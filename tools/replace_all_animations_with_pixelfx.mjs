import { loadEffect, renderFrames } from './pixelfx/tools/lib/fxlib.mjs';
import { encodePNG } from './pixelfx/tools/lib/png.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ANIMATIONS_JSON_PATH = path.join(PROJECT_ROOT, 'data', 'Animations.json');
const SKILLS_JSON_PATH = path.join(PROJECT_ROOT, 'data', 'Skills.json');
const ITEMS_JSON_PATH = path.join(PROJECT_ROOT, 'data', 'Items.json');
const PLUGINS_JS_PATH = path.join(PROJECT_ROOT, 'js', 'plugins.js');
const IMG_ANIM_DIR = path.join(PROJECT_ROOT, 'img', 'animations');

// Palette definitions for recoloring
const PALETTES = {
  chronosGold: ["#1a1005", "#47300c", "#876017", "#c4962b", "#fed95f", "#ffffff"],
  temporalViolet: ["#0c051a", "#26134a", "#4a248f", "#7742d4", "#6ee2ff", "#ffffff"],
  rewindCyan: ["#04151a", "#0d353b", "#1e6b6f", "#41af9d", "#a2edd4", "#ffffff"],
  hellfireCrimson: ["#1a0303", "#450909", "#8a1616", "#e03b14", "#fca328", "#ffffff"],
  glacialAzure: ["#041221", "#0b2c4d", "#1c5d94", "#40a5e3", "#a8e5ff", "#ffffff"],
  deepIce: ["#061324", "#103259", "#24619b", "#58aee6", "#c3f0ff", "#ffffff"],
  highVoltage: ["#071a1c", "#103e42", "#218080", "#45d4c8", "#fffa96", "#ffffff"],
  azureTide: ["#041426", "#0c335e", "#1b62a6", "#3f9ee3", "#9fe2ff", "#ffffff"],
  graniteEarth: ["#17120e", "#382c23", "#695444", "#a88e76", "#ded1be", "#ffffff"],
  emeraldGale: ["#081714", "#13382f", "#266b59", "#4ab092", "#afffe8", "#ffffff"],
  radiantSolar: ["#1f1604", "#4a350a", "#8c6716", "#dbab2a", "#fff07d", "#ffffff"],
  cosmicVoid: ["#06020c", "#18092a", "#351459", "#6723a3", "#b766f7", "#ffffff"],
  singularity: ["#000000", "#12021a", "#2b073d", "#5b147d", "#aa40de", "#ffffff"],
  bloodDrain: ["#170202", "#3b0606", "#751010", "#bf2020", "#ff6b6b", "#ffffff"],
  bloodReaver: ["#1c0404", "#470c0c", "#871b1b", "#d93838", "#ff8787", "#ffffff"],
  nightshadeViolet: ["#0e051c", "#271247", "#522591", "#8e47f0", "#d3a8ff", "#ffffff"],
  bloodRage: ["#210404", "#4a0b0b", "#8a1616", "#e02d2d", "#ff8282", "#ffffff"],
  goldenChi: ["#241505", "#57350c", "#9c6317", "#db9827", "#ffe57f", "#ffffff"],
  warRageYellow: ["#261605", "#5c370e", "#a1631a", "#e8992e", "#ffdc78", "#ffffff"]
};

