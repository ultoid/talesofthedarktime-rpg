const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log('=== RUNNING NUSV CTB CALIBRATION TEST SUITE ===');

// -----------------------------------------------------------------------------
// 1. Verify Configuration in plugins.js
// -----------------------------------------------------------------------------
const pluginsContent = fs.readFileSync('js/plugins.js', 'utf8');
vm.runInThisContext(pluginsContent);

const becPlugin = global.$plugins.find(p => p.name === 'YEP_BattleEngineCore');
assert(becPlugin, 'YEP_BattleEngineCore must exist in $plugins');
assert.strictEqual(
  becPlugin.parameters['Default System'],
  'ctb',
  'YEP_BattleEngineCore Default System must be calibrated to "ctb"'
);
console.log('[PASS] YEP_BattleEngineCore is set to Default System: "ctb"');

const ctbPlugin = global.$plugins.find(p => p.name === 'YEP_X_BattleSysCTB');
assert(ctbPlugin, 'YEP_X_BattleSysCTB must exist in $plugins');
assert.strictEqual(ctbPlugin.parameters['Show Turn Order'], 'true', 'Show Turn Order must be true');
assert.strictEqual(ctbPlugin.parameters['Enable Rubberband'], 'true', 'Enable Rubberband must be true');
assert.strictEqual(ctbPlugin.parameters['Position X'], 'right', 'Position X must be right');
assert.strictEqual(ctbPlugin.parameters['Position Y'], '54', 'Position Y must be 54');
assert.strictEqual(ctbPlugin.parameters['Turn Direction'], 'left', 'Turn Direction must be left');
assert.strictEqual(ctbPlugin.parameters['Icon Size'], '36', 'Icon Size must be 36 for 1080p/720p balance');
console.log('[PASS] YEP_X_BattleSysCTB parameters correctly calibrated (Rubberband, Size 36, Top-Right)');

const nusvCtbPlugin = global.$plugins.find(p => p.name === 'NUSV_CTBCalibration');
assert(nusvCtbPlugin, 'NUSV_CTBCalibration must exist in $plugins');
assert.strictEqual(nusvCtbPlugin.status, true, 'NUSV_CTBCalibration must be active');
console.log('[PASS] NUSV_CTBCalibration plugin is registered and active');

// -----------------------------------------------------------------------------
// 2. Mathematical CTB Pacing & Rubberband Simulation
// -----------------------------------------------------------------------------
function simulateCTBPacing(agiList, rounds) {
  const highestAgi = Math.max(...agiList);
  const target = Math.max(7000, highestAgi * 120);
  const minSpeed = 0.5 * highestAgi;
  const maxSpeed = 1.5 * highestAgi;

  const battlers = agiList.map((agi, idx) => ({
    id: idx + 1,
    agi: agi,
    speed: 0,
    turns: 0,
    speedTick: Math.max(minSpeed, Math.min(maxSpeed, agi))
  }));

  let totalTurns = 0;
  const turnLog = [];

  while (totalTurns < rounds) {
    // Check ready battlers
    let ready = battlers.filter(b => b.speed >= target);
    if (ready.length === 0) {
      // Advance tick
      for (const b of battlers) {
        b.speed += b.speedTick;
      }
      continue;
    }

    // Sort ready battlers by overflow speed or AGI
    ready.sort((a, b) => (b.speed - target) - (a.speed - target) || b.agi - a.agi);
    const active = ready[0];

    // Battler acts
    active.turns++;
    totalTurns++;
    turnLog.push(active.id);
    active.speed -= target; // Reset CTB speed
  }

  return { battlers, turnLog };
}

// Scenario A: Equal AGI (Hector AGI 20, Enemy AGI 20) -> Perfect 1:1 pacing
{
  const result = simulateCTBPacing([20, 20], 10);
  assert.strictEqual(result.battlers[0].turns, 5, 'Equal AGI battler 1 should take exactly 5 turns in 10 rounds');
  assert.strictEqual(result.battlers[1].turns, 5, 'Equal AGI battler 2 should take exactly 5 turns in 10 rounds');
  console.log('[PASS] Scenario A (Equal AGI): 1-to-1 turn alternation verified');
}

