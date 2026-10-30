/**
 * NUSV Database Studio - Constants & Data Specifications
 */

const PARAM_DEFS = [
    { 
        id: 0, 
        code: 'MHP', 
        name: 'Max HP (Vitality & STR)', 
        icon: '❤️', 
        color: '#f87171',
        desc: 'Poin Kesehatan Maksimal pahlawan',
        formula: 'Class Base HP + (VIT × 15) + (STR × 5) + Bonus Equipment'
    },
    { 
        id: 1, 
        code: 'MMP', 
        name: 'Max MP (Intelligence)', 
        icon: '💧', 
        color: '#60a5fa',
        desc: 'Poin Mana / Energi Sihir Maksimal',
        formula: 'Class Base MP + (INT × 8) + Bonus Equipment'
    },
    { 
        id: 2, 
        code: 'ATK', 
        name: 'Physical ATK (STR & DEX)', 
        icon: '⚔️', 
        color: '#fb923c',
        desc: 'Daya Serang Fisik Utama',
        formula: 'Standar: Weapon ATK + (STR × 1.8) + (DEX × 0.8) + Equip | Finesse (Dagger/Bow): Weapon ATK + (DEX × 1.8) + (STR × 0.8) + Equip'
    },
    { 
        id: 3, 
        code: 'DEF', 
        name: 'Physical DEF (VIT & STR)', 
        icon: '🛡️', 
        color: '#34d399',
        desc: 'Ketahanan Pertahanan Fisik',
        formula: 'Class Base DEF + (VIT × 1.5) + (STR × 0.5) + Bonus Armor'
    },
    { 
        id: 4, 
        code: 'MAT', 
        name: 'Magic ATK (Intelligence)', 
        icon: '🔮', 
        color: '#a78bfa',
        desc: 'Daya Serang Kekuatan Sihir',
        formula: 'Class Base MAT + (INT × 2.0) + Bonus Equipment'
    },
    { 
        id: 5, 
        code: 'MDF', 
        name: 'Magic DEF (INT & VIT)', 
        icon: '💠', 
        color: '#38bdf8',
        desc: 'Ketahanan Pertahanan Sihir',
        formula: 'Class Base MDF + (INT × 1.2) + (VIT × 0.8) + Bonus Equipment'
    },
    { 
        id: 6, 
        code: 'AGI', 
        name: 'Action Speed (Agility)', 
        icon: '⚡', 
        color: '#facc15',
        desc: 'Kecepatan Giliran & Inisiatif Tempur',
        formula: 'Class Base AGI + (AGI × 1.5) + Bonus Equipment'
    },
    { 
        id: 7, 
        code: 'LUK', 
        name: 'Luck (LUK)', 
        icon: '🍀', 
        color: '#4ade80',
        desc: 'Keberuntungan, Evasion Kritis & Efek Status',
        formula: 'Class Base LUK + LUK + Bonus Equipment'
    }
];



