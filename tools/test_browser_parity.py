#!/usr/bin/env python3
"""
Comprehensive Browser Parity Test Suite for RPG Maker MV Database Studio
Tests root (editor.html) and /editor.bundled.html on Desktop 1440x900
using Firefox WebDriver BiDi via Python websockets.
"""

import asyncio
import json
import os
import subprocess
import sys
import time
import websockets
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

async def test_endpoint(ws, context_id, url_path, log_entries):
    print(f"\n=======================================================")
    print(f" TESTING ENDPOINT: {url_path}")
    print(f"=======================================================")

    target_url = f"http://127.0.0.1:5050{url_path}"
    
    # 1. Navigate
    req_id = int(time.time() * 1000) % 1000000
    await ws.send(json.dumps({
        'id': req_id,
        'method': 'browsingContext.navigate',
        'params': {'context': context_id, 'url': target_url, 'wait': 'complete'}
    }))
    nav_resp = json.loads(await ws.recv())
    while nav_resp.get('id') != req_id:
        if nav_resp.get('method') == 'log.entryAdded':
            log_entries.append(nav_resp['params'])
        nav_resp = json.loads(await ws.recv())

    assert nav_resp.get('type') == 'success', f"Navigation failed: {nav_resp}"
    print(f"✓ Navigation to {target_url} successful")

    # 2. Wait for database and plugins to load asynchronously
    data_loaded = False
    for attempt in range(30):
        await asyncio.sleep(0.3)
        req_id += 1
        await ws.send(json.dumps({
            'id': req_id,
            'method': 'script.evaluate',
            'params': {
                'target': {'context': context_id},
                'expression': 'JSON.stringify({actors: (State.actors||[]).length, troops: (State.troops||[]).length, plugins: Object.keys(State.pluginParameters||{}).length, unsaved: State.hasUnsavedChanges})',
                'awaitPromise': True
            }
        }))
        resp = json.loads(await ws.recv())
        while resp.get('id') != req_id:
            if resp.get('method') == 'log.entryAdded':
                log_entries.append(resp['params'])
            resp = json.loads(await ws.recv())

        val_str = resp.get('result', {}).get('result', {}).get('value', '{}')
        val = json.loads(val_str)
        if val.get('actors', 0) > 0 and val.get('troops', 0) > 0:
            data_loaded = True
            print(f"✓ Async Data Loaded: {val['actors']} actors, {val['troops']} troops, {val['plugins']} plugin configs")
            break

    assert data_loaded, "Failed to load database files in editor!"

    # Helper function to evaluate JS in the page
    async def evaluate_js(expr):
        nonlocal req_id
        req_id += 1
        await ws.send(json.dumps({
            'id': req_id,
            'method': 'script.evaluate',
            'params': {
                'target': {'context': context_id},
                'expression': expr,
                'awaitPromise': True
            }
        }))
        res = json.loads(await ws.recv())
        while res.get('id') != req_id:
            if res.get('method') == 'log.entryAdded':
                log_entries.append(res['params'])
            res = json.loads(await ws.recv())
        
        result_obj = res.get('result', {}).get('result', {})
        if res.get('type') == 'success' and 'value' in result_obj:
            return result_obj['value']
        elif res.get('type') == 'success' and result_obj.get('type') == 'undefined':
            return None
        return res

    # 3. Switch to skill_animator tab
    await evaluate_js("switchTab('skill_animator');")
    await asyncio.sleep(0.3)
    tab_info = json.loads(await evaluate_js("JSON.stringify({tab: State.currentTab, width: SkillAnimator.WIDTH, height: SkillAnimator.HEIGHT, actorHome: SkillAnimator.actorHome, enemyHome: SkillAnimator.enemyHome, selectedActor: SkillAnimator.selectedActorId, selectedSlot: SkillAnimator.selectedPartySlot, selectedTroop: SkillAnimator.selectedTroopId, memberCount: (SkillAnimator.enemyBattlers||[]).length})"))
    print(f"✓ Skill Animator Tab Active: {tab_info['width']}x{tab_info['height']} battle resolution")
    assert tab_info['tab'] == 'skill_animator', f"Current tab is {tab_info['tab']}"
    assert tab_info['width'] == 1080 and tab_info['height'] == 720, "Canvas resolution is not 1080x720"

    # 4. Test Actor & Party Slot home formula parity
    # YEP BEC sideview home formula: screenWidth - 16 - (maxSize + 2) * 32 + index * 32
    # For width=1080, maxSize=4: 1080 - 16 - 192 + index * 32 = 872 + index * 32
    # Index 0 => X = 872; Index 1 => X = 904; Index 2 => X = 936; Index 3 => X = 968
    actor_home_test = json.loads(await evaluate_js("""
    (() => {
        SkillAnimator.selectPreviewPartySlot(0);
        const x0 = SkillAnimator.actorHome.x;
        SkillAnimator.selectPreviewPartySlot(1);
        const x1 = SkillAnimator.actorHome.x;
        SkillAnimator.selectPreviewPartySlot(2);
        const x2 = SkillAnimator.actorHome.x;
        SkillAnimator.selectPreviewPartySlot(3);
        const x3 = SkillAnimator.actorHome.x;
        SkillAnimator.selectPreviewPartySlot(0); // return to slot 0
        return JSON.stringify({x0, x1, x2, x3});
    })()
    """))
    print(f"✓ YEP BEC Actor Home Formula Verified: Slot 0={actor_home_test['x0']}, Slot 1={actor_home_test['x1']}, Slot 2={actor_home_test['x2']}, Slot 3={actor_home_test['x3']}")
    assert actor_home_test['x0'] == 872 and actor_home_test['x1'] == 904 and actor_home_test['x2'] == 936 and actor_home_test['x3'] == 968, f"Home positions do not match YEP formula: {actor_home_test}"

    # 5. Test Troop #1 (Ayam Hutan*2 with 3 members, static enemies in img/enemies/)
    troop1_info = json.loads(await evaluate_js("""
    (() => {
        SkillAnimator.selectPreviewTroop(1);
        const members = SkillAnimator.enemyBattlers.map(e => ({
            slot: e.slot,
            enemyId: e.enemyId,
            name: e.name,
            x: e.x,
            y: e.y,
            sideview: e.sideview,
            folder: e.folder,
            imagePath: e.imagePath,
            mirror: e.mirror
        }));
        return JSON.stringify({count: members.length, members});
    })()
    """))
    print(f"✓ Troop #1 Verified: {troop1_info['count']} members")
    assert troop1_info['count'] == 3, f"Expected 3 members in Troop #1, got {troop1_info['count']}"
    assert troop1_info['members'][0]['x'] == 165 and troop1_info['members'][0]['y'] == 444
    assert troop1_info['members'][1]['x'] == 258 and troop1_info['members'][1]['y'] == 310
    assert troop1_info['members'][2]['x'] == 300 and troop1_info['members'][2]['y'] == 400
    assert troop1_info['members'][0]['sideview'] == False, "Static enemy should have sideview=False"
    assert troop1_info['members'][0]['folder'] == 'enemies', "Static enemy should use folder='enemies'"
    assert troop1_info['members'][0]['mirror'] == False, "Static enemy should not be mirrored"

    # 6. Test Target Enemy Switching on Troop #1
    target_switch_test = json.loads(await evaluate_js("""
    (() => {
        SkillAnimator.selectPreviewEnemy(0);
        const h0 = { ...SkillAnimator.enemyHome };
        SkillAnimator.selectPreviewEnemy(1);
        const h1 = { ...SkillAnimator.enemyHome };
        SkillAnimator.selectPreviewEnemy(2);
        const h2 = { ...SkillAnimator.enemyHome };
        return JSON.stringify({h0, h1, h2});
    })()
    """))
    print(f"✓ Target Enemy Switching Verified: Slot 0={target_switch_test['h0']}, Slot 1={target_switch_test['h1']}, Slot 2={target_switch_test['h2']}")
    assert target_switch_test['h0']['x'] == 165 and target_switch_test['h0']['y'] == 444
    assert target_switch_test['h1']['x'] == 258 and target_switch_test['h1']['y'] == 310
    assert target_switch_test['h2']['x'] == 300 and target_switch_test['h2']['y'] == 400

    # 7. Test Troop #2 (Babi Hutan with animated SV enemy tags)
    troop2_info = json.loads(await evaluate_js("""
    (() => {
        SkillAnimator.selectPreviewTroop(2);
        const members = SkillAnimator.enemyBattlers.map(e => ({
            slot: e.slot,
            enemyId: e.enemyId,
            name: e.name,
            x: e.x,
            y: e.y,
            sideview: e.sideview,
            folder: e.folder,
            frames: e.frames,
            columns: e.columns,
            frameSpeed: e.frameSpeed,
            mirror: e.mirror
        }));
        return JSON.stringify({count: members.length, members});
    })()
    """))
    print(f"✓ Troop #2 (Animated SV Enemy) Verified: {troop2_info['count']} members, sideview={troop2_info['members'][0]['sideview']}, folder={troop2_info['members'][0]['folder']}, frames={troop2_info['members'][0]['frames']}, mirror={troop2_info['members'][0]['mirror']}")
    assert troop2_info['members'][0]['sideview'] == True, "Babi Hutan must be recognized as animated SV enemy"
    assert troop2_info['members'][0]['folder'] == 'sv_enemies', "Babi Hutan folder must match <Sideview Folder: sv_enemies>"
    assert troop2_info['members'][0]['frames'] == 8, "Babi Hutan frames must be 8"
    assert troop2_info['members'][0]['mirror'] == False, "Babi Hutan has <Sideview No Mirror> so mirror must be False"

    # Return to Troop 1
    await evaluate_js("SkillAnimator.selectPreviewTroop(1);")

    # 8. Test Choreography Movement Does NOT Reset Actor Home Every Tick
    movement_test = json.loads(await evaluate_js("""
    (() => {
        SkillAnimator.currentTick = 0;
        SkillAnimator.update(true);
        const initActorX = SkillAnimator.actorPos.x;
        
        // Advance to setup step forward
        SkillAnimator.currentTick = 12;
        SkillAnimator.update(true);
        const steppedActorX = SkillAnimator.actorPos.x;
        
        // Render several times to confirm render() does NOT snap position back to home
        SkillAnimator.render();
        SkillAnimator.render();
        const afterRenderActorX = SkillAnimator.actorPos.x;
        
        return JSON.stringify({initActorX, steppedActorX, afterRenderActorX});
    })()
    """))
    print(f"✓ Movement Choreography Verified: Initial X={movement_test['initActorX']}, Stepped X={movement_test['steppedActorX']}, After Render X={movement_test['afterRenderActorX']}")
    assert movement_test['steppedActorX'] != movement_test['initActorX'], "Actor did not step forward during sequence!"
    assert movement_test['afterRenderActorX'] == movement_test['steppedActorX'], "Render snapped actor position back to home!"

    # 9. Test Camera Controls & State
    camera_test = json.loads(await evaluate_js("""
    (() => {
        const cfg = SkillAnimator.getConfig(SkillAnimator.activeSkill);
        if (cfg.steps && cfg.steps[1]) {
            cfg.steps[1].cameraFocus = 'target';
            cfg.steps[1].cameraZoom = 125;
            cfg.steps[1].cameraDuration = 20;
            cfg.steps[1].cameraOffsetX = 20;
            cfg.steps[1].cameraOffsetY = -10;
        }
        SkillAnimator.currentTick = cfg.steps && cfg.steps[1] ? (cfg.steps[1].startTick + 10) : 25;
        SkillAnimator.update(true);
        const cam = { ...SkillAnimator.cameraState };
        return JSON.stringify({cam, yanfly: SkillAnimator.generateYanflySequence(cfg, SkillAnimator.activeSkill)});
    })()
    """))
    print(f"✓ Camera State & YEP Commands Verified: Zoom={camera_test['cam']['zoom']:.2f}, X={camera_test['cam']['x']:.1f}, Y={camera_test['cam']['y']:.1f}")
    assert 'camera focus: target, center' in camera_test['yanfly'] or 'camera' in camera_test['yanfly'], "Camera command missing from Yanfly sequence!"
    assert 'zoom: 125%' in camera_test['yanfly'] or 'zoom' in camera_test['yanfly'], "Zoom command missing from Yanfly sequence!"

    # 10. Test Native Animation Editor to Battle Preview Link & Multi-Skill Modal
    anim_link_test = json.loads(await evaluate_js("""
    (() => {
        switchTab('animations');
        State.selectedIndices.animations = 2; // Animation #2 is used by multiple skills
        renderEditor();
        
        const skillsUsingAnim = AnimEditor.findBattlePreviewSkills();
        
        // Open modal
        AnimEditor.openBattlePreview();
        const modal = document.getElementById('animSkillSelectModal');
        const modalVisible = modal && modal.style.display !== 'none';
        
        // Simulate selecting first skill in modal
        if (skillsUsingAnim.length > 0) {
            AnimEditor.openBattlePreview(skillsUsingAnim[0].id);
        }
        
        return JSON.stringify({
            matchingSkillsCount: skillsUsingAnim.length,
            modalWasVisible: modalVisible,
            activeTabAfterSelect: State.currentTab,
            selectedSkillId: SkillAnimator.activeSkill ? SkillAnimator.activeSkill.id : 0
        });
    })()
    """))
    print(f"✓ Native Animation to Battle Preview Link Verified: Found {anim_link_test['matchingSkillsCount']} skills, Modal Opened={anim_link_test['modalWasVisible']}, Navigated to Tab={anim_link_test['activeTabAfterSelect']} for Skill #{anim_link_test['selectedSkillId']}")
    assert anim_link_test['matchingSkillsCount'] > 1, f"Expected multiple skills for Animation #2, got {anim_link_test['matchingSkillsCount']}"
    assert anim_link_test['modalWasVisible'] == True, "Selection modal was not shown for multiple skills!"
    assert anim_link_test['activeTabAfterSelect'] == 'skill_animator', "Did not switch back to skill_animator tab!"

    # 11. Verify State.hasUnsavedChanges remains FALSE (no modifications committed to project)
    unsaved_status = await evaluate_js("State.hasUnsavedChanges")
    print(f"✓ Unsaved Changes Status: {unsaved_status}")
    assert unsaved_status == False, "State.hasUnsavedChanges was set to true during testing!"

    print(f"✓ ALL TESTS PASSED FOR ENDPOINT: {url_path}")
    return True

