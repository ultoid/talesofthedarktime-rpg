import json
import shutil
import os

# 1. Backup States.json
backup_path = 'data/States.backup_core_revamp.json'
if not os.path.exists(backup_path):
    shutil.copyfile('data/States.json', backup_path)
    print(f"Backup created at: {backup_path}")
else:
    print(f"Backup already exists at: {backup_path}")

with open('data/States.json', 'r', encoding='utf-8') as f:
    states = json.load(f)

# Helper to configure state
def update_state(s, name, icon, min_t, max_t, restriction, traits, note, messages=None, chance_dmg=100, rem_dmg=False, rem_battle=True, motion=1, overlay=0):
    s['name'] = name
    s['iconIndex'] = icon
    s['autoRemovalTiming'] = 2 # Turn End
    s['minTurns'] = min_t
    s['maxTurns'] = max_t
    s['restriction'] = restriction
    s['traits'] = traits
    s['note'] = note.strip()
    s['chanceByDamage'] = chance_dmg
    s['removeByDamage'] = rem_dmg
    s['removeAtBattleEnd'] = rem_battle
    s['motion'] = motion
    s['overlay'] = overlay
    if messages:
        s['message1'] = messages[0]
        s['message2'] = messages[1]
        s['message3'] = messages[2]
        s['message4'] = messages[3]

# ID 004: Poison
update_state(
    states[4],
    name="Poison",
    icon=2,
    min_t=3,
    max_t=3,
    restriction=0,
    traits=[
        {"code": 22, "dataId": 7, "value": -0.05} # HRG -5%
    ],
    note="<HRG Plus: -5%>\nState dasar racun murni. Mengurangi 5% Max HP setiap turn selama 3 turn.",
    messages=[" terkena Poison!", " terkena Poison!", " tersiksa oleh Poison!", " sembuh dari Poison!"],
    overlay=1
)

# ID 005: Burn
update_state(
    states[5],
    name="Burn",
    icon=64,
    min_t=3,
    max_t=3,
    restriction=0,
    traits=[
        {"code": 22, "dataId": 7, "value": -0.04}, # HRG -4%
        {"code": 21, "dataId": 2, "value": 0.80}  # ATK 80% (-20% physical attack)
    ],
    note="<HRG Plus: -4%>\nState luka bakar. Mengurangi 4% Max HP setiap turn dan melemahkan Serangan Fisik (ATK -20%) selama 3 turn.",
    messages=[" terkena luka bakar Burn!", " terkena luka bakar Burn!", " terbakar oleh Burn!", " pulih dari luka bakar Burn!"],
    overlay=0
)

# ID 006: Bleed
update_state(
    states[6],
    name="Bleed",
    icon=11,
    min_t=3,
    max_t=3,
    restriction=0,
    traits=[
        {"code": 22, "dataId": 7, "value": -0.04} # HRG -4%
    ],
    note="<HRG Plus: -4%>\nState pendarahan akibat luka senjata tajam. Mengurangi 4% Max HP setiap turn selama 3 turn.",
    messages=[" mengalami pendarahan Bleed!", " mengalami pendarahan Bleed!", " mengeluarkan darah akibat Bleed!", " pendarahan Bleed telah berhenti!"]
)

# ID 007: Paralyze (Pokemon style: AGI -50% + 30% chance to fail action)
paralyze_note = """<Custom Action Start Effect>
if (Math.random() < 0.30) {
  user.clearActions();
  var msg = user.name() + " lumpuh dan tidak dapat bergerak!";
  $gameMessage.add(msg);
}
</Custom Action Start Effect>
State kelumpuhan (Paralyze). Mengurangi Kecepatan (AGI) sebesar 50% dan memiliki peluang 30% gagal bertindak setiap aksi."""

update_state(
    states[7],
    name="Paralyze",
    icon=9,
    min_t=3,
    max_t=3,
    restriction=0,
    traits=[
        {"code": 21, "dataId": 6, "value": 0.50}, # AGI 50%
        {"code": 22, "dataId": 1, "value": -0.20}  # EVA -20%
    ],
    note=paralyze_note,
    messages=[" terkena kelumpuhan Paralyze!", " terkena kelumpuhan Paralyze!", " gemetar lumpuh akibat Paralyze!", " pulih dari kelumpuhan Paralyze!"],
    overlay=8
)