const CORE_ATTRIBUTES = [
    { 
        code: 'STR', 
        name: 'Strength', 
        icon: '💪', 
        color: '#ef4444',
        desc: 'Kekuatan fisik dasar, meningkatkan P.ATK dan sedikit Max HP & DEF',
        formula: 'Actor Species Base + Class IV Rating + Actor Growth + Class Growth + Equip'
    },
    { 
        code: 'INT', 
        name: 'Intelligence', 
        icon: '🧠', 
        color: '#3b82f6',
        desc: 'Kecerdasan sihir, meningkatkan M.ATK, M.DEF, Max MP, dan MP Regen',
        formula: 'Actor Species Base + Class IV Rating + Actor Growth + Class Growth + Equip'
    },
    { 
        code: 'DEX', 
        name: 'Dexterity', 
        icon: '🎯', 
        color: '#f59e0b',
        desc: 'Ketangkasan & presisi, meningkatkan Hit Rate, Critical Rate, Critical Damage, dan ATK Finesse',
        formula: 'Actor Species Base + Class IV Rating + Actor Growth + Class Growth + Equip'
    },
    { 
        code: 'AGI', 
        name: 'Agility', 
        icon: '⚡', 
        color: '#10b981',
        desc: 'Kelincahan gerak, meningkatkan Kecepatan (Speed), Evasion, dan SP Regen',
        formula: 'Actor Species Base + Class IV Rating + Actor Growth + Class Growth + Equip'
    },
    { 
        code: 'VIT', 
        name: 'Vitality', 
        icon: '🛡️', 
        color: '#06b6d4',
        desc: 'Ketahanan tubuh alami, meningkatkan Max HP, P.DEF, Guard Mitigation, dan HP Regen',
        formula: 'Actor Species Base + Class IV Rating + Actor Growth + Class Growth + Equip'
    },
    { 
        code: 'LUK', 
        name: 'Luck', 
        icon: '🎲', 
        color: '#a855f7',
        desc: 'Keberuntungan, meningkatkan Critical Rate, Evasion Kritis (CEV), dan peluang status',
        formula: 'Actor Species Base + Class IV Rating + Actor Growth + Class Growth + Equip'
    }
];



const DERIVED_STAT_DEFS = [
    // Vitalitas & Regen
    { key: 'Max SP', name: 'Max SP (Stamina)', icon: '⚡', color: '#38bdf8', group: 'vital', placeholder: '+20' },
    { key: 'HRG Plus', name: 'HP Regen / Turn', icon: '❤️', color: '#f87171', group: 'vital', placeholder: '+3%' },
    { key: 'MRG Plus', name: 'MP Regen / Turn', icon: '💧', color: '#60a5fa', group: 'vital', placeholder: '+2%' },
    { key: 'TRG Plus', name: 'SP Regen / Turn', icon: '🔋', color: '#34d399', group: 'vital', placeholder: '+3%' },

    // Presisi & Kritis
    { key: 'HIT Plus', name: 'Hit Rate', desc: 'Bonus akurasi serangan fisik (<HIT Plus: +X%>)', icon: '🎯', color: '#facc15', group: 'offensive', placeholder: '+5%' },
    { key: 'CRI Plus', name: 'Critical Rate', icon: '💥', color: '#fb923c', group: 'offensive', placeholder: '+5%' },
    { key: 'Critical Damage', name: 'Critical Damage', icon: '🗡️', color: '#ef4444', group: 'offensive', placeholder: '+25%' },
    { key: 'Armor Penetration', name: 'Armor Penetration', desc: 'Mengabaikan persentase pertahanan fisik target (<Armor Penetration: +X%>)', icon: '🏹', color: '#f59e0b', group: 'offensive', placeholder: '15%' },
    { key: 'Magic Penetration', name: 'Magic Penetration', desc: 'Mengabaikan persentase pertahanan sihir target (<Magic Penetration: +X%>)', icon: '🔮', color: '#a78bfa', group: 'offensive', placeholder: '15%' },

    // Pertahanan & Mitigasi
    { key: 'PDR Plus', name: 'Physical Damage Reduction', desc: 'Pengurangan damage fisik yang diterima (<PDR Plus: +X%>)', icon: '🔰', color: '#34d399', group: 'defensive', placeholder: '-10%' },
    { key: 'MDR Plus', name: 'Magical Damage Reduction', desc: 'Pengurangan damage sihir yang diterima (<MDR Plus: +X%>)', icon: '💠', color: '#38bdf8', group: 'defensive', placeholder: '-10%' },
    { key: 'GRD Plus', name: 'Guard Mitigation', desc: 'Efisiensi pengurangan damage saat mode bertahan (<GRD Plus: +X%>)', icon: '🛡️', color: '#60a5fa', group: 'defensive', placeholder: '+20%' },
    { key: 'EVA Plus', name: 'Evasion Rate', desc: 'Peluang menghindari serangan fisik musuh (<EVA Plus: +X%>)', icon: '💨', color: '#10b981', group: 'defensive', placeholder: '+5%' },
    { key: 'CEV Plus', name: 'Critical Evasion', desc: 'Resistensi terhadap serangan kritikal musuh (<CEV Plus: +X%>)', icon: '🛡️', color: '#4ade80', group: 'defensive', placeholder: '+5%' },
    { key: 'MEV Plus', name: 'Magic Evasion', desc: 'Peluang menghindari serangan sihir musuh (<MEV Plus: +X%>)', icon: '🍃', color: '#a3e635', group: 'defensive', placeholder: '+5%' },
    { key: 'MRF Plus', name: 'Magic Reflection', desc: 'Peluang memantulkan serangan sihir (<MRF Plus: +X%>)', icon: '🪞', color: '#2dd4bf', group: 'defensive', placeholder: '+5%' },
    { key: 'CNT Plus', name: 'Counter Attack Rate', desc: 'Peluang membalas serangan fisik langsung (<CNT Plus: +X%>)', icon: '⚔️', color: '#f43f5e', group: 'defensive', placeholder: '+10%' },

    // Utilitas & Aggro
    { key: 'MCR Plus', name: 'MP Cost Rate', desc: 'Tingkat efisiensi konsumsi MP (minus = hemat) (<MCR Plus: -X%>)', icon: '🧪', color: '#818cf8', group: 'utility', placeholder: '-10%' },
    { key: 'TGR Plus', name: 'Target Rate / Aggro', desc: 'Tingkat kecenderungan musuh menarget karakter ini (<TGR Plus: +X%>)', icon: '👁️', color: '#c084fc', group: 'utility', placeholder: '+20%' }
];



