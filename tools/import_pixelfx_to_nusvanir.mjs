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
  bloodRage: ["#210404", "#4a0b0b", "#8a1616", "#e02d2d", "#ff8282", "#ffffff"]
};

// 29 Curated Animations
const ANIMATION_DEFS = [
  // --- Chronomancer Suite ---
  {
    filename: 'Pix_TimeStop',
    name: 'Pix - Time Stop',
    fxId: 'arcane/time-stop',
    palette: null,
    position: 1, // Center
    timings: [
      { frame: 0, flashColor: [255, 255, 255, 255], flashDuration: 5, flashScope: 2, se: { name: 'Magic2', pan: 0, pitch: 100, volume: 90 } },
      { frame: 25, flashColor: [100, 200, 255, 200], flashDuration: 8, flashScope: 2, se: { name: 'Bell3', pan: 0, pitch: 120, volume: 90 } },
      { frame: 45, flashColor: [255, 255, 255, 255], flashDuration: 10, flashScope: 1, se: { name: 'Ice5', pan: 0, pitch: 140, volume: 95 } }
    ],
    skills: [142] // Chronos Apocalypse: Time Stop
  },
  {
    filename: 'Pix_ChronoHaste',
    name: 'Pix - Chrono Haste',
    fxId: 'status/haste',
    palette: PALETTES.chronosGold,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 220, 100, 150], flashDuration: 4, flashScope: 1, se: { name: 'Wind1', pan: 0, pitch: 120, volume: 80 } },
      { frame: 8, flashColor: [255, 255, 180, 200], flashDuration: 6, flashScope: 1, se: { name: 'Flash1', pan: 0, pitch: 130, volume: 85 } }
    ],
    skills: [140] // Grand Haste
  },
  {
    filename: 'Pix_TemporalDistort',
    name: 'Pix - Temporal Distortion',
    fxId: 'status/slowed',
    palette: PALETTES.temporalViolet,
    position: 1,
    timings: [
      { frame: 0, flashColor: [160, 100, 255, 180], flashDuration: 5, flashScope: 2, se: { name: 'Magic1', pan: 0, pitch: 85, volume: 85 } },
      { frame: 16, flashColor: [120, 80, 220, 200], flashDuration: 8, flashScope: 2, se: { name: 'Blind', pan: 0, pitch: 90, volume: 85 } }
    ],
    skills: [139] // Temporal Distortion
  },
  {
    filename: 'Pix_RewindFate',
    name: 'Pix - Rewind Fate',
    fxId: 'holy/heal-aoe',
    palette: PALETTES.rewindCyan,
    position: 1,
    timings: [
      { frame: 0, flashColor: [100, 240, 220, 180], flashDuration: 6, flashScope: 2, se: { name: 'Recovery3', pan: 0, pitch: 110, volume: 90 } },
      { frame: 18, flashColor: [160, 255, 240, 220], flashDuration: 8, flashScope: 2, se: { name: 'Bell1', pan: 0, pitch: 130, volume: 85 } }
    ],
    skills: [141] // Rewind Fate
  },

  // --- Pyromancer Suite ---
  {
    filename: 'Pix_FlamePillar',
    name: 'Pix - Flame Pillar',
    fxId: 'fire/flame-pillar',
    palette: null,
    position: 2, // Feet
    timings: [
      { frame: 0, flashColor: [255, 180, 50, 200], flashDuration: 5, flashScope: 2, se: { name: 'Fire3', pan: 0, pitch: 90, volume: 90 } },
      { frame: 15, flashColor: [255, 100, 30, 220], flashDuration: 8, flashScope: 2, se: { name: 'Explosion1', pan: 0, pitch: 100, volume: 95 } }
    ],
    skills: [97] // Inferno Pillar
  },
  {
    filename: 'Pix_FireRing',
    name: 'Pix - Fire Ring',
    fxId: 'fire/fire-ring',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [255, 160, 50, 180], flashDuration: 5, flashScope: 1, se: { name: 'Fire2', pan: 0, pitch: 95, volume: 90 } },
      { frame: 12, flashColor: [255, 200, 80, 200], flashDuration: 6, flashScope: 2, se: { name: 'Blow2', pan: 0, pitch: 110, volume: 85 } }
    ],
    skills: [98] // Scorching Wave
  },
  {
    filename: 'Pix_HellfireMeteor',
    name: 'Pix - Hellfire Meteor',
    fxId: 'fire/meteor',
    palette: PALETTES.hellfireCrimson,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 100, 50, 180], flashDuration: 5, flashScope: 2, se: { name: 'Fire1', pan: 0, pitch: 80, volume: 85 } },
      { frame: 20, flashColor: [255, 255, 200, 255], flashDuration: 12, flashScope: 2, se: { name: 'Explosion2', pan: 0, pitch: 95, volume: 100 } }
    ],
    skills: [100] // Hellfire Flare
  },
  {
    filename: 'Pix_FlameShield',
    name: 'Pix - Flame Shield',
    fxId: 'fire/fire-tornado',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 160, 40, 180], flashDuration: 5, flashScope: 1, se: { name: 'Fire2', pan: 0, pitch: 100, volume: 85 } },
      { frame: 10, flashColor: [255, 200, 60, 180], flashDuration: 5, flashScope: 1, se: { name: 'Wind2', pan: 0, pitch: 110, volume: 80 } }
    ],
    skills: [99] // Flame Shield
  },

  // --- Cryomancer Suite ---
  {
    filename: 'Pix_FrostNova',
    name: 'Pix - Frost Nova',
    fxId: 'ice/frost-nova',
    palette: PALETTES.glacialAzure,
    position: 1,
    timings: [
      { frame: 0, flashColor: [120, 200, 255, 200], flashDuration: 5, flashScope: 2, se: { name: 'Ice5', pan: 0, pitch: 100, volume: 90 } },
      { frame: 20, flashColor: [200, 240, 255, 220], flashDuration: 8, flashScope: 2, se: { name: 'Earth1', pan: 0, pitch: 130, volume: 85 } }
    ],
    skills: [120] // Glacial Cataclysm
  },
  {
    filename: 'Pix_IceSpikes',
    name: 'Pix - Ice Spikes',
    fxId: 'ice/ice-spikes',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [150, 220, 255, 180], flashDuration: 4, flashScope: 1, se: { name: 'Ice2', pan: 0, pitch: 100, volume: 90 } },
      { frame: 15, flashColor: [180, 240, 255, 200], flashDuration: 6, flashScope: 2, se: { name: 'Wind2', pan: 0, pitch: 120, volume: 80 } }
    ],
    skills: [117] // Blizzard Tempest
  },
  {
    filename: 'Pix_IceCrystal',
    name: 'Pix - Ice Crystal',
    fxId: 'ice/ice-crystal',
    palette: PALETTES.deepIce,
    position: 1,
    timings: [
      { frame: 0, flashColor: [140, 210, 255, 180], flashDuration: 5, flashScope: 1, se: { name: 'Ice1', pan: 0, pitch: 110, volume: 85 } },
      { frame: 12, flashColor: [200, 245, 255, 200], flashDuration: 6, flashScope: 1, se: { name: 'Flash1', pan: 0, pitch: 140, volume: 80 } }
    ],
    skills: [118, 119] // Frost Armor, Ice Mirror
  },

  // --- Electromancer Suite ---
  {
    filename: 'Pix_LightningStrike',
    name: 'Pix - Lightning Strike',
    fxId: 'lightning/lightning-strike',
    palette: PALETTES.highVoltage,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 255, 180, 220], flashDuration: 5, flashScope: 2, se: { name: 'Thunder1', pan: 0, pitch: 100, volume: 90 } },
      { frame: 10, flashColor: [255, 255, 255, 255], flashDuration: 8, flashScope: 2, se: { name: 'Thunder4', pan: 0, pitch: 110, volume: 95 } }
    ],
    skills: [113, 116] // Heaven's Fulmination, Judgement Storm
  },
  {
    filename: 'Pix_PlasmaBall',
    name: 'Pix - Plasma Ball',
    fxId: 'lightning/plasma-ball',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [180, 230, 255, 200], flashDuration: 5, flashScope: 1, se: { name: 'Thunder2', pan: 0, pitch: 115, volume: 85 } }
    ],
    skills: [114, 115] // Thunder Spear, Voltage Arc
  },

  // --- Hydromancer Suite ---
  {
    filename: 'Pix_WaterJet',
    name: 'Pix - Water Jet',
    fxId: 'water/water-jet',
    palette: PALETTES.azureTide,
    position: 1,
    timings: [
      { frame: 0, flashColor: [140, 200, 255, 180], flashDuration: 4, flashScope: 1, se: { name: 'Water1', pan: 0, pitch: 100, volume: 90 } }
    ],
    skills: [102] // Aqua Jet
  },
  {
    filename: 'Pix_Whirlpool',
    name: 'Pix - Whirlpool Maelstrom',
    fxId: 'water/whirlpool',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [100, 180, 240, 180], flashDuration: 5, flashScope: 1, se: { name: 'Water2', pan: 0, pitch: 90, volume: 85 } },
      { frame: 15, flashColor: [160, 220, 255, 200], flashDuration: 6, flashScope: 2, se: { name: 'Wind3', pan: 0, pitch: 100, volume: 85 } }
    ],
    skills: [101, 104] // Tidal Torrent, Abyssal Deluge
  },

  // --- Geomancer & Aeromancer Suite ---
  {
    filename: 'Pix_StoneSpire',
    name: 'Pix - Stone Spire',
    fxId: 'nature/earth-spike',
    palette: PALETTES.graniteEarth,
    position: 2,
    timings: [
      { frame: 0, flashColor: [180, 160, 140, 180], flashDuration: 4, flashScope: 1, se: { name: 'Earth3', pan: 0, pitch: 90, volume: 90 } },
      { frame: 12, flashColor: [220, 200, 180, 200], flashDuration: 5, flashScope: 1, se: { name: 'Blow1', pan: 0, pitch: 110, volume: 85 } }
    ],
    skills: [106] // Stone Spire
  },
  {
    filename: 'Pix_BoulderCrash',
    name: 'Pix - Boulder Crash',
    fxId: 'nature/boulder',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [160, 150, 140, 160], flashDuration: 4, flashScope: 2, se: { name: 'Earth1', pan: 0, pitch: 85, volume: 85 } },
      { frame: 14, flashColor: [255, 240, 220, 220], flashDuration: 8, flashScope: 2, se: { name: 'Blow3', pan: 0, pitch: 95, volume: 95 } }
    ],
    skills: [105, 108] // Earth Shatter, Cataclysm Quake
  },
  {
    filename: 'Pix_Tornado',
    name: 'Pix - Emerald Gale Tornado',
    fxId: 'nature/tornado',
    palette: PALETTES.emeraldGale,
    position: 1,
    timings: [
      { frame: 0, flashColor: [140, 240, 200, 180], flashDuration: 5, flashScope: 1, se: { name: 'Wind3', pan: 0, pitch: 95, volume: 90 } },
      { frame: 12, flashColor: [180, 255, 230, 200], flashDuration: 6, flashScope: 2, se: { name: 'Wind1', pan: 0, pitch: 110, volume: 85 } }
    ],
    skills: [109, 112] // Gale Tempest, Cyclone Cataclysm
  },

  // --- Holy Suite ---
  {
    filename: 'Pix_HolySmite',
    name: 'Pix - Holy Smite',
    fxId: 'holy/smite',
    palette: PALETTES.radiantSolar,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 240, 160, 200], flashDuration: 5, flashScope: 2, se: { name: 'Saint1', pan: 0, pitch: 90, volume: 90 } },
      { frame: 12, flashColor: [255, 255, 200, 255], flashDuration: 8, flashScope: 1, se: { name: 'Flash2', pan: 0, pitch: 110, volume: 95 } }
    ],
    skills: [42, 43] // Aegis Smite, Divine Provocation
  },
  {
    filename: 'Pix_DivineShield',
    name: 'Pix - Divine Shield',
    fxId: 'holy/divine-shield',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 230, 140, 180], flashDuration: 5, flashScope: 1, se: { name: 'Saint2', pan: 0, pitch: 100, volume: 85 } },
      { frame: 10, flashColor: [255, 255, 200, 200], flashDuration: 6, flashScope: 1, se: { name: 'Bell2', pan: 0, pitch: 120, volume: 85 } }
    ],
    skills: [44, 45] // Bulwark of Light, Aegis Retribution
  },
  {
    filename: 'Pix_Sunburst',
    name: 'Pix - Sunburst Garuda',
    fxId: 'holy/sunburst',
    palette: null,
    position: 3, // Screen
    timings: [
      { frame: 0, flashColor: [255, 240, 180, 220], flashDuration: 6, flashScope: 2, se: { name: 'Saint3', pan: 0, pitch: 95, volume: 95 } },
      { frame: 20, flashColor: [255, 255, 255, 255], flashDuration: 12, flashScope: 2, se: { name: 'Flash3', pan: 0, pitch: 120, volume: 100 } }
    ],
    skills: [46] // Garuda's Judgment
  },

  // --- Shadow & Void Suite ---
  {
    filename: 'Pix_BlackHole',
    name: 'Pix - Black Hole',
    fxId: 'shadow/black-hole',
    palette: PALETTES.cosmicVoid,
    position: 1,
    timings: [
      { frame: 0, flashColor: [120, 60, 200, 200], flashDuration: 5, flashScope: 2, se: { name: 'Darkness3', pan: 0, pitch: 90, volume: 90 } },
      { frame: 25, flashColor: [180, 80, 255, 220], flashDuration: 8, flashScope: 2, se: { name: 'Darkness1', pan: 0, pitch: 100, volume: 95 } }
    ],
    skills: [184, 186] // Event Horizon, Black Hole Collapse
  },
  {
    filename: 'Pix_VoidOrb',
    name: 'Pix - Void Orb',
    fxId: 'shadow/void-orb',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [140, 70, 220, 180], flashDuration: 5, flashScope: 1, se: { name: 'Darkness2', pan: 0, pitch: 95, volume: 85 } }
    ],
    skills: [185] // Nihility Rupture
  },
  {
    filename: 'Pix_AbsoluteVoid',
    name: 'Pix - Absolute Void Annihilation',
    fxId: 'explosions/implosion',
    palette: PALETTES.singularity,
    position: 3, // Screen
    timings: [
      { frame: 0, flashColor: [100, 40, 180, 220], flashDuration: 6, flashScope: 2, se: { name: 'Darkness4', pan: 0, pitch: 80, volume: 95 } },
      { frame: 12, flashColor: [0, 0, 0, 255], flashDuration: 10, flashScope: 2, se: { name: 'Collapse1', pan: 0, pitch: 90, volume: 100 } }
    ],
    skills: [187] // Void Annihilation: Absolute Zero Matter
  },
  {
    filename: 'Pix_LifeSteal',
    name: 'Pix - Life Steal',
    fxId: 'shadow/life-steal',
    palette: PALETTES.bloodDrain,
    position: 1,
    timings: [
      { frame: 0, flashColor: [200, 30, 30, 180], flashDuration: 5, flashScope: 1, se: { name: 'Absorb1', pan: 0, pitch: 95, volume: 85 } },
      { frame: 12, flashColor: [255, 50, 50, 200], flashDuration: 6, flashScope: 1, se: { name: 'Absorb2', pan: 0, pitch: 110, volume: 90 } }
    ],
    skills: [21, 55, 176] // Bloodlust Rage, Soul Harvest Strike, Abyssal Harvest
  },
  {
    filename: 'Pix_DarkExplosion',
    name: 'Pix - Dark Explosion',
    fxId: 'shadow/dark-explosion',
    palette: null,
    position: 1,
    timings: [
      { frame: 0, flashColor: [150, 50, 200, 180], flashDuration: 5, flashScope: 1, se: { name: 'Darkness2', pan: 0, pitch: 90, volume: 85 } },
      { frame: 10, flashColor: [200, 80, 255, 220], flashDuration: 8, flashScope: 2, se: { name: 'Explosion1', pan: 0, pitch: 95, volume: 90 } }
    ],
    skills: [175, 178] // Malice Affliction, Corpse Explosion
  },

  // --- Physical & Martial Masteries Suite ---
  {
    filename: 'Pix_HeavyCleaveBlood',
    name: 'Pix - Heavy Cleave Blood',
    fxId: 'melee/heavy-cleave',
    palette: PALETTES.bloodReaver,
    position: 1,
    timings: [
      { frame: 0, flashColor: [220, 40, 40, 200], flashDuration: 4, flashScope: 1, se: { name: 'Slash2', pan: 0, pitch: 100, volume: 90 } },
      { frame: 6, flashColor: [255, 70, 70, 220], flashDuration: 6, flashScope: 1, se: { name: 'Sword2', pan: 0, pitch: 95, volume: 95 } }
    ],
    skills: [20, 29, 52] // Brutal Cleave, Oblivion Guillotine, Abyssal Smite
  },
  {
    filename: 'Pix_GroundSlam',
    name: 'Pix - Cataclysm Ground Slam',
    fxId: 'impacts/ground-slam',
    palette: null,
    position: 2,
    timings: [
      { frame: 0, flashColor: [255, 240, 200, 200], flashDuration: 5, flashScope: 2, se: { name: 'Blow2', pan: 0, pitch: 90, volume: 90 } },
      { frame: 10, flashColor: [255, 255, 255, 255], flashDuration: 8, flashScope: 2, se: { name: 'Earth2', pan: 0, pitch: 95, volume: 95 } }
    ],
    skills: [16, 33] // Heavy Impact, Ragnarok World-Breaker
  },
  {
    filename: 'Pix_DaggerFlurry',
    name: 'Pix - Dagger Flurry Shadow',
    fxId: 'melee/dagger-flurry',
    palette: PALETTES.nightshadeViolet,
    position: 1,
    timings: [
      { frame: 0, flashColor: [180, 100, 255, 200], flashDuration: 4, flashScope: 1, se: { name: 'Slash3', pan: 0, pitch: 110, volume: 90 } },
      { frame: 6, flashColor: [220, 140, 255, 220], flashDuration: 5, flashScope: 1, se: { name: 'Sword1', pan: 0, pitch: 130, volume: 85 } }
    ],
    skills: [223, 227] // Shadow Execution, Omnislash Shadow Dance
  },
  {
    filename: 'Pix_BerserkerRage',
    name: 'Pix - Berserker Frenzy Rage',
    fxId: 'status/rage',
    palette: PALETTES.bloodRage,
    position: 1,
    timings: [
      { frame: 0, flashColor: [255, 50, 50, 200], flashDuration: 5, flashScope: 1, se: { name: 'Growl', pan: 0, pitch: 100, volume: 90 } },
      { frame: 8, flashColor: [255, 100, 100, 200], flashDuration: 6, flashScope: 1, se: { name: 'Fire1', pan: 0, pitch: 110, volume: 85 } }
    ],
    skills: [30] // Berserker Frenzy
  }
];

