// Test suite for Prompts 6-8: Q15 deletion, Q9F, Q19B, Left-Ecomodernism, axis ranges
// Run: node test-prompt6-8.mjs

import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('./src/App.jsx', 'utf-8');

// Extract code blocks
const qStart = src.indexOf('const QUESTIONS = [');
const qEnd = src.indexOf('];\n\nconst LIKERT_LABELS', qStart);
const questions = src.slice(qStart, qEnd + 2);

const asStart = src.indexOf('const AXIS_SCORING = {');
const asEnd = src.indexOf('};\n\n// Q9 option weights', asStart);
const axisScoringBlock = src.slice(asStart, asEnd + 2);

const constStart = src.indexOf('// Q9 option weights');
const constEnd = src.indexOf('// ─── SCORING FUNCTIONS');
const constants = src.slice(constStart, constEnd);

const funcStart = src.indexOf('// ─── SCORING FUNCTIONS');
const funcEnd = src.indexOf('// ─── CALCULATION REPORT');
const functions = src.slice(funcStart, funcEnd);

// Also grab calculation report functions
const reportStart = src.indexOf('// ─── CALCULATION REPORT');
const reportEnd = src.indexOf('// ─── HELPERS');
const reportFuncs = src.slice(reportStart, reportEnd);

const moduleCode = questions + '\n\n' + axisScoringBlock + '\n\n' + constants + '\n\n' + functions + '\n\n' + reportFuncs;

writeFileSync('./test-prompt68-module.mjs', moduleCode + `
export { QUESTIONS, AXIS_SCORING, TAG_DEFINITIONS, computeScoring, calculateAxes, calculateTags,
  calculateTheoryAffinities, calculateSubDiagnostics, calculateWarningFlags, generateCalculationReport,
  Q9_MI_WEIGHTS, Q9_SA_WEIGHTS, Q16_RT_VALUES, Q18_RT_VALUES, Q19_RT_VALUES };
`);