const SCOPE_NAMES = {
    0: 'None',
    1: '1 Enemy',
    2: 'All Enemies',
    3: '1 Random Enemy',
    4: '2 Random Enemies',
    5: '3 Random Enemies',
    6: '4 Random Enemies',
    7: '1 Ally',
    8: 'All Allies',
    9: '1 Dead Ally',
    10: 'All Dead Allies',
    11: 'Pengguna Sendiri (User)'
};



const OCCASION_NAMES = {
    0: 'Selalu (Battle & Menu)',
    1: 'Battle Only',
    2: 'Menu Only',
    3: 'Never'
};



const HIT_TYPES = {
    0: 'Certain Hit',
    1: 'Physical Attack',
    2: 'Magical Attack'
};



const DAMAGE_TYPES = {
    0: 'None',
    1: 'HP Damage',
    2: 'MP Damage',
    3: 'HP Recovery',
    4: 'MP Recovery',
    5: 'HP Drain',
    6: 'MP Drain'
};



const TRAIT_CATEGORIES = {
    11: { cat: 'Rate', name: 'Element Rate (Ketahanan Elemen)', hasDataId: 'element', isPercent: true },
    12: { cat: 'Rate', name: 'Debuff Rate (Ketahanan Debuff Stat)', hasDataId: 'param', isPercent: true },
    13: { cat: 'Rate', name: 'State Rate (Peluang Terkena Status Efek)', hasDataId: 'state', isPercent: true },
    14: { cat: 'Rate', name: 'State Resist (Kebal Penuh Terhadap Status)', hasDataId: 'state', isValNone: true },
    21: { cat: 'Param', name: 'Parameter (Pengali Stat Dasar %)', hasDataId: 'param', isPercent: true },
    22: { cat: 'Param', name: 'Ex-Parameter (Stat Tambahan: Akurasi/Kritis/Regen)', hasDataId: 'xparam', isPercentFloat: true },
    23: { cat: 'Param', name: 'Sp-Parameter (Stat Spesial: Aggro/Cost/SP Rate)', hasDataId: 'sparam', isPercent: true },
    31: { cat: 'Attack', name: 'Attack Element (Elemen Serangan Biasa)', hasDataId: 'element', isValNone: true },
    32: { cat: 'Attack', name: 'Attack State (Efek Status Serangan Fisik)', hasDataId: 'state', isPercent: true },
    33: { cat: 'Attack', name: 'Attack Speed (Kecepatan Serangan Biasa)', isFlatInt: true },
    34: { cat: 'Attack', name: 'Attack Times+ (Pengulangan Serangan Ekstra)', isFlatInt: true },
    41: { cat: 'Skill', name: 'Add Skill Type (Buka Akses Tipe Skill)', hasDataId: 'stype', isValNone: true },
    42: { cat: 'Skill', name: 'Seal Skill Type (Kunci Tipe Skill)', hasDataId: 'stype', isValNone: true },
    43: { cat: 'Skill', name: 'Add Skill (Beri Skill Tertentu)', hasDataId: 'skill', isValNone: true },
    44: { cat: 'Skill', name: 'Seal Skill (Kunci Skill Tertentu)', hasDataId: 'skill', isValNone: true },
    51: { cat: 'Equip', name: 'Equip Weapon (Bisa Pakai Tipe Senjata)', hasDataId: 'wtype', isValNone: true },
    52: { cat: 'Equip', name: 'Equip Armor (Bisa Pakai Tipe Armor)', hasDataId: 'atype', isValNone: true },
    53: { cat: 'Equip', name: 'Lock Equip (Kunci Slot Perlengkapan)', hasDataId: 'etype', isValNone: true },
    54: { cat: 'Equip', name: 'Seal Equip (Segel Slot Perlengkapan)', hasDataId: 'etype', isValNone: true },
    55: { cat: 'Equip', name: 'Slot Type (Dual Wield Bebas)', hasDataId: 'slotType', isDualWield: true },
    61: { cat: 'Other', name: 'Action Times+ (Peluang Aksi Tambahan)', isPercent: true },
    62: { cat: 'Other', name: 'Special Flag (Fitur Spesial Battler)', hasDataId: 'flag', isValNone: true },
    63: { cat: 'Other', name: 'Collapse Effect (Efek Hancur Musuh)', hasDataId: 'collapse', isValNone: true },
    64: { cat: 'Other', name: 'Party Ability (Kemampuan Party Eksklusif)', hasDataId: 'ability', isValNone: true }
};