// Complete replacement list of 57 PixelFX animations (IDs 1 to 57)
const ALL_PIXELFX_ANIMATIONS = [
  // 1: Basic Hit
  {
    id: 1,
    filename: 'Pix_HitSpark',
    name: 'Pix - Hit Spark',
    fxId: 'impacts/hit-spark',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 255, 200], flashDuration: 3, flashScope: 1, se: { name: 'Blow3', pan: 0, pitch: 100, volume: 90 } }
    ]
  },
  // 2: Sword Slash
  {
    id: 2,
    filename: 'Pix_SwordSlash',
    name: 'Pix - Sword Slash',
    fxId: 'melee/sword-slash',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 255, 180], flashDuration: 3, flashScope: 1, se: { name: 'Slash1', pan: 0, pitch: 130, volume: 85 } }
    ]
  },
  // 3: Spear Thrust
  {
    id: 3,
    filename: 'Pix_SpearThrust',
    name: 'Pix - Spear Thrust',
    fxId: 'melee/thrust',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 255, 180], flashDuration: 3, flashScope: 1, se: { name: 'Attack2', pan: 0, pitch: 120, volume: 85 } }
    ]
  },
  // 4: Arrow Shot
  {
    id: 4,
    filename: 'Pix_ArrowShot',
    name: 'Pix - Arrow Shot',
    fxId: 'projectiles/arrow',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 255, 150], flashDuration: 3, flashScope: 1, se: { name: 'Crossbow', pan: 0, pitch: 100, volume: 85 } }
    ]
  },
  // 5: Beast Claw
  {
    id: 5,
    filename: 'Pix_BeastClaw',
    name: 'Pix - Beast Claw',
    fxId: 'melee/claw-swipe',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 200, 200, 180], flashDuration: 3, flashScope: 1, se: { name: 'Slash2', pan: 0, pitch: 100, volume: 85 } }
    ]
  },
  // 6: Heavy Cleave Blood
  {
    id: 6,
    filename: 'Pix_HeavyCleaveBlood',
    name: 'Pix - Heavy Cleave Blood',
    fxId: 'melee/heavy-cleave',
    palette: PALETTES.bloodReaver,
    position: 1,
    timings: [
      { frame: 0, flashColor: [220, 40, 40, 200], flashDuration: 4, flashScope: 1, se: { name: 'Slash2', pan: 0, pitch: 100, volume: 90 } },
      { frame: 6, flashColor: [255, 70, 70, 220], flashDuration: 6, flashScope: 1, se: { name: 'Sword2', pan: 0, pitch: 95, volume: 95 } }
    ]
  },
  // 7: Dagger Flurry Shadow
  {
    id: 7,
    filename: 'Pix_DaggerFlurry',
    name: 'Pix - Dagger Flurry Shadow',
    fxId: 'melee/dagger-flurry',
    palette: PALETTES.nightshadeViolet,
    position: 1,
    timings: [
      { frame: 0, flashColor: [180, 100, 255, 200], flashDuration: 4, flashScope: 1, se: { name: 'Slash3', pan: 0, pitch: 110, volume: 90 } },
      { frame: 6, flashColor: [220, 140, 255, 220], flashDuration: 5, flashScope: 1, se: { name: 'Sword1', pan: 0, pitch: 130, volume: 85 } }
    ]
  },
  // 8: Cataclysm Ground Slam
  {
    id: 8,
    filename: 'Pix_GroundSlam',
    name: 'Pix - Cataclysm Ground Slam',
    fxId: 'impacts/ground-slam',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [255, 240, 200, 200], flashDuration: 5, flashScope: 2, se: { name: 'Blow2', pan: 0, pitch: 90, volume: 90 } },
      { frame: 10, flashColor: [255, 255, 255, 255], flashDuration: 8, flashScope: 2, se: { name: 'Earth2', pan: 0, pitch: 95, volume: 95 } }
    ]
  },
  // 9: Shield Block
  {
    id: 9,
    filename: 'Pix_ShieldBlock',
    name: 'Pix - Shield Block',
    fxId: 'impacts/shield-block',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 220, 200], flashDuration: 4, flashScope: 1, se: { name: 'Parry', pan: 0, pitch: 100, volume: 90 } }
    ]
  },
  // 10: Defensive Barrier
  {
    id: 10,
    filename: 'Pix_DefensiveBarrier',
    name: 'Pix - Defensive Barrier',
    fxId: 'scifi/force-field',
    palette: PALETTES.radiantSolar,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 240, 160, 180], flashDuration: 5, flashScope: 1, se: { name: 'Saint2', pan: 0, pitch: 110, volume: 85 } }
    ]
  },
  // 11: Chi Shockwave
  {
    id: 11,
    filename: 'Pix_ChiShockwave',
    name: 'Pix - Chi Shockwave',
    fxId: 'scifi/emp-blast',
    palette: PALETTES.goldenChi,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 230, 100, 200], flashDuration: 5, flashScope: 2, se: { name: 'Flash2', pan: 0, pitch: 120, volume: 90 } }
    ]
  },
  // 12: Battle Cry War Howl
  {
    id: 12,
    filename: 'Pix_BattleCry',
    name: 'Pix - Battle Cry War Howl',
    fxId: 'status/rage',
    palette: PALETTES.warRageYellow,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 200, 50, 180], flashDuration: 6, flashScope: 1, se: { name: 'Growl', pan: 0, pitch: 100, volume: 90 } }
    ]
  },
  // 13: Smoke Bomb Miasma
  {
    id: 13,
    filename: 'Pix_SmokeBomb',
    name: 'Pix - Smoke Bomb Miasma',
    fxId: 'explosions/smoke-bomb',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [180, 180, 180, 180], flashDuration: 5, flashScope: 1, se: { name: 'Blind', pan: 0, pitch: 100, volume: 85 } }
    ]
  },
  // 14: Poison Cloud
  {
    id: 14,
    filename: 'Pix_PoisonCloud',
    name: 'Pix - Poison Cloud',
    fxId: 'nature/poison-cloud',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [100, 220, 60, 180], flashDuration: 5, flashScope: 1, se: { name: 'Blind', pan: 0, pitch: 80, volume: 85 } }
    ]
  },
  // 15: Fireball
  {
    id: 15,
    filename: 'Pix_Fireball',
    name: 'Pix - Fireball',
    fxId: 'fire/fireball',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 160, 40, 180], flashDuration: 4, flashScope: 1, se: { name: 'Fire1', pan: 0, pitch: 100, volume: 90 } }
    ]
  },
  // 16: Flame Pillar
  {
    id: 16,
    filename: 'Pix_FlamePillar',
    name: 'Pix - Flame Pillar',
    fxId: 'fire/flame-pillar',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [255, 180, 50, 200], flashDuration: 5, flashScope: 2, se: { name: 'Fire3', pan: 0, pitch: 90, volume: 90 } },
      { frame: 15, flashColor: [255, 100, 30, 220], flashDuration: 8, flashScope: 2, se: { name: 'Explosion1', pan: 0, pitch: 100, volume: 95 } }
    ]
  },
  // 17: Fire Ring
  {
    id: 17,
    filename: 'Pix_FireRing',
    name: 'Pix - Fire Ring',
    fxId: 'fire/fire-ring',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [255, 160, 50, 180], flashDuration: 5, flashScope: 1, se: { name: 'Fire2', pan: 0, pitch: 95, volume: 90 } },
      { frame: 12, flashColor: [255, 200, 80, 200], flashDuration: 6, flashScope: 2, se: { name: 'Blow2', pan: 0, pitch: 110, volume: 85 } }
    ]
  },
  // 18: Hellfire Meteor
  {
    id: 18,
    filename: 'Pix_HellfireMeteor',
    name: 'Pix - Hellfire Meteor',
    fxId: 'fire/meteor',
    palette: PALETTES.hellfireCrimson,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 100, 50, 180], flashDuration: 5, flashScope: 2, se: { name: 'Fire1', pan: 0, pitch: 80, volume: 85 } },
      { frame: 20, flashColor: [255, 255, 200, 255], flashDuration: 12, flashScope: 2, se: { name: 'Explosion2', pan: 0, pitch: 95, volume: 100 } }
    ]
  },
  // 19: Flame Shield Tornado
  {
    id: 19,
    filename: 'Pix_FlameShield',
    name: 'Pix - Flame Shield Tornado',
    fxId: 'fire/fire-tornado',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 160, 40, 180], flashDuration: 5, flashScope: 1, se: { name: 'Fire2', pan: 0, pitch: 100, volume: 85 } },
      { frame: 10, flashColor: [255, 200, 60, 180], flashDuration: 5, flashScope: 1, se: { name: 'Wind2', pan: 0, pitch: 110, volume: 80 } }
    ]
  },
  // 20: Dragon Breath
  {
    id: 20,
    filename: 'Pix_DragonBreath',
    name: 'Pix - Dragon Breath',
    fxId: 'fire/fire-breath',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 120, 30, 200], flashDuration: 6, flashScope: 2, se: { name: 'Fire3', pan: 0, pitch: 85, volume: 95 } }
    ]
  },
  // 21: Ice Lance
  {
    id: 21,
    filename: 'Pix_IceLance',
    name: 'Pix - Ice Lance',
    fxId: 'ice/ice-lance',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [150, 220, 255, 180], flashDuration: 4, flashScope: 1, se: { name: 'Ice1', pan: 0, pitch: 110, volume: 85 } }
    ]
  },
  // 22: Frost Nova
  {
    id: 22,
    filename: 'Pix_FrostNova',
    name: 'Pix - Frost Nova',
    fxId: 'ice/frost-nova',
    palette: PALETTES.glacialAzure,
    position: 1,
    timings: [
      { frame: 0, flashColor: [120, 200, 255, 200], flashDuration: 5, flashScope: 2, se: { name: 'Ice5', pan: 0, pitch: 100, volume: 90 } },
      { frame: 20, flashColor: [200, 240, 255, 220], flashDuration: 8, flashScope: 2, se: { name: 'Earth1', pan: 0, pitch: 130, volume: 85 } }
    ]
  },
  // 23: Ice Spikes
  {
    id: 23,
    filename: 'Pix_IceSpikes',
    name: 'Pix - Ice Spikes',
    fxId: 'ice/ice-spikes',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [150, 220, 255, 180], flashDuration: 4, flashScope: 1, se: { name: 'Ice2', pan: 0, pitch: 100, volume: 90 } },
      { frame: 15, flashColor: [180, 240, 255, 200], flashDuration: 6, flashScope: 2, se: { name: 'Wind2', pan: 0, pitch: 120, volume: 80 } }
    ]
  },
  // 24: Ice Crystal Armor
  {
    id: 24,
    filename: 'Pix_IceCrystal',
    name: 'Pix - Ice Crystal Armor',
    fxId: 'ice/ice-crystal',
    palette: PALETTES.deepIce,
    position: 1,
    timings: [
      { frame: 0, flashColor: [140, 210, 255, 180], flashDuration: 5, flashScope: 1, se: { name: 'Ice1', pan: 0, pitch: 110, volume: 85 } },
      { frame: 12, flashColor: [200, 245, 255, 200], flashDuration: 6, flashScope: 1, se: { name: 'Flash1', pan: 0, pitch: 140, volume: 80 } }
    ]
  },
  // 25: Spark Arc
  {
    id: 25,
    filename: 'Pix_SparkArc',
    name: 'Pix - Spark Arc',
    fxId: 'lightning/spark-arc',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 150, 180], flashDuration: 3, flashScope: 1, se: { name: 'Thunder1', pan: 0, pitch: 120, volume: 85 } }
    ]
  },
  // 26: Lightning Strike
  {
    id: 26,
    filename: 'Pix_LightningStrike',
    name: 'Pix - Lightning Strike',
    fxId: 'lightning/lightning-strike',
    palette: PALETTES.highVoltage,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 180, 220], flashDuration: 5, flashScope: 2, se: { name: 'Thunder1', pan: 0, pitch: 100, volume: 90 } },
      { frame: 10, flashColor: [255, 255, 255, 255], flashDuration: 8, flashScope: 2, se: { name: 'Thunder4', pan: 0, pitch: 110, volume: 95 } }
    ]
  },
  // 27: Plasma Ball
  {
    id: 27,
    filename: 'Pix_PlasmaBall',
    name: 'Pix - Plasma Ball',
    fxId: 'lightning/plasma-ball',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [180, 230, 255, 200], flashDuration: 5, flashScope: 1, se: { name: 'Thunder2', pan: 0, pitch: 115, volume: 85 } }
    ]
  },
  // 28: Water Jet
  {
    id: 28,
    filename: 'Pix_WaterJet',
    name: 'Pix - Water Jet',
    fxId: 'water/water-jet',
    palette: PALETTES.azureTide,
    position: 1,
    timings: [
      { frame: 0, flashColor: [140, 200, 255, 180], flashDuration: 4, flashScope: 1, se: { name: 'Water1', pan: 0, pitch: 100, volume: 90 } }
    ]
  },
  // 29: Whirlpool Maelstrom
  {
    id: 29,
    filename: 'Pix_Whirlpool',
    name: 'Pix - Whirlpool Maelstrom',
    fxId: 'water/whirlpool',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [100, 180, 240, 180], flashDuration: 5, flashScope: 1, se: { name: 'Water2', pan: 0, pitch: 90, volume: 85 } },
      { frame: 15, flashColor: [160, 220, 255, 200], flashDuration: 6, flashScope: 2, se: { name: 'Wind3', pan: 0, pitch: 100, volume: 85 } }
    ]
  },
  // 30: Ocean Wave Crash
  {
    id: 30,
    filename: 'Pix_OceanWave',
    name: 'Pix - Ocean Wave Crash',
    fxId: 'water/wave-crash',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [120, 200, 255, 180], flashDuration: 5, flashScope: 1, se: { name: 'Water1', pan: 0, pitch: 90, volume: 85 } }
    ]
  },
  // 31: Stone Spire
  {
    id: 31,
    filename: 'Pix_StoneSpire',
    name: 'Pix - Stone Spire',
    fxId: 'nature/earth-spike',
    palette: PALETTES.graniteEarth,
    position: 2,
    timings: [
      { frame: 0, flashColor: [180, 160, 140, 180], flashDuration: 4, flashScope: 1, se: { name: 'Earth3', pan: 0, pitch: 90, volume: 90 } },
      { frame: 12, flashColor: [220, 200, 180, 200], flashDuration: 5, flashScope: 1, se: { name: 'Blow1', pan: 0, pitch: 110, volume: 85 } }
    ]
  },
  // 32: Boulder Crash
  {
    id: 32,
    filename: 'Pix_BoulderCrash',
    name: 'Pix - Boulder Crash',
    fxId: 'nature/boulder',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [160, 150, 140, 160], flashDuration: 4, flashScope: 2, se: { name: 'Earth1', pan: 0, pitch: 85, volume: 85 } },
      { frame: 14, flashColor: [255, 240, 220, 220], flashDuration: 8, flashScope: 2, se: { name: 'Blow3', pan: 0, pitch: 95, volume: 95 } }
    ]
  },
  // 33: Tectonic Quake
  {
    id: 33,
    filename: 'Pix_TectonicQuake',
    name: 'Pix - Tectonic Quake',
    fxId: 'nature/quake',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [200, 180, 150, 200], flashDuration: 6, flashScope: 2, se: { name: 'Earth2', pan: 0, pitch: 80, volume: 95 } }
    ]
  },
  // 34: Emerald Gale Tornado
  {
    id: 34,
    filename: 'Pix_Tornado',
    name: 'Pix - Emerald Gale Tornado',
    fxId: 'nature/tornado',
    palette: PALETTES.emeraldGale,
    position: 1,
    timings: [
      { frame: 0, flashColor: [140, 240, 200, 180], flashDuration: 5, flashScope: 1, se: { name: 'Wind3', pan: 0, pitch: 95, volume: 90 } },
      { frame: 12, flashColor: [180, 255, 230, 200], flashDuration: 6, flashScope: 2, se: { name: 'Wind1', pan: 0, pitch: 110, volume: 85 } }
    ]
  },
  // 35: Zephyr Spin Slash
  {
    id: 35,
    filename: 'Pix_SpinSlash',
    name: 'Pix - Zephyr Spin Slash',
    fxId: 'melee/spin-slash',
    palette: PALETTES.emeraldGale,
    position: 1,
    timings: [
      { frame: 0, flashColor: [180, 255, 220, 180], flashDuration: 4, flashScope: 1, se: { name: 'Wind1', pan: 0, pitch: 120, volume: 85 } }
    ]
  },
  // 36: Holy Heal Single
  {
    id: 36,
    filename: 'Pix_HealSingle',
    name: 'Pix - Holy Heal Single',
    fxId: 'holy/heal',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 200, 180], flashDuration: 5, flashScope: 1, se: { name: 'Heal1', pan: 0, pitch: 100, volume: 90 } }
    ]
  },
  // 37: Holy Heal AoE
  {
    id: 37,
    filename: 'Pix_HealAoE',
    name: 'Pix - Holy Heal AoE',
    fxId: 'holy/heal-aoe',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 220, 180], flashDuration: 6, flashScope: 2, se: { name: 'Heal2', pan: 0, pitch: 100, volume: 90 } }
    ]
  },
  // 38: Holy Blessing Cleanse
  {
    id: 38,
    filename: 'Pix_Blessing',
    name: 'Pix - Holy Blessing Cleanse',
    fxId: 'holy/blessing',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [240, 240, 255, 180], flashDuration: 5, flashScope: 1, se: { name: 'Heal3', pan: 0, pitch: 120, volume: 85 } }
    ]
  },
  // 39: Holy Resurrection
  {
    id: 39,
    filename: 'Pix_Resurrection',
    name: 'Pix - Holy Resurrection',
    fxId: 'holy/resurrection',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 220, 220], flashDuration: 8, flashScope: 2, se: { name: 'Heal3', pan: 0, pitch: 100, volume: 95 } }
    ]
  },
  // 40: Holy Smite
  {
    id: 40,
    filename: 'Pix_HolySmite',
    name: 'Pix - Holy Smite',
    fxId: 'holy/smite',
    palette: PALETTES.radiantSolar,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 240, 160, 200], flashDuration: 5, flashScope: 2, se: { name: 'Saint1', pan: 0, pitch: 90, volume: 90 } },
      { frame: 12, flashColor: [255, 255, 200, 255], flashDuration: 8, flashScope: 1, se: { name: 'Flash2', pan: 0, pitch: 110, volume: 95 } }
    ]
  },
  // 41: Divine Shield Bulwark
  {
    id: 41,
    filename: 'Pix_DivineShield',
    name: 'Pix - Divine Shield Bulwark',
    fxId: 'holy/divine-shield',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 230, 140, 180], flashDuration: 5, flashScope: 1, se: { name: 'Saint2', pan: 0, pitch: 100, volume: 85 } },
      { frame: 10, flashColor: [255, 255, 200, 200], flashDuration: 6, flashScope: 1, se: { name: 'Bell2', pan: 0, pitch: 120, volume: 85 } }
    ]
  },
  // 42: Sunburst Garuda
  {
    id: 42,
    filename: 'Pix_Sunburst',
    name: 'Pix - Sunburst Garuda',
    fxId: 'holy/sunburst',
    palette: null,
    position: 3,
    timings: [
      { frame: 0, flashColor: [255, 240, 180, 220], flashDuration: 6, flashScope: 2, se: { name: 'Saint3', pan: 0, pitch: 95, volume: 95 } },
      { frame: 20, flashColor: [255, 255, 255, 255], flashDuration: 12, flashScope: 2, se: { name: 'Flash2', pan: 0, pitch: 120, volume: 100 } }
    ]
  },
  // 43: Hex Curse Sigil
  {
    id: 43,
    filename: 'Pix_HexCurse',
    name: 'Pix - Hex Curse Sigil',
    fxId: 'shadow/curse',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [140, 50, 180, 180], flashDuration: 5, flashScope: 1, se: { name: 'Darkness2', pan: 0, pitch: 100, volume: 85 } }
    ]
  },
  // 44: Void Dark Orb
  {
    id: 44,
    filename: 'Pix_VoidOrb',
    name: 'Pix - Void Dark Orb',
    fxId: 'shadow/void-orb',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [140, 70, 220, 180], flashDuration: 5, flashScope: 1, se: { name: 'Darkness2', pan: 0, pitch: 95, volume: 85 } }
    ]
  },
  // 45: Black Hole Horizon
  {
    id: 45,
    filename: 'Pix_BlackHole',
    name: 'Pix - Black Hole Horizon',
    fxId: 'shadow/black-hole',
    palette: PALETTES.cosmicVoid,
    position: 1,
    timings: [
      { frame: 0, flashColor: [120, 60, 200, 200], flashDuration: 5, flashScope: 2, se: { name: 'Darkness3', pan: 0, pitch: 90, volume: 90 } },
      { frame: 25, flashColor: [180, 80, 255, 220], flashDuration: 8, flashScope: 2, se: { name: 'Darkness1', pan: 0, pitch: 100, volume: 95 } }
    ]
  },
  // 46: Dark Explosion Corpse
  {
    id: 46,
    filename: 'Pix_DarkExplosion',
    name: 'Pix - Dark Explosion Corpse',
    fxId: 'shadow/dark-explosion',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [150, 50, 200, 180], flashDuration: 5, flashScope: 1, se: { name: 'Darkness2', pan: 0, pitch: 90, volume: 85 } },
      { frame: 10, flashColor: [200, 80, 255, 220], flashDuration: 8, flashScope: 2, se: { name: 'Explosion1', pan: 0, pitch: 95, volume: 90 } }
    ]
  },
  // 47: Life Steal Drain
  {
    id: 47,
    filename: 'Pix_LifeSteal',
    name: 'Pix - Life Steal Drain',
    fxId: 'shadow/life-steal',
    palette: PALETTES.bloodDrain,
    position: 1,
    timings: [
      { frame: 0, flashColor: [200, 30, 30, 180], flashDuration: 5, flashScope: 1, se: { name: 'Absorb1', pan: 0, pitch: 95, volume: 85 } },
      { frame: 12, flashColor: [255, 50, 50, 200], flashDuration: 6, flashScope: 1, se: { name: 'Absorb2', pan: 0, pitch: 110, volume: 90 } }
    ]
  },
  // 48: Necro Skulls Requiem
  {
    id: 48,
    filename: 'Pix_NecroSkulls',
    name: 'Pix - Necro Skulls Requiem',
    fxId: 'shadow/necro-skulls',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [160, 60, 200, 180], flashDuration: 5, flashScope: 1, se: { name: 'Darkness1', pan: 0, pitch: 85, volume: 90 } }
    ]
  },
  // 49: Absolute Void Singularity
  {
    id: 49,
    filename: 'Pix_AbsoluteVoid',
    name: 'Pix - Absolute Void Singularity',
    fxId: 'explosions/implosion',
    palette: PALETTES.singularity,
    position: 3,
    timings: [
      { frame: 0, flashColor: [100, 40, 180, 220], flashDuration: 6, flashScope: 2, se: { name: 'Darkness4', pan: 0, pitch: 80, volume: 95 } },
      { frame: 12, flashColor: [0, 0, 0, 255], flashDuration: 10, flashScope: 2, se: { name: 'Collapse1', pan: 0, pitch: 90, volume: 100 } }
    ]
  },
  // 50: Time Stop Chronos
  {
    id: 50,
    filename: 'Pix_TimeStop',
    name: 'Pix - Time Stop Chronos',
    fxId: 'arcane/time-stop',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 255, 255], flashDuration: 5, flashScope: 2, se: { name: 'Magic2', pan: 0, pitch: 100, volume: 90 } },
      { frame: 25, flashColor: [100, 200, 255, 200], flashDuration: 8, flashScope: 2, se: { name: 'Bell3', pan: 0, pitch: 120, volume: 90 } },
      { frame: 45, flashColor: [255, 255, 255, 255], flashDuration: 10, flashScope: 1, se: { name: 'Ice5', pan: 0, pitch: 140, volume: 95 } }
    ]
  },
  // 51: Chrono Haste Flux
  {
    id: 51,
    filename: 'Pix_ChronoHaste',
    name: 'Pix - Chrono Haste Flux',
    fxId: 'status/haste',
    palette: PALETTES.chronosGold,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 220, 100, 150], flashDuration: 4, flashScope: 1, se: { name: 'Wind1', pan: 0, pitch: 120, volume: 80 } },
      { frame: 8, flashColor: [255, 255, 180, 200], flashDuration: 6, flashScope: 1, se: { name: 'Flash1', pan: 0, pitch: 130, volume: 85 } }
    ]
  },
  // 52: Temporal Distortion Slow
  {
    id: 52,
    filename: 'Pix_TemporalDistort',
    name: 'Pix - Temporal Distortion Slow',
    fxId: 'status/slowed',
    palette: PALETTES.temporalViolet,
    position: 1,
    timings: [
      { frame: 0, flashColor: [160, 100, 255, 180], flashDuration: 5, flashScope: 2, se: { name: 'Magic1', pan: 0, pitch: 85, volume: 85 } },
      { frame: 16, flashColor: [120, 80, 220, 200], flashDuration: 8, flashScope: 2, se: { name: 'Blind', pan: 0, pitch: 90, volume: 85 } }
    ]
  },
  // 53: Rewind Fate Starlight
  {
    id: 53,
    filename: 'Pix_RewindFate',
    name: 'Pix - Rewind Fate Starlight',
    fxId: 'holy/heal-aoe',
    palette: PALETTES.rewindCyan,
    position: 1,
    timings: [
      { frame: 0, flashColor: [100, 240, 220, 180], flashDuration: 6, flashScope: 2, se: { name: 'Heal3', pan: 0, pitch: 110, volume: 90 } },
      { frame: 18, flashColor: [160, 255, 240, 220], flashDuration: 8, flashScope: 2, se: { name: 'Bell1', pan: 0, pitch: 130, volume: 85 } }
    ]
  },
  // 54: Berserker Frenzy Rage
  {
    id: 54,
    filename: 'Pix_BerserkerRage',
    name: 'Pix - Berserker Frenzy Rage',
    fxId: 'status/rage',
    palette: PALETTES.bloodRage,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 50, 50, 200], flashDuration: 5, flashScope: 1, se: { name: 'Growl', pan: 0, pitch: 100, volume: 90 } },
      { frame: 8, flashColor: [255, 100, 100, 200], flashDuration: 6, flashScope: 1, se: { name: 'Fire1', pan: 0, pitch: 110, volume: 85 } }
    ]
  },
  // 55: Critical Hit Multi
  {
    id: 55,
    filename: 'Pix_CritHit',
    name: 'Pix - Critical Hit Multi',
    fxId: 'impacts/crit-hit',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 255, 255], flashDuration: 4, flashScope: 1, se: { name: 'Flash1', pan: 0, pitch: 140, volume: 95 } }
    ]
  },
  // 56: Arcane Missiles Bolt
  {
    id: 56,
    filename: 'Pix_ArcaneMissiles',
    name: 'Pix - Arcane Missiles Bolt',
    fxId: 'arcane/arcane-missiles',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [180, 120, 255, 180], flashDuration: 4, flashScope: 1, se: { name: 'Magic1', pan: 0, pitch: 120, volume: 85 } }
    ]
  },
  // 57: Item Potion Drink
  {
    id: 57,
    filename: 'Pix_Potion',
    name: 'Pix - Item Potion Drink',
    fxId: 'pickups/potion',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [200, 255, 200, 180], flashDuration: 4, flashScope: 1, se: { name: 'Heal1', pan: 0, pitch: 110, volume: 85 } }
    ]
  }
];