# ID 008: Sleep (Cannot move, 100% wakes up on damage)
update_state(
    states[8],
    name="Sleep",
    icon=8,
    min_t=2,
    max_t=3,
    restriction=4, # Cannot move
    traits=[
        {"code": 22, "dataId": 1, "value": -1.0} # EVA -100% (pasti kena)
    ],
    note="State tidur lelap (Sleep). Target tidak dapat bergerak, tetapi akan langsung terbangun jika menerima serangan fisik (100% chance).",
    messages=[" tertidur lelap!", " tertidur lelap!", " sedang tertidur!", " terbangun dari tidur!"],
    chance_dmg=100,
    rem_dmg=True,
    motion=2,
    overlay=5
)

# ID 009: Confuse (Attack Anyone, 50% remove on damage)
update_state(
    states[9],
    name="Confuse",
    icon=6,
    min_t=2,
    max_t=3,
    restriction=2, # Attack Anyone
    traits=[],
    note="State kebingungan (Confuse). Target menyerang kawan atau lawan secara acak. 50% peluang pulih jika terkena serangan.",
    messages=[" menjadi bingung!", " menjadi bingung!", " bertingkah bingung!", " tersadar dari kebingungan!"],
    chance_dmg=50,
    rem_dmg=True,
    overlay=6
)

# ID 010: Curse (Anti-Heal REC 0% + MAT -15%)
update_state(
    states[10],
    name="Curse",
    icon=10,
    min_t=3,
    max_t=3,
    restriction=0,
    traits=[
        {"code": 23, "dataId": 2, "value": 0.0}, # REC 0% (Anti-Heal)
        {"code": 21, "dataId": 4, "value": 0.85} # MAT 85% (-15%)
    ],
    note="<REC Rate: 0%>\nState kutukan hitam (Curse). Memblokir seluruh pemulihan HP (Anti-Heal) dan mengurangi Magic Attack sebesar 15% selama 3 turn.",
    messages=[" terkena kutukan Curse!", " terkena kutukan Curse!", " tersiksa oleh kutukan Curse!", " terbebas dari kutukan Curse!"],
    overlay=9
)

# ID 011: Stun (Cannot move for exactly 1 turn)
update_state(
    states[11],
    name="Stun",
    icon=22,
    min_t=1,
    max_t=1,
    restriction=4, # Cannot move
    traits=[],
    note="State pusing/tersentak (Stun). Target kehilangan giliran bertindak selama tepat 1 turn.",
    messages=[" pusing terkena Stun!", " pusing terkena Stun!", " tertegun oleh Stun!", " pulih dari pusing Stun!"],
    overlay=8
)

# ID 012: Slow (Repurposed from Chill)
update_state(
    states[12],
    name="Slow",
    icon=65,
    min_t=3,
    max_t=3,
    restriction=0,
    traits=[
        {"code": 21, "dataId": 6, "value": 0.70}, # AGI 70% (-30%)
        {"code": 22, "dataId": 1, "value": -0.10}  # EVA -10%
    ],
    note="State perlambatan (Slow). Mengurangi Kecepatan (AGI) sebesar 30% dan Evasion sebesar 10% selama 3 turn.",
    messages=[" gerakannya melambat oleh Slow!", " gerakannya melambat oleh Slow!", " bergerak lambat oleh Slow!", " kecepatan kembali normal!"]
)

# ID 013: Freeze (Cannot move for 2 turns, melts on Fire damage)
freeze_note = """<Custom React Effect>
if (this.isDamage() && this.getItemElements().contains(2)) {
  target.removeState(13);
  var msg = target.name() + " mencair dari pembekuan es akibat panas api!";
  $gameMessage.add(msg);
}
</Custom React Effect>
State pembekuan es (Freeze). Target tidak dapat bergerak selama 2 turn. Jika terkena serangan berelemen Api (Fire), es akan langsung mencair!"""