const XPARAM_NAMES = [
    'Hit Rate (HIT - Akurasi Fisik / DEX)',
    'Evasion Rate (EVA - Hindaran / AGI & LUK)',
    'Critical Rate (CRI - Peluang Kritis / DEX & LUK)',
    'Critical Evasion (CEV - Hindaran Kritis / LUK & VIT)',
    'Magic Evasion (MEV - Hindaran Serangan Sihir)',
    'Magic Reflection (MRF - Pantulan Serangan Sihir)',
    'Counter Attack (CNT - Serangan Balik Fisik)',
    'HP Regeneration (HRG - Regen HP / Turn / VIT)',
    'MP Regeneration (MRG - Regen MP / Turn / INT)',
    'SP Regeneration (TRG - Regen SP Stamina / AGI & VIT)'
];



const SPARAM_NAMES = [
    'Target Rate (TGR - Peluang Ditarget Serangan Musuh)',
    'Guard Efficiency (GRD - Efisiensi Bertahan / VIT)',
    'Recovery Effect (REC - Efektivitas Pemulihan Diterima)',
    'Pharmacology (PHA - Efektivitas Pemakaian Item Obat)',
    'MP Cost Rate (MCR - Pengali Konsumsi MP Skill)',
    'SP Charge Rate (TCR - Pengali Pengisian SP Stamina)',
    'Physical Damage Rate (PDR - Pengali Kerusakan Fisik)',
    'Magical Damage Rate (MDR - Pengali Kerusakan Sihir)',
    'Floor Damage Rate (FDR - Kerusakan Lantai/Jebakan)',
    'Experience Rate (EXR - Pengali Perolehan EXP)'
];