async function main() {
  console.log('🚀 Starting PixelFX to Nusvanir Animation Importer...');
  fs.mkdirSync(IMG_ANIM_DIR, { recursive: true });

  // Load existing database files
  const animsData = JSON.parse(fs.readFileSync(ANIMATIONS_JSON_PATH, 'utf-8'));
  const skillsData = JSON.parse(fs.readFileSync(SKILLS_JSON_PATH, 'utf-8'));

  // Determine starting Animation ID
  let nextAnimId = animsData.length;
  console.log(`Initial Animations.json count: ${animsData.length}, next ID: ${nextAnimId}`);

  const registeredAnimations = [];

  for (const def of ANIMATION_DEFS) {
    console.log(`\n⏳ Processing [${def.filename}] from effect: ${def.fxId}...`);
    try {
      const fx = await loadEffect(def.fxId);
      const renderOpts = { fps: 15, actor: false };
      if (def.palette) {
        renderOpts.options = { palette: def.palette };
      }
      const r = renderFrames(fx, renderOpts);
      const numFrames = r.frames.length;
      const cols = 5;
      const rows = Math.ceil(numFrames / cols);
      const sheetW = cols * 192;
      const sheetH = rows * 192;
      const sheetData = new Uint8ClampedArray(sheetW * sheetH * 4);

      // Find visible bounding box
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

      // If empty frame protection
      if (minX > maxX) {
        minX = 0; maxX = r.w - 1; minY = 0; maxY = r.h - 1;
      }

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

      // Write PNG
      const pngPath = path.join(IMG_ANIM_DIR, `${def.filename}.png`);
      const pngBuf = encodePNG(sheetW, sheetH, sheetData);
      fs.writeFileSync(pngPath, pngBuf);
      console.log(`  ✅ Generated PNG: ${def.filename}.png (${numFrames} frames, ${sheetW}x${sheetH})`);

      // Check if animation already exists in Animations.json
      let existingIndex = animsData.findIndex(a => a && a.animation1Name === def.filename);
      let animId;

      const mvFrames = [];
      for (let i = 0; i < numFrames; i++) {
        // [pattern, x, y, scale, rotation, mirror, opacity, blendMode]
        mvFrames.push([[i, 0, 0, 100, 0, 0, 255, 0]]);
      }

      if (existingIndex !== -1) {
        animId = existingIndex;
        animsData[animId].frames = mvFrames;
        animsData[animId].name = def.name;
        animsData[animId].position = def.position;
        animsData[animId].timings = def.timings;
        console.log(`  🔄 Updated existing Animation ID ${animId}: ${def.name}`);
      } else {
        animId = nextAnimId++;
        const newAnim = {
          id: animId,
          animation1Hue: 0,
          animation1Name: def.filename,
          animation2Hue: 0,
          animation2Name: "",
          frames: mvFrames,
          name: def.name,
          position: def.position,
          timings: def.timings
        };
        animsData.push(newAnim);
        console.log(`  ✨ Created new Animation ID ${animId}: ${def.name}`);
      }

      registeredAnimations.push({
        animId,
        filename: def.filename,
        name: def.name,
        numFrames,
        skills: def.skills
      });

      // Update skills in Skills.json
      for (const skillId of def.skills) {
        if (skillsData[skillId]) {
          const oldAnim = skillsData[skillId].animationId;
          skillsData[skillId].animationId = animId;
          console.log(`    🔗 Linked Skill [${skillId}] "${skillsData[skillId].name}" (Old Anim: ${oldAnim} -> New Anim: ${animId})`);
        } else {
          console.warn(`    ⚠️ Skill ID ${skillId} not found in Skills.json!`);
        }
      }
    } catch (err) {
      console.error(`  ❌ Error processing ${def.filename}:`, err);
    }
  }

  // Save updated databases
  fs.writeFileSync(ANIMATIONS_JSON_PATH, JSON.stringify(animsData, null, 2), 'utf-8');
  console.log(`\n💾 Successfully saved ${ANIMATIONS_JSON_PATH} (Total entries: ${animsData.length})`);

  fs.writeFileSync(SKILLS_JSON_PATH, JSON.stringify(skillsData, null, 2), 'utf-8');
  console.log(`💾 Successfully saved ${SKILLS_JSON_PATH}`);

  // Summary Report
  console.log('\n================ IMPLEMENTATION SUMMARY ================');
  for (const reg of registeredAnimations) {
    const linkedSkillNames = reg.skills.map(sid => `[${sid}] ${skillsData[sid] ? skillsData[sid].name : 'Unknown'}`).join(', ');
    console.log(`ID ${reg.animId}: ${reg.name} (${reg.numFrames} frames) -> Skills: ${linkedSkillNames}`);
  }
  console.log('========================================================\n');
}

main().catch(err => {
  console.error("Fatal error in main:", err);
  process.exit(1);
});

