# PluginGuide.md

Panduan ini merangkum plugin yang ada di project **Tales of The Dark Time**. Fokus utama ada pada plugin `NUSV_*` karena plugin ini dibuat khusus untuk project ini. Plugin YEP/SRD/bawaan tetap dirangkum supaya mudah tahu fungsi dan notetag pentingnya.

## Cara Baca Notetag

Notetag ditulis di kolom **Note** database RPG Maker MV, kecuali kalau disebut sebagai **Event Comment**.

Contoh:

```text
<Damage Cap: 50000>
```

Untuk blok multiline, tulis lengkap tag pembuka dan penutup:

```text
<Damage Formula>
value = a.atk * 4 - b.def * 2;
</Damage Formula>
```

Variabel umum yang sering dipakai:

- `a`, `user`, `subject`: pemakai skill/item.
- `b`, `target`: target.
- `item`, `skill`, `cls`: objek database yang sedang diproses.
- `s`: `$gameSwitches._data`.
- `v`: `$gameVariables._data`.
- `condition`: hasil benar/salah untuk requirement.
- `value`: angka hasil formula.

## Urutan Plugin Aktif

Urutan aktif saat ini mengikuti `js/plugins.js`:

1. `Community_Basic`
2. `CustomLogo`
3. `YEP_CoreEngine`
4. `NUSV_OptionsCore`
5. `YEP_BattleEngineCore`
6. `YEP_X_ActSeqPack1`
7. `YEP_X_ActSeqPack2`
8. `YEP_X_ActSeqPack3`
9. `YEP_X_BattleSysCTB`
10. `YEP_SkillCore`
11. `YEP_BuffsStatesCore`
12. `YEP_AutoPassiveStates`
13. `YEP_ElementCore`
14. `YEP_BattleAICore`
15. `YEP_BaseTroopEvents`
16. `NUSV_DamageCore`
17. `NUSV_CriticalControl`
18. `NUSV_TargetCore`
19. `NUSV_SelectionControl`
20. `NUSV_ExtraParamFormula`
21. `NUSV_SpecialParamFormula`
22. `NUSV_InstantCast`
23. `NUSV_EnemyLevels`
24. `NUSV_DifficultySlider`
25. `YEP_X_AnimatedSVEnemies`
26. `YEP_ItemCore`
27. `YEP_EquipCore`
28. `NUSV_ItemUpgrade`
29. `NUSV_SocketCore`
30. `WeaponSkill`
31. `NUSV_WeaponUnleash`
32. `NUSV_JobPoints`
33. `SRD_SummonCore`
34. `SRD_SummonBattlerImages`
35. `YEP_MessageCore`
36. `YEP_QuestJournal`
37. `YEP_SaveCore`
38. `YEP_MoveRouteCore`
39. `YEP_EventChasePlayer`
40. `YEP_RegionRestrictions`
41. `YEP_RegionEvents`
42. `NUSV_EventChaseStealth`
43. `YEP_VictoryAftermath`
44. `YEP_MainMenuManager`
45. `NUSV_ItemMenuCategories`
46. `NUSV_PartySystem`
47. `NUSV_ClassChange`
48. `NUSV_SkillLearn`
49. `NUSV_ItemSynthesis`
50. `NUSV_MainMenuBridge`
51. `NUSV_MapSelectEquip`
52. `NUSV_MapSelectItem`
53. `NUSV_MapSelectSkill`
54. `NUSV_ButtonCommonEvents`

File lain yang ada di folder tetapi tidak aktif di `plugins.js`: `AltMenuScreen`, `AltSaveScreen`, `EnemyBook`, `ItemBook`, `MadeWithMv`, `SimpleMsgSideView`, `TitleCommandPosition`, dan separator `--------------------`.

## NUSV_DamageCore

Fungsi: mengatur formula damage multiline, batas damage/heal, bypass cap, armor/magic penetration, dan bonus critical damage.

Skill/Item:

```text
<Damage Formula>
value = a.atk * 5 - b.def * 2;
if (b.isStateAffected(10)) value *= 1.25;
</Damage Formula>

<Damage Cap: 50000>
<Heal Cap: 50000>
<Bypass Damage Cap>
```

Actor/Class/Enemy/Weapon/Armor/State juga bisa memakai:

```text
<Damage Cap: 50000>
<Heal Cap: 50000>
<Bypass Damage Cap>
<Armor Penetration: 15%>
<Magic Penetration: 15%>
<Critical Damage: +25%>
```

Helper formula:

```text
nusvDef(b)
nusvMdf(b)
```

Contoh memakai armor penetration:

```text
<Damage Formula>
value = a.atk * 4 - nusvDef(b) * 2;
</Damage Formula>
```

## NUSV_CriticalControl

Fungsi: mengatur chance critical, multiplier critical, dan tambahan damage critical.

Skill/Item:

```text
<Critical Rate: 25%>
<Critical Rate: 0.25>
<Critical Multiplier: 250%>
<Critical Multiplier: 2.5>
<Flat Critical: 50% atk>
```

Actor/Class/Enemy/Weapon/Armor/State:

```text
<Critical Multiplier: +25%>
<Critical Multiplier: -25%>
<Flat Critical: +100>
<Flat Critical: -50>
<Certain Hit Critical Rate: +10%>
<Physical Critical Rate: +10%>
<Magical Critical Rate: +10%>
```

Formula khusus Skill/Item:

```text
<Critical Rate Formula>
rate = user.cri + 0.20;
rate -= target.cev;
</Critical Rate Formula>

<Critical Multiplier Formula>
value *= 3.0 + bonus;
</Critical Multiplier Formula>

<Flat Critical Formula>
value += 1.5 * user.luk + bonus;
</Flat Critical Formula>
```

Action Sequence:

```text
CRITICAL MULTIPLIER: 50%
CRITICAL MULTIPLIER: 2.5
CRITICAL MULTIPLIER: VARIABLE 3
FLAT CRITICAL: +100
FLAT CRITICAL: VARIABLE 3
FORCE CRITICAL
FORCE NO CRITICAL
NORMAL CRITICAL
```

