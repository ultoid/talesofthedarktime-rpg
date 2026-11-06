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
        print("JS EVAL ERROR RESPONSE:", res)
        return res

    # 3. Switch to skills tab
    await evaluate_js("switchTab('skills');")
    await asyncio.sleep(0.3)
    tab_info = json.loads(await evaluate_js("JSON.stringify({tab: State.currentTab, hasVisualizer: typeof renderBattleEngineVisualizer === 'function', hasParser: typeof parseBecSkillState === 'function', hasGenerator: typeof generateBecSkillNote === 'function'})"))
    print(f"✓ Skills Tab Active: Battle Engine & Action Sequence Flowchart Loaded={tab_info['hasVisualizer']}")
    assert tab_info['tab'] == 'skills', f"Current tab is {tab_info['tab']}"
    assert tab_info['hasVisualizer'] == True, "renderBattleEngineVisualizer is missing!"
    assert tab_info['hasParser'] == True, "parseBecSkillState is missing!"
    assert tab_info['hasGenerator'] == True, "generateBecSkillNote is missing!"

    # 4. Verify All 6 Flowchart Nodes & Form Sections in DOM
    bec_dom_test = json.loads(await evaluate_js("""
    (() => {
        const sections = ['becSec_pre', 'becSec_setup', 'becSec_whole', 'becSec_target', 'becSec_follow', 'becSec_finish'];
        const sectionCheck = sections.map(id => ({ id, exists: Boolean(document.getElementById(id)) }));
        const flowchartTrack = Boolean(document.querySelector('.bec-flowchart-track'));
        const nodeButtonsCount = document.querySelectorAll('.bec-node-btn').length;
        return JSON.stringify({ sectionCheck, flowchartTrack, nodeButtonsCount });
    })()
    """))
    print(f"✓ BEC 6-Phase Forms & Flowchart Verified: {bec_dom_test['nodeButtonsCount']} flowchart nodes, all 6 forms present")
    assert bec_dom_test['flowchartTrack'] == True, "bec-flowchart-track element not found"
    assert bec_dom_test['nodeButtonsCount'] == 6, f"Expected 6 node buttons, got {bec_dom_test['nodeButtonsCount']}"
    for sec in bec_dom_test['sectionCheck']:
        assert sec['exists'] == True, f"Phase form section {sec['id']} missing from DOM"

    # 5. Test State Parser on Skill #1 (Attack)
    bec_parse_test = json.loads(await evaluate_js("""
    (() => {
        const skill = (State.skills || [])[1];
        const state = parseBecSkillState(skill ? skill.note : '');
        return JSON.stringify({
            hasSetup: state.setup.hasSetup,
            setupImmortal: state.setup.setupImmortal,
            setupBattleLog: state.setup.setupBattleLog,
            targetApproach: state.target.targetApproach,
            targetMotion: state.target.targetMotion,
            targetAnimType: state.target.targetAnimType,
            targetImpactFx: state.target.targetImpactFx,
            finishImmortalRelease: state.finish.finishImmortalRelease
        });
    })()
    """))
    print(f"✓ BEC Parser Verified for Skill #1: Approach={bec_parse_test['targetApproach']}, Motion={bec_parse_test['targetMotion']}, Anim={bec_parse_test['targetAnimType']}")
    assert bec_parse_test['targetAnimType'] in ['weapon_anim', 'custom_anim', 'skill_anim'], f"Expected weapon_anim or custom_anim, got {bec_parse_test['targetAnimType']}"
    assert bec_parse_test['setupImmortal'] == True, "Expected setupImmortal to be true"
    assert bec_parse_test['finishImmortalRelease'] == True, "Expected finishImmortalRelease to be true"

    # 6. Test Interactive Field Mutation & Note Generation
    mutation_test = json.loads(await evaluate_js("""
    (() => {
        const skill = (State.skills || [])[1];
        const originalNote = skill.note;
        skill.note = '<setup action>\\nimmortal: targets, true\\n</setup action>\\n<target action>\\naction effect: target\\n</target action>\\n<finish action>\\nimmortal: targets, false\\n</finish action>';
        
        // Mutate target fields
        onBecStateFieldChange('target', 'targetApproach', 'jump_in');
        onBecStateFieldChange('target', 'targetMotion', 'thrust');
        onBecTargetAnimChange('anim_4');
        
        const modifiedNote = skill.note;
        const modifiedState = parseBecSkillState(modifiedNote);
        
        // Restore original note to leave no dirty state
        skill.note = originalNote;
        setUnsaved(false);
        renderEditor();
        
        return JSON.stringify({
            hasJumpIn: modifiedNote.includes('jump user: 120'),
            hasThrust: modifiedNote.includes('motion thrust: user'),
            hasAnim4: modifiedNote.includes('animation 4: target'),
            parsedApproach: modifiedState.target.targetApproach,
            parsedMotion: modifiedState.target.targetMotion,
            parsedAnimType: modifiedState.target.targetAnimType,
            parsedCustomAnim: modifiedState.target.targetCustomAnim
        });
    })()
    """))
    print(f"✓ BEC Sequence Generation & Mutation Verified: JumpIn={mutation_test['hasJumpIn']}, Thrust={mutation_test['hasThrust']}, DirectAnim4={mutation_test['hasAnim4']}")
    assert mutation_test['hasJumpIn'] == True, "jump user: 120 missing from generated note"
    assert mutation_test['hasThrust'] == True, "motion thrust: user missing from generated note"
    assert mutation_test['hasAnim4'] == True, "animation 4: target missing from generated note"
    assert mutation_test['parsedApproach'] == 'jump_in', "Parsed approach does not match jump_in"
    assert mutation_test['parsedMotion'] == 'thrust', "Parsed motion does not match thrust"
    assert mutation_test['parsedAnimType'] == 'custom_anim', "Parsed anim type does not match custom_anim"
    assert mutation_test['parsedCustomAnim'] == 4, "Parsed custom anim id does not match 4"

    # 6b. Test Cinematic Slow-Mo Preset Generation & Round-trip Parity
    cinematic_test = json.loads(await evaluate_js("""
    (() => {
        const skill = (State.skills || [])[1];
        const originalNote = skill.note;
        
        // Apply Cinematic Slow-Mo Preset
        applyCinematicSlowMoPreset();
        const cineNote = skill.note;
        const cineState = parseBecSkillState(cineNote);
        
        // Restore
        skill.note = originalNote;
        setUnsaved(false);
        renderEditor();
        
        return JSON.stringify({
            hasZoom150: cineNote.includes('zoom: 150%'),
            hasUserTrack: cineNote.includes('camera focus: user, center, 20'),
            hasSlowDash: cineNote.includes('move user: target, front, 18, 28'),
            hasHold12: cineNote.includes('wait: 12'),
            hasCutTarget: cineNote.includes('camera focus: target, center, 15'),
            hasSlowRecoil: cineNote.includes('motion damage: target') && cineNote.includes('wait: 20'),
            hasDeadCheck: cineNote.includes('if target.isDead()'),
            hasFade50: cineNote.includes('opacity target: 0%, 50'),
            hasSmoothReset: cineNote.includes('reset camera: 30') && cineNote.includes('reset zoom: 30'),
            parsedCam: cineState.setup.setupCamera,
            parsedSpeed: cineState.target.targetApproachSpeed,
            parsedHold: cineState.target.targetStrikeHold,
            parsedHitCam: cineState.target.targetHitCamera,
            parsedRecoil: cineState.target.targetRecoil,
            parsedDeath: cineState.target.targetDeathRule,
            parsedFinishCam: cineState.finish.finishResetCamera
        });
    })()
    """))
    print(f"✓ Cinematic Slow-Mo Preset Verified: Zoom150={cinematic_test['hasZoom150']}, SlowDash={cinematic_test['hasSlowDash']}, Hold12={cinematic_test['hasHold12']}, CutTarget={cinematic_test['hasCutTarget']}, Fade50={cinematic_test['hasFade50']}, SmoothReset={cinematic_test['hasSmoothReset']}")
    assert cinematic_test['hasZoom150'] == True
    assert cinematic_test['hasUserTrack'] == True
    assert cinematic_test['hasSlowDash'] == True
    assert cinematic_test['hasHold12'] == True
    assert cinematic_test['hasCutTarget'] == True
    assert cinematic_test['hasSlowRecoil'] == True
    assert cinematic_test['hasDeadCheck'] == True
    assert cinematic_test['hasFade50'] == True
    assert cinematic_test['hasSmoothReset'] == True
    assert cinematic_test['parsedCam'] == 'zoom_user_track'
    assert cinematic_test['parsedSpeed'] == 'slow_28'
    assert cinematic_test['parsedHold'] == 'hold_12'
    assert cinematic_test['parsedHitCam'] == 'cut_target'
    assert cinematic_test['parsedRecoil'] == 'slow_recoil_20'
    assert cinematic_test['parsedDeath'] == 'slow_fade_50'
    assert cinematic_test['parsedFinishCam'] == 'smooth_30'

    # 6c. Test Event-Command Builder (Add, Move, Duplicate, Delete, Presets)
    builder_test = json.loads(await evaluate_js("""
    (() => {
        const skill = (State.skills || [])[1];
        const originalNote = skill.note;

        // 1. Open modal and check visibility
        openBecCommandModal('target');
        const modal = document.getElementById('becCommandModal');
        const modalVisible = modal && modal.style.display === 'flex';

        // 2. Select 'zoom' and set manual values: scale=180, frames=25
        onBecModalCommandTypeChange('zoom');
        document.getElementById('bec_p_zoom_scale').value = '180';
        document.getElementById('bec_p_zoom_frames').value = '25';
        onBecModalParamChange();
        saveBecCommandModal();

        const afterAddState = parseBecSkillState(skill.note);
        const hasManualZoom = skill.note.includes('zoom: 180%, 25');
        const countAfterAdd = afterAddState.targetCommands.length;

        // 3. Duplicate last command
        duplicateBecCommand('target', countAfterAdd - 1);
        const countAfterDup = parseBecSkillState(skill.note).targetCommands.length;

        // 4. Move command & Drag-and-Drop Reorder
        moveBecCommand('target', countAfterDup - 1, -1);
        reorderBecCommand('target', 0, 2);
        const stateAfterReorder = parseBecSkillState(skill.note);
        const reorderSuccess = stateAfterReorder.targetCommands.length === countAfterDup;

        // 5. Delete command
        deleteBecCommand('target', countAfterDup - 1);
        const countAfterDel = parseBecSkillState(skill.note).targetCommands.length;

        // 6. Test phase preset loading
        applyBecPhasePreset('target', 'standard_melee');
        const meleeState = parseBecSkillState(skill.note);
        const hasMeleeLine = skill.note.includes('move user: target, front, 18, 15');

        // Restore original state
        skill.note = originalNote;
        setUnsaved(false);
        renderEditor();

        return JSON.stringify({
            modalWasVisible: modalVisible,
            hasManualZoom: hasManualZoom,
            countAfterAdd: countAfterAdd,
            countAfterDup: countAfterDup,
            countAfterDel: countAfterDel,
            hasMeleeLine: hasMeleeLine,
            meleeCmdCount: meleeState.targetCommands.length
        });
    })()
    """))
    print(f"✓ Event-Command Builder Verified: ModalOpened={builder_test['modalWasVisible']}, ManualZoom={builder_test['hasManualZoom']}, DupCount={builder_test['countAfterDup']}, DelCount={builder_test['countAfterDel']}, MeleePreset={builder_test['hasMeleeLine']}")
    assert builder_test['modalWasVisible'] == True, "Command modal failed to open!"
    assert builder_test['hasManualZoom'] == True, "Manual zoom 180%, 25 was not generated in skill note!"
    assert builder_test['countAfterDup'] == builder_test['countAfterAdd'] + 1, "Duplicate failed to increase command count!"
    assert builder_test['countAfterDel'] == builder_test['countAfterDup'] - 1, "Delete failed to decrease command count!"
    assert builder_test['hasMeleeLine'] == True, "Standard melee preset failed to generate in note!"

    # 7. Test Native Animation Editor to Skills Link & Multi-Skill Modal
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
            selectedSkillId: State.selectedIndex || 0
        });
    })()
    """))
    print(f"✓ Native Animation to Battle Link Verified: Found {anim_link_test['matchingSkillsCount']} skills, Modal Opened={anim_link_test['modalWasVisible']}, Navigated to Tab={anim_link_test['activeTabAfterSelect']} for Skill #{anim_link_test['selectedSkillId']}")
    assert anim_link_test['matchingSkillsCount'] > 1, f"Expected multiple skills for Animation #2, got {anim_link_test['matchingSkillsCount']}"
    assert anim_link_test['modalWasVisible'] == True, "Selection modal was not shown for multiple skills!"
    assert anim_link_test['activeTabAfterSelect'] == 'skills', "Did not switch to skills tab!"

    # 8. Verify State.hasUnsavedChanges remains FALSE (no modifications committed to project)
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
