// Test scenarios for final scoring implementation
// Run: node test-final-scoring.mjs

import { readFileSync } from 'fs';

// Extract the scoring logic from App.jsx by evaluating it in a controlled way
const src = readFileSync('./src/App.jsx', 'utf-8');

// We need to extract just the scoring functions. Let's build a self-contained test.
// First, extract the QUESTIONS, constants, and functions.

// Helper: extract code between markers
function extractBlock(source, startMarker, endMarker) {
  const s = source.indexOf(startMarker);
  const e = source.indexOf(endMarker, s + startMarker.length);
  if (s === -1 || e === -1) return '';
  return source.slice(s, e);
}

// Build a module from the source
const moduleCode = `
// ─── Extracted from App.jsx for testing ───

${(() => {
  // Extract everything from 'const QUESTIONS' to 'export default' (approximately)
  // We need: QUESTIONS, AXIS_SCORING, all constants, all scoring functions

  // Find QUESTIONS array
  const qStart = src.indexOf('const QUESTIONS = [');
  const qEnd = src.indexOf('];\n\nconst LIKERT_LABELS', qStart);
  const questions = src.slice(qStart, qEnd + 2);

  // Find AXIS_SCORING
  const asStart = src.indexOf('const AXIS_SCORING = {');
  const asEnd = src.indexOf('};\n\n// Q9 option weights', asStart);
  const axisScoringBlock = src.slice(asStart, asEnd + 2);

  // Find all constants from Q9_MI_WEIGHTS through TAG_DEFINITIONS
  const constStart = src.indexOf('// Q9 option weights');
  const constEnd = src.indexOf('// ─── SCORING FUNCTIONS');
  const constants = src.slice(constStart, constEnd);

  // Find scoring functions through computeScoring
  const funcStart = src.indexOf('// ─── SCORING FUNCTIONS');
  const funcEnd = src.indexOf('// ─── CALCULATION REPORT');
  const functions = src.slice(funcStart, funcEnd);

  return questions + '\n\n' + axisScoringBlock + '\n\n' + constants + '\n\n' + functions;
})()}
`;

// Write it to a temp file and evaluate
import { writeFileSync } from 'fs';
writeFileSync('./test-scoring-module.mjs', moduleCode + '\nexport { QUESTIONS, AXIS_SCORING, computeScoring, calculateAxes, calculateTags, calculateTheoryAffinities, calculateSubDiagnostics, calculateWarningFlags };');

