// Test scenarios for Q14 update (9→7 options, new indices)
// Run: node test-q14-update.mjs

import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('./src/App.jsx', 'utf-8');

// Build a module from the source
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

writeFileSync('./test-q14-module.mjs', moduleCode + '\nexport { QUESTIONS, AXIS_SCORING, computeScoring, calculateAxes, calculateTags, calculateTheoryAffinities, calculateSubDiagnostics, calculateWarningFlags };');

const mod = await import('./test-q14-module.mjs');
const { computeScoring, QUESTIONS } = mod;

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

// ─── Test 1: Q14 has 7 options ──────────────────────────────
console.log('\n═══ Test 1: Q14 Option Count ═══');
{
  const q14 = QUESTIONS.find(q => q.id === 'Q14');
  assert(q14.options.length === 7, `Q14 should have 7 options (got ${q14.options.length})`);
  assert(q14.options[0].includes('Equality'), `Option A should be about equality (got "${q14.options[0].slice(0, 40)}")`);
  assert(q14.options[3].includes('Ecosystems'), `Option D (index 3) should be ecosystems (got "${q14.options[3].slice(0, 40)}")`);
  assert(q14.options[4].includes('Marginalised'), `Option E (index 4) should be marginalised (got "${q14.options[4].slice(0, 40)}")`);
  assert(q14.options[5].includes('hierarchical'), `Option F (index 5) should be hierarchical (got "${q14.options[5].slice(0, 40)}")`);
  assert(q14.options[6].includes('order'), `Option G (index 6) should be order (got "${q14.options[6].slice(0, 40)}")`);
}

// ─── Test 2: Tag counting with new indices ─────────────────
console.log('\n═══ Test 2: Tag Counting with New Indices ═══');
{
  // Rank ecosystems (3) first, marginalised (4) second, classes (2) third
  const answers = { Q14: [3, 4, 2] };
  const scoring = computeScoring(answers);

  console.log(`  ecologicalRelational: ${scoring.tags.ecologicalRelational.score}`);
  console.log(`  peoplesMovements: ${scoring.tags.peoplesMovements.score}`);
  console.log(`  indigenousPostcolonial: ${scoring.tags.indigenousPostcolonial.score}`);
  console.log(`  structuralClass: ${scoring.tags.structuralClass.score}`);

  assert(scoring.tags.ecologicalRelational.score >= 2, `Ecosystems ranked 1st should give ecological >= 2 (got ${scoring.tags.ecologicalRelational.score})`);
  assert(scoring.tags.peoplesMovements.score >= 1, `Marginalised ranked 2nd should give peoples >= 1 (got ${scoring.tags.peoplesMovements.score})`);
  assert(scoring.tags.indigenousPostcolonial.score >= 1, `Marginalised ranked 2nd should give indigenous >= 1 (got ${scoring.tags.indigenousPostcolonial.score})`);
  assert(scoring.tags.structuralClass.score === 0, `Classes ranked 3rd (not in top 2) should give 0 (got ${scoring.tags.structuralClass.score})`);

  // Now test with classes in top 2
  const withClassesTop2 = computeScoring({ Q14: [2, 3, 4] });
  assert(withClassesTop2.tags.structuralClass.score >= 1, `Classes ranked 1st should give structuralClass >= 1 (got ${withClassesTop2.tags.structuralClass.score})`);
}

// ─── Test 3: Confucian IR gate with new index ──────────────
console.log('\n═══ Test 3: Confucian IR Gate ═══');
{
  // Hierarchical (index 5) ranked first — should trigger gate
  const withGate = computeScoring({ Q14: [5, 1, 0] });
  console.log(`  Confucian with F(5) ranked 1st: ${withGate.theories.confucianIR.percent}%`);
  assert(withGate.theories.confucianIR.percent >= 40, `Confucian gate should open with index 5 in top 2 (got ${withGate.theories.confucianIR.percent}%)`);

  // Hierarchical (index 5) ranked second — should also trigger gate
  const withGate2 = computeScoring({ Q14: [1, 5, 0] });
  console.log(`  Confucian with F(5) ranked 2nd: ${withGate2.theories.confucianIR.percent}%`);
  assert(withGate2.theories.confucianIR.percent >= 40, `Confucian gate should open with index 5 in rank 2 (got ${withGate2.theories.confucianIR.percent}%)`);

  // No hierarchical — gate should NOT trigger
  const noGate = computeScoring({ Q14: [0, 1, 2] });
  console.log(`  Confucian without F(5): ${noGate.theories.confucianIR.percent}%`);
  assert(noGate.theories.confucianIR.percent === 0, `Confucian gate should NOT open without index 5 (got ${noGate.theories.confucianIR.percent}%)`);
}

