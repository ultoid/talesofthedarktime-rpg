/**
 * NUSV Database Studio - Entity Editor: editors/actor_editor.js
 */

function getActorEquippedItems(actor) {
    const items = [];
    actor.equips = actor.equips || [0, 0, 0, 0, 0, 0, 0];

    if (actor.equips[0] && State.weapons[actor.equips[0]]) {
        items.push({ slot: 'Weapon', item: State.weapons[actor.equips[0]] });
    }

    if (actor.equips[1]) {
        const sId = actor.equips[1];
        if (State.weapons[sId] && (State.weapons[sId].note || '').includes('Secondary')) {
            items.push({ slot: 'Secondary Weapon', item: State.weapons[sId] });
        } else if (State.armors[sId]) {
            items.push({ slot: 'Secondary / Shield', item: State.armors[sId] });
        }
    }

    const slotMap = { 2: 'Helm', 3: 'Armor', 4: 'Boots', 5: 'Accessory 1' };
    for (let i = 2; i <= 5; i++) {
        if (actor.equips[i] && State.armors[actor.equips[i]]) {
            items.push({ slot: slotMap[i], item: State.armors[actor.equips[i]] });
        }
    }

    const secAccVal = getTagVal(actor.note, 'Second Accessory') || getTagVal(actor.note, 'Accessory 2');
    if (secAccVal) {
        const a2 = State.armors.find(a => a && (a.name === secAccVal || String(a.id) === secAccVal));
        if (a2) items.push({ slot: 'Accessory 2', item: a2 });
    }

    if (actor.equips[6] && State.armors[actor.equips[6]]) {
        items.push({ slot: 'Relic', item: State.armors[actor.equips[6]] });
    }

    return items;
}