// Mapping of specific skill IDs to dedicated animations
const DEDICATED_SKILL_MAP = {
  // Basic Attacks
  1: 1,   // Attack -> Pix_HitSpark
  3: 1,   // Dual Attack
  4: 1,   // Double Attack
  5: 1,   // Triple Attack

  // Slashes
  12: 2,  // Power Strike -> Pix_SwordSlash
  15: 2,  // Sunder Armor
  189: 2, // Quick Stab
  192: 2, // Backstab

  // Heavy Cleaves
  20: 6,  // Brutal Cleave -> Pix_HeavyCleaveBlood
  29: 6,  // Oblivion Guillotine
  52: 6,  // Abyssal Smite

  // Ground Slam
  16: 8,  // Heavy Impact -> Pix_GroundSlam
  33: 8,  // Ragnarok World-Breaker
  23: 8,  // Bone Crusher
  24: 8,  // Sovereign Execution
  31: 8,  // Armor Sundering

  // Spear
  57: 3,  // Dragon Leap
  58: 3,  // Draconic Thrust
  63: 3,  // Gale Impalement

  // Archery
  193: 4, // Quick Shot
  195: 4, // Scatter Shot
  197: 4, // Armor-Piercer Shot
  199: 4, // Arrow Rain Tempest
  201: 4, // Dead Eye Shot
  203: 4, // Storm of Arrows

  // Chi & Martial
  69: 11, // Chi Blast
  73: 11, // Chi Shockwave
  77: 11, // Buddha's Palm
  82: 11, // Asura Wrath Wave
  70: 55, // Nerve Strike
  74: 55, // Meridian Lock
  78: 55, // Sixty-Four Palms
  81: 55, // Meridian Annihilation

  // Shouts & Buffs
  13: 12, // Battle Cry
  17: 12, // War Howl
  25: 12, // King's Dominion
  65: 12, // Challenging Roar
  30: 54, // Berserker Frenzy

  // Shield
  19: 9,  // Shield Breaker
  34: 9,  // Heavy Shield Slam
  36: 10, // Shield Wall
  37: 10, // Intercept
  38: 9,  // Bastion Impact
  40: 10, // Knight's Aegis
  64: 10, // Vanguard Intercept

  // Spinning Slash
  14: 35, // Wide Slash
  18: 35, // Whirlwind Sweep
  22: 35, // Cyclone Rupture
  26: 35, // Kingdom's Wrath
  110: 35,// Zephyr Slice

  // Pyromancy
  9: 15,   // Fire
  89: 15,  // Flame Burst
  97: 16,  // Inferno Pillar
  98: 17,  // Scorching Wave
  99: 19,  // Flame Shield
  100: 18, // Hellfire Flare
  129: 18, // Hellfire Cataclysm
  316: 15, // Ember Bolt

  // Cryomancy
  87: 21,  // Frost Touch
  90: 21,  // Glacial Spike
  94: 21,  // Permafrost Lance
  117: 23, // Blizzard Tempest
  118: 24, // Frost Armor
  119: 24, // Ice Mirror
  120: 22, // Glacial Cataclysm
  130: 22, // Absolute Zero

  // Electromancy
  10: 25,  // Spark
  91: 26,  // Lightning Bolt
  95: 26,  // Thunderclap Surge
  113: 26, // Heaven's Fulmination
  114: 27, // Thunder Spear
  115: 27, // Voltage Arc
  116: 26, // Judgement Storm
  131: 26, // Judgement Thunderstorm

  // Hydromancy
  101: 29, // Tidal Torrent
  102: 28, // Aqua Jet
  104: 29, // Abyssal Deluge

  // Geomancy & Aeromancy
  105: 32, // Earth Shatter
  106: 31, // Stone Spire
  107: 10, // Granite Wall
  108: 33, // Cataclysm Quake
  109: 34, // Gale Tempest
  111: 51, // Tailwind Aura
  112: 34, // Cyclone Cataclysm

  // Holy Light & Healing
  8: 36,   // Heal
  41: 36,  // Heal One
  42: 40,  // Aegis Smite
  43: 40,  // Divine Provocation
  44: 41,  // Bulwark of Light
  45: 41,  // Aegis Retribution
  46: 42,  // Garuda's Judgment
  47: 40,  // Divine Judgement Strike
  48: 41,  // Holy Citadel Challenge
  49: 41,  // Divine Sanctuary
  50: 41,  // Guardian Vow of Light
  51: 41,  // Avatar of Light Fortress
  143: 37, // Pray
  144: 38, // Purify Status
  145: 36, // Healing Light
  146: 40, // Holy Smite
  147: 40, // Silence Ray
  148: 37, // Medica Wave
  149: 36, // Sacred Restoration
  150: 38, // Cleanse All
  151: 39, // Raise
  152: 38, // Sanctified Benediction
  153: 37, // Radiant Salvation
  155: 38, // Sanctified Absolution
  156: 39, // Arise
  157: 38, // Divine Miracle Shower
  160: 39, // Mass Resurrection

  // Chronomancy
  139: 52, // Temporal Distortion
  140: 51, // Grand Haste
  141: 53, // Rewind Fate
  142: 50, // Chronos Apocalypse: Time Stop

  // Shadow, Necromancy & Void
  53: 43,  // Dread Provocation
  54: 46,  // Dark Bastion
  55: 47,  // Soul Harvest Strike
  56: 46,  // Apocalypse Unholy Wall
  167: 43, // Hex of Agony
  169: 44, // Dark Orb
  170: 47, // Siphon Life
  173: 47, // Soul Siphon
  174: 13, // Shadow Miasma
  175: 46, // Malice Affliction
  176: 47, // Abyssal Harvest
  177: 46, // Blood Pact: Commander
  178: 46, // Corpse Explosion
  182: 48, // Netherworld Grasp
  184: 45, // Event Horizon
  185: 44, // Nihility Rupture
  186: 45, // Black Hole Collapse
  187: 49, // Void Annihilation: Absolute Zero Matter

  // Thief & Assassin
  215: 56, // Steal
  219: 14, // Venom Strike
  223: 7,  // Shadow Execution
  224: 10, // Shadow Clone Trick
  225: 14, // Abyssal Plague
  226: 13, // Toxic Fog
  227: 7,  // Omnislash Shadow Dance
  228: 7,  // Phantom Assassinate

  // Dragons & Beasts
  61: 20,  // Dragon King Roar
  134: 20, // Draconic Roar
  135: 20, // Primordial Breath
  138: 20, // Breath of the Ancient Dragon
  205: 5,  // Call of Lupine
  21: 47   // Bloodlust Rage
};