// ─── Test 4: Order (index 6) bonuses/penalties ─────────────
console.log('\n═══ Test 4: Order (Index 6) Bonuses/Penalties ═══');
{
  // Neorealism with order ranked first
  const withOrder = computeScoring({ Q14: [6, 1, 0], Q4: 0, Q7: 0, Q11: 0 });
  const withoutOrder = computeScoring({ Q14: [0, 1, 2], Q4: 0, Q7: 0, Q11: 0 });
  console.log(`  Neorealism with order: ${withOrder.theories.neorealism.percent}%`);
  console.log(`  Neorealism without order: ${withoutOrder.theories.neorealism.percent}%`);
  assert(withOrder.theories.neorealism.percent > withoutOrder.theories.neorealism.percent,
    'Neorealism should be higher with Q14 order option');

  // State Strategic tag with order
  console.log(`  State Strategic with order: ${withOrder.tags.stateStrategic.score}`);
  assert(withOrder.tags.stateStrategic.score > withoutOrder.tags.stateStrategic.score,
    'State Strategic tag should be higher with Q14 order option');

  // Postcolonial penalty
  const pcWithOrder = computeScoring({ Q14: [6, 4, 2], Q19: 2, Q3: 1 });
  const pcWithoutOrder = computeScoring({ Q14: [4, 3, 2], Q19: 2, Q3: 1 });
  console.log(`  Postcolonial with order: ${pcWithOrder.theories.postcolonial.percent}%`);
  console.log(`  Postcolonial without order: ${pcWithoutOrder.theories.postcolonial.percent}%`);
  assert(pcWithOrder.theories.postcolonial.percent < pcWithoutOrder.theories.postcolonial.percent,
    'Postcolonial should be penalized with Q14 order option');

  // Indigenous penalty
  const idWithOrder = computeScoring({ Q14: [6, 4, 2], Q19: 3, Q20: 4, Q3: 1 });
  const idWithoutOrder = computeScoring({ Q14: [4, 3, 2], Q19: 3, Q20: 4, Q3: 1 });
  console.log(`  Indigenous with order: ${idWithOrder.theories.indigenousDecolonial.percent}%`);
  console.log(`  Indigenous without order: ${idWithoutOrder.theories.indigenousDecolonial.percent}%`);
  assert(idWithOrder.theories.indigenousDecolonial.percent < idWithoutOrder.theories.indigenousDecolonial.percent,
    'Indigenous should be penalized with Q14 order option');
}

// ─── Test 5: Edge case — ranks only 0, 1, 2 ───────────────
console.log('\n═══ Test 5: Edge Case — Only Indices 0, 1, 2 ═══');
{
  const answers = { Q14: [0, 1, 2] };
  const scoring = computeScoring(answers);

  assert(scoring.tags.ecologicalRelational.score === 0, `No ecological tag with indices 0,1,2 (got ${scoring.tags.ecologicalRelational.score})`);
  assert(scoring.tags.indigenousPostcolonial.score === 0, `No indigenous tag from Q14 with indices 0,1,2 (got ${scoring.tags.indigenousPostcolonial.score})`);
  assert(scoring.tags.confucianHierarchical.score === 0, `No confucian tag with indices 0,1,2 (got ${scoring.tags.confucianHierarchical.score})`);
  assert(scoring.theories.confucianIR.percent === 0, `Confucian IR should be 0 with indices 0,1,2 (got ${scoring.theories.confucianIR.percent})`);
}

// ─── Test 6: Green Theory with new ecosystems index ────────
console.log('\n═══ Test 6: Green Theory Ecosystems ═══');
{
  const withEco = computeScoring({ Q14: [3, 0, 1] }); // ecosystems first
  const withoutEco = computeScoring({ Q14: [0, 1, 2] }); // no ecosystems
  console.log(`  Green Theory with ecosystems: ${withEco.theories.greenTheory.percent}%`);
  console.log(`  Green Theory without ecosystems: ${withoutEco.theories.greenTheory.percent}%`);
  assert(withEco.theories.greenTheory.percent > withoutEco.theories.greenTheory.percent,
    'Green Theory should be higher when ecosystems is ranked');
}

// ─── Test 7: Confucian hierarchical tag ────────────────────
console.log('\n═══ Test 7: Confucian Hierarchical Tag ═══');
{
  const ranked1st = computeScoring({ Q14: [5, 0, 1] }); // hierarchical first
  const ranked2nd = computeScoring({ Q14: [0, 5, 1] }); // hierarchical second
  const notRanked = computeScoring({ Q14: [0, 1, 2] }); // no hierarchical

  console.log(`  Confucian tag ranked 1st: ${ranked1st.tags.confucianHierarchical.score}`);
  console.log(`  Confucian tag ranked 2nd: ${ranked2nd.tags.confucianHierarchical.score}`);
  console.log(`  Confucian tag not ranked: ${notRanked.tags.confucianHierarchical.score}`);

  assert(ranked1st.tags.confucianHierarchical.score === 2, `Hierarchical ranked 1st should give 2 pts (got ${ranked1st.tags.confucianHierarchical.score})`);
  assert(ranked2nd.tags.confucianHierarchical.score === 1, `Hierarchical ranked 2nd should give 1 pt (got ${ranked2nd.tags.confucianHierarchical.score})`);
  assert(notRanked.tags.confucianHierarchical.score === 0, `No hierarchical should give 0 pts (got ${notRanked.tags.confucianHierarchical.score})`);
}

// ─── Summary ────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════');
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log('════════════════════════════════════════════\n');

// Cleanup
import { unlinkSync } from 'fs';
try { unlinkSync('./test-q14-module.mjs'); } catch(e) {}

if (failed > 0) process.exit(1);