function calculateActorSimulation(actor, baseLevel = 1, classLevel = 1) {
    const cls = State.classes[actor.classId] || {};
    const equipped = getActorEquippedItems(actor);
    const note = actor.note || '';
    const classNote = cls.note || '';

    const eqParams = [0, 0, 0, 0, 0, 0, 0, 0];
    const eqCore = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
    let eqMaxSP = 0;
    let eqHit = 0, eqEva = 0, eqCri = 0, eqCdmg = 0, eqCev = 0;
    let eqGrd = 0, eqHrg = 0, eqMrg = 0, eqTrg = 0;
    let eqArmPen = 0, eqMagPen = 0, eqPdr = 0, eqMdr = 0;
    let eqCnt = 0, eqMev = 0, eqMrf = 0, eqMcr = 0, eqTgr = 0;
    const amplifiedElements = [];
    const setCounts = {};

    equipped.forEach(({ item }) => {
        if (!item) return;
        const inote = item.note || '';

        if (Array.isArray(item.params)) {
            for (let p = 0; p < 8; p++) {
                eqParams[p] += (item.params[p] || 0);
            }
        }

        CORE_ATTRIBUTES.forEach(a => {
            eqCore[a.code] += parseBonusNum(getTagVal(inote, a.code));
        });

        eqMaxSP += parseBonusNum(getTagVal(inote, 'Max SP'));
        eqHit += parsePercent(getTagVal(inote, 'HIT Plus'));
        eqEva += parsePercent(getTagVal(inote, 'EVA Plus'));
        eqCri += parsePercent(getTagVal(inote, 'CRI Plus'));
        eqCdmg += parsePercent(getTagVal(inote, 'Critical Damage'));
        eqCev += parsePercent(getTagVal(inote, 'CEV Plus'));
        eqGrd += parsePercent(getTagVal(inote, 'GRD Plus'));
        eqHrg += parsePercent(getTagVal(inote, 'HRG Plus'));
        eqMrg += parsePercent(getTagVal(inote, 'MRG Plus'));
        eqTrg += parsePercent(getTagVal(inote, 'TRG Plus'));
        eqArmPen += parsePercent(getTagVal(inote, 'Armor Penetration'));
        eqMagPen += parsePercent(getTagVal(inote, 'Magic Penetration'));
        eqPdr += parsePercent(getTagVal(inote, 'PDR Plus'));
        eqMdr += parsePercent(getTagVal(inote, 'MDR Plus'));
        eqCnt += parsePercent(getTagVal(inote, 'CNT Plus'));
        eqMev += parsePercent(getTagVal(inote, 'MEV Plus'));
        eqMrf += parsePercent(getTagVal(inote, 'MRF Plus'));
        eqMcr += parsePercent(getTagVal(inote, 'MCR Plus'));
        eqTgr += parsePercent(getTagVal(inote, 'TGR Plus'));

        const eMatch = inote.match(/<Element Amplify ([^:>]+):[ ]*(.+?)>/i);
        if (eMatch) {
            amplifiedElements.push(`${eMatch[1]} ${eMatch[2]}`);
        }

        const sName = getTagVal(inote, 'NUSV Set Name');
        if (sName) {
            setCounts[sName] = (setCounts[sName] || 0) + 1;
        }
    });

    // 1. Base Core Stats (Actor Innate Species Base) & Class IV Scaling (1 - 10)
    const actorBaseCore = {};
    const classIVRating = {};
    const classGrowthRates = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
    const baseCore = {};

    const classGrowthStr = getTagVal(classNote, 'Class Stat Growth', '');
    if (classGrowthStr) {
        classGrowthStr.split(',').forEach(part => {
            const p = part.trim();
            let m = p.match(/\+?\s*([\d.]+)\s*([A-Za-z]{3})/);
            if (m) {
                const code = m[2].toUpperCase();
                if (classGrowthRates[code] !== undefined) classGrowthRates[code] = parseFloat(m[1]) || 0;
                return;
            }
            m = p.match(/([A-Za-z]{3})\s*\+?\s*([\d.]+)/);
            if (m) {
                const code = m[1].toUpperCase();
                if (classGrowthRates[code] !== undefined) classGrowthRates[code] = parseFloat(m[2]) || 0;
            }
        });
    }

    CORE_ATTRIBUTES.forEach(a => {
        // Actor's innate species base stat (ditulis di tab Actor)
        const actBase = parseInt(getTagVal(note, `Base ${a.code}`), 10);
        actorBaseCore[a.code] = !isNaN(actBase) ? actBase : 10;

        // Class IV Rating (1 - 10, ditulis di tab Class)
        const rawCls = parseInt(getTagVal(classNote, `Base ${a.code}`), 10);
        const iv = (!isNaN(rawCls) && rawCls >= 1 && rawCls <= 10) ? rawCls : Math.min(10, Math.max(1, rawCls || 5));
        classIVRating[a.code] = iv;

        // Jika tidak ada notetag manual Class Stat Growth untuk stat ini, hitung otomatis dari IV (1-10) -> (IV / 5) per level
        if (!classGrowthRates[a.code]) {
            classGrowthRates[a.code] = Math.round((iv / 5) * 10) / 10;
        }

        // Total Base pondasi awal di Lv 1 = Actor Base + Class IV bonus
        baseCore[a.code] = actorBaseCore[a.code] + iv;
    });

    // 2. Actor Stat Growth (Innate scaling with Base Level)
    const actorGrowthRates = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
    const actorGrowthStr = getTagVal(note, 'Actor Stat Growth');
    if (actorGrowthStr) {
        actorGrowthStr.split(',').forEach(part => {
            const p = part.trim();
            let m = p.match(/\+?\s*([\d.]+)\s*([A-Za-z]{3})/);
            if (m) {
                const code = m[2].toUpperCase();
                if (actorGrowthRates[code] !== undefined) actorGrowthRates[code] = parseFloat(m[1]) || 0;
                return;
            }
            m = p.match(/([A-Za-z]{3})\s*\+?\s*([\d.]+)/);
            if (m) {
                const code = m[1].toUpperCase();
                if (actorGrowthRates[code] !== undefined) actorGrowthRates[code] = parseFloat(m[2]) || 0;
            }
        });
    }

    // 3. Race / Nature Stat Modifiers (▲ +10%, ● 100%, ▼ -10%)
    const actorRaceName = getTagVal(note, 'Race', 'Pribumi');
    const raceObj = (State.races || []).find(r => r && (
        r.name.toLowerCase() === actorRaceName.toLowerCase() || 
        (r.englishName && r.englishName.toLowerCase() === actorRaceName.toLowerCase())
    ));
    const raceMods = (raceObj && raceObj.modifiers) ? raceObj.modifiers : { str: 1.0, int: 1.0, dex: 1.0, luk: 1.0, agi: 1.0, vit: 1.0 };
    const raceNatureTags = (raceObj && raceObj.natureTags) ? raceObj.natureTags : { str: '=', int: '=', dex: '=', luk: '=', agi: '=', vit: '=' };

    // 4. Calculate Final 6 Core Attributes
    const actorGrowthCore = {};
    const classGrowthCore = {};
    const totalCore = {};

    CORE_ATTRIBUTES.forEach(a => {
        const actGrowth = Math.round(actorGrowthRates[a.code] * (baseLevel - 1) * 10) / 10;
        const clsGrowth = Math.round(classGrowthRates[a.code] * (classLevel - 1) * 10) / 10;
        actorGrowthCore[a.code] = actGrowth;
        classGrowthCore[a.code] = clsGrowth;

        const raw = baseCore[a.code] + actGrowth + clsGrowth + eqCore[a.code];
        const rRate = raceMods[a.code.toLowerCase()] || 1.0;
        totalCore[a.code] = Math.max(1, Math.round(raw * rRate));
    });

    ensureClassParams(cls);
    const classMhp = (cls.params && cls.params[0] && cls.params[0][baseLevel]) ? cls.params[0][baseLevel] : 450;
    const classMmp = (cls.params && cls.params[1] && cls.params[1][baseLevel]) ? cls.params[1][baseLevel] : 40;

    const totalMhp = Math.round(classMhp + (totalCore.VIT * 15) + (totalCore.STR * 5) + eqParams[0]);
    const totalMmp = Math.round(classMmp + (totalCore.INT * 8) + eqParams[1]);
    const totalMsp = Math.round(50 + (totalCore.VIT * 5) + (totalCore.STR * 2) + eqMaxSP);

    const mainWeap = State.weapons[actor.equips[0]];
    const isFinesse = mainWeap && (/finesse|bow|dagger|crossbow|whip/i.test(mainWeap.note || '') || mainWeap.wtypeId === 8 || mainWeap.wtypeId === 9 || mainWeap.wtypeId === 10);

    const classAtk = (cls.params && cls.params[2] && cls.params[2][baseLevel]) ? cls.params[2][baseLevel] : 10;
    const totalAtk = isFinesse ? Math.round(classAtk + (totalCore.DEX * 2) + (totalCore.STR * 0.5) + eqParams[2])
                               : Math.round(classAtk + (totalCore.STR * 2) + (totalCore.DEX * 0.5) + eqParams[2]);

    const classDef = (cls.params && cls.params[3] && cls.params[3][baseLevel]) ? cls.params[3][baseLevel] : 15;
    const totalDef = Math.round(classDef + (totalCore.VIT * 1.5) + (totalCore.STR * 0.5) + eqParams[3]);

    const classMat = (cls.params && cls.params[4] && cls.params[4][baseLevel]) ? cls.params[4][baseLevel] : 10;
    const totalMat = Math.round(classMat + (totalCore.INT * 2) + eqParams[4]);

    const classMdf = (cls.params && cls.params[5] && cls.params[5][baseLevel]) ? cls.params[5][baseLevel] : 10;
    const totalMdf = Math.round(classMdf + (totalCore.INT * 1.2) + (totalCore.VIT * 0.8) + eqParams[5]);

    const classAgi = (cls.params && cls.params[6] && cls.params[6][baseLevel]) ? cls.params[6][baseLevel] : 10;
    const totalAgi = Math.round(classAgi + (totalCore.AGI * 1.5) + eqParams[6]);

    const classLuk = (cls.params && cls.params[7] && cls.params[7][baseLevel]) ? cls.params[7][baseLevel] : 10;
    const totalLuk = Math.round(classLuk + totalCore.LUK + eqParams[7]);

    const hitRate = Math.min(1.0, 0.85 + (totalCore.DEX * 0.002) + eqHit);
    const evaRate = Math.min(0.80, 0.02 + (totalCore.AGI * 0.002) + (totalCore.LUK * 0.0005) + eqEva);
    const critRate = Math.min(0.85, 0.03 + (totalCore.DEX * 0.002) + (totalCore.LUK * 0.001) + eqCri);
    const critDmg = 1.50 + (totalCore.STR * 0.003) + (totalCore.DEX * 0.002) + eqCdmg;
    const critEva = (totalCore.LUK * 0.0015) + (totalCore.VIT * 0.001) + eqCev;
    const guardEff = 1.00 + (totalCore.VIT * 0.005) + eqGrd;

    const hpRegen = (totalCore.VIT * 0.0003) + eqHrg;
    const mpRegen = (totalCore.INT * 0.0003) + eqMrg;
    const spRegen = 0.03 + (totalCore.AGI * 0.0004) + (totalCore.VIT * 0.0002) + eqTrg;
    const targetRate = 1.00 + eqTgr;

    const activeSets = [];
    Object.keys(setCounts).forEach(sName => {
        const count = setCounts[sName];
        if (count >= 2) {
            activeSets.push(`${sName} (${count}-Piece Active)`);
        }
    });

    return {
        baseLevel,
        classLevel,
        cls,
        isFinesse,
        actorBaseCore,
        actorRaceName,
        raceObj,
        raceMods,
        raceNatureTags,
        classIVRating,
        classBaseCore: classIVRating,
        baseCore,
        actorGrowthRates,
        classGrowthRates,
        actorGrowthCore,
        classGrowthCore,
        eqCore,
        totalCore,
        classMhp,
        totalMhp,
        classMmp,
        totalMmp,
        totalMsp,
        totalAtk,
        totalDef,
        totalMat,
        totalMdf,
        totalAgi,
        totalLuk,
        hitRate,
        evaRate,
        critRate,
        critDmg,
        critEva,
        guardEff,
        hpRegen,
        mpRegen,
        spRegen,
        armPen: eqArmPen,
        magPen: eqMagPen,
        pdr: eqPdr,
        mdr: eqMdr,
        cnt: eqCnt,
        mev: eqMev,
        mrf: eqMrf,
        mcr: eqMcr,
        targetRate,
        amplifiedElements,
        activeSets,
        equippedCount: equipped.length
    };
}



function onActorSimBaseLevelChange(lvl) {
    const val = Math.max(1, Math.min(99, parseInt(lvl, 10) || 1));
    State.actorSimBaseLevel = val;
    const badge = document.getElementById('actorSimBaseBadge');
    if (badge) badge.innerText = `Base Lv ${val}`;
    const slider = document.getElementById('actorSimBaseSlider');
    if (slider && parseInt(slider.value, 10) !== val) slider.value = val;
    const input = document.getElementById('actorSimBaseInput');
    if (input && parseInt(input.value, 10) !== val) input.value = val;
    updateActorSimulationLive();
}



function onActorSimClassLevelChange(lvl) {
    const actor = State.actors[State.selectedIndex];
    const cls = actor ? (State.classes[actor.classId] || {}) : {};
    const classTier = getTagVal(cls.note, 'Class Tier', '1');
    const customMax = parseInt(getTagVal(cls.note, 'Class Max Level'), 10);
    const tierCaps = { '1': 10, '2': 30, '3': 40, '4': 50, '5': 60, '6': 99 };
    const maxLvl = customMax || tierCaps[classTier] || 10;

    const val = Math.max(1, Math.min(maxLvl, parseInt(lvl, 10) || 1));
    State.actorSimClassLevel = val;
    const badge = document.getElementById('actorSimClassBadge');
    if (badge) badge.innerText = `Class Lv ${val} / ${maxLvl}`;
    const slider = document.getElementById('actorSimClassSlider');
    if (slider && parseInt(slider.value, 10) !== val) slider.value = val;
    const input = document.getElementById('actorSimClassInput');
    if (input && parseInt(input.value, 10) !== val) input.value = val;
    updateActorSimulationLive();
}