## NUSV_TargetCore

Fungsi: memperluas scope target skill/item.

Skill/Item:

```text
<Repeat: 12>
<Target: Everybody>
<Target: 3 Random Any>
<Target: Target All Foes>
<Target: Target 3 Random Foes>
<Target: 6 Random Foes>
<Target: All Allies But User>
<Target: Target All Allies>
<Target: Target 3 Random Allies>
<Target: 6 Random Allies>
```

Target berdasarkan parameter:

```text
<Target: Everybody atk Multiple Of 10>
<Target: Allies hp Multiple Of 100>
<Target: Foes agi Multiple Of 5>
```

Parameter valid: `level`, `maxhp`, `maxmp`, `atk`, `def`, `mat`, `mdf`, `agi`, `luk`, `hp`, `mp`, `tp`.

Custom target:

```text
<Custom Target Eval>
for (var i = 0; i < foes.aliveMembers().length; ++i) {
  var member = foes.aliveMembers()[i];
  if (member.hpRate() < 0.5) targets.push(member);
}
</Custom Target Eval>
```

Teks bantuan target:

```text
<Custom Target Text>
text = "Menarget semua musuh yang terluka.";
</Custom Target Text>
```

Jika ada sistem row:

```text
<Target: Enemy Row>
<Target: Enemy Row 2>
<Target: Front Enemy Row>
<Target: Back Enemy Row>
<Target: Ally Row>
<Target: Ally Row 2>
<Target: Front Ally Row>
<Target: Back Ally Row>
```

## NUSV_SelectionControl

Fungsi: membatasi siapa yang boleh dipilih sebagai target.

Skill/Item:

```text
<Select Allies>
<Select Foes>
<Select Dead Allies>
<Cannot Select User>
<Only Select User>
```

Berdasarkan state/aktor/enemy/type:

```text
<Select State: 10>
<Select State: Poison>
<Cannot Select State: 10>
<Select Actor: 3>
<Cannot Select Actor: 3>
<Select Enemy: 5>
<Cannot Select Enemy: 5>
<Select Actor Type: Fighter>
<Select Enemy Type: Undead>
```

Untuk enemy type, pasang ini di Enemy:

```text
<Enemy Type: Undead>
```

Berdasarkan kondisi parameter:

```text
<Select HP Above: 50%>
<Select HP Below: 50%>
<Select MP Above: 25%>
<Select TP Below: 50>
<Select ATK Above: 100>
<Select DEF Below: 80>
<Select MAT Above: 120>
<Select MDF Below: 100>
<Select AGI Above: 75>
<Select LUK Below: 50>
```

Custom:

```text
<Custom Select Condition>
condition = target.hpRate() < 0.5;
</Custom Select Condition>

<Custom Select Text>
text = "Hanya bisa memilih ally yang terluka.";
</Custom Select Text>
```

## NUSV_ExtraParamFormula

Fungsi: mengatur X-Parameter dengan formula. X-Parameter memakai desimal, jadi `5% = 0.05`.

Kode parameter: `HIT`, `EVA`, `CRI`, `CEV`, `MEV`, `MRF`, `CNT`, `HRG`, `MRG`, `TRG`.

Actor/Class/Enemy/Weapon/Armor/State:

```text
<HIT Plus: +5%>
<EVA Plus: +10%>
<CRI Plus: +3%>
<CEV Plus: +5%>
<MEV Plus: +5%>
<MRF Plus: +5%>
<CNT Plus: +10%>
<HRG Plus: +3%>
<MRG Plus: +2%>
<TRG Plus: +5%>

<HIT Rate: 110%>
<EVA Rate: 125%>
<CRI Rate: 150%>
```

Custom formula:

```text
<HIT Formula>
value += user.agi * 0.0005;
</HIT Formula>

<CRI Formula>
if (user.hpRate() <= 0.5) value += 0.10;
</CRI Formula>
```

Jangan memanggil parameter yang sama di formulanya sendiri. Untuk `CRI Formula`, gunakan `base`, bukan `user.cri`.

## NUSV_SpecialParamFormula

Fungsi: mengatur S-Parameter dengan formula. S-Parameter juga rate desimal, jadi `100% = 1.00`.

Kode parameter: `TGR`, `GRD`, `REC`, `PHA`, `MCR`, `TCR`, `PDR`, `MDR`, `FDR`, `EXR`.

Actor/Class/Enemy/Weapon/Armor/State:

```text
<TGR Plus: +25%>
<GRD Plus: +20%>
<REC Plus: +10%>
<PHA Plus: +15%>
<MCR Plus: -10%>
<TCR Plus: +15%>
<PDR Plus: -10%>
<MDR Plus: -5%>
<FDR Plus: -25%>
<EXR Plus: +10%>

<TGR Rate: 125%>
<GRD Rate: 120%>
<REC Rate: 110%>
<MCR Rate: 90%>
<PDR Rate: 90%>
<MDR Rate: 95%>
```

Custom formula:

```text
<PDR Formula>
if (user.hpRate() <= 0.25) value *= 0.85;
</PDR Formula>

<REC Formula>
if (user.isStateAffected(20)) value += 0.20;
</REC Formula>
```

## NUSV_InstantCast

Fungsi: skill/item bisa langsung dieksekusi saat dipilih, lalu aktor bisa kembali input atau turn-nya dianggap selesai.

Skill/Item:

```text
<Instant Cast>
<Instant Cast: Turn>
<Instant Cast: Free>
<No Instant Cast>
```

Conditional:

```text
<Instant Cast Condition>
condition = user.hpRate() <= 0.5;
</Instant Cast Condition>
```

Script:

```js
NUSV.InstantCast.isInstant(item, user)
```

## NUSV_EnemyLevels

Fungsi: memberi level ke enemy dan opsional scaling stat/EXP/Gold.

Enemy:

```text
<Enemy Level: 10>
<Enemy Level: 5 to 12>
<Enemy Level: Party>
<Minimum Level: 5>
<Maximum Level: 30>
<Level Variance: 2>
<No Level Scaling>
```

Formula level:

```text
<Enemy Level Formula>
level = Math.floor(partyLevel + v[10]);
</Enemy Level Formula>
```

Growth per level di atas level 1:

```text
<Param Growth: 3%>
<MHP Growth: 5%>
<MMP Growth: 3%>
<ATK Growth: 4%>
<DEF Growth: 4%>
<MAT Growth: 4%>
<MDF Growth: 4%>
<AGI Growth: 2%>
<LUK Growth: 2%>
<EXP Growth: 10%>
<Gold Growth: 5%>
```

Plugin Command:

```text
NUSVEnemyLevel Set 1 20
NUSVEnemyLevel Add 1 5
NUSVEnemyLevel Reset 1
```

Troop index dimulai dari 1.

Script:

```js
enemy.level
enemy.nusvEnemyLevel()
enemy.nusvSetEnemyLevel(20)
enemy.nusvAddEnemyLevel(5)
enemy.nusvResetEnemyLevel()
```

## NUSV_DifficultySlider

Fungsi: mengatur difficulty 1 sampai 4, scaling enemy parameter, EXP, dan Gold.

Enemy:

```text
<No Difficulty Scaling>
<Difficulty Param Rate: 150%>
<Difficulty EXP Rate: 120%>
<Difficulty Gold Rate: 120%>

<Difficulty 3 Param Rate: 140%>
<Difficulty 4 Param Rate: 175%>
<Difficulty 3 EXP Rate: 120%>
<Difficulty 3 Gold Rate: 120%>
```

Plugin Command:

```text
NUSVDifficulty Set 1
NUSVDifficulty Set 2
NUSVDifficulty Set 3
NUSVDifficulty Set 4
NUSVDifficulty Next
NUSVDifficulty Previous
```

Default project saat ini:

- `1`: Easy
- `2`: Normal
- `3`: Hard
- `4`: Nightmare

## NUSV_ItemUpgrade

Fungsi: upgrade equipment menjadi `+1`, `+2`, dan seterusnya.

Weapon/Armor:

```text
<Upgrade Max: 10>
<Upgrade Gold: 500>
<Upgrade Material: Item 25, 2>
<Upgrade Success: 90%>
<Upgrade ATK: +3>
<Upgrade DEF: +2>
<Upgrade MAT: +4>
<Upgrade MDF: +4>
<Upgrade AGI: +1>
<Upgrade LUK: +1>
<Upgrade MHP: +20>
<Upgrade MMP: +10>
```

Formula:

```text
<Upgrade Cost Formula>
gold = 500 * Math.pow(1.4, level);
</Upgrade Cost Formula>

<Upgrade Success Formula>
chance = Math.max(25, 100 - level * 5);
</Upgrade Success Formula>
```

Script:

```js
NUSV.ItemUpgrade.level(item)
NUSV.ItemUpgrade.canUpgrade(item)
NUSV.ItemUpgrade.attempt(item)
```

Catatan: karena project memakai `YEP_ItemCore`, upgrade disimpan di equipment independent. Jangan kirim base database weapon/armor ke `attempt()` saat independent equipment aktif.

## NUSV_SocketCore

Fungsi: equipment punya socket, item socket memberi bonus parameter.

Weapon/Armor:

```text
<Sockets: 2>
```

Item material socket:

```text
<Socket Item>
<Socket MHP: +50>
<Socket MMP: +20>
<Socket ATK: +5>
<Socket DEF: +5>
<Socket MAT: +5>
<Socket MDF: +5>
<Socket AGI: +3>
<Socket LUK: +3>
<Socket Weapon Only>
<Socket Armor Only>
```

Script:

```js
NUSV.SocketCore.socketCount(equipment)
NUSV.SocketCore.sockets(equipment)
NUSV.SocketCore.canAttach(equipment, item)
NUSV.SocketCore.attach(equipment, item)
NUSV.SocketCore.remove(equipment, index)
```

`remove()` mengembalikan item socket ke party.

## WeaponSkill

Fungsi: mengganti skill Attack berdasarkan weapon.

Weapon:

```text
<skill_id:3>
```

Artinya normal attack dari weapon itu memakai Skill ID 3.

## NUSV_WeaponUnleash

Fungsi: mengganti Attack dengan skill khusus dari Actor/Class/Weapon/Armor/State. Bisa pakai chance dan priority. Jika tidak ada yang aktif, fallback ke `WeaponSkill`.

Actor/Class/Weapon/Armor/State:

```text
<Unleash Skill: 15>
<Unleash Skill: 15, 25%>
<Unleash Skill: 15, 25%, 10>
```

Format:

```text
<Unleash Skill: skillId>
<Unleash Skill: skillId, rate%>
<Unleash Skill: skillId, rate%, priority>
```

Advanced:

```text
<Unleash Entry>
skill = 220;
rate = 35;
priority = 15;
condition = user.level >= 20 && user.hpRate() <= 0.5;
</Unleash Entry>
```

Priority lebih tinggi dicek lebih dulu.

## NUSV_JobPoints

Fungsi: aktor mendapat JP setelah battle, per class atau shared tergantung parameter.

Enemy:

```text
<JP: 25>
<JP Rate: 150%>
```

Actor/Class/Weapon/Armor/State:

```text
<JP Gain: +5>
<JP Rate: 120%>
```

Plugin Command:

```text
NUSVJP Gain 1 50
NUSVJP Gain 1 100 5
NUSVJP Lose 2 25
NUSVJP Set 1 0
```

Script:

```js
actor.jp()
actor.jp(classId)
actor.gainJp(amount)
actor.gainJp(amount, classId)
actor.loseJp(amount)
actor.loseJp(amount, classId)
actor.setJp(amount)
actor.setJp(amount, classId)
```

## SRD_SummonCore