const TRAIT_TAB_DEFS = {
    'Rate': [
        { code: 11, label: 'Element Rate', hasData: 'element', hasVal: 'percent', op: '*', defVal: 100 },
        { code: 12, label: 'Debuff Rate', hasData: 'param', hasVal: 'percent', op: '*', defVal: 100 },
        { code: 13, label: 'State Rate', hasData: 'state', hasVal: 'percent', op: '*', defVal: 100 },
        { code: 14, label: 'State Resist', hasData: 'state', hasVal: 'none' }
    ],
    'Param': [
        { code: 21, label: 'Parameter', hasData: 'param', hasVal: 'percent', op: '*', defVal: 100 },
        { code: 22, label: 'Ex-Parameter', hasData: 'xparam', hasVal: 'percentFloat', op: '+', defVal: 0 },
        { code: 23, label: 'Sp-Parameter', hasData: 'sparam', hasVal: 'percent', op: '*', defVal: 100 }
    ],
    'Attack': [
        { code: 31, label: 'Attack Element', hasData: 'element', hasVal: 'none' },
        { code: 32, label: 'Attack State', hasData: 'state', hasVal: 'percent', op: '+', defVal: 100 },
        { code: 33, label: 'Attack Speed', hasVal: 'flatInt', op: '+', defVal: 0 },
        { code: 34, label: 'Attack Times+', hasVal: 'flatInt', op: '+', defVal: 1 }
    ],
    'Skill': [
        { code: 41, label: 'Add Skill Type', hasData: 'stype', hasVal: 'none' },
        { code: 42, label: 'Seal Skill Type', hasData: 'stype', hasVal: 'none' },
        { code: 43, label: 'Add Skill', hasData: 'skill', hasVal: 'none' },
        { code: 44, label: 'Seal Skill', hasData: 'skill', hasVal: 'none' }
    ],
    'Equip': [
        { code: 51, label: 'Equip Weapon', hasData: 'wtype', hasVal: 'none' },
        { code: 52, label: 'Equip Armor', hasData: 'atype', hasVal: 'none' },
        { code: 53, label: 'Lock Equip', hasData: 'etype', hasVal: 'none' },
        { code: 54, label: 'Seal Equip', hasData: 'etype', hasVal: 'none' },
        { code: 55, label: 'Slot Type', hasData: 'slotType', hasVal: 'none' }
    ],
    'Other': [
        { code: 61, label: 'Action Times+', hasVal: 'percent', op: '+', defVal: 100 },
        { code: 62, label: 'Special Flag', hasData: 'flag', hasVal: 'none' },
        { code: 63, label: 'Collapse Effect', hasData: 'collapse', hasVal: 'none' },
        { code: 64, label: 'Party Ability', hasData: 'ability', hasVal: 'none' }
    ]
};


const EFFECT_CATEGORIES = {
    11: { cat: 'Recover', name: 'Recover HP (Pemulihan HP)', isHpRecover: true },
    12: { cat: 'Recover', name: 'Recover MP (Pemulihan MP)', isMpRecover: true },
    13: { cat: 'Recover', name: 'Gain TP / SP (Poin Stamina / Energi)', isTpGain: true },
    21: { cat: 'State', name: 'Add State (Berikan Status Efek)', hasState: true },
    22: { cat: 'State', name: 'Remove State (Hapus Status Efek)', hasState: true },
    31: { cat: 'Param', name: 'Add Buff (Tingkatkan Stat Sementara)', hasParam: true },
    32: { cat: 'Param', name: 'Add Debuff (Turunkan Stat Sementara)', hasParam: true },
    33: { cat: 'Param', name: 'Remove Buff (Hapus Efek Buff)', hasParam: true },
    34: { cat: 'Param', name: 'Remove Debuff (Hapus Efek Debuff)', hasParam: true },
    41: { cat: 'Other', name: 'Special Effect (Escape dari Pertarungan)' },
    42: { cat: 'Other', name: 'Permanent Stat Growth (Tingkatkan Stat Permanen)', hasParam: true },
    43: { cat: 'Other', name: 'Learn Skill (Pelajari Skill Permanen)', hasSkill: true },
    44: { cat: 'Other', name: 'Common Event (Jalankan Common Event)', hasCommonEvent: true }
};