function onActorSimLevelChange(lvl) {
    onActorSimBaseLevelChange(lvl);
}



function onActorBaseStatInput(actorOrCode, codeOrVal, maybeVal) {
    let actor, code, val;
    if (maybeVal !== undefined) {
        actor = (typeof actorOrCode === 'object' && actorOrCode) ? actorOrCode : (window.currentItem || getActiveItem());
        code = codeOrVal;
        val = maybeVal;
    } else {
        actor = window.currentItem || getActiveItem();
        code = actorOrCode;
        val = codeOrVal;
    }
    if (!actor) return;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
        setTagVal(actor, `Base ${code}`, num);
    } else if (val === '') {
        setTagVal(actor, `Base ${code}`, '');
    }
    updateActorSimulationLive();
}



function updateActorSimulationLive() {
    const actor = State.actors[State.selectedIndex];
    if (!actor) return;
    const baseLevel = State.actorSimBaseLevel || actor.initialLevel || 1;
    const classLevel = State.actorSimClassLevel || 1;
    const res = calculateActorSimulation(actor, baseLevel, classLevel);

        const elMhp = document.getElementById('sim-mhp');
    if (elMhp) elMhp.innerText = res.totalMhp.toLocaleString();
    const cardMhp = document.getElementById('sim-mhp-card');
    if (cardMhp) {
        cardMhp.title = `Poin Kesehatan Maksimal
Rumus: Class Base HP + (VIT × 15) + (STR × 5) + Bonus Equipment
Rincian: Class ${res.classMhp} + VIT(${res.totalCore.VIT}×15=${res.totalCore.VIT*15}) + STR(${res.totalCore.STR}×5=${res.totalCore.STR*5}) + Eq = ${res.totalMhp.toLocaleString()}`;
    }

    const elMmp = document.getElementById('sim-mmp');
    if (elMmp) elMmp.innerText = res.totalMmp.toLocaleString();
    const cardMmp = document.getElementById('sim-mmp-card');
    if (cardMmp) {
        cardMmp.title = `Poin Mana / Energi Sihir Maksimal
Rumus: Class Base MP + (INT × 8) + Bonus Equipment
Rincian: Class ${res.classMmp} + INT(${res.totalCore.INT}×8=${res.totalCore.INT*8}) + Eq = ${res.totalMmp.toLocaleString()}`;
    }

    const elMsp = document.getElementById('sim-msp');
    if (elMsp) elMsp.innerText = res.totalMsp.toLocaleString();
    const cardMsp = document.getElementById('sim-msp-card');
    if (cardMsp) {
        cardMsp.title = `Poin Stamina Tempur Maksimal
Rumus: Base 50 + (VIT × 5) + (STR × 2) + Bonus Equipment
Rincian: Base 50 + VIT(${res.totalCore.VIT}×5=${res.totalCore.VIT*5}) + STR(${res.totalCore.STR}×2=${res.totalCore.STR*2}) + Eq = ${res.totalMsp.toLocaleString()}`;
    }

    CORE_ATTRIBUTES.forEach(a => {
        const el = document.getElementById(`sim-core-${a.code}`);
        if (el) el.innerText = res.totalCore[a.code];
        const card = document.getElementById(`sim-core-${a.code}-card`);
        if (card) {
            const parts = [];
            parts.push(`Actor Base: ${res.actorBaseCore[a.code]}`);
            parts.push(`Class IV: +${res.classIVRating[a.code]}`);
            if (res.actorGrowthCore[a.code] > 0) parts.push(`Actor Growth: +${res.actorGrowthCore[a.code]}`);
            if (res.classGrowthCore[a.code] > 0) parts.push(`Class Growth: +${res.classGrowthCore[a.code]}`);
            if (res.eqCore[a.code] !== 0) parts.push(`Equip: ${res.eqCore[a.code] > 0 ? '+' : ''}${res.eqCore[a.code]}`);
            const rTag = (res.raceNatureTags && res.raceNatureTags[a.code.toLowerCase()]) || '=';
            const rRate = (res.raceMods && res.raceMods[a.code.toLowerCase()]) || 1.0;
            if (rTag === '+') parts.push(`Ras (${res.actorRaceName} ▲): ×${rRate.toFixed(2)}`);
            else if (rTag === '-') parts.push(`Ras (${res.actorRaceName} ▼): ×${rRate.toFixed(2)}`);
            card.title = `${a.name} (${a.code})
${a.desc || ''}
Rumus: ${a.formula || ''}
Rincian: ${parts.join(' + ')} = ${res.totalCore[a.code]}`;
        }
    });

    const elAtk = document.getElementById('sim-atk');
    if (elAtk) elAtk.innerText = res.totalAtk;
    const cardAtk = document.getElementById('sim-atk-card');
    if (cardAtk) {
        if (res.isFinesse) {
            cardAtk.title = `Daya Serang Fisik (Senjata Finesse: Dagger / Bow)
Rumus: Weapon ATK + (DEX × 2.0) + (STR × 0.5) + Bonus Equipment
Rincian: Base/Weap + DEX(${res.totalCore.DEX}×2=${res.totalCore.DEX*2}) + STR(${res.totalCore.STR}×0.5=${Math.round(res.totalCore.STR*0.5)}) + Eq = ${res.totalAtk}`;
        } else {
            cardAtk.title = `Daya Serang Fisik (Senjata Standar / Melee)
Rumus: Weapon ATK + (STR × 2.0) + (DEX × 0.5) + Bonus Equipment
Rincian: Base/Weap + STR(${res.totalCore.STR}×2=${res.totalCore.STR*2}) + DEX(${res.totalCore.DEX}×0.5=${Math.round(res.totalCore.DEX*0.5)}) + Eq = ${res.totalAtk}`;
        }
    }

    const elDef = document.getElementById('sim-def');
    if (elDef) elDef.innerText = res.totalDef;
    const cardDef = document.getElementById('sim-def-card');
    if (cardDef) {
        cardDef.title = `Ketahanan Pertahanan Fisik
Rumus: Class Base DEF + (VIT × 1.5) + (STR × 0.5) + Bonus Armor
Rincian: Class Base + VIT(${res.totalCore.VIT}×1.5=${Math.round(res.totalCore.VIT*1.5)}) + STR(${res.totalCore.STR}×0.5=${Math.round(res.totalCore.STR*0.5)}) + Eq = ${res.totalDef}`;
    }

    const elMat = document.getElementById('sim-mat');
    if (elMat) elMat.innerText = res.totalMat;
    const cardMat = document.getElementById('sim-mat-card');
    if (cardMat) {
        cardMat.title = `Daya Serang Kekuatan Sihir
Rumus: Class Base MAT + (INT × 2.0) + Bonus Equipment
Rincian: Class Base + INT(${res.totalCore.INT}×2.0=${res.totalCore.INT*2}) + Eq = ${res.totalMat}`;
    }

    const elMdf = document.getElementById('sim-mdf');
    if (elMdf) elMdf.innerText = res.totalMdf;
    const cardMdf = document.getElementById('sim-mdf-card');
    if (cardMdf) {
        cardMdf.title = `Ketahanan Pertahanan Sihir
Rumus: Class Base MDF + (INT × 1.2) + (VIT × 0.8) + Bonus Equipment
Rincian: Class Base + INT(${res.totalCore.INT}×1.2=${Math.round(res.totalCore.INT*1.2)}) + VIT(${res.totalCore.VIT}×0.8=${Math.round(res.totalCore.VIT*0.8)}) + Eq = ${res.totalMdf}`;
    }

    const elSpd = document.getElementById('sim-spd');
    if (elSpd) elSpd.innerText = res.totalAgi;
    const cardSpd = document.getElementById('sim-spd-card');
    if (cardSpd) {
        cardSpd.title = `Kecepatan Giliran & Inisiatif Tempur
Rumus: Class Base AGI + (AGI × 1.5) + Bonus Equipment
Rincian: Class Base + AGI(${res.totalCore.AGI}×1.5=${Math.round(res.totalCore.AGI*1.5)}) + Eq = ${res.totalAgi}`;
    }

    const elLuk = document.getElementById('sim-luk');
    if (elLuk) elLuk.innerText = res.totalLuk;
    const cardLuk = document.getElementById('sim-luk-card');
    if (cardLuk) {
        cardLuk.title = `Keberuntungan, Evasion Kritis & Efek Status
Rumus: Class Base LUK + LUK + Bonus Equipment
Rincian: Class Base + LUK(${res.totalCore.LUK}) + Eq = ${res.totalLuk}`;
    }

    const updateStatBadge = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    updateStatBadge('sim-hit', `${(res.hitRate * 100).toFixed(1)}%`);
    updateStatBadge('sim-eva', `${(res.evaRate * 100).toFixed(1)}%`);
    updateStatBadge('sim-cri', `${(res.critRate * 100).toFixed(1)}%`);
    updateStatBadge('sim-cdmg', `${(res.critDmg * 100).toFixed(1)}%`);
    updateStatBadge('sim-cev', `${(res.critEva * 100).toFixed(1)}%`);
    updateStatBadge('sim-grd', `${(res.guardEff * 100).toFixed(1)}%`);

    updateStatBadge('sim-hrg', `+${(res.hpRegen * 100).toFixed(2)}%/T`);
    updateStatBadge('sim-mrg', `+${(res.mpRegen * 100).toFixed(2)}%/T`);
    updateStatBadge('sim-trg', `+${(res.spRegen * 100).toFixed(2)}%/T`);

    updateStatBadge('sim-armpen', res.armPen ? `${(res.armPen * 100).toFixed(0)}%` : '0%');
    updateStatBadge('sim-magpen', res.magPen ? `${(res.magPen * 100).toFixed(0)}%` : '0%');
    updateStatBadge('sim-pdr', res.pdr ? `${(res.pdr * 100).toFixed(0)}%` : '0%');
    updateStatBadge('sim-mdr', res.mdr ? `${(res.mdr * 100).toFixed(0)}%` : '0%');
    updateStatBadge('sim-cnt', res.cnt ? `${(res.cnt * 100).toFixed(0)}%` : '0%');
    updateStatBadge('sim-mev', res.mev ? `${(res.mev * 100).toFixed(0)}%` : '0%');
    updateStatBadge('sim-mrf', res.mrf ? `${(res.mrf * 100).toFixed(0)}%` : '0%');
    updateStatBadge('sim-mcr', res.mcr ? `${(res.mcr * 100).toFixed(0)}%` : '100%');
    updateStatBadge('sim-tgr', `${(res.targetRate * 100).toFixed(0)}%`);

    const extraBox = document.getElementById('sim-extra-tags');
    if (extraBox) {
        const badges = [];
        res.amplifiedElements.forEach(e => {
            badges.push(`<span class="list-badge" style="color:#f59e0b; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); padding:3px 8px;">${pai('fire')} Amplify: ${escapeHtml(e)}</span>`);
        });
        res.activeSets.forEach(s => {
            badges.push(`<span class="list-badge" style="color:#10b981; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); padding:3px 8px;">${pai('shield')} Set: ${escapeHtml(s)}</span>`);
        });
        extraBox.innerHTML = badges.length ? badges.join(' ') : `<span style="font-size:0.75rem; color:var(--text-muted);">No elemental amplification or active set bonuses.</span>`;
    }
}