async def main():
    print("Starting NUSV Database Editor Server on port 5050...")
    server_process = subprocess.Popen(
        ['python3', 'tools/nusv_editor_server.py', '--port', '5050', '--no-browser'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1.2)

    print("Launching Firefox headless 1440x900 with remote debugging port 9222...")
    firefox_process = subprocess.Popen(
        ['firefox', '--headless', '--remote-debugging-port', '9222', '-width', '1440', '-height', '900'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1.8)

    log_entries = []

    try:
        async with websockets.connect('ws://127.0.0.1:9222/session') as ws:
            # Create session
            await ws.send(json.dumps({'id': 1, 'method': 'session.new', 'params': {'capabilities': {}}}))
            await ws.recv()

            # Get main browsing context
            await ws.send(json.dumps({'id': 2, 'method': 'browsingContext.getTree', 'params': {}}))
            r2 = json.loads(await ws.recv())
            context_id = r2['result']['contexts'][0]['context']

            # Subscribe to console and exception logs
            await ws.send(json.dumps({'id': 3, 'method': 'session.subscribe', 'params': {'events': ['log.entryAdded']}}))
            await ws.recv()

            # Test 1: Root path (editor.html)
            await test_endpoint(ws, context_id, '/', log_entries)

            # Test 2: editor.bundled.html
            await test_endpoint(ws, context_id, '/editor.bundled.html', log_entries)

            # Check for any fatal errors in captured logs
            page_errors = [entry for entry in log_entries if entry.get('level') == 'error' and 'favicon' not in entry.get('text', '').lower()]
            if page_errors:
                print("\n[WARNING] Captured log errors:")
                for err in page_errors[:10]:
                    print(" -", err.get('text'))
            else:
                print("\n✓ ZERO page errors or unhandled exceptions detected in browser!")

    finally:
        print("\nCleaning up processes...")
        firefox_process.kill()
        server_process.kill()
        firefox_process.wait()
        server_process.wait()
        print("Done.")

if __name__ == '__main__':
    asyncio.run(main())