// General fallback by old animation ID
const OLD_ANIM_FALLBACK = {
  0: 0,    // Stance / Wait / None
  1: 1,    // Hit Physical -> Pix_HitSpark
  2: 11,   // Hit Effect -> Chi
  3: 15,   // Hit Fire -> Fireball
  4: 21,   // Hit Ice -> Ice Lance
  5: 25,   // Hit Thunder -> Spark Arc
  6: 2,    // Slash Physical -> Sword Slash
  7: 2,    // Slash Effect -> Sword Slash
  8: 15,   // Slash Fire
  9: 21,   // Slash Ice
  10: 25,  // Slash Thunder
  11: 3,   // Pierce Physical -> Spear Thrust
  12: 3,   // Pierce Effect
  13: 15,  // Pierce Fire
  14: 21,  // Pierce Ice
  15: 25,  // Pierce Thunder
  16: 5,   // Claw Physical -> Beast Claw
  17: 5,   // Claw Effect
  18: 15,  // Claw Fire
  19: 21,  // Claw Ice
  20: 25,  // Claw Thunder
  21: 55,  // Hit Special 1 -> Crit Hit
  22: 55,  // Hit Special 2
  23: 7,   // Slash Special 1 -> Dagger Flurry
  24: 8,   // Slash Special 2 -> Ground Slam
  25: 6,   // Slash Special 3 -> Heavy Cleave
  26: 4,   // Pierce Special 1 -> Arrow Shot
  27: 4,   // Pierce Special 2
  28: 5,   // Claw Special -> Beast Claw
  29: 4,   // Arrow Special -> Arrow Shot
  30: 56,  // General Special 1 -> Arcane Missiles
  31: 18,  // General Special 2 -> Hellfire Meteor
  32: 20,  // Breath -> Dragon Breath
  33: 14,  // Pollen -> Poison Cloud
  34: 11,  // Sonic Wave -> Chi Shockwave
  35: 13,  // Fog -> Smoke Bomb
  36: 38,  // Song -> Blessing
  37: 12,  // Shout -> Battle Cry
  38: 35,  // Sweep -> Zephyr Spin Slash
  39: 9,   // Bodyslam -> Shield Block
  40: 10,  // Flash -> Defensive Barrier
  41: 36,  // Heal One 1 -> Holy Heal Single
  42: 36,  // Heal One 2
  43: 37,  // Heal All 1 -> Holy Heal AoE
  44: 37,  // Heal All 2
  45: 38,  // Recovery 1 -> Blessing Cleanse
  46: 38,  // Recovery 2
  47: 38,  // Recovery 3
  48: 38,  // Recovery 4
  49: 39,  // Revive 1 -> Holy Resurrection
  50: 39,  // Revive 2
  51: 39,  // Revive 3
  52: 13,  // Blind -> Smoke
  53: 43,  // Silence -> Hex Curse
  54: 14,  // Poison -> Poison Cloud
  55: 12,  // Confusion
  56: 52,  // Sleep
  57: 54,  // Paralysis
  66: 15,  // Fire One 1 -> Fireball
  67: 17,  // Fire One 2 -> Fire Ring
  68: 16,  // Fire All 1 -> Flame Pillar
  69: 18,  // Fire All 2 -> Hellfire Meteor
  71: 21,  // Ice One 1 -> Ice Lance
  72: 23,  // Ice One 2 -> Ice Spikes
  73: 22,  // Ice All 1 -> Frost Nova
  74: 22,  // Ice All 2
  76: 26,  // Thunder One 1 -> Lightning Strike
  77: 27,  // Thunder One 2 -> Plasma Ball
  78: 25,  // Thunder All 1 -> Spark Arc
  79: 26,  // Thunder All 2
  81: 30,  // Water/Earth 1 -> Ocean Wave
  82: 31,  // Earth Spire
  83: 29,  // Water All -> Whirlpool
  86: 35,  // Wind One -> Zephyr Spin Slash
  87: 34,  // Wind Two
  88: 34,  // Wind All -> Tornado
  91: 40,  // Light One -> Holy Smite
  92: 40,  // Light Two
  93: 41,  // Light All -> Divine Shield
  96: 43,  // Dark One -> Hex Curse
  97: 44,  // Dark Two -> Void Dark Orb
  98: 46,  // Dark All -> Dark Explosion
  101: 47, // Neutral Drain -> Life Steal
  104: 48, // Dark Requiem -> Necro Skulls
  106: 18, // Meteorfall
  108: 33, // Earth Quake -> Tectonic Quake
  // Mappings for the earlier round of 121..150
  121: 50, 122: 51, 123: 52, 124: 53, 125: 16, 126: 17, 127: 18, 128: 19,
  129: 22, 130: 23, 131: 24, 132: 26, 133: 27, 134: 28, 135: 29, 136: 31,
  137: 32, 138: 34, 139: 40, 140: 41, 141: 42, 142: 45, 143: 44, 144: 49,
  145: 47, 146: 46, 147: 6, 148: 8, 149: 7, 150: 54
};