const mod = await import('./test-prompt68-module.mjs');
const {
  QUESTIONS, AXIS_SCORING, TAG_DEFINITIONS,
  computeScoring, calculateAxes, calculateTags,
  calculateTheoryAffinities, calculateSubDiagnostics,
  generateCalculationReport,
  Q9_MI_WEIGHTS, Q9_SA_WEIGHTS, Q16_RT_VALUES, Q18_RT_VALUES, Q19_RT_VALUES,
} = mod;

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.error(`  ✗ FAIL: ${msg}`); }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: Classical Realist profile
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST 1: Classical Realist Profile ═══');
{
  const answers = {
    Q1: [1, 0],
    Q2: 0,
    Q3: 0,
    Q4: 0,
    Q5: [0, 4],
    Q6: 2,
    Q7: 0,
    Q8: 2,
    Q9: [5, 1],       // F (human nature) rank1, B (leaders) rank2
    Q10: [0, 4, 1],
    Q11: 0,
    Q12: 0,
    Q13: 3,
    Q14: [6, 1, 0],
    Q15: 2,
    Q16: 0,
    Q17: 0,           // respect sovereignty
    Q18: 0,           // inevitable (nation-states)
    Q19: 1,           // spheres of influence
  };
  const scoring = computeScoring(answers);
  const cr = scoring.theories.classicalRealism.percent;
  console.log(`  Classical Realism: ${cr}%`);
  assert(cr >= 60, `Classical Realism >= 60% (got ${cr}%)`);

  const neo = scoring.theories.neorealism.percent;
  console.log(`  Neorealism: ${neo}%`);
  assert(neo > 30, `Neorealism > 30% (got ${neo}%)`);

  const rt = scoring.axes.reformTransform.score;
  console.log(`  Reform-Transform: ${rt}`);
  assert(rt <= -3, `RT ≤ -3 with Q19=B (got ${rt})`);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: Left-Ecomodernist profile
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST 2: Left-Ecomodernist Profile ═══');
{
  const answers = {
    Q1: [2, 0],
    Q2: 2,
    Q3: 1,
    Q4: 4,
    Q5: [3, 1],
    Q6: 3,
    Q7: 2,
    Q8: 3,
    Q9: [4, 0],
    Q10: [1, 0, 2],
    Q11: 3,
    Q12: 2,
    Q13: 2,
    Q14: [2, 3, 4],
    Q15: 5,
    Q16: 0,           // TECHNOLOGY (gate)
    Q17: 2,
    Q18: 2,
    Q19: 3,           // dismantle capitalism
  };
  const scoring = computeScoring(answers);
  const le = scoring.theories.leftEcomodernism;
  console.log(`  Left-Ecomodernism: ${le.percent}%`);
  assert(le.percent >= 45 && le.percent <= 70, `Left-Ecomodernism 45-70% (got ${le.percent}%)`);
  assert(le.minDisplay === 35, 'minDisplay threshold is 35');

  // No gate
  const noGate = { ...answers, Q16: 1 };
  const noGateScore = computeScoring(noGate);
  assert(noGateScore.theories.leftEcomodernism.percent === 0,
    'Left-Ecomodernism = 0% without Q16=A');
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3: Axis range checks
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST 3: Axis Range Checks ═══');
{
  const isRange = AXIS_SCORING.immediateStructural.range;
  assert(isRange[0] === -4 && isRange[1] === 4, `IS range [-4, 4] (got [${isRange}])`);

  const isCats = AXIS_SCORING.immediateStructural.categories;
  assert(isCats[0].min === -4, `IS Strong Immediate min = -4 (got ${isCats[0].min})`);
  assert(isCats[isCats.length - 1].max === 4, `IS Strong Structural max = 4`);

  const rtRange = AXIS_SCORING.reformTransform.range;
  assert(rtRange[0] === -7 && rtRange[1] === 9, `RT range [-7, 9] (got [${rtRange}])`);

  const rtCats = AXIS_SCORING.reformTransform.categories;
  assert(rtCats[0].min === -7, `RT Strong Reform min = -7 (got ${rtCats[0].min})`);

  // IS with max structural
  const axesMax = calculateAxes({ Q5: [1, 3] });
  assert(axesMax.immediateStructural.score === 3, `IS Q5=[B,D] = 3 (got ${axesMax.immediateStructural.score})`);

  // IS with immediate
  const axesMin = calculateAxes({ Q5: [0, 2] });
  assert(axesMin.immediateStructural.score < 0, 'IS negative with immediate answers');
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4: Confucian IR (no Q15 dependency)
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST 4: Confucian IR Pattern ═══');
{
  const answers = {
    Q1: [3, 1],
    Q2: 0,
    Q3: 0,
    Q4: 0,
    Q5: [0, 4],
    Q6: 2,
    Q7: 0,
    Q8: 2,
    Q9: [0, 3],
    Q10: [0, 1, 3],
    Q11: 0,
    Q12: 0,
    Q13: 3,
    Q14: [5, 6, 1],   // H in top 2
    Q15: 2,
    Q16: 0,
    Q17: 3,           // legitimacy-conditional
    Q18: 1,
    Q19: 0,
  };
  const scoring = computeScoring(answers);
  const conf = scoring.theories.confucianIR.percent;
  console.log(`  Confucian IR: ${conf}%`);
  assert(conf >= 40, `Confucian IR >= 40% with H in top 2 (got ${conf}%)`);

  // Without H
  const noH = { ...answers, Q14: [6, 1, 0] };
  const noHScore = computeScoring(noH);
  assert(noHScore.theories.confucianIR.percent === 0, 'Confucian IR = 0% without H');
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 5: Question numbering
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST 5: Question Numbering ═══');
{
  assert(QUESTIONS.length === 19, `Total = 19 (got ${QUESTIONS.length})`);

  for (let i = 0; i < QUESTIONS.length; i++) {
    const expected = `Q${i + 1}`;
    assert(QUESTIONS[i].id === expected, `Q[${i}].id = '${expected}' (got '${QUESTIONS[i].id}')`);
  }

  const opening = QUESTIONS.filter(q => q.schema === 'Opening Block');
  assert(opening.length === 4, `Opening Block = 4 (got ${opening.length})`);

  const s1 = QUESTIONS.filter(q => q.schema === 'Schema 1');
  assert(s1.length === 9, `Schema 1 = 9 (got ${s1.length})`);

  const s2 = QUESTIONS.filter(q => q.schema === 'Schema 2');
  assert(s2.length === 6, `Schema 2 = 6 (got ${s2.length})`);

  const q15 = QUESTIONS.find(q => q.id === 'Q15');
  assert(q15.type === 'likert', `Q15 is likert (got ${q15.type})`);
  assert(q15.text.includes('Development'), 'Q15 is dev/colonial legacies');

  const tradeQ = QUESTIONS.find(q => q.text && q.text.includes('trade policy'));
  assert(!tradeQ, 'No trade policy question exists');
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 6: Q9 options and weights
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST 6: Q9 Options & Weights ═══');
{
  const q9 = QUESTIONS.find(q => q.id === 'Q9');
  assert(q9.options.length === 6, `Q9 has 6 options (got ${q9.options.length})`);
  assert(q9.options[5].includes('Human nature'), 'Q9 F = human nature');
  assert(Q9_MI_WEIGHTS.length === 6, 'Q9_MI_WEIGHTS has 6 elements');
  assert(Q9_SA_WEIGHTS.length === 6, 'Q9_SA_WEIGHTS has 6 elements');
  assert(Q9_MI_WEIGHTS[5] === -2, `Q9 F MI = -2 (got ${Q9_MI_WEIGHTS[5]})`);
  assert(Q9_SA_WEIGHTS[5] === -2, `Q9 F SA = -2 (got ${Q9_SA_WEIGHTS[5]})`);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 7: Q19 option B scoring
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST 7: Q19 Option B (Spheres of Influence) ═══');
{
  assert(Q19_RT_VALUES[1] === -3, `Q19 B RT = -3 (got ${Q19_RT_VALUES[1]})`);

  const ssRules = TAG_DEFINITIONS.stateStrategic.rules;
  const q19Rule = ssRules.find(r => r.q === 'Q19' && r.match === 1);
  assert(q19Rule && q19Rule.pts === 2, 'State Strategic Q19=B +2 pts');

  const q19 = QUESTIONS.find(q => q.id === 'Q19');
  assert(q19.options[1].includes('great powers'), 'Q19 B mentions great powers');
  assert(!q19.options[1].includes('BRICS'), 'Q19 B does NOT mention BRICS');
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 8: Calculation breakdown
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST 8: Calculation Breakdown ═══');
{
  const answers = {
    Q5: [1, 3],
    Q9: [5, 1],
    Q10: [0, 1, 2],
    Q16: 0,
    Q18: 2,
    Q19: 1,
  };
  const report = generateCalculationReport(answers);

  assert(report.includes('Sources: Q5'), 'IS shows Sources: Q5');
  assert(!report.includes('Sources: Q5, Q15'), 'IS does NOT show Q15');
  assert(report.includes('Sources: Q16, Q18, Q19'), 'RT shows Sources: Q16, Q18, Q19');
  assert(report.includes('Human nature'), 'Report has Q9 F text');
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 9: Left-Ecomodernism edge cases
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST 9: Left-Ecomodernism Edge Cases ═══');
{
  // Base only
  const base = computeScoring({ Q16: 0 });
  assert(base.theories.leftEcomodernism.percent === 30, `Base = 30% (got ${base.theories.leftEcomodernism.percent}%)`);

  // Reformist penalty
  const reformist = computeScoring({ Q16: 0, Q18: 0, Q19: 1 });
  const rLE = reformist.theories.leftEcomodernism.percent;
  console.log(`  Reformist Left-Ecomod: ${rLE}%`);
  assert(rLE < 30, `Reformist penalised < 30% (got ${rLE}%)`);

  // Cap at 70
  const maximal = computeScoring({
    Q1: [2, 0], Q4: 4, Q5: [3, 1], Q7: 2, Q11: 3,
    Q16: 0, Q18: 2, Q19: 3,
  });
  assert(maximal.theories.leftEcomodernism.percent <= 70, `Capped at 70% (got ${maximal.theories.leftEcomodernism.percent}%)`);
}

// ═══════════════════════════════════════════════════════════════════════════
console.log(`\n${'═'.repeat(50)}`);
console.log(`RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
if (fail > 0) process.exit(1);