// Now import and test
const mod = await import('./test-scoring-module.mjs');
const { computeScoring, QUESTIONS, AXIS_SCORING } = mod;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ FAIL: ${message}`);
  }
}

function assertRange(value, min, max, message) {
  assert(value >= min && value <= max, `${message} (got ${value}, expected ${min}-${max})`);
}

// ─── Test 1: Strong Transform Constructivist ─────────────────────
console.log('\n═══ Test 1: Strong Transform Constructivist ═══');
{
  const answers = {
    Q6: 5,     // norms shape behavior (strongly agree)
    Q17: 3,    // D: replace capitalism (strong transform)
    Q19: 2,    // C: colonialism (transform +2)
    Q20: 3,    // D: dismantle capitalism (transform +3)
    Q3: 1,     // power shapes categories
    Q9: [3, 0], // D first (norms)
    Q10: [2, 0, 1], // C first (norms)
  };
  const scoring = computeScoring(answers);
  const rt = scoring.axes.reformTransform.score;
  console.log(`  RT axis score: ${rt}`);
  console.log(`  Constructivism: ${scoring.theories.constructivism.percent}%`);

  assert(rt >= 4, `RT score should be >= 4 for strong transform (got ${rt})`);
  // With strong transform (rt >= 4), constructivism gets -10 penalty (no +15 bonus)
  // Verify penalty is applied by comparing with moderate RT version
  const moderateVersion = computeScoring({...answers, Q17: 0, Q19: 1, Q20: 0}); // RT should be moderate
  const modRT = moderateVersion.axes.reformTransform.score;
  console.log(`  Moderate RT version: RT=${modRT}, Constructivism=${moderateVersion.theories.constructivism.percent}%`);
  assert(scoring.theories.constructivism.percent < moderateVersion.theories.constructivism.percent,
    `Constructivism with strong transform (${scoring.theories.constructivism.percent}%) should be lower than moderate (${moderateVersion.theories.constructivism.percent}%)`);
}

// ─── Test 2: Moderate Transform Constructivist ─────────────────────
console.log('\n═══ Test 2: Moderate Transform Constructivist ═══');
{
  const answers = {
    Q6: 5,     // norms shape behavior (strongly agree)
    Q17: 2,    // C: colonial critique (transform +2)
    Q18: 4,    // E: UN authorization (sovereignty - procedural)
    Q19: 1,    // B: productive (reform -1)
    Q20: 0,    // A: reform existing (reform -2)
    Q3: 1,     // power shapes categories
    Q9: [3, 0], // D first (norms)
    Q10: [2, 0, 1], // C first (norms)
    Q8: 3,     // moderate epistemology
    Q11: 2,    // external structures (norms)
  };
  const scoring = computeScoring(answers);
  const rt = scoring.axes.reformTransform.score;
  console.log(`  RT axis score: ${rt}`);
  console.log(`  Constructivism: ${scoring.theories.constructivism.percent}%`);

  assert(rt >= -3 && rt <= 3, `RT score should be in moderate range -3..+3 (got ${rt})`);
  // With moderate RT, constructivism gets +15 bonus
  assertRange(scoring.theories.constructivism.percent, 50, 100, 'Constructivism should be high (>=50%) with moderate transform');
}

// ─── Test 3: Ecofeminist ─────────────────────────────────────────
console.log('\n═══ Test 3: Ecofeminist ═══');
{
  const answers = {
    Q12: 1,    // B: masculinist assumptions
    Q13: 2,    // C: intersectional
    Q17: 2,    // C: colonial/patriarchal attitudes (ecofeminist)
  };
  const scoring = computeScoring(answers);
  console.log(`  Feminist IR tag: ${scoring.tags.feministIR.score}/${scoring.tags.feministIR.max}`);
  console.log(`  Ecological tag: ${scoring.tags.ecologicalRelational.score}/${scoring.tags.ecologicalRelational.max}`);

  assert(scoring.tags.feministIR.score >= 4, `Feminist IR tag should be >= 4 (got ${scoring.tags.feministIR.score})`);
  assert(scoring.tags.ecologicalRelational.score >= 2, `Ecological tag should be >= 2 (got ${scoring.tags.ecologicalRelational.score})`);
}

// ─── Test 4: Realist Order-Focused ─────────────────────────────
console.log('\n═══ Test 4: Realist Order-Focused ═══');
{
  const answers = {
    Q14: [8, 1, 0], // I first (order), then Nations, Individuals
    Q4: 0,     // states
    Q7: 0,     // national security
    Q11: 0,    // rational unitary
  };
  const scoring = computeScoring(answers);
  console.log(`  State Strategic tag: ${scoring.tags.stateStrategic.score}/${scoring.tags.stateStrategic.max}`);
  console.log(`  Neorealism: ${scoring.theories.neorealism.percent}%`);

  assert(scoring.tags.stateStrategic.score >= 2, `State Strategic tag should include Q14-I bonus (got ${scoring.tags.stateStrategic.score})`);
  // Check the Q14-I bonus is in the neorealism calculation
  // Neorealism should get the +10 bonus from Q14 option I
  const baseNeorealism = computeScoring({...answers, Q14: [1, 0, 2]}).theories.neorealism.percent; // without option I
  console.log(`  Neorealism without Q14-I: ${baseNeorealism}%`);
  assert(scoring.theories.neorealism.percent > baseNeorealism, 'Neorealism should be higher with Q14 option I');
}

// ─── Test 5: Warning Flags ─────────────────────────────────────
console.log('\n═══ Test 5: Warning Flags ═══');
{
  const answers = {
    Q5: [2, 0],  // C first (cultural explanation), A second
    Q13: 4,      // E: biological essentialism
  };
  const scoring = computeScoring(answers);
  console.log(`  Warning flags: ${scoring.warningFlags.length}`);
  for (const f of scoring.warningFlags) {
    console.log(`    ${f.question}: ${f.flag}`);
  }

  assert(scoring.warningFlags.length === 2, `Should have 2 warning flags (got ${scoring.warningFlags.length})`);
  assert(scoring.warningFlags.some(f => f.question === 'Q5'), 'Should have Q5 cultural explanation flag');
  assert(scoring.warningFlags.some(f => f.question === 'Q13'), 'Should have Q13 biological essentialism flag');
}

// ─── Test 6: No warning flags for normal answers ──────────────
console.log('\n═══ Test 6: No Warning Flags ═══');
{
  const answers = {
    Q5: [0, 1],  // A, B (no cultural explanation)
    Q13: 1,      // B: structural (not biological)
  };
  const scoring = computeScoring(answers);
  assert(scoring.warningFlags.length === 0, `Should have 0 warning flags (got ${scoring.warningFlags.length})`);
}

// ─── Test 7: Q17 Reform-Transform contributions ──────────────
console.log('\n═══ Test 7: Q17 Reform-Transform Axis ═══');
{
  // Q17=A (tech/industrial) should give -1
  const a1 = computeScoring({ Q17: 0 });
  const a2 = computeScoring({ Q17: 1 }); // B: market = -2
  const a3 = computeScoring({ Q17: 2 }); // C: colonial = +2
  const a4 = computeScoring({ Q17: 3 }); // D: replace capitalism = +3
  const a5 = computeScoring({ Q17: 4 }); // E: Global South = +1

  console.log(`  Q17=A RT: ${a1.axes.reformTransform.score}`);
  console.log(`  Q17=B RT: ${a2.axes.reformTransform.score}`);
  console.log(`  Q17=C RT: ${a3.axes.reformTransform.score}`);
  console.log(`  Q17=D RT: ${a4.axes.reformTransform.score}`);
  console.log(`  Q17=E RT: ${a5.axes.reformTransform.score}`);

  assert(a1.axes.reformTransform.score === -1, `Q17=A should give RT -1 (got ${a1.axes.reformTransform.score})`);
  assert(a2.axes.reformTransform.score === -2, `Q17=B should give RT -2 (got ${a2.axes.reformTransform.score})`);
  assert(a3.axes.reformTransform.score === 2, `Q17=C should give RT +2 (got ${a3.axes.reformTransform.score})`);
  assert(a4.axes.reformTransform.score === 3, `Q17=D should give RT +3 (got ${a4.axes.reformTransform.score})`);
  assert(a5.axes.reformTransform.score === 1, `Q17=E should give RT +1 (got ${a5.axes.reformTransform.score})`);
}

// ─── Test 8: RT range extremes ──────────────────────────────
console.log('\n═══ Test 8: Reform-Transform Range ═══');
{
  // Maximum transform: Q17=D(+3) + Q19=C(+2)or D(+3) + Q20=D(+3)or E(+3)
  const maxTransform = computeScoring({ Q17: 3, Q19: 3, Q20: 3 });
  console.log(`  Max transform RT: ${maxTransform.axes.reformTransform.score}`);
  assert(maxTransform.axes.reformTransform.score === 9, `Max RT should be 9 (got ${maxTransform.axes.reformTransform.score})`);

  // Maximum reform: Q17=B(-2) + Q19=A(-2) + Q20=A(-2)or C(-2)
  const maxReform = computeScoring({ Q17: 1, Q19: 0, Q20: 2 });
  console.log(`  Max reform RT: ${maxReform.axes.reformTransform.score}`);
  assert(maxReform.axes.reformTransform.score === -6, `Min RT should be -6 (got ${maxReform.axes.reformTransform.score})`);
}

// ─── Test 9: Q17 Anti-Capitalist tag ────────────────────────
console.log('\n═══ Test 9: Q17 Tag Contributions ═══');
{
  const withD = computeScoring({ Q17: 3 }); // D: replace capitalism
  const withC = computeScoring({ Q17: 2 }); // C: colonial critique

  console.log(`  Q17=D antiCapitalist: ${withD.tags.antiCapitalist.score}/${withD.tags.antiCapitalist.max}`);
  console.log(`  Q17=C ecologicalRelational: ${withC.tags.ecologicalRelational.score}/${withC.tags.ecologicalRelational.max}`);
  console.log(`  Q17=C feministIR: ${withC.tags.feministIR.score}/${withC.tags.feministIR.max}`);
  console.log(`  Q17=C indigenousPostcolonial: ${withC.tags.indigenousPostcolonial.score}/${withC.tags.indigenousPostcolonial.max}`);
  console.log(`  Q17=D ecologicalRelational: ${withD.tags.ecologicalRelational.score}/${withD.tags.ecologicalRelational.max}`);

  assert(withD.tags.antiCapitalist.score === 2, `Q17=D should give antiCapitalist +2 (got ${withD.tags.antiCapitalist.score})`);
  assert(withC.tags.ecologicalRelational.score === 2, `Q17=C should give ecological +2 (got ${withC.tags.ecologicalRelational.score})`);
  assert(withC.tags.feministIR.score === 2, `Q17=C should give feministIR +2 (got ${withC.tags.feministIR.score})`);
  assert(withC.tags.indigenousPostcolonial.score === 1, `Q17=C should give indigenousPostcolonial +1 (got ${withC.tags.indigenousPostcolonial.score})`);
  assert(withD.tags.ecologicalRelational.score === 1, `Q17=D should give ecological +1 (got ${withD.tags.ecologicalRelational.score})`);
}

// ─── Test 10: Confucian IR threshold ────────────────────────
console.log('\n═══ Test 10: Confucian IR Strong Transform Filter ═══');
{
  // Set up Confucian gate (Q14 ranks H in top 2) with high transform
  const base = {
    Q14: [7, 0, 1], // H first
    Q15: 1,          // B: relational duty
    Q18: 3,          // D: legitimacy-conditional
    Q17: 3,          // D: replace capitalism (RT +3)
    Q19: 3,          // D: RT +3
    Q20: 3,          // D: RT +3 → total = 9
  };
  const scoring = computeScoring(base);
  console.log(`  RT score: ${scoring.axes.reformTransform.score}`);
  console.log(`  Confucian IR: ${scoring.theories.confucianIR.percent}%`);

  // RT=9 >= 6, so strong transform filter should apply (-10)
  assert(scoring.axes.reformTransform.score >= 6, 'RT should be >= 6');

  // With RT=5 (just below threshold)
  const belowThreshold = computeScoring({...base, Q17: 4}); // E: +1 instead of +3, RT = 1+3+3 = 7... still >= 6
  const belowThreshold2 = computeScoring({...base, Q17: 0, Q19: 1}); // A: -1 + B: -1 + D: +3 = 1
  console.log(`  Below threshold RT: ${belowThreshold2.axes.reformTransform.score}`);
  console.log(`  Below threshold Confucian: ${belowThreshold2.theories.confucianIR.percent}%`);

  // When RT < 6, the penalty should NOT apply
  assert(belowThreshold2.axes.reformTransform.score < 6, 'Below threshold RT should be < 6');
}

// ─── Test 11: Q14 Option I penalties on Postcolonial/Indigenous ──
console.log('\n═══ Test 11: Q14 Option I Theory Penalties ═══');
{
  // Postcolonial without Q14-I
  const pcBase = computeScoring({
    Q19: 2, Q3: 1, Q15: 2, Q16: 5, Q1: [0, 2],
  });
  // Postcolonial with Q14-I in top 2
  const pcWithI = computeScoring({
    Q14: [8, 6], Q19: 2, Q3: 1, Q15: 2, Q16: 5, Q1: [0, 2],
  });
  console.log(`  Postcolonial without Q14-I: ${pcBase.theories.postcolonial.percent}%`);
  console.log(`  Postcolonial with Q14-I: ${pcWithI.theories.postcolonial.percent}%`);
  assert(pcWithI.theories.postcolonial.percent < pcBase.theories.postcolonial.percent,
    'Postcolonial should be lower with Q14 option I');

  // Indigenous without/with Q14-I
  const idBase = computeScoring({
    Q19: 3, Q20: 4, Q3: 1, Q14: [6, 5],
  });
  const idWithI = computeScoring({
    Q19: 3, Q20: 4, Q3: 1, Q14: [8, 6],
  });
  console.log(`  Indigenous without Q14-I: ${idBase.theories.indigenousDecolonial.percent}%`);
  console.log(`  Indigenous with Q14-I: ${idWithI.theories.indigenousDecolonial.percent}%`);
  assert(idWithI.theories.indigenousDecolonial.percent < idBase.theories.indigenousDecolonial.percent,
    'Indigenous should be lower with Q14 option I');
}

// ─── Summary ────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════');
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log('════════════════════════════════════════════\n');

if (failed > 0) process.exit(1);