async function main() {
  console.log('🔥 STARTING FULL REPLACEMENT: REPLACE ALL RPG MAKER MV ANIMATIONS WITH PIXELFX 🔥\n');

  fs.mkdirSync(IMG_ANIM_DIR, { recursive: true });

  // 1. Generate/Ensure all 57 PixelFX animation spritesheets exist
  console.log('--- STEP 1: RENDERING & COMPILING PIXELFX SPRITESHEETS ---');
  const compiledAnimations = [];

  for (const def of ALL_PIXELFX_ANIMATIONS) {
    const pngPath = path.join(IMG_ANIM_DIR, `${def.filename}.png`);
    let numFrames = 0;

    // Check if we need to render
    if (!fs.existsSync(pngPath)) {
      console.log(`⏳ Rendering [${def.filename}] from effect: ${def.fxId}...`);
      const fx = await loadEffect(def.fxId);
      const renderOpts = { fps: 15, actor: false };
      if (def.palette) renderOpts.options = { palette: def.palette };

      const r = renderFrames(fx, renderOpts);
      numFrames = r.frames.length;
      const cols = 5;
      const rows = Math.ceil(numFrames / cols);
      const sheetW = cols * 192;
      const sheetH = rows * 192;
      const sheetData = new Uint8ClampedArray(sheetW * sheetH * 4);

      // Find bounding box
      let minX = r.w, maxX = 0, minY = r.h, maxY = 0;
      for (const f of r.frames) {
        for (let y = 0; y < r.h; y++) {
          for (let x = 0; x < r.w; x++) {
            if (f.clear[(y * r.w + x) * 4 + 3] > 10) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
      }
      if (minX > maxX) { minX = 0; maxX = r.w - 1; minY = 0; maxY = r.h - 1; }

      const visW = maxX - minX + 1;
      const visH = maxY - minY + 1;
      const scale = Math.min(1.0, 186 / Math.max(visW, visH));
      const visCenterX = (minX + maxX) / 2;
      const visCenterY = (minY + maxY) / 2;

      for (let i = 0; i < numFrames; i++) {
        const f = r.frames[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cellStartX = col * 192;
        const cellStartY = row * 192;

        for (let dy = 0; dy < 192; dy++) {
          for (let dx = 0; dx < 192; dx++) {
            const destX = cellStartX + dx;
            const destY = cellStartY + dy;
            const srcX = Math.round(visCenterX + (dx - 96) / scale);
            const srcY = Math.round(visCenterY + (dy - 96) / scale);
            if (srcX >= 0 && srcX < r.w && srcY >= 0 && srcY < r.h) {
              const sIdx = (srcY * r.w + srcX) * 4;
              const dIdx = (destY * sheetW + destX) * 4;
              sheetData[dIdx] = f.clear[sIdx];
              sheetData[dIdx + 1] = f.clear[sIdx + 1];
              sheetData[dIdx + 2] = f.clear[sIdx + 2];
              sheetData[dIdx + 3] = f.clear[sIdx + 3];
            }
          }
        }
      }

      const pngBuf = encodePNG(sheetW, sheetH, sheetData);
      fs.writeFileSync(pngPath, pngBuf);
      console.log(`  ✅ Generated: ${def.filename}.png (${numFrames} frames, ${sheetW}x${sheetH})`);
    } else {
      // Already generated, inspect frame count
      const stat = fs.statSync(pngPath);
      // We can also just render fast or get frame count from fx
      const fx = await loadEffect(def.fxId);
      const r = renderFrames(fx, { fps: 15, actor: false });
      numFrames = r.frames.length;
      console.log(`  ⚡ Existing: ${def.filename}.png (${numFrames} frames)`);
    }

    const mvFrames = [];
    for (let i = 0; i < numFrames; i++) {
      mvFrames.push([[i, 0, 0, 100, 0, 0, 255, 0]]);
    }

    compiledAnimations.push({
      id: def.id,
      animation1Hue: 0,
      animation1Name: def.filename,
      animation2Hue: 0,
      animation2Name: "",
      frames: mvFrames,
      name: def.name,
      position: def.position,
      timings: def.timings
    });
  }

  // 2. Delete ALL legacy RPG Maker MV PNG animations in img/animations
  console.log('\n--- STEP 2: REMOVING ALL LEGACY RPG MAKER MV ANIMATIONS ---');
  const animFiles = fs.readdirSync(IMG_ANIM_DIR);
  let removedCount = 0;
  for (const file of animFiles) {
    if (!file.startsWith('Pix_') && file.endsWith('.png')) {
      fs.unlinkSync(path.join(IMG_ANIM_DIR, file));
      removedCount++;
    }
  }
  console.log(`🗑️ Deleted ${removedCount} legacy RPG Maker MV animation files.`);
  console.log(`✨ Only ${ALL_PIXELFX_ANIMATIONS.length} PixelFX animation files remain in img/animations/.`);

  // 3. Write clean new Animations.json
  console.log('\n--- STEP 3: WRITING REPLACED Animations.json ---');
  const newAnimationsJson = [null, ...compiledAnimations];
  fs.writeFileSync(ANIMATIONS_JSON_PATH, JSON.stringify(newAnimationsJson, null, 2), 'utf-8');
  console.log(`💾 Saved Animations.json with exactly ${compiledAnimations.length} pure PixelFX animations.`);

  // 4. Update ALL Skills in data/Skills.json
  console.log('\n--- STEP 4: RE-LINKING ALL SKILLS TO PIXELFX ANIMATIONS ---');
  const skillsData = JSON.parse(fs.readFileSync(SKILLS_JSON_PATH, 'utf-8'));
  let updatedSkillsCount = 0;

  for (let sid = 1; sid < skillsData.length; sid++) {
    const s = skillsData[sid];
    if (!s || !s.name) continue;

    const oldAnimId = s.animationId || 0;
    let newAnimId = 0;

    // First priority: dedicated mapping
    if (DEDICATED_SKILL_MAP[sid] !== undefined) {
      newAnimId = DEDICATED_SKILL_MAP[sid];
    } else if (OLD_ANIM_FALLBACK[oldAnimId] !== undefined) {
      newAnimId = OLD_ANIM_FALLBACK[oldAnimId];
    } else {
      // Default fallback
      newAnimId = 1; // Pix_HitSpark
    }

    s.animationId = newAnimId;
    updatedSkillsCount++;
  }

  fs.writeFileSync(SKILLS_JSON_PATH, JSON.stringify(skillsData, null, 2), 'utf-8');
  console.log(`💾 Successfully updated all ${updatedSkillsCount} skills in Skills.json!`);

  // 5. Update ALL Items in data/Items.json
  console.log('\n--- STEP 5: RE-LINKING ITEMS TO PIXELFX ANIMATIONS ---');
  const itemsData = JSON.parse(fs.readFileSync(ITEMS_JSON_PATH, 'utf-8'));
  let updatedItemsCount = 0;

  for (let iid = 1; iid < itemsData.length; iid++) {
    const item = itemsData[iid];
    if (!item || !item.name) continue;

    const oldAnimId = item.animationId || 0;
    let newAnimId = 0;

    if (oldAnimId === 0) {
      newAnimId = 0;
    } else if ([41, 42].includes(oldAnimId)) {
      newAnimId = 57; // Pix_Potion
    } else if ([43, 44].includes(oldAnimId)) {
      newAnimId = 37; // Pix_HealAoE
    } else if ([45, 46, 47, 48].includes(oldAnimId)) {
      newAnimId = 38; // Pix_Blessing
    } else if ([49, 50, 51].includes(oldAnimId)) {
      newAnimId = 39; // Pix_Resurrection
    } else if (oldAnimId === 35) {
      newAnimId = 13; // Pix_SmokeBomb
    } else {
      newAnimId = 57; // Pix_Potion
    }

    item.animationId = newAnimId;
    updatedItemsCount++;
  }

  fs.writeFileSync(ITEMS_JSON_PATH, JSON.stringify(itemsData, null, 2), 'utf-8');
  console.log(`💾 Successfully updated ${updatedItemsCount} items in Items.json!`);

  // 6. Update js/plugins.js defaults
  console.log('\n--- STEP 6: UPDATING js/plugins.js SETTINGS ---');
  let pluginsJsContent = fs.readFileSync(PLUGINS_JS_PATH, 'utf-8');

  const replacements = [
    { from: /"Physical Animation":"\d+"/g, to: '"Physical Animation":"1"' },
    { from: /"Magical Animation":"\d+"/g, to: '"Magical Animation":"56"' },
    { from: /"Enemy Attack Animation":"\d+"/g, to: '"Enemy Attack Animation":"1"' },
    { from: /"Reflect Animation":"\d+"/g, to: '"Reflect Animation":"10"' },
    { from: /"Default Animation":"\d+"/g, to: '"Default Animation":"1"' },
    { from: /"Weapon 1 Animation":"\d+"/g, to: '"Weapon 1 Animation":"7"' },   // Dagger
    { from: /"Weapon 2 Animation":"\d+"/g, to: '"Weapon 2 Animation":"2"' },   // Sword
    { from: /"Weapon 3 Animation":"\d+"/g, to: '"Weapon 3 Animation":"1"' },   // Flail
    { from: /"Weapon 4 Animation":"\d+"/g, to: '"Weapon 4 Animation":"6"' },   // Axe
    { from: /"Weapon 5 Animation":"\d+"/g, to: '"Weapon 5 Animation":"2"' },   // Whip
    { from: /"Weapon 6 Animation":"\d+"/g, to: '"Weapon 6 Animation":"1"' },   // Cane
    { from: /"Weapon 7 Animation":"\d+"/g, to: '"Weapon 7 Animation":"4"' },   // Bow
    { from: /"Weapon 8 Animation":"\d+"/g, to: '"Weapon 8 Animation":"4"' },   // Crossbow
    { from: /"Weapon 9 Animation":"\d+"/g, to: '"Weapon 9 Animation":"4"' },   // Gun
    { from: /"Weapon 10 Animation":"\d+"/g, to: '"Weapon 10 Animation":"5"' }, // Claw
    { from: /"Weapon 11 Animation":"\d+"/g, to: '"Weapon 11 Animation":"1"' }, // Glove
    { from: /"Weapon 12 Animation":"\d+"/g, to: '"Weapon 12 Animation":"3"' }, // Spear
    { from: /"Weapon 16 Animation":"\d+"/g, to: '"Weapon 16 Animation":"2"' }, // Katana
    { from: /"Weapon 17 Animation":"\d+"/g, to: '"Weapon 17 Animation":"2"' }, // Rapier
    { from: /"Weapon 19 Animation":"\d+"/g, to: '"Weapon 19 Animation":"3"' }  // Lance
  ];

  for (const r of replacements) {
    pluginsJsContent = pluginsJsContent.replace(r.from, r.to);
  }

  fs.writeFileSync(PLUGINS_JS_PATH, pluginsJsContent, 'utf-8');
  console.log('💾 Successfully updated js/plugins.js defaults to PixelFX animations!');

  console.log('\n🎉 ALL RPG MAKER MV DEFAULT ANIMATIONS HAVE BEEN COMPLETELY REPLACED WITH PIXELFX! 🎉\n');
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});