update_state(
    states[13],
    name="Freeze",
    icon=65,
    min_t=2,
    max_t=2,
    restriction=4, # Cannot move
    traits=[
        {"code": 22, "dataId": 1, "value": -1.0} # EVA -100%
    ],
    note=freeze_note,
    messages=[" membeku dalam Freeze!", " membeku dalam Freeze!", " membeku kaku oleh Freeze!", " mencair dari es Freeze!"]
)

# ID 014: Blind (HIT -50%)
update_state(
    states[14],
    name="Blind",
    icon=3,
    min_t=3,
    max_t=3,
    restriction=0,
    traits=[
        {"code": 22, "dataId": 0, "value": -0.50} # HIT -50%
    ],
    note="<HIT Plus: -50%>\nState kebutaan (Blind). Menurunkan akurasi serangan fisik (HIT) sebesar 50% selama 3 turn.",
    messages=[" pandangannya dibutakan oleh Blind!", " pandangannya dibutakan oleh Blind!", " terhalang pandangannya oleh Blind!", " pandangannya kembali jernih!"],
    overlay=2
)

# ID 016: Silence (Seal White Magic & Black Magic)
update_state(
    states[16],
    name="Silence",
    icon=4,
    min_t=3,
    max_t=3,
    restriction=0,
    traits=[
        {"code": 42, "dataId": 1, "value": 0}, # Seal White Magic
        {"code": 42, "dataId": 2, "value": 0}  # Seal Black Magic
    ],
    note="State pembungkaman (Silence). Menyegel penggunaan sihir White Magic dan Black Magic selama 3 turn.",
    messages=[" terbungkam oleh Silence!", " terbungkam oleh Silence!", " tidak dapat mengucapkan mantra!", " sihir kembali dapat dirapalkan!"],
    overlay=3
)

# ID 018: Vulnerable (Damage taken +30%)
update_state(
    states[18],
    name="Vulnerable",
    icon=77,
    min_t=2,
    max_t=2,
    restriction=0,
    traits=[
        {"code": 23, "dataId": 6, "value": 1.30}, # PDR 130%
        {"code": 23, "dataId": 7, "value": 1.30}  # MDR 130%
    ],
    note="State zirah rapuh (Vulnerable). Meningkatkan seluruh kerusakan fisik dan sihir yang diterima target sebesar 30% selama 2 turn.",
    messages=[" pertahanannya jebol (Vulnerable)!", " pertahanannya jebol (Vulnerable)!", " rentan terhadap serangan!", " pertahanan kembali kokoh!"]
)

# ID 020: Taunt (TGR 1000%)
update_state(
    states[20],
    name="Taunt",
    icon=5,
    min_t=2,
    max_t=2,
    restriction=0,
    traits=[
        {"code": 23, "dataId": 0, "value": 10.0} # TGR 1000%
    ],
    note="State provokasi (Taunt). Menarik fokus serangan seluruh musuh ke pengguna (TGR 1000%) selama 2 turn.",
    messages=[" memancing kemarahan musuh (Taunt)!", " terprovokasi oleh Taunt!", " mengunci target serangan!", " efek provokasi telah hilang!"],
    overlay=4
)

# Clean out bloat states: 21, 23, 24, 25, 26
bloat_ids = [21, 23, 24, 25, 26]
for bid in bloat_ids:
    s = states[bid]
    s['name'] = ""
    s['iconIndex'] = 0
    s['autoRemovalTiming'] = 0
    s['minTurns'] = 1
    s['maxTurns'] = 1
    s['restriction'] = 0
    s['traits'] = []
    s['note'] = ""
    s['message1'] = ""
    s['message2'] = ""
    s['message3'] = ""
    s['message4'] = ""
    s['chanceByDamage'] = 100
    s['removeByDamage'] = False
    s['removeAtBattleEnd'] = True
    s['motion'] = 0
    s['overlay'] = 0
    print(f"Cleared bloat state ID {bid:03d}")

# Save back to data/States.json
with open('data/States.json', 'w', encoding='utf-8') as f:
    json.dump(states, f, indent=2, ensure_ascii=False)

print("States.json updated successfully!")