Fungsi: membuat skill summon aktor ke party/battle.

Skill:

```text
<Summon>
Actor ID: 2
Level: 10
Turns: 2
Animation: 51
Exit Animation: 51
X: master._homeX - 120
Y: master._homeY
</End Summon>
```

Yang paling penting:

- `Actor ID`: aktor yang disummon.
- `Level`: level summon.
- `Turns`: durasi turn. `-1` biasanya berarti tidak otomatis hilang.
- `Animation`: animasi saat muncul.
- `Exit Animation`: animasi saat hilang.
- `X` dan `Y`: posisi battler summon.

## SRD_SummonBattlerImages

Fungsi: summon actor bisa memakai gambar battler statis.

Actor:

```text
<Summon Battler Image: filename>
<Summon Battler Scale: 1.25>
<Summon Battler Hue: 0>
```

Nama file tanpa ekstensi, umumnya dari folder battler yang dipakai plugin.

## NUSV_ItemMenuCategories

Fungsi: menambah kategori item menu.

Item/Weapon/Armor:

```text
<Menu Category: Material>
<Menu Category: Material, Forge>
```

Kategori bawaan: `Item`, `Weapon`, `Armor`, `KeyItem`, `All`.

Kategori project saat ini:

```text
Item,Weapon,Armor,KeyItem,Consumable,Material,Forge,Valuable
```

## NUSV_ItemSynthesis

Fungsi: crafting item/weapon/armor dari recipe di notetag output.

Pasang di Item/Weapon/Armor yang ingin dibuat:

```text
<Synthesis Recipe>
Item 5: 3
Weapon 2: 1
Armor 4: 2
Gold: 500
</Synthesis Recipe>

<Synthesis Amount: 3>
<Synthesis Category: Forge>
```

Unlock:

```text
<Synthesis Unlock Switch: 25>
<Synthesis Unlock Item: 50>
<Synthesis Unlock Skill: 30>
<Synthesis Unlock Class: 5>
```

Custom:

```text
<Synthesis Requirement>
condition = $gameVariables.value(10) >= 3;
</Synthesis Requirement>

<Synthesis Cost Eval>
costOk = $gameVariables.value(15) >= 2;
</Synthesis Cost Eval>

<Synthesis Cost Pay>
$gameVariables.setValue(15, $gameVariables.value(15) - 2);
</Synthesis Cost Pay>

<Synthesis Effect>
$gameVariables.setValue(20, $gameVariables.value(20) + 1);
</Synthesis Effect>
```

Plugin Command:

```text
NUSVSynthesis Open
NUSVSynthesis Craft Item 5
NUSVSynthesis Craft Weapon 2
NUSVSynthesis Craft Armor 4
```

Script:

```js
NUSV.ItemSynthesis.canCraft($dataItems[5])
NUSV.ItemSynthesis.craft($dataItems[5])
```

## NUSV_PartySystem

Fungsi: menu formation/party, battle member dan reserve, lock/require actor.

Plugin Command:

```text
OpenPartyMenu
ShowBattleFormation
HideBattleFormation
EnableBattleFormation
DisableBattleFormation

LockActor 3
LockActor 4 5 6
UnlockActor 3
RequireActor 3
UnrequireActor 3

ChangePartyMax 5
ChangePartyTotalMax 8
```

Bedanya:

- `LockActor`: aktor tidak bisa dipindah dari posisi sekarang.
- `RequireActor`: aktor boleh dipindah, tapi harus tetap ada di slot aktif sebelum keluar menu.

Script:

```js
$gameParty.nusvMaxBattleMembers()
$gameParty.nusvSetMaxBattleMembers(n)
$gameParty.nusvLockActor(actorId)
$gameParty.nusvUnlockActor(actorId)
$gameParty.nusvRequireActor(actorId)
$gameParty.nusvUnrequireActor(actorId)
$gameParty.nusvIsActorLocked(actorId)
$gameParty.nusvIsActorRequired(actorId)
```

## NUSV_ClassChange

Fungsi: menu ganti class, unlock/lock class, tier class, requirement class, level class, dan sinkronisasi skill learnset class.

Class:

```text
<Class Tier: 2>

<Class Max Level: 20>

<Class Description>
Fighter ofensif yang memakai heavy weapon.
</Class Description>

<Class Change Level: 20>
<Class Change Switch: 15>
<Class Change Item: 7>
<Class Change Weapon: 5>
<Class Change Armor: 8>
<Class Change From: 1>
<Class Change From: Fighter>
<Class Change Actor: 3>
<Class Change Race: Avesari>
```

`<Class Max Level: 20>` membatasi level maksimal aktor saat sedang memakai class itu. Batas ini tidak menaikkan limit global/actor dari `YEP_CoreEngine`; plugin memakai batas yang lebih rendah antara max level actor dan max level class.

Learnset bawaan di database Class sekarang diperlakukan sebagai skill aktif class:

- Skill dipasang berdasarkan level class aktif (`actor.nusvClassLevel()`).
- Saat actor pindah class, skill dari learnset class lama dilepas.
- Setelah masuk class baru, skill dari learnset class baru dipasang sesuai level class tersebut.
- Skill ID yang berada di learnset database Class dianggap sebagai skill class aktif, sehingga akan mengikuti class aktif.

Di `js/plugins.js`, parameter `Maintain Level` untuk `NUSV_ClassChange` diset `false`, sehingga setiap class mengingat levelnya masing-masing.

Race bisa dibaca dari:

```text
<Race: Avesari>
```

di note Actor, atau dari data internal `actor._nusvRace`.

Custom requirement:

```text
<Class Change Requirement>
condition = actor.level >= 30;
condition = condition && $gameSwitches.value(20);
</Class Change Requirement>
```

Plugin Command:

```text
NUSVClass Unlock 5
NUSVClass Lock 5
NUSVClass Change 1 5
```

Script:

```js
$gameSystem.nusvUnlockClass(5)
$gameSystem.nusvLockClass(5)
$gameSystem.nusvIsClassUnlocked(5)
actor.nusvCanChangeClass(5)
actor.nusvChangeClass(5)
actor.nusvClassTier()
actor.nusvClassMaxLevel()
```

Untuk class yang belum boleh dimainkan, bisa pakai switch yang tidak pernah ON:

```text
<Class Change Switch: 999>
```

## NUSV_SkillLearn

Fungsi: menu learn skill dengan biaya JP/Gold/item dan requirement.

Skill:

```text
<Learn JP: 25>
<Learn Gold: 1000>
<Learn Item: 7, 2>
<Learn Weapon: 5, 1>
<Learn Armor: 8, 1>
<Learn Level: 20>
<Learn Class: 5>
<Learn Class: Warrior>
<Learn Race: Avesari>
<Learn Switch: 25>
<Learn Skill: 30>
<Learn Skill Type: 2>
<Hide If Learned>
```

`<Learn Level: 20>` memakai level class aktif jika `NUSV_ClassChange` tersedia. Jika tidak, fallback ke level actor biasa.

Deskripsi:

```text
<Learn Description>
Teknik pedang tingkat lanjut.
</Learn Description>
```

Custom:

```text
<Learn Requirement>
condition = actor.level >= 30;
condition = condition && actor.jp() >= 50;
</Learn Requirement>

<Learn Cost Eval>
costOk = $gameVariables.value(10) >= 3;
</Learn Cost Eval>

<Learn Cost Pay>
$gameVariables.setValue(10, $gameVariables.value(10) - 3);
</Learn Cost Pay>
```

Plugin Command:

```text
NUSVSkillLearn Open
NUSVSkillLearn Learn 1 25
```

Script:

```js
actor.nusvCanLearnSkill(skillId)
actor.nusvLearnSkill(skillId)
actor.nusvSkillLearnCost(skillId)
```

## NUSV_MainMenuBridge

Fungsi: jembatan agar menu dari `NUSV_ClassChange`, `NUSV_SkillLearn`, `NUSV_ItemSynthesis`, dan `NUSV_PartySystem` tetap muncul walau memakai `YEP_MainMenuManager`.

Tidak ada notetag. Letakkan setelah semua plugin menu NUSV. Di project ini posisinya sudah benar: setelah `NUSV_ItemSynthesis`.

Symbol menu:

```text
nusvClass
nusvSkillLearn
nusvSynthesis
nusvParty
```

## NUSV_MapSelectEquip

Fungsi: membuka window pilih weapon/armor di map lalu menyimpan database ID ke variable. Cancel menyimpan `0`.

Plugin Command:

```text
MapSelectEquip 10 Both
MapSelectEquip 11 Weapon
MapSelectEquip 12 Armor

MapSelectEquip 10 Weapon WType 3
MapSelectEquip 10 Armor AType 2
MapSelectEquip 10 Armor EType 4
```

Format:

```text
MapSelectEquip variableId Both
MapSelectEquip variableId Weapon
MapSelectEquip variableId Armor
```

## NUSV_MapSelectItem

Fungsi: pilih item di map dengan filter kategori, lalu simpan database ID ke variable. Cancel menyimpan `0`.

Plugin Command:

```text
MapSelectItem 10 All
MapSelectItem 11 Normal
MapSelectItem 12 KeyItem
MapSelectItem 13 Category Material
MapSelectItem 14 Category Forge
MapSelectItem 15 Category Valuable
```

Plugin ini hanya untuk Item. Weapon/Armor gunakan `NUSV_MapSelectEquip`.

## NUSV_MapSelectSkill

Fungsi: pilih skill yang sudah dipelajari aktor, lalu simpan Skill ID ke variable. Cancel menyimpan `0`.

Plugin Command:

```text
MapSelectSkill 1 0 10
MapSelectSkill 1 2 10
MapSelectSkillParty 1 2 10
```

Format:

```text
MapSelectSkill actorId skillTypeId variableId
MapSelectSkillParty partyIndex skillTypeId variableId
```

`skillTypeId = 0` berarti semua skill type.

## NUSV_ButtonCommonEvents

Fungsi: bind tombol keyboard ke Common Event.

Plugin Parameter `Default Bindings`:

```text
1:10,2:11,H:20,J:21
```

Artinya tombol `1` menjalankan Common Event 10, tombol `H` menjalankan Common Event 20, dan seterusnya.

Plugin Command:

```text
NUSVButtonCE Bind H 10
NUSVButtonCE Clear H
NUSVButtonCE ClearAll
NUSVButtonCE Reset
NUSVButtonCE Run H
NUSVButtonCE Enable
NUSVButtonCE Disable
```

Script:

```js
NUSV.ButtonCommonEvents.bind('H', 10)
NUSV.ButtonCommonEvents.clear('H')
NUSV.ButtonCommonEvents.clearAll()
NUSV.ButtonCommonEvents.reset()
NUSV.ButtonCommonEvents.run('H')
NUSV.ButtonCommonEvents.eventId('H')
```

Key yang didukung: `A` sampai `Z`, `0` sampai `9`, `F1` sampai `F12`, `TAB`, `SHIFT`, `CTRL`, `ALT`, `SPACE`, `ENTER`, `ESC`, `INSERT`, `DELETE`, `HOME`, `END`, `PAGEUP`, `PAGEDOWN`, `LEFT`, `UP`, `RIGHT`, `DOWN`, `NUM0` sampai `NUM9`, dan beberapa simbol seperti `COMMA`, `MINUS`, `PERIOD`, `SLASH`.

Jika `Forbid Default Bound Keys = true`, jangan bind tombol kontrol MV seperti `Z`, `X`, `ENTER`, `ESC`, arah panah, `SHIFT`, `Q`, `W`, `PAGEUP`, `PAGEDOWN`.

## NUSV_EventChaseStealth

Fungsi: stealth mode untuk event chase/detection.

Plugin Command:

```text
NUSVStealth On
NUSVStealth Off
NUSVStealth Toggle
NUSVStealth Time 300
NUSVStealth Add 120
NUSVStealth Set 600
NUSVStealth Clear
```

Script:

```js
$gamePlayer.nusvSetStealth(true)
$gamePlayer.nusvSetStealth(false)
$gamePlayer.nusvSetTimedStealth(300)
$gamePlayer.nusvAddStealthTime(120)
$gamePlayer.nusvIsStealth()
$gamePlayer.nusvStealthTime()
```

Event Comment di page event:

```text
<Ignore Stealth>
<Stealth Only>
<Stealth Detect Region: 10>
<Stealth Block Region: 11>
```

Region stealth global diatur lewat parameter `Stealth Regions`, contoh:

```text
5,6,7
```

## NUSV_OptionsCore

Fungsi: mengatur isi Options menu dan menambah option persistent.

Option tambahan:

- `Auto Dash`
- `Battle Log Speed` dari 1 sampai 5
- `Animation Speed` dari 1 sampai 5

Script:

```js
ConfigManager.nusvAutoDash
ConfigManager.nusvBattleLogSpeed
ConfigManager.nusvAnimationSpeed
```

Tidak ada notetag.

## YEP_CoreEngine

Fungsi: core Yanfly untuk banyak plugin lain. Mengatur resolusi, limit gold/item/level/stat, font, window, battleback scaling, dan beberapa bugfix.

Notetag penting umumnya tidak dipakai langsung untuk gameplay di plugin ini. Setting utama ada di Plugin Manager.

## YEP_BattleEngineCore

Fungsi: mengubah flow battle, battle log, visual selection, action sequence, sideview control, state timing.

Plugin Command:

```text
setBattleSys DTB
setBattleSys CTB
```

Skill/Item:

```text
<Display Text: text>
<Display Icon: x>
<Cast Animation: x>
<Action Speed: x>
```

Actor/Enemy/State/Weapon/Armor/Class:

```text
<Reflect Animation ID: x>
<Sprite Cannot Move>
<Anchor X: 0.5>
<Anchor Y: 1.0>
```

State timing:

```text
<Action Start: x>
<Turn Start: x>
```

Action Sequence dasar memakai blok seperti:

```text
<setup action>
</setup action>
<whole action>
</whole action>
<target action>
</target action>
<follow action>
</follow action>
<finish action>
</finish action>
```

## YEP_X_ActSeqPack1, Pack2, Pack3

Fungsi: menambah perintah action sequence untuk battle.

Pack 1 biasanya untuk perintah dasar seperti movement, opacity, wait, animation, effect.

Pack 2 biasanya untuk visual action sequence seperti motion, projectile, jump, float, face direction.

Pack 3 menambah kamera/zoom/focus.

Contoh target selector yang sering dipakai:

```text
user
target
targets
actors
all actors
dead actors
actors not user
enemies
all enemies
dead enemies
friends
opponents
all alive
all members
focus
not focus
```

## YEP_X_BattleSysCTB

Fungsi: memakai CTB atau Charge Turn Battle.

Plugin Command:

```text
setBattleSys CTB
setBattleSys DTB
```

Actor/Enemy:

```text
<CTB Icon: x>
<CTB Border Color: x>
<CTB Background Color: x>
```

Actor khusus class:

```text
<Class x CTB Icon: y>
<Warrior CTB Icon: x>
```

Skill/Item:

```text
<CTB Speed: x>
<CTB Speed: x%>
<CTB Speed: +x>
<CTB Speed: -x>
<CTB Order: +x>
<CTB Order: -x>
<After CTB: x>
<After CTB: x%>
```

Trait object:

```text
<CTB Start: +x>
<CTB Start: +x%>
<CTB Turn: +x>
<CTB Turn: +x%>
```

Eval:

```text
<Target CTB Speed Eval>
speed = target.hpRate() * max;
</Target CTB Speed Eval>

<Target CTB Order Eval>
order = 3;
</Target CTB Order Eval>

<After CTB Eval>
speed = user.mpRate() * max;
</After CTB Eval>
```

## YEP_SkillCore

Fungsi: menambah kontrol biaya skill, requirement, custom execution.

Skill:

```text
<HP Cost: x>
<HP Cost: x%>
<MP Cost: x>
<MP Cost: x%>
<TP Cost: x>
<TP Cost: x%>
<Hide in Battle>
<Hide in Field>
```

Lunatic mode yang umum:

```text
<Custom HP Cost>
cost = user.mhp * 0.10;
</Custom HP Cost>

<Custom Requirement>
value = user.level >= 10;
</Custom Requirement>

<Custom Execution>
$gameSwitches.setValue(10, true);
</Custom Execution>
```

## YEP_BuffsStatesCore

Fungsi: mengatur buff/debuff limit, tampilan turn state, state counter, dan efek custom state.

Actor/Class/Enemy/Weapon/Armor/State:

```text
<Max atk Buff: +2>
<Max def Debuff: -1>
```

Skill/Item:

```text
<atk Buff Turns: +2>
<def Debuff Turns: -1>
<State 10 Turns: +2>
<State Poison Turns: -1>
```

State:

```text
<Show Turns>
<Hide Turns>
<Turn Font Size: 16>
<Turn Alignment: Left>
<Turn Alignment: Center>
<Turn Alignment: Right>
<Turn Buffer X: +2>
<Turn Buffer Y: -2>
<Turn Color: 10>
<Reapply Ignore Turns>
<Reapply Reset Turns>
<Reapply Add Turns>
```

Efek custom state:

```text
<Custom Apply Effect>
</Custom Apply Effect>
<Custom Remove Effect>
</Custom Remove Effect>
<Custom Leave Effect>
</Custom Leave Effect>
<Custom Turn Start Effect>
</Custom Turn Start Effect>
<Custom Action Start Effect>
</Custom Action Start Effect>
<Custom Action End Effect>
</Custom Action End Effect>
<Custom Regenerate Effect>
</Custom Regenerate Effect>
<Custom Turn End Effect>
</Custom Turn End Effect>
<Custom Battle Effect>
</Custom Battle Effect>
<Custom Victory Effect>
</Custom Victory Effect>
<Custom Escape Effect>
</Custom Escape Effect>
<Custom Defeat Effect>
</Custom Defeat Effect>
```

