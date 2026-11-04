import sys, io, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('editor.html', 'r', encoding='utf-8') as f:
    html = f.read()

def read_mod(path):
    with open(f'editor_studio/{path}', 'r', encoding='utf-8') as f:
        return f.read()

actor_ed = read_mod('js/editors/actor_editor.js')
class_ed = read_mod('js/editors/class_editor.js')
weapon_ed = read_mod('js/editors/weapon_editor.js')
armor_ed = read_mod('js/editors/armor_editor.js')
enemy_ed = read_mod('js/editors/enemy_editor.js')
state_ed = read_mod('js/editors/state_editor.js')
skill_ed = read_mod('js/editors/skill_editor.js')
skill_anim = read_mod('js/editors/skill_animator.js')
anim_ed = read_mod('js/editors/animation_editor.js')
item_ed = read_mod('js/editors/item_editor.js')
api_js = read_mod('js/api.js')
constants_js = read_mod('js/constants.js')
icon_modal = read_mod('js/modals/icon_picker.js')
trait_modal = read_mod('js/modals/trait_modal.js')
effect_modal = read_mod('js/modals/effect_modal.js')

checks = {
    "Traits Card in Actors": "${renderTraitsCard(actor, 'actors')}" in actor_ed,
    "Traits Card in Classes": "${renderTraitsCard(cls, 'classes')}" in class_ed,
    "Traits Card in Weapons": "${renderTraitsCard(weapon, 'weapons')}" in weapon_ed,
    "Traits Card in Armors": "${renderTraitsCard(armor, 'armors')}" in armor_ed,
    "Traits Card in Enemies": "${renderTraitsCard(enemy, 'enemies')}" in enemy_ed,
    "Traits Card in States": "${renderTraitsCard(state, 'states')}" in state_ed,
    "Effects Card in Skills": "${renderEffectsCard(skill)}" in skill_ed,
    "Effects Card in Items": "${renderEffectsCard(item)}" in item_ed,
    "Icon Picker modal in HTML": 'id="iconPickerModal"' in html,
    "Trait modal in HTML": 'id="traitModal"' in html,
    "Effect modal in HTML": 'id="effectModal"' in html,
    "Resize modal in HTML": 'id="resizeModal"' in html,
    "Class Curve modal in HTML": 'id="classParamsCurveModal"' in html,
    "Sidebar Footer Add/Clone/Delete/Max": 'class="sidebar-footer"' in html,
    "CommonEvents fetched": 'CommonEvents.json' in api_js,
    "Icon Picker field function": 'function renderIconPickerField(' in icon_modal,
    "EXP curve in Classes": 'Class EXP Progression Curve' in class_ed,
    "RPG Maker MV Trait Tabs (Rate, Param, Attack, Skill, Equip, Other)": 'TRAIT_TAB_DEFS' in constants_js,
    "NUSV Core Attributes (STR, INT, VIT, AGI, DEX, LUK)": 'STR' in constants_js and 'DEX' in constants_js,
    "NUSV SP Regeneration (replacing TP)": 'SP Regeneration' in constants_js,
    "Enemy Battler SV Preview": '/api/images/sv_enemies' in api_js and 'img/sv_enemies/' in enemy_ed,
    "Skill Sideview Battle Canvas in HTML": 'id="svBattleCanvas"' in html,
    "Skill Action Sequence Studio in HTML": 'Sideview Battle &amp; Skill Animation Studio' in html,
    "Skill Animator Engine in Module": 'const SkillAnimator =' in skill_anim,
    "Skill 1-Click Presets in Module": 'PRESETS:' in skill_anim,
    "Skill Yanfly Action Sequence Generator": 'generateYanflySequence' in skill_anim,
    "Animation Studio Canvas in HTML": 'id="animEditorCanvas"' in html,
    "Animations Tab in HTML": "switchTab('animations')" in html,
    "Animation Engine in Module": 'const AnimEditor =' in anim_ed,
    "Animation Spritesheet Cell Picker in Module": 'openAnimPatternPicker' in anim_ed,
    "Animation Save Endpoint in API": "'Animations.json'" in api_js,
}

all_ok = True
for name, ok in checks.items():
    status = "✓ PASS" if ok else "✗ FAIL"
    print(f"{status}: {name}")
    if not ok:
        all_ok = False

exp_in_sta = 'INTERACTIVE EXP PROGRESSION' in state_ed
print(f"{'✗ FAIL' if exp_in_sta else '✓ PASS'}: EXP curve absent from States (in States: {exp_in_sta})")
if exp_in_sta: all_ok = False

exp_in_cls = 'INTERACTIVE EXP PROGRESSION' in class_ed
print(f"{'✓ PASS' if exp_in_cls else '✗ FAIL'}: EXP curve present in Classes (in Classes: {exp_in_cls})")
if not exp_in_cls: all_ok = False

print("\nOVERALL VERIFICATION:", "ALL PASSED!" if all_ok else "SOME CHECKS FAILED!")
if not all_ok:
    sys.exit(1)
