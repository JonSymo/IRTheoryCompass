// Test scenarios for Q11 update
// Run: node test-q11-update.mjs

import { readFileSync, writeFileSync, unlinkSync } from 'fs';

const src = readFileSync('./src/App.jsx', 'utf-8');

const moduleCode = (() => {
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
  return questions + '\n\n' + axisScoringBlock + '\n\n' + constants + '\n\n' + functions;
})();

writeFileSync('./test-q11-module.mjs', moduleCode + '\nexport { QUESTIONS, AXIS_SCORING, computeScoring };');
const { computeScoring, QUESTIONS } = await import('./test-q11-module.mjs');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ FAIL: ${msg}`); }
}

// ─── Test 1: Neorealist student ──────────────────────────────
console.log('\n═══ Test 1: Neorealist Student (Q11=0) ═══');
{
  const s = computeScoring({ Q11: 0, Q4: 0, Q7: 0 });
  console.log(`  State Strategic tag: ${s.tags.stateStrategic.score}`);
  console.log(`  Neorealism: ${s.theories.neorealism.percent}%`);
  assert(s.tags.stateStrategic.score >= 1, `State Strategic should include Q11=0 (+1) (got ${s.tags.stateStrategic.score})`);
  assert(s.theories.neorealism.percent >= 30, `Neorealism should be significant (got ${s.theories.neorealism.percent}%)`);

  // Verify Q11=0 gives neorealism bonus vs Q11=3
  const sAlt = computeScoring({ Q11: 3, Q4: 0, Q7: 0 });
  assert(s.theories.neorealism.percent > sAlt.theories.neorealism.percent,
    `Neorealism with Q11=0 (${s.theories.neorealism.percent}%) > Q11=3 (${sAlt.theories.neorealism.percent}%)`);
}

// ─── Test 2: Liberal Pluralist (Q11=2) ───────────────────────
console.log('\n═══ Test 2: Liberal Pluralist (Q11=2) ═══');
{
  const s = computeScoring({ Q11: 2, Q15: 0, Q1: [3, 0] });
  console.log(`  Liberal Institutionalism: ${s.theories.liberalInstitutionalism.percent}%`);

  // Q11=2 should give liberal inst bonus vs Q11=0
  const sAlt = computeScoring({ Q11: 0, Q15: 0, Q1: [3, 0] });
  assert(s.theories.liberalInstitutionalism.percent > sAlt.theories.liberalInstitutionalism.percent,
    `Liberal Inst with Q11=2 (${s.theories.liberalInstitutionalism.percent}%) > Q11=0 (${sAlt.theories.liberalInstitutionalism.percent}%)`);
}

// ─── Test 3: Marxist Student (Q11=3) ────────────────────────
console.log('\n═══ Test 3: Marxist Student (Q11=3) ═══');
{
  const s = computeScoring({ Q11: 3, Q7: 2, Q4: 1 });
  console.log(`  Structural Class tag: ${s.tags.structuralClass.score}`);
  console.log(`  Marxism: ${s.theories.marxismWorldSystems.percent}%`);

  assert(s.tags.structuralClass.score >= 1, `Structural Class should include Q11=3 (+1) (got ${s.tags.structuralClass.score})`);

  // Q11=3 should boost Marxism vs Q11=0
  const sAlt = computeScoring({ Q11: 0, Q7: 2, Q4: 1 });
  assert(s.theories.marxismWorldSystems.percent > sAlt.theories.marxismWorldSystems.percent,
    `Marxism with Q11=3 (${s.theories.marxismWorldSystems.percent}%) > Q11=0 (${sAlt.theories.marxismWorldSystems.percent}%)`);
}

// ─── Test 4: Feminist Student (Q11=3) ──────────────────────
console.log('\n═══ Test 4: Feminist Student (Q11=3) ═══');
{
  const s = computeScoring({ Q11: 3, Q12: 1, Q13: 2 });
  console.log(`  Feminist IR tag: ${s.tags.feministIR.score}`);
  console.log(`  Feminism: ${s.theories.feminism.percent}%`);

  assert(s.tags.feministIR.score >= 1, `Feminist IR tag should include Q11=3 (+1) (got ${s.tags.feministIR.score})`);

  // Q11=3 should boost Feminism vs Q11=0
  const sAlt = computeScoring({ Q11: 0, Q12: 1, Q13: 2 });
  assert(s.theories.feminism.percent > sAlt.theories.feminism.percent,
    `Feminism with Q11=3 (${s.theories.feminism.percent}%) > Q11=0 (${sAlt.theories.feminism.percent}%)`);
}

// ─── Test 5: Constructivist Student (Q11=3) ────────────────
console.log('\n═══ Test 5: Constructivist Student (Q11=3) ═══');
{
  const s = computeScoring({ Q11: 3, Q6: 5, Q3: 1, Q9: [3, 0], Q10: [2, 0, 1] });
  console.log(`  Constructivism: ${s.theories.constructivism.percent}%`);

  // Q11=3 should give constructivism a small boost vs Q11=0
  const sAlt = computeScoring({ Q11: 0, Q6: 5, Q3: 1, Q9: [3, 0], Q10: [2, 0, 1] });
  assert(s.theories.constructivism.percent > sAlt.theories.constructivism.percent,
    `Constructivism with Q11=3 (${s.theories.constructivism.percent}%) > Q11=0 (${sAlt.theories.constructivism.percent}%)`);
}

// ─── Test 6: Q11 option count and wording ──────────────────
console.log('\n═══ Test 6: Q11 Option Verification ═══');
{
  const q11 = QUESTIONS.find(q => q.id === 'Q11');
  assert(q11.options.length === 4, `Q11 should have 4 options (got ${q11.options.length})`);
  assert(q11.options[0].includes('rational unitary'), `Option A should mention rational unitary (got "${q11.options[0].slice(0, 50)}")`);
  assert(q11.options[1].includes('bureaucracies'), `Option B should mention bureaucracies (got "${q11.options[1].slice(0, 50)}")`);
  assert(q11.options[2].includes('domestic political'), `Option C should mention domestic coalitions (got "${q11.options[2].slice(0, 50)}")`);
  assert(q11.options[3].includes('patriarchy'), `Option D should mention patriarchy (got "${q11.options[3].slice(0, 50)}")`);
}

// ─── Summary ────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════');
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log('════════════════════════════════════════════\n');

try { unlinkSync('./test-q11-module.mjs'); } catch(e) {}
if (failed > 0) process.exit(1);