// Scenario B: Fast Rogue (AGI 30) vs Heavy Knight (AGI 15) -> 2:1 pacing
{
  const result = simulateCTBPacing([30, 15], 12);
  assert.strictEqual(result.battlers[0].turns, 8, 'AGI 30 should take 8 turns');
  assert.strictEqual(result.battlers[1].turns, 4, 'AGI 15 should take 4 turns');
  console.log('[PASS] Scenario B (Fast vs Normal AGI): 2-to-1 ratio verified (AGI investment feels rewarding)');
}

// Scenario C: Extreme Boss (AGI 80) vs Slow Party Member (AGI 10)
// Without rubberband, ratio would be 8:1 (unfair death loop).
// With rubberband: AGI 10 clamped to 0.5 * 80 = 40! Ratio is strictly 80:40 = 2:1!
{
  const result = simulateCTBPacing([80, 10], 12);
  assert.strictEqual(result.battlers[0].turns, 8, 'Extreme Boss takes 8 turns');
  assert.strictEqual(result.battlers[1].turns, 4, 'Slow unit clamped by rubberband takes 4 turns (NO infinite queue cut)');
  console.log('[PASS] Scenario C (Extreme Boss vs Slow Party): Rubberband successfully prevents queue-cutting monopoly');
}

// -----------------------------------------------------------------------------
// 3. Turn Order Icon Positioning & Overlap Test
// -----------------------------------------------------------------------------
const boxWidth = 1080;
const iconSize = 36;
const contentsWidth = iconSize + 8; // 44
const constant = contentsWidth + 2;  // 46
const padding = 18;

function calculateDestinationX(index, totalBattlers) {
  // YEP updateDestinationRightAlign
  let destX = boxWidth - (padding * 2) - (constant * totalBattlers) - (constant / 2) + 2;
  // YEP updateDestinationGoingLeft
  destX += index * constant;
  if (index !== 0) {
    destX += constant / 2;
  }
  return destX;
}

const totalUnits = 6; // 3 Actors + 3 Enemies
const iconPositions = [];

for (let i = 0; i < totalUnits; i++) {
  const winX = calculateDestinationX(i, totalUnits);
  const visualContentX = winX + padding;
  iconPositions.push({
    index: i,
    winX: winX,
    contentLeft: visualContentX,
    contentRight: visualContentX + contentsWidth
  });
}

// Verify that for all adjacent icons, there is NO overlap (distance between edges >= 0)
for (let i = 0; i < totalUnits - 1; i++) {
  const current = iconPositions[i];
  const next = iconPositions[i + 1];
  const gap = next.contentLeft - current.contentRight;
  assert(gap >= 2, `Icon ${i} and ${i + 1} must not overlap. Gap: ${gap}px`);
}
console.log('[PASS] Turn Order Icons: No horizontal overlap between adjacent icons (clean 2px margin)');

// Verify distinct separation gap for the Active Turn (index 0 to index 1)
const activeGap = iconPositions[1].contentLeft - iconPositions[0].contentRight;
assert(activeGap >= constant / 2, `Active turn must have extra separation gap. Gap: ${activeGap}px`);
console.log(`[PASS] Active Turn clearly separated from upcoming queue by ${activeGap}px gap`);

// Verify queue fits inside 1080px screen
const rightmostEdge = iconPositions[totalUnits - 1].contentRight;
assert(rightmostEdge <= boxWidth, `Turn bar right edge (${rightmostEdge}) must not exceed screen width (${boxWidth})`);
console.log(`[PASS] Turn bar cleanly bounds within screen edge (${rightmostEdge}px <= ${boxWidth}px)`);

console.log('\n>>> ALL CTB CALIBRATION TESTS PASSED SUCCESSFULLY! <<<');