Script state counter:

```js
battler.clearStateCounters()
battler.setStateCounter(stateId, value)
battler.addStateCounter(stateId, value)
battler.clampStateCounter(stateId, min, max)
battler.removeStateCounter(stateId)
battler.getStateCounter(stateId)
```

## YEP_AutoPassiveStates

Fungsi: memberi passive state otomatis dari actor/class/skill/equip/enemy/global.

Actor/Class/Skill/Weapon/Armor/Enemy:

```text
<Passive State: 10>
<Passive State: 10, 11, 12>
<Passive State: 10 to 15>
```

State condition:

```text
<Passive Condition: HP Above 50%>
<Passive Condition: HP Below 25%>
<Passive Condition: MP Above 50%>
<Passive Condition: atk Above 100>
<Passive Condition: def Below 80>
<Passive Condition: Switch 10 ON>
<Passive Condition: Switch 10 OFF>
<Passive Condition: Variable 5 Above 10>
<Passive Condition: Variable 5 Below 10>
```

Custom:

```text
<Custom Passive Condition>
condition = user.hpRate() <= 0.25;
</Custom Passive Condition>
```

## YEP_ElementCore

Fungsi: multi element, absorb, reflect, amplify, magnify, null, force element rate.

Skill/Item:

```text
<Bypass Element Reflect>
<Multiple Elements: 3>
<Multiple Elements: 3 to 5>
<Multiple Elements: Fire, Ice>
<Multi-Element Rule: Lowest>
<Multi-Element Rule: Add>
<Multi-Element Rule: Multiply>
<Multi-Element Rule: Highest>
<Multi-Element Rule: Average>
```

Actor/Class/Enemy/Weapon/Armor/State:

```text
<Element Absorb: 3>
<Element Absorb: Fire, Ice>
<Element Reflect 3: +25%>
<Element Reflect Fire: +25%>
<Element Magnify 3: +25%>
<Element Amplify Fire: +25%>
<Element Null>
<Force Element 3 Rate: 50%>
<Force Element Fire Rate: 50%>
```

## YEP_BattleAICore

Fungsi: membuat AI enemy lebih terstruktur.

Enemy:

```text
<AI Level: 80>
<AI Consider Taunt>

<AI Priority>
Always: Skill 10, Lowest HP%
HP% <= 50%: Heal, Lowest HP%
Turn 3: Skill 20, Random
</AI Priority>
```

Semakin tinggi `AI Level`, semakin patuh enemy pada daftar priority.

## YEP_BaseTroopEvents

Fungsi: menjalankan event dari Base Troop di semua battle. Parameter project memakai `Base Troop ID: 1`.

Tidak ada notetag penting. Buat event battle umum di Troop ID 1.

## YEP_X_AnimatedSVEnemies

Fungsi: enemy bisa memakai sideview battler actor-style, breathing, floating, scaling, weapon, shadow.

Enemy:

```text
<Breathing>
<No Breathing>
<Breathing Speed: x>
<Breathing Rate X: 0.001>
<Breathing Rate Y: 0.020>
<Enable HP Link Breathing>
<Disable HP Link Breathing>

<Floating>
<Floating Speed: x>
<Floating Rate: 0.3>
<Floating Height: 50>
<Floating Death>
<No Floating Death>

<Scale Sprite: 150%>
<Scale Sprite Width: 150%>
<Scale Sprite Height: 150%>
<Sideview Battler: filename>
<Sideview Anchor X: 0.5>
<Sideview Anchor Y: 1.0>
<Sideview Width: x>
<Sideview Height: x>
<Sideview Collapse>
<Sideview No Collapse>
<Sideview Frame Speed: x>
<Sideview Show State Overlay>
<Sideview Hide State Overlay>
<Sideview Attack Motion: swing>
<Sideview Weapon: x>
<Sideview Weapon: x, swing, animationId>
<Sideview Idle Motion: walk>
<Sideview Damage Motion: damage>
<Sideview Evade Motion: evade>
<Sideview Guard Motion: guard>
<Sideview Dead Motion: dead>
<Sideview Show Shadow>
<Sideview Hide Shadow>
<Sideview Shadow Width: 100%>
<Sideview Shadow Height: 100%>
```

State:

```text
<Hide Sideview Weapon>
```

## YEP_ItemCore

Fungsi: item scene baru, independent weapon/armor, max item, variasi item.

Notetag yang sering dipakai:

```text
<Max Item: x>
<Max Item: 0>
<Independent Item>
<Not Independent Item>
<Random Variance: x>
<No Random Variance>
<Priority Name>
prefix text
</Priority Name>
```

Karena project memakai `YEP_ItemCore`, sistem upgrade/socket NUSV menyimpan data di equipment independent.

## YEP_EquipCore

Fungsi: equipment slot fleksibel dan aturan equip.

Actor/Class/Enemy:

```text
<Equip Slot>
Weapon
Shield
Head
Body
Accessory
</Equip Slot>
```

Weapon/Armor:

```text
<Equip Requirement>
condition = user.level >= 10;
</Equip Requirement>

<Custom Equip Requirement>
condition = user.atk >= 50;
</Custom Equip Requirement>
```

## YEP_MessageCore

Fungsi: memperluas message window, text code, name box, word wrap.

Text code yang umum:

```text
\n<x>       nama actor ID x
\p<x>       nama party member slot x
\v[x]       variable x
\s[x]       switch x
\i[x]       icon x
\c[x]       warna teks x
\{          perbesar font
\}          perkecil font
\|          wait 60 frame
\!          tunggu input
\^          jangan tunggu input
```

Name box:

```text
\n<Harold>
\nc<Harold>
\nr<Harold>
```

## YEP_QuestJournal

Fungsi: sistem journal quest lengkap dari Plugin Parameter.

Plugin Command utama:

```text
Quest Journal Open
Quest Journal Open To x
Quest Journal Show
Quest Journal Hide
Quest Journal Enable
Quest Journal Disable

Quest Add x
Quest Add x to y
Quest Remove x
Quest Set Completed x
Quest Set Failed x
Quest Set Available x

Quest x Change Description Entry To y
Quest x Show Objective y
Quest x Hide Objective y
Quest x Complete Objective y
Quest x Fail Objective y
Quest x Normalize Objective y
Quest x Show All Objectives
Quest x Hide All Objectives

Quest x Show Reward y
Quest x Hide Reward y
Quest x Claim Reward y
Quest x Deny Reward y
Quest x Normalize Reward y
Quest x Show All Rewards
Quest x Hide All Rewards

Quest x Change Subtext Entry To y
```

Gunakan `x to y` atau daftar `x, x, x` untuk batch sesuai dokumentasi YEP.

## YEP_SaveCore

Fungsi: mengatur tampilan save/load, jumlah file save, info yang tampil, dan beberapa script untuk save.

Biasanya tidak memakai notetag database. Setting dilakukan dari Plugin Manager.

## YEP_MoveRouteCore

Fungsi: memperluas Move Route event.

Contoh script di Move Route:

```js
this.stepForward()
this.stepBackward()
this.moveTowardPlayer()
this.moveAwayFromPlayer()
this.turnTowardPlayer()
this.turnAwayFromPlayer()
```

Plugin ini juga menjadi dasar untuk extension movement seperti `YEP_X_ExtMovePack1` jika dipakai.

## YEP_EventChasePlayer

Fungsi: event bisa mengejar player ketika melihat/mendekati player.

Biasanya dipakai lewat movement route / custom move route script dari event. Plugin ini juga dipakai oleh `NUSV_EventChaseStealth`.

Contoh konsep event:

```js
this._chaseRange = 5
this._fleeRange = 0
this._sightLock = 300
```

Untuk stealth override, pakai Event Comment dari `NUSV_EventChaseStealth`.

## YEP_RegionRestrictions

Fungsi: region tertentu bisa melarang player/event lewat.

Setting utamanya di Plugin Manager. Pakai Region ID di map untuk menentukan area yang tidak bisa dilewati atau hanya dibatasi untuk player/event tertentu.

## YEP_RegionEvents

Fungsi: menghubungkan Region ID dengan Common Event.

Setting utamanya di Plugin Manager. Cocok untuk trap, area effect, langkah khusus, atau tile interaktif berdasarkan region.

## YEP_VictoryAftermath

Fungsi: mengubah layar victory setelah battle, EXP, item drop, level up, dan pesan aftermath.

Umumnya setting ada di Plugin Manager. Terhubung dengan battle reward seperti JP dari `NUSV_JobPoints`.

## YEP_MainMenuManager

Fungsi: mengatur daftar command main menu.

Project ini memakai `NUSV_MainMenuBridge` agar command `Class`, `Learn Skills`, `Synthesis`, dan `Formation` tetap aman muncul bersama YEP Main Menu Manager.

## Community_Basic

Fungsi: setting dasar resolusi, cache, rendering mode, dan always dash.

Tidak ada notetag/plugin command.

## CustomLogo

Fungsi: menampilkan logo saat game dibuka.

Setting utama:

- `logo1ImageName`, `logo2ImageName`, `logo3ImageName`
- posisi `logoX`, `logoY`
- `logoSkippable`
- fade in/out dan durasi
- `allowTotalSkip`

Tidak ada notetag/plugin command.

## Plugin Tidak Aktif di plugins.js

Bagian ini untuk file yang ada di folder tetapi tidak sedang aktif.

### AltMenuScreen

Mengubah layout menu. Tidak ada notetag/plugin command.

### AltSaveScreen

Mengubah layout save/load. Tidak ada notetag/plugin command.

### EnemyBook

Fungsi: bestiary/enemy book.

Enemy:

```text
<desc1:teks baris 1>
<desc2:teks baris 2>
<book:no>
```

Plugin Command:

```text
EnemyBook open
EnemyBook add 3
EnemyBook remove 4
EnemyBook complete
EnemyBook clear
```

### ItemBook

Fungsi: item book untuk item/weapon/armor.

Item/Weapon/Armor:

```text
<book:no>
```

Plugin Command:

```text
ItemBook open
ItemBook add weapon 3
ItemBook add armor 4
ItemBook remove armor 5
ItemBook remove item 6
ItemBook complete
ItemBook clear
```

### MadeWithMv

Menampilkan splash screen `Made with MV` atau custom splash. Tidak ada notetag/plugin command.

### SimpleMsgSideView

Mengubah tampilan pesan pada sideview battle. Tidak ditemukan notetag utama dari header.

### TitleCommandPosition

Mengubah posisi title command window.

Parameter:

- `Offset X`
- `Offset Y`
- `Width`
- `Background`

Tidak ada notetag/plugin command.

## Tips Praktis

- Untuk skill kompleks, biasanya gabungkan `NUSV_TargetCore`, `NUSV_SelectionControl`, `NUSV_DamageCore`, dan `NUSV_CriticalControl`.
- Untuk progression karakter, pakai urutan konsep: `NUSV_JobPoints` memberi JP, `NUSV_SkillLearn` memakai JP, `NUSV_ClassChange` membuka class lanjutan.
- Untuk equipment unik, karena `YEP_ItemCore` aktif, gunakan item independent agar upgrade dan socket tidak tercampur antar copy.
- Untuk enemy scaling, jangan aktifkan growth global kalau balancing sudah dibuat manual. Pakai notetag growth hanya pada enemy yang memang perlu adaptive level.
- Untuk menu, biarkan `NUSV_MainMenuBridge` tetap berada setelah semua plugin menu.