// =====================================================================
// 1. ACTORS EDITOR
// =====================================================================

// =====================================================================
// RPG MAKER MV TRAITS, EFFECTS & CRUD ENHANCEMENTS
// =====================================================================


function renderActorEditor(container, actor) {
    const note = actor.note || '';
    const secAccVal = getTagVal(note, 'Second Accessory') || getTagVal(note, 'Accessory 2');
    const portrait = (getTagVal(note, 'Portrait') || getTagVal(note, 'Status Image')).replace(/\.(png|jpe?g)$/i, '');
    const isLocked = hasTag(note, 'LockActor');
    const defaultRow = getTagVal(note, 'Default Row', '1');
    const race = getTagVal(note, 'Race', '');
    const passiveState = getTagVal(note, 'Passive State', '');
    const profile = getBlockTag(note, 'Profile', actor.profile || '');

    const actorClass = State.classes[actor.classId] || { name: 'Unknown Class', note: '' };
    const actorCoreStats = {};
    const classCoreStats = {};
    CORE_ATTRIBUTES.forEach(a => {
        actorCoreStats[a.code] = getTagVal(note, `Base ${a.code}`, '0');
        classCoreStats[a.code] = getTagVal(actorClass.note || '', `Base ${a.code}`, '0');
    });

    const accessories = State.armors.filter(a => a && a.etypeId === 6);
    const relics = State.armors.filter(a => a && a.etypeId === 7);
    const weaponsList = State.weapons.filter(w => w);
    const secondaryList = [
        ...State.weapons.filter(w => w && !w.note?.includes('2H Primary+Secondary')),
        ...State.armors.filter(a => a && a.etypeId === 2)
    ];
    const helms = State.armors.filter(a => a && a.etypeId === 3);
    const bodyArmors = State.armors.filter(a => a && a.etypeId === 4);
    const boots = State.armors.filter(a => a && a.etypeId === 5);

    actor.equips = actor.equips || [0, 0, 0, 0, 0, 0, 0];
    const simBaseLevel = State.actorSimBaseLevel || actor.initialLevel || 1;
    State.actorSimBaseLevel = simBaseLevel;

    const classTier = getTagVal(actorClass.note, 'Class Tier', '1');
    const customMax = parseInt(getTagVal(actorClass.note, 'Class Max Level'), 10);
    const tierCaps = { '1': 10, '2': 30, '3': 40, '4': 50, '5': 60, '6': 99 };
    const classMaxLvl = customMax || tierCaps[classTier] || 10;

    const simClassLevel = Math.min(classMaxLvl, State.actorSimClassLevel || 1);
    State.actorSimClassLevel = simClassLevel;

    container.innerHTML = `
        <!-- GENERAL SETTINGS & IDENTITY -->
        <div class="card">
            <div class="card-header">
                <h2 title="Pengaturan identitas dan profil karakter pahlawan">${pai('user')} Actor: #${actor.id} ${escapeHtml(actor.name)}</h2>
                <span style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(actor.nickname || '')}</span>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Nama karakter pahlawan yang tampil di layar, menu, dan dialog">Character Name</label>
                                <input type="text" class="form-control" value="${escapeHtml(actor.name || '')}" onchange="actor.name=this.value; setUnsaved(true); renderSidebar(); updateActorSimulationLive();">
                            </div>
                            <div class="form-group">
                                <label title="Julukan atau gelar kehormatan pahlawan">Nickname / Title</label>
                                <input type="text" class="form-control" value="${escapeHtml(actor.nickname || '')}" onchange="actor.nickname=this.value; setUnsaved(true);">
                            </div>
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label title="Kelas pekerjaan awal yang menentukan pertumbuhan stat dan kemampuan">Starting Class</label>
                                <select class="form-control" onchange="actor.classId=parseInt(this.value,10); setUnsaved(true); renderEditor();">
                                    ${State.classes.filter(c => c).map(c => `<option value="${c.id}" ${actor.classId === c.id ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Level awal karakter saat pertama kali bergabung ke pesta petualang">Initial Level</label>
                                <input type="number" min="1" max="99" class="form-control" value="${actor.initialLevel || 1}" onchange="actor.initialLevel=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                            <div class="form-group">
                                <label title="Batas level tertinggi yang dapat dicapai karakter ini (maksimal 99)">Max Level</label>
                                <input type="number" min="1" max="99" class="form-control" value="${actor.maxLevel || 99}" onchange="actor.maxLevel=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Ras atau spesies karakter (&lt;Race: ...&gt;) untuk interaksi afinitas cerita, pengali Nature stat (▲ +10%, ▼ -10%), dan Racial Ability bawaan">Ras Karakter</label>
                                <select class="form-control" onchange="setTagVal(actor, 'Race', this.value); updateActorSimulationLive();">
                                    <option value="Pribumi" ${race.toLowerCase() === 'pribumi' || !race ? 'selected' : ''}>Pribumi (True Neutral / All =)</option>
                                    ${(State.races || []).map(r => {
                                        if (!r || r.name === 'Pribumi') return '';
                                        const tags = r.natureTags || {};
                                        const pos = [];
                                        const neg = [];
                                        ['str','int','dex','luk','agi','vit'].forEach(k => {
                                            if (tags[k] === '+') pos.push(k.toUpperCase());
                                            if (tags[k] === '-') neg.push(k.toUpperCase());
                                        });
                                        const summary = (pos.length ? `▲${pos.join(',')} ` : '') + (neg.length ? `▼${neg.join(',')}` : '');
                                        const isSel = race.toLowerCase() === r.name.toLowerCase();
                                        return `<option value="${escapeHtml(r.name)}" ${isSel ? 'selected' : ''}>${escapeHtml(r.name)} (${escapeHtml(r.group || '')}) [${summary}]</option>`;
                                    }).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Posisi baris tempur awal (&lt;Default Row: 1-3&gt;): 1 (Baris Depan / Melee), 2 (Tengah), 3 (Belakang / Support)">Default Row</label>
                                <select class="form-control" onchange="setTagVal(actor, 'Default Row', this.value);">
                                    <option value="1" ${defaultRow === '1' ? 'selected' : ''}>Baris Depan (Front Row)</option>
                                    <option value="2" ${defaultRow === '2' ? 'selected' : ''}>Baris Tengah (Middle Row)</option>
                                    <option value="3" ${defaultRow === '3' ? 'selected' : ''}>Baris Belakang (Back Row)</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="ID status efek pasif bawaan unik yang selalu melekat pada karakter ini">Innate Passive State ID</label>
                                <select class="form-control" onchange="setTagVal(actor, 'Passive State', this.value);">
                                    <option value="">(Tidak Ada)</option>
                                    ${State.states.filter(s => s).map(s => `<option value="${s.id}" ${passiveState === String(s.id) ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="display:flex; align-items:center; align-self:end; height:34px;">
                                <label class="checkbox-label" style="margin:0;">
                                    <input type="checkbox" ${isLocked ? 'checked' : ''} onchange="setBoolTag(actor, 'LockActor', this.checked);">
                                    <span title="Mencegah karakter ini dikeluarkan atau ditukar dari susunan party aktif (<LockActor>)">${pai('lock')} Lock in Party</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style="font-size:0.76rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;" title="Pratinjau gambar potret besar karakter (<Portrait: ...>) untuk menu status Nusvanir">Portrait Preview</label>
                        <div class="portrait-preview-box">
                            ${portrait ? `<img src="img/pictures/${escapeHtml(portrait)}.png" class="portrait-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=&quot;portrait-empty&quot;><i class=&quot;pai-warning-diamond&quot;></i> File tidak ditemukan: '+this.getAttribute('src')+'</div>';">` : `<div class="portrait-empty">No portrait selected.<br>Choose from the list below.</div>`}
                        </div>
                        <div class="form-group" style="margin-top:10px;">
                            <label title="Pilih file ilustrasi potret karakter dari folder img/pictures/">Select Portrait Image</label>
                            <select class="form-control" onchange="setTagVal(actor, 'Portrait', this.value); renderEditor();">
                                <option value="">(Gunakan Face Graphic Standar)</option>
                                ${State.pictures.map(p => {
                                    const base = p.replace(/\.(png|jpe?g)$/i, '');
                                    return `<option value="${base}" ${portrait === base ? 'selected' : ''}>${p}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- VISUAL GRAPHICS & SPRITES WITH LIVE PREVIEWS -->
                <div style="margin-top:16px;">
                    <div style="font-size:0.85rem; font-weight:700; color:#38bdf8; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                        <span>${pai('image')} RPG Maker MV Visual Graphics &amp; Sprites</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">Click any preview box to open visual sheet picker</span>
                    </div>
                    <div class="grid-3" style="gap:14px;">
                        <!-- 1. FACE GRAPHIC -->
                        <div class="graphic-preview-card">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <label style="margin:0; font-weight:700; font-size:0.82rem;" title="Grafis wajah untuk dialog teks percakapan dan menu sederhana">Face Graphic</label>
                                <span class="badge-sub" id="faceIndexLabel">Index ${actor.faceIndex || 0}</span>
                            </div>
                            
                            <div class="sprite-preview-box" id="facePreviewBox" title="Klik untuk membuka visual sheet picker" onclick="openGraphicSheetModal('face')">
                                ${renderFacePreviewHtml(actor.faceName, actor.faceIndex || 0)}
                            </div>

                            <div class="form-group" style="margin-bottom:6px;">
                                <select class="form-control" id="actorFaceSelect" onchange="onActorFaceChange(this.value)">
                                    <option value="">(None)</option>
                                    ${State.faces.map(f => {
                                        const clean = f.replace(/\.png$/i, '');
                                        return `<option value="${clean}" ${actor.faceName === clean ? 'selected' : ''}>${f}</option>`;
                                    }).join('')}
                                </select>
                            </div>

                            <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px;" title="Pilih indeks wajah (0-7) dari 4 kolom x 2 baris sheet">Face Index (0 - 7):</div>
                            <div class="index-grid-8" id="faceIndexGrid">
                                ${[0, 1, 2, 3, 4, 5, 6, 7].map(idx => `
                                    <button type="button" class="idx-btn ${Number(actor.faceIndex || 0) === idx ? 'active' : ''}" 
                                            onclick="onActorFaceIndexChange(${idx})" title="Wajah Indeks #${idx}">
                                        ${idx}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 2. CHARACTER SPRITE -->
                        <div class="graphic-preview-card">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <label style="margin:0; font-weight:700; font-size:0.82rem;" title="Sprite visual karakter saat menjelajah peta dunia">Character Sprite</label>
                                <span class="badge-sub" id="charIndexLabel">${(actor.characterName || '').startsWith('$') ? 'Single ($)' : `Index ${actor.characterIndex || 0}`}</span>
                            </div>

                            <div class="sprite-preview-box" id="charPreviewBox" title="Klik untuk membuka visual sheet picker" onclick="openGraphicSheetModal('character')">
                                ${renderCharPreviewHtml(actor.characterName, actor.characterIndex || 0)}
                            </div>

                            <div class="form-group" style="margin-bottom:6px;">
                                <select class="form-control" id="actorCharSelect" onchange="onActorCharChange(this.value)">
                                    <option value="">(None)</option>
                                    ${State.characters.map(c => {
                                        const clean = c.replace(/\.png$/i, '');
                                        return `<option value="${clean}" ${actor.characterName === clean ? 'selected' : ''}>${c}</option>`;
                                    }).join('')}
                                </select>
                            </div>

                            <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px;" title="Pilih karakter (0-7) jika sheet berisi 8 karakter">Character Index (0 - 7):</div>
                            <div class="index-grid-8" id="charIndexGrid">
                                ${[0, 1, 2, 3, 4, 5, 6, 7].map(idx => `
                                    <button type="button" class="idx-btn ${Number(actor.characterIndex || 0) === idx ? 'active' : ''}" 
                                            onclick="onActorCharIndexChange(${idx})" title="Karakter Indeks #${idx}" ${(actor.characterName || '').startsWith('$') ? 'disabled' : ''}>
                                        ${idx}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 3. SV BATTLER -->
                        <div class="graphic-preview-card">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <label style="margin:0; font-weight:700; font-size:0.82rem;" title="Sprite animasi gerak samping saat melancarkan aksi tempur">[SV] Battler</label>
                                <span class="badge-sub">Idle Pose</span>
                            </div>

                            <div class="sprite-preview-box" id="svPreviewBox" title="Klik untuk memilih gambar SV Battler" onclick="openGraphicSheetModal('sv')">
                                ${renderSvPreviewHtml(actor.battlerName)}
                            </div>

                            <div class="form-group" style="margin-bottom:6px;">
                                <select class="form-control" id="actorSvSelect" onchange="onActorSvChange(this.value)">
                                    <option value="">(None)</option>
                                    ${State.svActors.map(s => {
                                        const clean = s.replace(/\.png$/i, '');
                                        return `<option value="${clean}" ${actor.battlerName === clean ? 'selected' : ''}>${s}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                            <div style="font-size:0.72rem; color:var(--text-muted); text-align:center; padding-top:6px;">
                                Sideview Combat Sheet
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-group" style="margin-top:16px;">
                    <label title="Latar belakang kisah dan catatan narasi karakter yang tampil di menu profil (&lt;Profile&gt;)">Character Lore &amp; Profile</label>
                    <textarea class="form-control" rows="3" onchange="actor.profile=this.value; setBlockTag(actor, 'Profile', this.value);">${escapeHtml(profile)}</textarea>
                </div>
            </div>
        </div>

        <!-- BASE ACTOR STATS & INNATE GROWTH (SPECIES BASE) -->
        <div class="card">
            <div class="card-header">
                <h2 title="Stat dasar bawaan alami karakter (Species Base) dan pertumbuhannya per Base Level">${pai('chart-bar')} Actor Baseline Stats (Species Base)</h2>
                <span style="font-size:0.8rem; color:var(--text-muted);">&lt;Base STR: X&gt; &amp; &lt;Actor Stat Growth&gt;</span>
            </div>
            <div class="card-body">
                <div class="form-group" style="margin-bottom:14px;">
                    <label title="Pertumbuhan stat alami karakter setiap kali Base Level naik (+Stat per Base Level) (&lt;Actor Stat Growth: +X STR, +Y INT, ...&gt;)">${pai('chart-line')} Innate Actor Growth per Base Level</label>
                    <input type="text" class="form-control" placeholder="Contoh: +1 STR, +1 VIT, +0.5 AGI" 
                           value="${escapeHtml(getTagVal(note, 'Actor Stat Growth', ''))}" 
                           oninput="setTagVal(actor, 'Actor Stat Growth', this.value); updateActorSimulationLive();"
                           onchange="setTagVal(actor, 'Actor Stat Growth', this.value); updateActorSimulationLive();">
                </div>
                <div class="stat-grid-6">
                    ${CORE_ATTRIBUTES.map(attr => {
                        const rawClsIV = parseInt(getTagVal(actorClass.note || '', `Base ${attr.code}`, '5'), 10) || 5;
                        const ivInfo = getIVGradeInfo(rawClsIV);
                        return `
                            <div class="stat-card-input">
                                <label style="color:${attr.color};"><span>${attr.icon} ${attr.code}</span> <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span></label>
                                <input type="number" min="0" max="999" class="form-control" 
                                       id="actor-base-input-${attr.code}"
                                       value="${actorCoreStats[attr.code]}" 
                                       placeholder=""
                                       oninput="onActorBaseStatInput('${attr.code}', this.value)"
                                       onchange="onActorBaseStatInput('${attr.code}', this.value)">
                                <div style="font-size:0.7rem; color:var(--text-muted); margin-top:4px;" title="Scaling bakat dari profesi ${escapeHtml(actorClass.name)} (IV Rating: ${rawClsIV}/10)">
                                    Class IV: <strong style="color:${ivInfo.color};">${rawClsIV}/10 (${ivInfo.grade})</strong>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>

        <!-- INITIAL EQUIPS -->
        <div class="card">
            <div class="card-header">
                <h2 title="Perlengkapan bawaan awal karakter saat petualangan dimulai">${pai('shield')} Initial Equipment (8 Nusvanir Slots)</h2>
                <span style="font-size:0.8rem; color:var(--text-muted);" title="Perubahan perlengkapan langsung memperbarui simulasi stat di atas">Modifying equipment instantly updates the simulation above.</span>
            </div>
            <div class="card-body">
                <div class="equip-grid">
                    <div class="equip-slot-item">
                        <div class="slot-title">${pai('sword')} 1. Weapon (Utama)</div>
                        <select class="form-control" onchange="actor.equips[0]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                            <option value="0">(Kosong)</option>
                            ${weaponsList.map(w => `<option value="${w.id}" ${actor.equips[0] === w.id ? 'selected' : ''}>#${w.id} ${escapeHtml(w.name)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="equip-slot-item">
                        <div class="slot-title">${pai('shield')} 2. Secondary (Off-Hand)</div>
                        <select class="form-control" onchange="actor.equips[1]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                            <option value="0">(Kosong)</option>
                            ${secondaryList.map(s => `<option value="${s.id}" ${actor.equips[1] === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="equip-slot-item">
                        <div class="slot-title">${pai('user')} 3. Helm (Kepala)</div>
                        <select class="form-control" onchange="actor.equips[2]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                            <option value="0">(Kosong)</option>
                            ${helms.map(h => `<option value="${h.id}" ${actor.equips[2] === h.id ? 'selected' : ''}>#${h.id} ${escapeHtml(h.name)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="equip-slot-item">
                        <div class="slot-title">${pai('shirt')} 4. Armor (Badan)</div>
                        <select class="form-control" onchange="actor.equips[3]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                            <option value="0">(Kosong)</option>
                            ${bodyArmors.map(b => `<option value="${b.id}" ${actor.equips[3] === b.id ? 'selected' : ''}>#${b.id} ${escapeHtml(b.name)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="equip-slot-item">
                        <div class="slot-title">${pai('speed-fast')} 5. Boots (Kaki)</div>
                        <select class="form-control" onchange="actor.equips[4]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                            <option value="0">(Kosong)</option>
                            ${boots.map(b => `<option value="${b.id}" ${actor.equips[4] === b.id ? 'selected' : ''}>#${b.id} ${escapeHtml(b.name)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="equip-slot-item">
                        <div class="slot-title">${pai('diamond-gem')} 6. Accessory 1</div>
                        <select class="form-control" onchange="actor.equips[5]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                            <option value="0">(Kosong)</option>
                            ${accessories.map(a => `<option value="${a.id}" ${actor.equips[5] === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="equip-slot-item">
                        <div class="slot-title" title="Slot aksesoris kedua (<Second Accessory>)">${pai('diamond-gem')} 6. Accessory 2</div>
                        <select class="form-control" onchange="setTagVal(actor, 'Second Accessory', this.value); updateActorSimulationLive();">
                            <option value="">(Kosong)</option>
                            ${accessories.map(a => {
                                const isSel = secAccVal === a.name || secAccVal === String(a.id);
                                return `<option value="${escapeHtml(a.name)}" ${isSel ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`;
                            }).join('')}
                        </select>
                    </div>

                    <div class="equip-slot-item">
                        <div class="slot-title">${pai('wand')} 7. Relic</div>
                        <select class="form-control" onchange="actor.equips[6]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                            <option value="0">(Kosong)</option>
                            ${relics.map(r => `<option value="${r.id}" ${actor.equips[6] === r.id ? 'selected' : ''}>#${r.id} ${escapeHtml(r.name)}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- NOTETAG MENTAH -->
        ${renderTraitsCard(actor, 'actors')}

        <div class="card">
            <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">${pai('notes')} Raw Notetags (Direct Edit)</h2></div>
            <div class="card-body">
                <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value); updateActorSimulationLive();">${escapeHtml(actor.note || '')}</textarea>
            </div>
        </div>
    `;
}



function renderActorStatPreview(container, actor) {
    const note = actor.note || '';
    const actorClass = State.classes[actor.classId] || { name: 'Unknown Class', note: '' };
    const simBaseLevel = State.actorSimBaseLevel || actor.initialLevel || 1;
    const simClassLevel = State.actorSimClassLevel || 1;
    const classTier = parseInt(getTagVal(actorClass.note || '', 'Class Tier', '1'), 10) || 1;
    const defaultMaxLvl = classTier === 1 ? 10 : (classTier === 2 ? 30 : (classTier === 3 ? 40 : (classTier === 4 ? 50 : (classTier === 5 ? 60 : 99))));
    const classMaxLvl = parseInt(getTagVal(actorClass.note || '', 'Class Max Level', '0'), 10) || defaultMaxLvl;

    container.innerHTML = `
        <!-- 1. DUAL LEVEL SLIDERS (BASE LEVEL & CLASS LEVEL) -->
        <div class="card" style="border: 1px solid rgba(59, 130, 246, 0.4); margin-bottom: 0;">
            <div class="card-header" style="background: linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); padding: 8px 12px;">
                <h2 style="font-size:0.85rem; margin:0; display:flex; align-items:center; gap:6px;">${pai('sliders')} Level Simulation</h2>
                <div style="display:flex; gap:6px;">
                    <span class="badge-sub" style="font-size:0.75rem; font-weight:700; color:#38bdf8;" id="actorSimBaseBadge">Base Lv ${simBaseLevel}</span>
                    <span class="badge-sub" style="font-size:0.75rem; font-weight:700; color:#c084fc;" id="actorSimClassBadge">Class Lv ${simClassLevel} / ${classMaxLvl}</span>
                </div>
            </div>
            <div class="card-body" style="padding: 10px 12px; display:flex; flex-direction:column; gap:10px;">
                <!-- Base Level Slider -->
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <label style="font-weight:700; font-size:0.78rem; margin:0; color:#94a3b8;" title="Base Level (1 - 99)">${pai('user')} Base Level:</label>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <input type="range" min="1" max="99" value="${simBaseLevel}" class="form-control" style="flex:1; cursor:pointer;" 
                               id="actorSimBaseSlider" oninput="onActorSimBaseLevelChange(this.value)">
                        <input type="number" min="1" max="99" value="${simBaseLevel}" class="form-control" style="width:55px; text-align:center; padding:3px 4px; font-weight:700; font-size:0.85rem;" 
                               id="actorSimBaseInput" onchange="onActorSimBaseLevelChange(this.value)">
                    </div>
                </div>

                <!-- Class Level Slider -->
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <label style="font-weight:700; font-size:0.78rem; margin:0; color:#94a3b8;" title="Class Level (1 - ${classMaxLvl})">${pai('shield')} Class Level:</label>
                        <span class="badge-sub" style="font-size:0.72rem; color:#a78bfa; padding:1px 6px;">${escapeHtml(actorClass.name)}</span>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <input type="range" min="1" max="${classMaxLvl}" value="${simClassLevel}" class="form-control" style="flex:1; cursor:pointer;" 
                               id="actorSimClassSlider" oninput="onActorSimClassLevelChange(this.value)">
                        <input type="number" min="1" max="${classMaxLvl}" value="${simClassLevel}" class="form-control" style="width:55px; text-align:center; padding:3px 4px; font-weight:700; font-size:0.85rem;" 
                               id="actorSimClassInput" onchange="onActorSimClassLevelChange(this.value)">
                    </div>
                </div>
            </div>
        </div>

                <!-- 2. VITAL RESOURCES & 6 CORE STATS -->
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:8px 12px;">
                <h2 style="font-size:0.85rem; margin:0; color:#38bdf8;">${pai('chart-bar')} Vital Resources &amp; 6 Core Stats</h2>
                <span style="font-size:0.7rem; color:var(--text-muted);">Hover untuk rincian formula</span>
            </div>
            <div class="card-body" style="padding:10px 12px; display:flex; flex-direction:column; gap:10px;">
                <!-- Row Vitals: HP, MP, SP -->
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
                    <div class="stat-card-input" id="sim-mhp-card" style="border-left: 3px solid #f87171; padding:6px 8px; cursor:help;" data-hover-name="Max HP (Vitality & STR)" title="Poin Kesehatan Maksimal&#10;Rumus: Class Base HP + (VIT × 15) + (STR × 5) + Bonus Equipment">
                        <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600;">${pai('heart')} Max HP</div>
                        <div style="font-size:1.15rem; font-weight:700; color:#f87171; line-height:1.1; margin-top:3px;" id="sim-mhp">0</div>
                    </div>
                    <div class="stat-card-input" id="sim-mmp-card" style="border-left: 3px solid #60a5fa; padding:6px 8px; cursor:help;" data-hover-name="Max MP (Intelligence)" title="Poin Mana / Energi Sihir Maksimal&#10;Rumus: Class Base MP + (INT × 8) + Bonus Equipment">
                        <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600;">${pai('drop')} Max MP</div>
                        <div style="font-size:1.15rem; font-weight:700; color:#60a5fa; line-height:1.1; margin-top:3px;" id="sim-mmp">0</div>
                    </div>
                    <div class="stat-card-input" id="sim-msp-card" style="border-left: 3px solid #38bdf8; padding:6px 8px; cursor:help;" data-hover-name="Max SP (Stamina)" title="Poin Stamina Tempur Maksimal&#10;Rumus: Base 50 + (VIT × 1.5) + (STR × 0.5) + Bonus Equipment">
                        <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600;">${pai('zap')} Max SP</div>
                        <div style="font-size:1.15rem; font-weight:700; color:#38bdf8; line-height:1.1; margin-top:3px;" id="sim-msp">0</div>
                    </div>
                </div>

                <!-- 6 Core Attributes (2 columns: Physical & Special) -->
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    ${CORE_ATTRIBUTES.map(a => `
                        <div class="stat-card-input" id="sim-core-${a.code}-card" style="border-left: 3px solid ${a.color}; padding:6px 8px; cursor:help;" data-hover-name="${escapeHtml(a.name)} (${a.code})" title="${escapeHtml(a.desc || '')}&#10;Rumus: ${escapeHtml(a.formula || '')}">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="color:${a.color}; font-weight:700; font-size:0.78rem; line-height:1.2;">${a.icon} ${a.code}</div>
                                    <div style="font-size:0.62rem; color:var(--text-muted); line-height:1.1;">${escapeHtml(a.name)}</div>
                                </div>
                                <span style="font-size:1.15rem; font-weight:700; color:${a.color}; line-height:1.1;" id="sim-core-${a.code}">0</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- 3. PARAMETER TEMPUR & MITIGASI -->
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:8px 12px;">
                <h2 style="font-size:0.85rem; margin:0; color:#fb923c;">${pai('sword')} Combat Parameters &amp; Mitigation</h2>
                <span style="font-size:0.7rem; color:var(--text-muted);">Hover untuk rincian formula</span>
            </div>
            <div class="card-body" style="padding:10px 12px; display:flex; flex-direction:column; gap:10px;">
                <!-- Primary Combat Parameters (3 columns) -->
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                    <div class="stat-card-input" id="sim-atk-card" style="border-left: 2px solid #fb923c; padding:5px 6px; cursor:help;" data-hover-name="P.ATK (Physical Attack)" title="Daya Serang Fisik Utama&#10;Rumus: Weapon ATK + (STR × 2.0) + (DEX × 0.5) + Equip">
                        <div style="font-size:0.68rem; color:var(--text-muted);">${pai('sword')} P.ATK</div>
                        <div style="font-size:1.05rem; font-weight:700; color:#fb923c; line-height:1.1; margin-top:3px;" id="sim-atk">0</div>
                    </div>
                    <div class="stat-card-input" id="sim-def-card" style="border-left: 2px solid #34d399; padding:5px 6px; cursor:help;" data-hover-name="P.DEF (Physical Defense)" title="Ketahanan Pertahanan Fisik&#10;Rumus: Class Base DEF + (VIT × 1.5) + (STR × 0.5) + Bonus Armor">
                        <div style="font-size:0.68rem; color:var(--text-muted);">${pai('shield')} P.DEF</div>
                        <div style="font-size:1.05rem; font-weight:700; color:#34d399; line-height:1.1; margin-top:3px;" id="sim-def">0</div>
                    </div>
                    <div class="stat-card-input" id="sim-mat-card" style="border-left: 2px solid #a78bfa; padding:5px 6px; cursor:help;" data-hover-name="M.ATK (Magic Attack)" title="Daya Serang Kekuatan Sihir&#10;Rumus: Class Base MAT + (INT × 2.0) + Bonus Equipment">
                        <div style="font-size:0.68rem; color:var(--text-muted);">${pai('wand')} M.ATK</div>
                        <div style="font-size:1.05rem; font-weight:700; color:#a78bfa; line-height:1.1; margin-top:3px;" id="sim-mat">0</div>
                    </div>
                    <div class="stat-card-input" id="sim-mdf-card" style="border-left: 2px solid #38bdf8; padding:5px 6px; cursor:help;" data-hover-name="M.MDF (Magic Defense)" title="Ketahanan Pertahanan Sihir&#10;Rumus: Class Base MDF + (INT × 1.2) + (VIT × 0.8) + Bonus Equipment">
                        <div style="font-size:0.68rem; color:var(--text-muted);">${pai('shield')} M.MDF</div>
                        <div style="font-size:1.05rem; font-weight:700; color:#38bdf8; line-height:1.1; margin-top:3px;" id="sim-mdf">0</div>
                    </div>
                    <div class="stat-card-input" id="sim-spd-card" style="border-left: 2px solid #facc15; padding:5px 6px; cursor:help;" data-hover-name="Speed (Action Agility)" title="Kecepatan Giliran & Inisiatif Tempur&#10;Rumus: Class Base AGI + (AGI × 1.5) + Bonus Equipment">
                        <div style="font-size:0.68rem; color:var(--text-muted);">${pai('speed-fast')} Speed</div>
                        <div style="font-size:1.05rem; font-weight:700; color:#facc15; line-height:1.1; margin-top:3px;" id="sim-spd">0</div>
                    </div>
                    <div class="stat-card-input" id="sim-luk-card" style="border-left: 2px solid #4ade80; padding:5px 6px; cursor:help;" data-hover-name="Luck (LUK)" title="Keberuntungan, Evasion Kritis & Efek Status&#10;Rumus: Class Base LUK + LUK + Bonus Equipment">
                        <div style="font-size:0.68rem; color:var(--text-muted);">${pai('sparkles')} Luck</div>
                        <div style="font-size:1.05rem; font-weight:700; color:#4ade80; line-height:1.1; margin-top:3px;" id="sim-luk">0</div>
                    </div>
                </div>

                <!-- Precision & Mitigation (4 columns chip badges) with hover details -->
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:4px; background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:6px;">
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="HIT (Hit Rate)" title="Akurasi Serangan Fisik&#10;Rumus: 85% + (DEX × 0.2%) + Bonus Equipment (Maks 100%)">
                        <div style="font-size:0.65rem; color:#facc15;">${pai('target')} HIT</div>
                        <div style="font-size:0.85rem; font-weight:700; color:#facc15;" id="sim-hit">0%</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="EVA (Evasion Rate)" title="Peluang Menghindari Serangan Fisik&#10;Rumus: 2% + (AGI × 0.2%) + (LUK × 0.05%) + Bonus Equipment (Maks 80%)">
                        <div style="font-size:0.65rem; color:#10b981;">${pai('speed-fast')} EVA</div>
                        <div style="font-size:0.85rem; font-weight:700; color:#10b981;" id="sim-eva">0%</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="CRI (Critical Rate)" title="Peluang Serangan Kritikal&#10;Rumus: 3% + (DEX × 0.2%) + (LUK × 0.1%) + Bonus Equipment (Maks 85%)">
                        <div style="font-size:0.65rem; color:#fb923c;">${pai('zap')} CRI</div>
                        <div style="font-size:0.85rem; font-weight:700; color:#fb923c;" id="sim-cri">0%</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="CDMG (Critical Damage)" title="Pengali Kerusakan Serangan Kritis&#10;Rumus: 150% + (STR × 0.3%) + (DEX × 0.2%) + Bonus Equipment">
                        <div style="font-size:0.65rem; color:#ef4444;">${pai('sword')} CDMG</div>
                        <div style="font-size:0.85rem; font-weight:700; color:#ef4444;" id="sim-cdmg">150%</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="CEV (Critical Evasion)" title="Resistensi Terhadap Serangan Kritis Musuh&#10;Rumus: (LUK × 0.15%) + (VIT × 0.1%) + Bonus Equipment">
                        <div style="font-size:0.65rem; color:#4ade80;">${pai('shield')} CEV</div>
                        <div style="font-size:0.85rem; font-weight:700; color:#4ade80;" id="sim-cev">0%</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="GRD (Guard Mitigation)" title="Efisiensi Pengurangan Damage Saat Guard / Bertahan&#10;Rumus: 100% + (VIT × 0.5%) + Bonus Equipment">
                        <div style="font-size:0.65rem; color:#60a5fa;">${pai('shield')} GRD</div>
                        <div style="font-size:0.85rem; font-weight:700; color:#60a5fa;" id="sim-grd">100%</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="PDR (Physical Damage Reduction)" title="Pengurangan Damage Fisik yang Diterima&#10;Rumus: Dari Notetag Perlengkapan <PDR Plus: +X%>">
                        <div style="font-size:0.65rem; color:#34d399;">${pai('shield')} PDR</div>
                        <div style="font-size:0.85rem; font-weight:700; color:#34d399;" id="sim-pdr">0%</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="MDR (Magical Damage Reduction)" title="Pengurangan Damage Sihir yang Diterima&#10;Rumus: Dari Notetag Perlengkapan <MDR Plus: +X%>">
                        <div style="font-size:0.65rem; color:#38bdf8;">${pai('shield')} MDR</div>
                        <div style="font-size:0.85rem; font-weight:700; color:#38bdf8;" id="sim-mdr">0%</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="HRG (HP Regen / Turn)" title="Pemulihan HP Otomatis Setiap Giliran&#10;Rumus: (VIT × 0.03%) + Bonus Equipment">
                        <div style="font-size:0.65rem; color:#f87171;">${pai('heart')} HRG</div>
                        <div style="font-size:0.82rem; font-weight:700; color:#f87171;" id="sim-hrg">0%/T</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="TRG (SP Regen / Turn)" title="Pemulihan Stamina (SP) Otomatis Setiap Giliran&#10;Rumus: 3% + (AGI × 0.04%) + (VIT × 0.02%) + Bonus Equipment">
                        <div style="font-size:0.65rem; color:#38bdf8;">${pai('zap')} TRG</div>
                        <div style="font-size:0.82rem; font-weight:700; color:#38bdf8;" id="sim-trg">3%/T</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="ArPen (Armor Penetration)" title="Penetrasi Pertahanan Fisik Target&#10;Rumus: Dari Notetag Perlengkapan <Armor Penetration: +X%>">
                        <div style="font-size:0.65rem; color:#f59e0b;">${pai('sword')} ArPen</div>
                        <div style="font-size:0.82rem; font-weight:700; color:#f59e0b;" id="sim-armpen">0%</div>
                    </div>
                    <div style="padding:3px 4px; text-align:center; cursor:help;" data-hover-name="MgPen (Magic Penetration)" title="Penetrasi Pertahanan Sihir Target&#10;Rumus: Dari Notetag Perlengkapan <Magic Penetration: +X%>">
                        <div style="font-size:0.65rem; color:#a78bfa;">${pai('wand')} MgPen</div>
                        <div style="font-size:0.82rem; font-weight:700; color:#a78bfa;" id="sim-magpen">0%</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. ACTIVE SETS & ELEMENTS -->
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:8px 12px;"><h2 style="font-size:0.85rem; margin:0; color:#eab308;">${pai('sparkles')} Active Sets &amp; Elements</h2></div>
            <div class="card-body" style="padding:8px 12px;">
                <div id="sim-extra-tags" style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
                    <span style="font-size:0.75rem; color:var(--text-muted);">(None)</span>
                </div>
            </div>
        </div>
    `;

    setTimeout(updateActorSimulationLive, 10);
}

// =====================================================================
// 2. CLASSES EDITOR
// =====================================================================
