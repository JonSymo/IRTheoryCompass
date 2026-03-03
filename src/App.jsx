import { useState, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';

// ─── DATA ────────────────────────────────────────────────────────────────────
const QUESTIONS = [
  // ─── OPENING BLOCK ───────────────────────────────────────────────────────
  {
    id: 'Q1',
    schema: 'Opening Block',
    schemaColor: '#4A6FA5',
    type: 'rank2',
    instruction: 'Rank your top 2',
    text: 'What most shaped the world we live in today?',
    options: [
      'Political struggles by ordinary people (anti-colonial movements, labour struggles, feminist movements, civil rights campaigns, etc.)',
      'Competition, rivalry, and wars between powerful states',
      'The global spread of capitalism through colonialism, trade, investment and geopolitical competition',
      'Creation of international organisations and rules after major wars',
      'Spread of ideas about democracy, human rights, and cooperation',
    ],
  },
  {
    id: 'Q2',
    schema: 'Opening Block',
    schemaColor: '#4A6FA5',
    type: 'forced',
    instruction: 'Select one',
    text: 'Whose knowledge should theories of international relations primarily draw on?',
    options: [
      'State officials and diplomats',
      'Rigorous scientific modelling of state behaviour and strategic interaction',
      'Marginalized communities whose experiences reveal how power operates (First Nations peoples, stateless peoples, trafficked women, etc.)',
    ],
  },
  {
    id: 'Q3',
    schema: 'Opening Block',
    schemaColor: '#4A6FA5',
    type: 'forced',
    instruction: 'Select one',
    text: 'Categories like "terrorism," "rogue state," or "humanitarian crisis" mainly reflect:',
    note: 'For example, how different actors describe events in Palestine, Ukraine, Yemen, or Myanmar',
    options: [
      'Objective realities identifiable through evidence',
      'Power — whoever defines the terms shapes politics',
      'Different but valid cultural perspectives',
    ],
  },
  {
    id: 'Q4',
    schema: 'Opening Block',
    schemaColor: '#4A6FA5',
    type: 'forced',
    instruction: 'Select one option',
    text: 'What do you think is the most useful thing to focus on for understanding international relations?',
    options: [
      'States and their interactions',
      'Economic classes and their conflicts (e.g., the working class or global elites)',
      'Civilizations or cultural blocs (e.g., Western, Confucian, Islamic, Latin American, African)',
      'Multinational corporations',
      'The structural logic of global capitalism',
      'Social movements and activist networks (e.g., Indigenous rights, climate justice, feminist movements)',
    ],
  },
  // ─── SCHEMA 1: EXPLANATORY WORLDVIEW ─────────────────────────────────────
  {
    id: 'Q5',
    schema: 'Schema 1',
    schemaColor: '#2E6B9E',
    type: 'rank2',
    instruction: 'Rank your top 2',
    text: 'Global inequality exists primarily because:',
    options: [
      'Poor governance and policy choices by governments',
      'Historical exploitation through colonialism and slavery',
      'Cultural differences in values and work ethic',
      'Ongoing capitalist exploitation by powerful states and corporations',
      'Geography and natural resource distribution',
    ],
  },
  {
    id: 'Q6',
    schema: 'Schema 1',
    schemaColor: '#2E6B9E',
    type: 'likert',
    instruction: 'Rate your agreement',
    text: 'International norms shape behaviour',
    detail:
      'Governments often act in line with widely accepted rules about legitimacy — for example, which weapons are acceptable to use in conflict, whether borders should be respected, or how to treat prisoners of war.',
  },
  {
    id: 'Q7',
    schema: 'Schema 1',
    schemaColor: '#2E6B9E',
    type: 'forced',
    instruction: 'Select one',
    text: 'Whose interests does national foreign policy usually serve most?',
    options: [
      'The country as a whole / national security',
      'Domestic business interests',
      'The interests of global capital',
      "State institutions' own survival and power",
    ],
  },
  {
    id: 'Q8',
    schema: 'Schema 1',
    schemaColor: '#2E6B9E',
    type: 'likert',
    instruction: 'Rate your agreement',
    text: 'Objective knowledge about world politics is achievable',
    detail:
      'With enough evidence, experts can reach objective conclusions about why states act as they do — for example, why the United States invaded Iraq in 2003, or why Vietnam intervened to remove Pol Pot from power in Cambodia in 1978.',
  },
  {
    id: 'Q9',
    schema: 'Schema 1',
    schemaColor: '#2E6B9E',
    type: 'rank2',
    instruction: 'Rank your top 2',
    text: 'Why do wars between states happen?',
    options: [
      'Shifts in military or economic power create insecurity and fear in rivals',
      'Decisions and personalities of leaders',
      'Misperceptions and miscommunication',
      'Conflicting national identities and conceptions of honour or prestige',
      'Competition for markets and resources driven by economic structures',
      'Human nature - fear and the will for power drive conflict',
    ],
  },
  {
    id: 'Q10',
    schema: 'Schema 1',
    schemaColor: '#2E6B9E',
    type: 'rank3',
    instruction: 'Rank your top 3',
    text: 'What most shapes foreign policy decisions?',
    note: 'For example, deciding whether to join a trade agreement, impose economic sanctions, send military aid, or sign an environmental treaty',
    options: [
      'Security threats',
      'Economic interests',
      'International norms about appropriate behaviour',
      'Domestic political pressures',
      'Personal beliefs and values of leaders',
    ],
  },
  {
    id: 'Q11',
    schema: 'Schema 1',
    schemaColor: '#2E6B9E',
    type: 'forced',
    instruction: 'Select one',
    text: 'In order to build a model of how the world functions is it useful to think of states as rational, unitary actors pursuing their national interests?',
    options: [
      'Yes, modelling states as rational unitary actors is a useful simplification',
      'No, bureaucracies and organisations within states pursue their own interests, not a unified national interest',
      'No, domestic political coalitions shape foreign policy - there\'s no single \'national interest\'',
      'No, other economic and social structures - including capitalism, class relations, and patriarchy - determine state behaviour',
    ],
  },
  {
    id: 'Q12',
    schema: 'Schema 1',
    schemaColor: '#2E6B9E',
    type: 'forced',
    instruction: 'Select one',
    text: 'International politics prioritises military security over human security primarily because:',
    note: 'Human security includes poverty, disease, and domestic violence',
    options: [
      'External military threats are the main danger states face; human security is primarily a domestic policy question',
      'Patriarchal assumptions about what counts as "security" structure world politics',
      'Foreign policy is dominated by corporate interests who benefit from militarisation',
      'The territorial state system defines states as defence units, not welfare providers',
      'The premise is wrong — most states do prioritise human security and development',
    ],
  },
  {
    id: 'Q13',
    schema: 'Schema 1',
    schemaColor: '#2E6B9E',
    type: 'forced',
    instruction: 'Select one',
    text: 'Gender inequality in international politics is best understood as resulting from:',
    options: [
      'The absence of women in positions of power in national governments, foreign policy and international institutions',
      'How core concepts like "security," "rationality," and "development" are defined in masculine terms that exclude women\'s experiences and priorities',
      'Gender inequality is inseparable from racial and economic hierarchies rooted in colonialism',
      'Traditional cultural and religious values that shape gender roles globally',
      'Gender difference reflects sex differences; what appears as inequality is natural specialization',
    ],
  },
  // ─── SCHEMA 2: NORMATIVE-POLITICAL ORIENTATION ──────────────────────────
  {
    id: 'Q14',
    schema: 'Schema 2',
    schemaColor: '#2E7D4F',
    type: 'rank3',
    instruction: 'Rank your top 3',
    text: 'Who should be the main subject of moral concern in world politics?',
    options: [
      'Equality and equal dignity for all persons',
      'Nations or national communities',
      'Working people and exploited classes',
      'Ecosystems and non-human nature',
      'Marginalised peoples and communities (e.g., First Nations peoples, stateless peoples)',
      'Proper hierarchical relationships and role-based duties (e.g., rulers as benevolent, citizens as loyal; harmony over rights)',
      'International order and stability',
    ],
  },
  {
    id: 'Q15',
    schema: 'Schema 2',
    schemaColor: '#2E7D4F',
    type: 'likert',
    instruction: 'Rate your agreement',
    text: 'Development programs and colonial legacies',
    detail:
      'Even well-intentioned international development programs often reinforce colonial power relationships.',
  },
  {
    id: 'Q16',
    schema: 'Schema 2',
    schemaColor: '#2E7D4F',
    type: 'forced',
    instruction: 'Select one',
    text: 'Ecological crises like climate change are most usefully addressed by:',
    options: [
      'Collective investments in technological innovation and green industry policy',
      'Market-based solutions like carbon pricing and green finance',
      'Challenging the colonial and patriarchal attitudes that treat nature as something to exploit',
      'Replacing capitalism with an economic system organised around human needs rather than profit',
      'Prioritising development for poor countries in the Global South, even if this requires continued fossil fuel use in the near term',
    ],
  },
  {
    id: 'Q17',
    schema: 'Schema 2',
    schemaColor: '#2E7D4F',
    type: 'forced',
    instruction: 'Select one',
    text: 'A government is violently suppressing protests. International observers document thousands of deaths and widespread human rights abuses. What should the international community do?',
    options: [
      'Respect sovereignty — intervention would set a dangerous precedent and likely make things worse',
      'Impose sanctions and diplomatic pressure while respecting sovereignty',
      'Military intervention is justified when governments commit mass atrocities against their own people',
      'It depends on whether the government has popular support — intervention against governments with broad consent is not justified',
      'Intervention is only legitimate if authorized by the UN Security Council',
      'Intervention is only justified when it will likely improve the situation — consequences matter not intentions',
    ],
  },
  {
    id: 'Q18',
    schema: 'Schema 2',
    schemaColor: '#2E7D4F',
    type: 'forced',
    instruction: 'Select one',
    text: 'The system of territorial nation-states:',
    options: [
      'Is an inevitable outcome of social evolution',
      'Has problems but is generally a productive way to represent group interests',
      'Was imposed by colonialism and has uneven impacts on different peoples',
      'Is a source of violence against those it marginalises through policing, borders, and criminalisation',
    ],
  },
  {
    id: 'Q19',
    schema: 'Schema 2',
    schemaColor: '#2E7D4F',
    type: 'forced',
    instruction: 'Select one',
    text: 'The best path to global justice is:',
    options: [
      'Reform existing institutions like the United Nations and World Bank to be more representative',
      'Maintaining order by respecting great powers and their spheres of influence',
      'Empower individuals through expanding markets, development, and rights protections',
      'Dismantle capitalism — institutions merely manage an inherently exploitative economic system',
      'Moving beyond the state system towards forms of political organisation based on community self-determination',
      'Change culture and consciousness from the ground up through social movements and shifting norms',
    ],
  },
];

const LIKERT_LABELS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
];

// ─── SCORING CONFIGURATION ──────────────────────────────────────────────────

// Axis 1: Material ← → Ideational  (negative = Material, positive = Ideational)
// Axis 2: Structure ← → Agency     (negative = Structure, positive = Agency)
// Axis 3: Immediate ← → Structural (negative = Immediate, positive = Structural)
// Axis 4: Reform ← → Transform     (negative = Reform, positive = Transform)

const AXIS_SCORING = {
  materialIdeational: {
    label: 'Material ← → Ideational',
    leftLabel: 'Material',
    rightLabel: 'Ideational',
    range: [-23, 22],
    schema: 'Schema 1',
    schemaLabel: 'Schema 1 — Explanatory Worldview',
    schemaColor: '#4A6FA5',
    categories: [
      { min: -23, max: -12, label: 'Strong Material' },
      { min: -11, max: -5, label: 'Material-leaning' },
      { min: -4, max: 4, label: 'Mixed' },
      { min: 5, max: 11, label: 'Ideational-leaning' },
      { min: 12, max: 22, label: 'Strong Ideational' },
    ],
  },
  structureAgency: {
    label: 'Structure ← → Agency',
    leftLabel: 'Structure',
    rightLabel: 'Agency',
    range: [-15, 19],
    schema: 'Schema 1',
    schemaLabel: 'Schema 1 — Explanatory Worldview',
    schemaColor: '#4A6FA5',
    categories: [
      { min: -15, max: -10, label: 'Strong Structure' },
      { min: -9, max: -4, label: 'Structure-leaning' },
      { min: -3, max: 3, label: 'Mixed' },
      { min: 4, max: 9, label: 'Agency-leaning' },
      { min: 10, max: 19, label: 'Strong Agency' },
    ],
  },
  immediateStructural: {
    label: 'Immediate ← → Structural Injustice',
    leftLabel: 'Immediate',
    rightLabel: 'Structural',
    range: [-4, 4],
    schema: 'Schema 2',
    schemaLabel: 'Schema 2 — Normative-Political Orientation',
    schemaColor: '#2E7D4F',
    categories: [
      { min: -4, max: -3, label: 'Strong Immediate' },
      { min: -2, max: -2, label: 'Immediate-leaning' },
      { min: -1, max: 1, label: 'Mixed' },
      { min: 2, max: 2, label: 'Structural-leaning' },
      { min: 3, max: 4, label: 'Strong Structural' },
    ],
  },
  reformTransform: {
    label: 'Reform ← → Transform',
    leftLabel: 'Reform',
    rightLabel: 'Transform',
    range: [-7, 9],
    schema: 'Schema 2',
    schemaLabel: 'Schema 2 — Normative-Political Orientation',
    schemaColor: '#2E7D4F',
    categories: [
      { min: -7, max: -3, label: 'Strong Reform' },
      { min: -2, max: -1, label: 'Reform-leaning' },
      { min: 0, max: 1, label: 'Mixed' },
      { min: 2, max: 4, label: 'Transform-leaning' },
      { min: 5, max: 9, label: 'Strong Transform' },
    ],
  },
};

// Q9 option weights for Material-Ideational axis: [A, B, C, D, E, F]
const Q9_MI_WEIGHTS = [-3, -1, -1, 3, -3, -2];
// Q9 option weights for Structure-Agency axis
const Q9_SA_WEIGHTS = [-2, 3, 1, 0, -3, -2];
// Q10 option weights for Material-Ideational axis: [A, B, C, D, E]
const Q10_MI_WEIGHTS = [-3, -3, 3, 1, 2];
// Q10 option weights for Structure-Agency axis
const Q10_SA_WEIGHTS = [-2, -2, -1, 2, 3];
// Q5 raw rank values for Immediate-Structural axis [rank1_value, rank2_value]
const Q5_IS_VALUES = {
  0: [-2, -1],   // A
  1: [2, 1],     // B
  2: [-1, -0.5], // C
  3: [2, 1],     // D
  4: [0, 0],     // E
};
// Reform-Transform forced values
// Q16: Ecological crises (A=tech/reform, B=market/reform, C=colonial critique, D=replace capitalism, E=Global South dev)
const Q16_RT_VALUES = { 0: -1, 1: -2, 2: 2, 3: 3, 4: 1 };
// Q18: Nation-states  Q19: Global justice
const Q18_RT_VALUES = { 0: -2, 1: -1, 2: 2, 3: 3 };
const Q19_RT_VALUES = { 0: -2, 1: -3, 2: -2, 3: 3, 4: 3, 5: 2 };

// Sub-diagnostic configurations
const Q2_EPIST_VALUES = { 0: -2, 1: -1, 2: 2 };
const Q3_EPIST_VALUES = { 0: -2, 1: 3, 2: 1 };
const Q1_HISTORICITY_VALUES = { 0: 2, 1: 0, 2: 2, 3: -1, 4: 1 };
const Q12_FEMINIST_VALUES = { 0: 0, 1: 2, 2: 0, 3: 0, 4: 0 };
const Q13_FEMINIST_VALUES = { 0: 1, 1: 2, 2: 3, 3: 0, 4: -1 };
const Q17_SOVEREIGNTY_LABELS = {
  0: 'Absolute sovereignty',
  1: 'Qualified sovereignty',
  2: 'Liberal interventionist',
  3: 'Legitimacy-conditional',
  4: 'Procedural institutionalist',
  5: 'Consequentialist realist',
};
const Q2_AUTHORITY_VALUES = { 0: -2, 1: -1, 2: 3 };

// Tag rules
const TAG_DEFINITIONS = {
  stateStrategic: {
    label: 'State Strategic',
    max: 11,
    rules: [
      { q: 'Q4', type: 'forced_eq', match: 0, pts: 2 },
      { q: 'Q7', type: 'forced_eq', match: 0, pts: 2 },
      { q: 'Q11', type: 'forced_eq', match: 0, pts: 1 },
      { q: 'Q12', type: 'forced_eq', match: 0, pts: 1 },
      { q: 'Q1', type: 'rank_includes', match: 1, pts: 1 },
      { q: 'Q14', type: 'rank_pos', match: 6, pts1: 2, pts2: 1 }, // Option G (international order) in top 2
      { q: 'Q19', type: 'forced_eq', match: 1, pts: 2 }, // sphere of influence (global justice)
    ],
  },
  elitePolitical: {
    label: 'Elite Political',
    max: 5,
    rules: [
      { q: 'Q4', type: 'forced_eq', match: 3, pts: 2 },
      { q: 'Q7', type: 'forced_in', match: [1, 2], pts: 2 },
      { q: 'Q12', type: 'forced_eq', match: 2, pts: 1 },
    ],
  },
  structuralClass: {
    label: 'Structural Class',
    max: 8,
    rules: [
      { q: 'Q4', type: 'forced_in', match: [1, 4], pts: 2 },
      { q: 'Q7', type: 'forced_eq', match: 2, pts: 2 },
      { q: 'Q11', type: 'forced_eq', match: 3, pts: 1 }, // capitalism/class/patriarchy structures
      { q: 'Q14', type: 'rank_top2', match: 2, pts: 1 },
      { q: 'Q5', type: 'rank_top2', match: 3, pts: 1 },
      { q: 'Q1', type: 'rank_includes', match: 2, pts: 1 },
    ],
  },
  civilizational: {
    label: 'Civilizational',
    max: 4,
    rules: [
      { q: 'Q4', type: 'forced_eq', match: 2, pts: 2 },
      { q: 'Q9', type: 'rank_top2', match: 3, pts: 1 },
      { q: 'Q5', type: 'rank_top2', match: 2, pts: 1 },
    ],
  },
  ecologicalRelational: {
    label: 'Ecological / Relational',
    max: 7,
    rules: [
      { q: 'Q14', type: 'rank_pos', match: 3, pts1: 2, pts2: 1 }, // Ecosystems (index 3)
      { q: 'Q16', type: 'forced_eq', match: 2, pts: 2 }, // colonial/patriarchal attitudes
      { q: 'Q16', type: 'forced_eq', match: 3, pts: 1 }, // replace capitalism (ecosocialist)
    ],
  },
  peoplesMovements: {
    label: 'Peoples / Movements',
    max: 7,
    rules: [
      { q: 'Q4', type: 'forced_eq', match: 5, pts: 2 },
      { q: 'Q14', type: 'rank_pos', match: 4, pts1: 2, pts2: 1 }, // Marginalised (index 4)
      { q: 'Q1', type: 'rank_includes', match: 0, pts: 1 },
      { q: 'Q2', type: 'forced_eq', match: 2, pts: 1 },
    ],
  },
  feministIR: {
    label: 'Feminist IR',
    max: 7,
    rules: [
      { q: 'Q12', type: 'forced_eq', match: 1, pts: 2 },
      { q: 'Q13', type: 'forced_in', match: [1, 2], pts: 2 },
      { q: 'Q16', type: 'forced_eq', match: 2, pts: 2 }, // ecofeminist position
      { q: 'Q11', type: 'forced_eq', match: 3, pts: 1 }, // mentions patriarchy
    ],
  },
  indigenousPostcolonial: {
    label: 'Indigenous / Postcolonial',
    max: 9,
    rules: [
      { q: 'Q18', type: 'forced_in', match: [2, 3], pts: 2 },
      { q: 'Q14', type: 'rank_pos', match: 4, pts1: 2, pts2: 1 }, // Marginalised (index 4)
      { q: 'Q15', type: 'likert_gte', min: 4, pts: 1 },
      { q: 'Q5', type: 'rank_top2', match: 1, pts: 1 },
      { q: 'Q2', type: 'forced_eq', match: 2, pts: 1 },
      { q: 'Q3', type: 'forced_eq', match: 1, pts: 1 },
      { q: 'Q16', type: 'forced_eq', match: 2, pts: 1 }, // colonial attitudes critique
    ],
  },
  confucianHierarchical: {
    label: 'Confucian / Hierarchical',
    max: 2,
    rules: [
      { q: 'Q14', type: 'rank_pos', match: 5, pts1: 2, pts2: 1 }, // Hierarchical (index 5)
    ],
  },
  liberalIndividualism: {
    label: 'Liberal Individualism',
    max: 2,
    rules: [
      { q: 'Q19', type: 'forced_eq', match: 2, pts: 2 },
    ],
  },
  antiCapitalist: {
    label: 'Anti-Capitalist',
    max: 4,
    rules: [
      { q: 'Q19', type: 'forced_eq', match: 3, pts: 2 },
      { q: 'Q16', type: 'forced_eq', match: 3, pts: 2 }, // ecosocialist
    ],
  },
};

// ─── SCORING FUNCTIONS ──────────────────────────────────────────────────────

function scoreRankWeighted(answer, weights, multipliers) {
  if (!Array.isArray(answer)) return 0;
  let total = 0;
  for (let i = 0; i < answer.length; i++) {
    const optIdx = answer[i];
    const w = weights[optIdx] ?? 0;
    const m = multipliers[i] ?? 1;
    total += w * m;
  }
  return total;
}

function scoreRankRaw(answer, valuesMap) {
  if (!Array.isArray(answer)) return 0;
  let total = 0;
  for (let i = 0; i < answer.length; i++) {
    const optIdx = answer[i];
    const vals = valuesMap[optIdx];
    if (vals && vals[i] !== undefined) {
      total += vals[i];
    }
  }
  return total;
}

function scoreForcedLookup(answer, valuesMap) {
  if (answer === undefined || answer === null) return 0;
  return valuesMap[answer] ?? 0;
}

function findCategory(categories, score) {
  for (const cat of categories) {
    if (score >= cat.min && score <= cat.max) return cat.label;
  }
  return 'Unknown';
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function evaluateTagRule(rule, answers) {
  const a = answers[rule.q];
  if (a === undefined || a === null) return 0;
  switch (rule.type) {
    case 'forced_eq':
      return a === rule.match ? rule.pts : 0;
    case 'forced_in':
      return rule.match.includes(a) ? rule.pts : 0;
    case 'rank_includes':
      return Array.isArray(a) && a.includes(rule.match) ? rule.pts : 0;
    case 'rank_top2':
      return Array.isArray(a) && a.slice(0, 2).includes(rule.match) ? rule.pts : 0;
    case 'rank_pos': {
      if (!Array.isArray(a)) return 0;
      if (a[0] === rule.match) return rule.pts1;
      if (a.length > 1 && a[1] === rule.match) return rule.pts2;
      return 0;
    }
    case 'likert_gte':
      return a >= rule.min ? rule.pts : 0;
    default:
      return 0;
  }
}

function calculateAxes(answers) {
  // Material ← → Ideational
  let mi = 0;
  if (answers.Q6 != null) mi += (answers.Q6 - 3) * 2;
  mi += scoreRankWeighted(answers.Q9, Q9_MI_WEIGHTS, [2, 1]);
  mi += scoreRankWeighted(answers.Q10, Q10_MI_WEIGHTS, [3, 2, 1]);
  mi = clamp(mi, -23, 22);

  // Structure ← → Agency
  let sa = 0;
  sa += scoreRankWeighted(answers.Q9, Q9_SA_WEIGHTS, [2, 1]);
  sa += scoreRankWeighted(answers.Q10, Q10_SA_WEIGHTS, [3, 2, 1]);
  sa = clamp(sa, -15, 19);

  // Immediate ← → Structural Injustice
  let is_ = 0;
  is_ += scoreRankRaw(answers.Q5, Q5_IS_VALUES);
  is_ = clamp(is_, -4, 4);

  // Reform ← → Transform
  let rt = 0;
  rt += scoreForcedLookup(answers.Q16, Q16_RT_VALUES);
  rt += scoreForcedLookup(answers.Q18, Q18_RT_VALUES);
  rt += scoreForcedLookup(answers.Q19, Q19_RT_VALUES);
  rt = clamp(rt, -7, 9);

  return {
    materialIdeational: {
      score: mi,
      category: findCategory(AXIS_SCORING.materialIdeational.categories, mi),
    },
    structureAgency: {
      score: sa,
      category: findCategory(AXIS_SCORING.structureAgency.categories, sa),
    },
    immediateStructural: {
      score: is_,
      category: findCategory(AXIS_SCORING.immediateStructural.categories, is_),
    },
    reformTransform: {
      score: rt,
      category: findCategory(AXIS_SCORING.reformTransform.categories, rt),
    },
  };
}

function calculateSubDiagnostics(answers) {
  // Epistemology: Q2, Q3, Q8
  let epist = 0;
  epist += scoreForcedLookup(answers.Q2, Q2_EPIST_VALUES);
  epist += scoreForcedLookup(answers.Q3, Q3_EPIST_VALUES);
  if (answers.Q8 != null) epist += 3 - answers.Q8;
  epist = clamp(epist, -6, 7);
  const epistCategories = [
    { min: -6, max: -2, label: 'Positivist' },
    { min: -1, max: 2, label: 'Critical realist' },
    { min: 3, max: 7, label: 'Post-positivist' },
  ];

  // Structures Reproduce Domination: Q15
  let srd = 0;
  if (answers.Q15 != null) srd = answers.Q15 - 3;
  srd = clamp(srd, -2, 2);
  const srdCategories = [
    { min: -2, max: -1, label: 'Skeptical' },
    { min: 0, max: 0, label: 'Neutral' },
    { min: 1, max: 1, label: 'Aware' },
    { min: 2, max: 2, label: 'Critical affinity' },
  ];

  // Feminist IR: Q12, Q13
  let fem = 0;
  fem += scoreForcedLookup(answers.Q12, Q12_FEMINIST_VALUES);
  fem += scoreForcedLookup(answers.Q13, Q13_FEMINIST_VALUES);
  fem = clamp(fem, 0, 5);
  const femCategories = [
    { min: 0, max: 0, label: 'No feminist orientation' },
    { min: 1, max: 1, label: 'Weak' },
    { min: 2, max: 3, label: 'Moderate' },
    { min: 4, max: 5, label: 'Strong' },
  ];

  // Historicity / System Ontology: Q1
  let hist = 0;
  if (Array.isArray(answers.Q1)) {
    for (const optIdx of answers.Q1) {
      hist += Q1_HISTORICITY_VALUES[optIdx] ?? 0;
    }
  }
  hist = clamp(hist, -2, 4);
  const histCategories = [
    { min: -2, max: 0, label: 'Naturalised' },
    { min: 1, max: 2, label: 'Historical awareness' },
    { min: 3, max: 4, label: 'Historicised / critical' },
  ];

  // Sovereignty: Q17 (categorical)
  const sovLabel =
    answers.Q17 != null
      ? Q17_SOVEREIGNTY_LABELS[answers.Q17] ?? 'Unknown'
      : null;

  // Epistemic Authority: Q2
  let auth = scoreForcedLookup(answers.Q2, Q2_AUTHORITY_VALUES);
  auth = clamp(auth, -2, 3);
  const authCategories = [
    { min: -2, max: -1, label: 'Traditional authority' },
    { min: 0, max: 1, label: 'Mixed' },
    { min: 2, max: 3, label: 'Pluralist / subaltern' },
  ];

  return {
    epistemology: { score: epist, category: findCategory(epistCategories, epist), range: [-6, 7] },
    structuresDomination: { score: srd, category: findCategory(srdCategories, srd), range: [-2, 2] },
    feministIR: { score: fem, category: findCategory(femCategories, fem), range: [0, 5] },
    historicity: { score: hist, category: findCategory(histCategories, hist), range: [-2, 4] },
    sovereignty: { label: sovLabel },
    epistemicAuthority: { score: auth, category: findCategory(authCategories, auth), range: [-2, 3] },
  };
}

function calculateTags(answers) {
  const result = {};
  for (const [key, def] of Object.entries(TAG_DEFINITIONS)) {
    let score = 0;
    for (const rule of def.rules) {
      score += evaluateTagRule(rule, answers);
    }
    result[key] = { score: Math.min(score, def.max), max: def.max, label: def.label };
  }
  return result;
}

// ─── THEORY AFFINITY PROFILES ───────────────────────────────────────────────

function normalizeAxis(score, range, direction) {
  const [lo, hi] = range;
  const span = hi - lo;
  if (span === 0) return 0;
  const norm = (score - lo) / span; // 0..1 where 0=lo, 1=hi
  if (direction === 'low') return 1 - norm;
  if (direction === 'high') return norm;
  if (direction === 'mid') return 1 - Math.abs(norm - 0.5) * 2;
  return 0;
}

function normalizeDiag(diag, direction) {
  if (!diag || diag.range == null) return 0;
  return normalizeAxis(diag.score, diag.range, direction);
}

function calculateTheoryAffinities(answers, axes, subDiag, tags) {
  const a = answers;
  const results = {};

  // --- Structural Realism ---
  {
    let pct = 0;
    pct += (tags.stateStrategic.score / tags.stateStrategic.max) * 30;
    pct += normalizeAxis(axes.materialIdeational.score, AXIS_SCORING.materialIdeational.range, 'low') * 20;
    pct += normalizeAxis(axes.structureAgency.score, AXIS_SCORING.structureAgency.range, 'low') * 15;
    pct += normalizeDiag(subDiag.epistemology, 'low') * 10;
    if (a.Q11 === 0) pct += 10;
    if (a.Q7 === 0) pct += 10;
    if (a.Q4 === 0) pct += 5;
    if (Array.isArray(a.Q14) && (a.Q14[0] === 6 || a.Q14[1] === 6)) pct += 10; // Q14 option G (order) in top 2
    if (a.Q19 === 1) pct += 5; // sphere of influence (compatible with neorealism)
    results.neorealism = { label: 'Structural Realism', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Liberal Institutionalism ---
  {
    let pct = 0;
    pct += (tags.stateStrategic.score / tags.stateStrategic.max) * 10;
    pct += normalizeAxis(axes.reformTransform.score, AXIS_SCORING.reformTransform.range, 'low') * 15;
    pct += normalizeDiag(subDiag.epistemology, 'low') * 10;
    if (Array.isArray(a.Q1) && a.Q1.includes(3)) pct += 15; // Q1 includes D
    if (a.Q17 === 1 || a.Q17 === 4) pct += 10; // Q17=B or E (sovereignty)
    if (a.Q19 === 0 || a.Q19 === 2) pct += 10; // Q19=A or C (global justice)
    if (a.Q11 === 2) pct += 5; // domestic coalitions
    if (a.Q4 === 0) pct += 5; // states lens
    if (a.Q18 === 1) pct += 5; // states productive (nation-states)
    if (Array.isArray(a.Q14) && a.Q14[0] === 6) pct += 5; // Q14 option G ranked first (order through institutions)
    results.liberalInstitutionalism = { label: 'Liberal Institutionalism', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Constructivism ---
  {
    let pct = 0;
    pct += normalizeAxis(axes.materialIdeational.score, AXIS_SCORING.materialIdeational.range, 'high') * 25;
    pct += normalizeDiag(subDiag.epistemology, 'mid') * 10;
    if (a.Q6 != null && a.Q6 >= 4) pct += 15; // norms shape behaviour
    if (a.Q3 === 1 || a.Q3 === 2) pct += 10; // power or perspectives
    if (Array.isArray(a.Q9) && a.Q9.includes(3)) pct += 15; // Q9 ranks D
    if (a.Q11 === 3) pct += 5; // social structures (capitalism/class/patriarchy — constructivists see these as social constructs)
    if (a.Q8 != null && (a.Q8 === 2 || a.Q8 === 3)) pct += 5; // moderate epistemology
    if (Array.isArray(a.Q10) && a.Q10.includes(2)) pct += 10; // Q10 ranks C (norms)
    // Constructivists favour reform to moderate transform
    const rtScore = axes.reformTransform.score;
    if (rtScore >= -3 && rtScore <= 3) pct += 15;
    // Penalty for strong transform
    if (rtScore >= 4) pct -= 10;
    results.constructivism = { label: 'Constructivism', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Classical Realism ---
  {
    let pct = 0;
    pct += (tags.stateStrategic.score / tags.stateStrategic.max) * 15;
    pct += normalizeAxis(axes.materialIdeational.score, AXIS_SCORING.materialIdeational.range, 'low') * 15;
    pct += normalizeAxis(axes.structureAgency.score, AXIS_SCORING.structureAgency.range, 'high') * 20;
    if (Array.isArray(a.Q9) && a.Q9.includes(1)) pct += 10; // Q9 ranks B (leaders)
    if (Array.isArray(a.Q9) && a.Q9.includes(5)) pct += 15; // Q9 ranks F (human nature)
    if (Array.isArray(a.Q10) && a.Q10.includes(4)) pct += 10; // Q10 ranks E (personal beliefs)
    if (a.Q7 === 0 || a.Q7 === 3) pct += 10; // national security or state survival
    if (a.Q17 === 5) pct += 5; // consequentialist (sovereignty)
    if (a.Q11 === 0) pct += 5; // rational unitary
    if (a.Q4 === 0) pct += 5; // states lens
    if (Array.isArray(a.Q14) && (a.Q14[0] === 6 || a.Q14[1] === 6)) pct += 8; // Q14 option G (order) in top 2
    if (a.Q19 === 1) pct += 10; // sphere of influence (conservative realism)
    results.classicalRealism = { label: 'Classical Realism', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Marxism / World Systems ---
  {
    let pct = 0;
    pct += (tags.structuralClass.score / tags.structuralClass.max) * 30;
    pct += (tags.antiCapitalist.score / tags.antiCapitalist.max) * 10;
    pct += normalizeAxis(axes.materialIdeational.score, AXIS_SCORING.materialIdeational.range, 'low') * 15;
    pct += normalizeAxis(axes.structureAgency.score, AXIS_SCORING.structureAgency.range, 'low') * 10;
    if (Array.isArray(a.Q5) && a.Q5.includes(3)) pct += 10; // Q5 ranks D
    if (a.Q7 === 2) pct += 10; // global capital
    if (a.Q19 === 3) pct += 10; // dismantle capitalism (global justice)
    if (a.Q11 === 3) pct += 10; // capitalism/class structures determine state behaviour
    results.marxismWorldSystems = { label: 'Marxism / World Systems', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Feminism ---
  {
    let pct = 0;
    pct += (tags.feministIR.score / tags.feministIR.max) * 35;
    pct += normalizeDiag(subDiag.feministIR, 'high') * 25;
    pct += normalizeDiag(subDiag.epistemology, 'high') * 10;
    if (a.Q12 === 1) pct += 15; // masculinist assumptions
    if (a.Q13 === 1 || a.Q13 === 2) pct += 10; // structural or intersectional
    if (a.Q11 === 3) pct += 5; // structures including patriarchy
    results.feminism = { label: 'Feminism', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Postcolonial Theory ---
  {
    let pct = 0;
    pct += (tags.indigenousPostcolonial.score / tags.indigenousPostcolonial.max) * 30;
    pct += normalizeAxis(axes.immediateStructural.score, AXIS_SCORING.immediateStructural.range, 'high') * 10;
    pct += normalizeAxis(axes.reformTransform.score, AXIS_SCORING.reformTransform.range, 'high') * 15;
    pct += normalizeDiag(subDiag.epistemology, 'high') * 10;
    if (a.Q18 === 2 || a.Q18 === 3) pct += 10; // colonialism (nation-states)
    if (a.Q3 === 1) pct += 10; // power shapes categories
    if (a.Q15 != null && a.Q15 >= 4) pct += 5; // colonial legacies
    if (subDiag.historicity.score >= 3) pct += 5; // historicised/critical
    if (Array.isArray(a.Q14) && (a.Q14[0] === 6 || a.Q14[1] === 6)) pct -= 10; // Q14 option G in top 2 (order over justice)
    results.postcolonial = { label: 'Postcolonial Theory', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Green Theory ---
  {
    let pct = 0;
    pct += (tags.ecologicalRelational.score / tags.ecologicalRelational.max) * 30;
    pct += normalizeAxis(axes.reformTransform.score, AXIS_SCORING.reformTransform.range, 'high') * 20;
    if (Array.isArray(a.Q14) && a.Q14.includes(3)) pct += 10; // ecosystems (index 3)
    if (a.Q19 === 5) pct += 5; // change consciousness (global justice)
    results.greenTheory = { label: 'Green Theory', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Indigenous / Decolonial ---
  {
    let pct = 0;
    pct += (tags.indigenousPostcolonial.score / tags.indigenousPostcolonial.max) * 25;
    pct += normalizeAxis(axes.reformTransform.score, AXIS_SCORING.reformTransform.range, 'high') * 20;
    if (a.Q18 === 3) pct += 15; // key cause of inequality (nation-states)
    if (a.Q19 === 4) pct += 15; // centre self-determination (global justice)
    if (a.Q3 === 1) pct += 10; // power shapes categories
    if (Array.isArray(a.Q14) && a.Q14.includes(4)) pct += 10; // marginalised peoples (index 4)
    if (Array.isArray(a.Q14) && (a.Q14[0] === 6 || a.Q14[1] === 6)) pct -= 15; // Q14 option G in top 2 (order over justice)
    results.indigenousDecolonial = { label: 'Indigenous / Decolonial', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Confucian IR / Moral Realism --- (special formula from spec)
  {
    let pct = 0;
    // Gate: Q14 must rank F (Hierarchical, index 5) in top 2
    const q14 = answers.Q14;
    const hasH = Array.isArray(q14) && (q14[0] === 5 || q14[1] === 5);
    if (!hasH) {
      pct = 0;
    } else {
      pct = 40; // base
      // Pattern 1: Legitimacy-Based Sovereignty — Q17=D
      if (a.Q17 === 3) pct += 10;
      // Pattern 2: Moderate Material Structure
      // Material axis: -8 to -3 AND Structure axis: -6 to +2
      const miScore = axes.materialIdeational.score;
      const saScore = axes.structureAgency.score;
      if (miScore >= -8 && miScore <= -3 && saScore >= -6 && saScore <= 2) pct += 10;
      // Pattern 3: Weak Sovereignty Preference — Q17=A if Q14=H
      if (a.Q17 === 0) pct += 5;
      // Negative filters
      if (a.Q19 === 3) pct -= 15; // revolutionary anti-capitalism (global justice)
      if (a.Q19 === 4) pct -= 15; // decolonial transformation (global justice)
      if (axes.reformTransform.score >= 6) pct -= 10; // strong transform
      if (tags.structuralClass.score >= 4) pct -= 10; // class struggle emphasis
      if (axes.materialIdeational.score <= -12) pct -= 10; // strong marxist materialism
    }
    results.confucianIR = { label: 'Confucian IR / Moral Realism', percent: clamp(Math.round(pct), 0, 100) };
  }

  // --- Left-Ecomodernism / Ecosocialism ---
  {
    let pct = 0;
    // Gate: must select Q16 option A (technology/state investment)
    if (a.Q16 !== 0) {
      pct = 0;
    } else {
      pct = 30; // base
      // Reinforcing patterns (anti-capitalist)
      if (tags.antiCapitalist.score >= 2) pct += 20;
      if (tags.structuralClass.score >= 3) pct += 15;
      if (axes.reformTransform.score >= 4) pct += 15;
      if (a.Q19 === 3) pct += 10; // dismantle capitalism
      // Negative filters (too reformist)
      if (axes.reformTransform.score <= -2) pct -= 20;
      if (tags.stateStrategic.score >= 4 && tags.structuralClass.score < 2) pct -= 10;
    }
    results.leftEcomodernism = { label: 'Left-Ecomodernism / Ecosocialism', percent: clamp(Math.round(pct), 0, 70), minDisplay: 35 };
  }

  return results;
}

// ─── THEORY PROFILE READINGS ────────────────────────────────────────────────

const THEORY_PROFILES = {
  neorealism: {
    emoji: '\u{1F3B1}',
    heading: 'Structural Realism',
    body: [
      'Structural realists have often been the least popular scholars in the International Relations theory zodiac (mind you, practically everyone in government calls themselves a \u201Crealist\u201D). No-one makes friends with cold, calculating analysis, or by rejecting liberal moralism. Recently though, John Mearsheimer\u2019s lectures on Ukraine/NATO have accumulated Kardashian-level YouTube views \u2013 so things might be looking up for Realists.',
      'Neorealists lean toward pessimism and love to prudently assess risks, especially of using military force. Their greatest scorn is for the strategic naivety of liberal imperialists who think American power can remake the world for the better. While others dream about cooperation and shared norms, or promise humanitarian interventions to liberate the oppressed, neorealists think only of the sober pursuit of interests. They see international law and institutions surviving only so long as they serve the interests of the powerful. Realists have a long record of condemning unlawful US military action (Iran, Iraq, Vietnam etc). But they reject these \u2018wars of choice\u2019 because they are counterproductive, not because they are wrong.',
    ],
    watchOut: 'Watch out that your tragic disposition doesn\u2019t mean you fail to see possibilities for change. Sometimes progress is possible even when the structure says no.',
    vibeWith: [
      'Kenneth Waltz \u2013 Made structure the star of IR theory and didn\u2019t apologise for it (we read him in Week 4)',
      'John Mearsheimer \u2013 Says great powers lie, cheat, and steal because the system makes them',
    ],
    challengeYou: [
      'Kathryn Sikkink \u2013 Would show you how norms change state behaviour (we read her in Week 6)',
      'Postcolonial scholars \u2013 Would ask why you treat the \u201Cstate system\u201D as natural rather than colonial',
    ],
    quote: { text: 'In international politics, as in any self-help system, the units of greatest capability set the scene of action for others as well as for themselves.', attribution: 'Kenneth Waltz, Theory of World Politics' },
  },
  liberalInstitutionalism: {
    emoji: '\u2696\uFE0F',
    heading: 'Liberal Institutionalism',
    body: [
      'John Lennon was thinking of you when he wrote: Imagine all the people, living life in peace? You may be a dreamer, but you\u2019re not the only one. Liberals are natural optimists who reckon everything\u2019s going to come up Milhouse. They also dominated Western public discourse up until \u2013 roughly \u2013 the election of Trump in 2016.',
      'Whereas Realists see a world of competition and power, liberals see states slowly building the architecture of cooperation \u2013 treaties, trade agreements, international courts, climate accords. You think institutions work by creating common knowledge, making commitments credible, and allowing states to coordinate. When others kvetch about a world in disarray, you probably find yourself defending the UN\u2019s achievements, or pointing out that the World Trade Organisation has prevented trade wars and global recession.',
    ],
    watchOut: 'Watch out for: Sometimes \u201Cthe rules-based international order\u201D is just a polite way of saying \u201CUS-led\u201D. Keohane called this \u201Ccooperation under hegemony\u201D for a reason. If your liberal values have you supporting the use of force to \u2018liberate\u2019 oppressed people, take a beat to assess whose interests you\u2019re advancing.',
    vibeWith: [
      'Robert Keohane \u2013 Argues institutions matter even after hegemony fades (we read \u201CAfter Hegemony\u201D in Week 3)',
      'Anne-Marie Slaughter \u2013 Writes about networks of judges, regulators, and bureaucrats cooperating across borders',
    ],
    challengeYou: [
      'Kenneth Waltz (Week 4) \u2013 Thinks institutions just reflect power distributions, not independent forces',
      'Robert Cox (Week 5) \u2013 \u201CThe UN is not a realm of equality but a site for great power management\u201D',
      'Sanjay Seth (Week 10) \u2013 Would ask whose universalism your \u201Cinternational order\u201D represents',
    ],
    quote: { text: 'Institutions do not enforce themselves.', attribution: 'Robert Keohane' },
  },
  constructivism: {
    emoji: '\u{1F422}',
    heading: 'Constructivism',
    body: [
      'Do you know the scene in Mean Girls where Amanda Seyfried tells Lindsay Lohan \u201COn Wednesdays we wear pink\u201D \u2013 establishing the norms that set their clique apart? You think world politics works that way too. Just like in high school, norms, identities and ideas shape how states act, what states want, and who has influence.',
      'Why did chemical weapons become taboo? Why did international law reject colonialism? Why do women have the vote nearly everywhere? Why, for a time, did states refrain from assassinating foreign leaders or seizing each other\u2019s territory? Constructivists think norms shape what\u2019s legitimate and identity shapes threat perception. Change the ideas, change the world.',
    ],
    watchOut: 'Watch out for: To their critics, constructivism is liberalism in a leather jacket \u2013 still thinking ideas shape material reality, not the other way around. Don\u2019t forget to ask what role new technologies, class power, and military force play in shaping the world.',
    vibeWith: [
      'Kathryn Sikkink \u2013 Traces how human rights norms spread and change state behaviour (we read her work on torture in Week 6)',
      'Peter Katzenstein \u2013 Studies how identity shapes security policy',
      'Martha Finnemore \u2013 Shows how international organisations socialise states into new norms',
    ],
    challengeYou: [
      'Realists like Kenneth Waltz (Week 4) \u2013 Thinks you\u2019re naive about material power (surprise, surprise)',
      'Robert Cox \u2013 Would tell you to ask whose interests benefit when norms change',
      'Maja Zehfuss \u2013 Worries mainstream constructivism got too comfortable and not critical enough (we read her warning in Week 7)',
    ],
    quote: { text: 'Anarchy is what states make of it.', attribution: 'Alexander Wendt' },
  },
  classicalRealism: {
    emoji: '\u2694\uFE0F',
    heading: 'Classical Realism',
    body: [
      'Classical realists are the historians of the IR zodiac. While their neorealist cousins model the abstract structure of world politics like pool players calculating angles, classical realists seek patterns in historical experience, and reflect on the limited space for moral action amid the tragic dilemmas of political life.',
      'You think humans are fundamentally flawed \u2013 driven by fear, ambition, and the desire for power. This doesn\u2019t make you a nihilist; it makes you a pessimist who thinks clearly about what politics can achieve. You think actions should be judged primarily by their consequences. Hans Morgenthau said it best: \u201CTo know with despair that the political act is inevitably evil, and to act nevertheless, is moral courage. To choose among several expedient actions the least evil one is moral judgment.\u201D',
    ],
    watchOut: 'Watch out for: Remember Hannah Arendt\u2019s warning: \u201Cthose who choose the lesser evil forget very quickly that they chose evil.\u201D',
    vibeWith: [
      'Hans Morgenthau \u2013 Wrote that politics is a struggle for power, but also that it must be tempered by ethics (we read his realist theory in Week 2)',
      'Thucydides \u2013 The Melian Dialogue (Week 2) remains compelling 2,400 years on',
      'Reinhold Niebuhr \u2013 Christian realism',
      'E.H. Carr \u2013 On the twenty years\u2019 crisis and why we should balance realism and utopian thinking',
    ],
    challengeYou: [
      'Kathryn Sikkink (Week 6) \u2013 Ideas change what leaders want; it\u2019s not just human nature',
      'Robert Cox (Week 5) \u2013 Would ask whose \u2018human nature\u2019 realism universalises',
      'Aileen Moreton-Robinson (Week 9) \u2013 Colonial violence reveals what you call \u2018human nature\u2019 is often just European power',
    ],
    quote: { text: 'To know with despair that the political act is inevitably evil, and to act nevertheless, is moral courage.', attribution: 'Hans Morgenthau, \u201CThe Evil of Politics and the Ethics of Evil\u201D (1945)' },
  },
  marxismWorldSystems: {
    emoji: '\u{1F6A9}',
    heading: 'Marxism / World Systems',
    body: [
      'You are Katniss Everdeen in the Hunger Games. You see how the Capitol (the West) exploits the Districts (the Global South), and you\u2019re ready to join the resistance.',
      'You have no time for realists (servants of state power), constructivists or liberals (servants of self-serving bourgeois morality). Instead, you see the warp and weft of history \u2013 how changing methods of production shape class formations, and how the ideologies people believe in grow from material conditions. Your disdain for bourgeois ideology is captured in Rosa Luxemburg\u2019s statement \u201CThe most revolutionary thing one can do is always to proclaim loudly what is happening.\u201D',
      'You know global poverty isn\u2019t a development problem to be solved \u2013 it\u2019s how capitalism works \u2013 extracting cheap labour and resources from the South. You think the state system organises and legitimates this exploitation. And so you\u2019ve figured human equality requires that working people seize the means of production, and (if you\u2019re a classic Marxist) allow the state to wither away.',
    ],
    watchOut: 'Watch out for: You\u2019ve seen the totality. Be careful that others don\u2019t mistake your holistic analysis for dogma; or think your focus on class conflict blinds you to other forms of injustice, like racism and sexism.',
    vibeWith: [
      'Robert Cox \u2013 Asked \u201Cfor whom, for what purpose?\u201D and made Gramscian hegemony central to IR (we read him in Week 5)',
      'Rosa Luxemburg \u2013 Wrote about imperialism and capital accumulation',
      'Immanuel Wallerstein \u2013 Mapped the world-system: core, periphery, semi-periphery',
      'Silvia Federici \u2013 Shows capitalism requires women\u2019s unpaid reproductive labour',
    ],
    challengeYou: [
      'Kenneth Waltz \u2013 \u201CStates, not classes, are the units that matter\u201D',
    ],
    quote: null,
  },
  feminism: {
    emoji: '\u{1F4AA}',
    heading: 'Feminism',
    body: [
      'Feminist scholars like Jan Pettman call IR a \u201Cmasculinist discipline\u201D \u2013 masculinist in \u201Cits personnel and in how it understands states, wars, and markets\u201D. You ask challenging questions like: where are the women? What kinds of masculinities and femininities allow the world to function? How does patriarchy intersect with colonialism, race, and class?',
      'Women may not have been in the war rooms making decisions, but they were doing the background work that makes \u2018high politics\u2019 possible. They were not writing the laws of war, but they were living with the consequences of patriarchal violence.',
      'You see gender everywhere because it is everywhere. You think IR theory is most masculinist when it\u2019s pretending to be neutral, because that\u2019s when it\u2019s obscuring women\u2019s perspectives and experiences most completely. You make the invisible visible \u2013 and the establishment resents you because it\u2019s uncomfortable.',
    ],
    watchOut: 'Watch out for: \u201CWomen\u201D isn\u2019t a unified category. It\u2019s fractured by race, class, geography, colonialism. Liberal feminism that wants more women CEOs isn\u2019t the same as feminism that wants to dismantle capitalism and patriarchy together.',
    vibeWith: [
      'Jeanne Morefield \u2013 Questions the exclusions of the masculinist IR canon (Week 8)',
      'Cynthia Enloe \u2013 Showed that military bases need bartenders, sex workers, and wives \u2013 all women, all made invisible',
      'Jan Pettman \u2013 The founder of Australian feminist international relations',
    ],
    challengeYou: [
      'Aileen Moreton-Robinson\u2019s \u201CTalkin\u2019 Up to the White Woman\u201D (2021) will challenge you to think about the inadvertent complicity of many white feminists in racial oppression',
      'John Mearsheimer, Kenneth Waltz etc \u2013 Write as though gender is irrelevant to power politics',
    ],
    quote: { text: '\u2018Womenandchildren\u2019 is not a description of reality but a political move.', attribution: 'Cynthia Enloe' },
  },
  postcolonial: {
    emoji: '\u270A\u{1F3FE}',
    heading: 'Postcolonial Theory',
    body: [
      'Postcolonial scholars believe the \u201Cinternational system\u201D isn\u2019t universal or neutral \u2013 it was built through colonialism and still operates through colonial logics. When others talk about \u201Cfailed states\u201D and \u201Cdevelopment,\u201D you hear echoes of the colonial \u201Ccivilising mission.\u201D You know that concepts IR theory takes for granted \u2013 sovereignty, progress, civilisation, even \u201Cinternational\u201D itself \u2013 carry colonial DNA.',
      'Postcolonial theory has taken different forms. Frantz Fanon wrote about colonial violence \u2013 both physical and psychological \u2013 and the necessity of liberation. Edward Said showed how Western \u201Cknowledge\u201D about the non-West was a technology of power. Gayatri Spivak shows how Western philosophy required the figure of the colonised \u2018native informant\u2019 \u2013 someone who could be known but never truly speak \u2013 to construct European rationality itself. She also critiqued colonial logic (\u2018white men saving brown women from brown men\u2019) and white feminism\u2019s complicity in it. Contemporary scholars like Ol\u00FAf\u1EB9\u0301mi T\u00E1\u00EDw\u00F2 push postcolonial thought toward reparative politics: not just diagnosing colonial harm, but building alternatives.',
    ],
    watchOut: 'Watch out for: Don\u2019t let critique substitute for construction. As T\u00E1\u00EDw\u00F2 argues, we need to move from exposing what\u2019s wrong to articulating what reparative justice actually requires.',
    vibeWith: [
      'Sanjay Seth \u2013 Challenges IR\u2019s universalist claims and shows how they\u2019re rooted in European history (we read him in Week 10)',
      'Ol\u00FAf\u1EB9\u0301mi T\u00E1\u00EDw\u00F2 \u2013 Thinking constructively about reparations beyond just acknowledgment (Week 10 reading)',
    ],
    challengeYou: [
      'Kenneth Waltz \u2013 Thinks you dwell too much on history; structure is what matters',
      'Samuel Huntington \u2013 Called colonialism \u201Cmodernisation\u201D',
    ],
    quote: null,
  },
  greenTheory: {
    emoji: '\u{1F30D}',
    heading: 'Green Theory',
    body: [
      '\u201CIt\u2019s not easy being green.\u201D If Kermit the Frog taught us anything it\u2019s that \u201Cpeople tend to pass you over\u201D if you\u2019re green. Green theorists are cursed to see the future but not be heard. While everyone else debates power transitions, trade agreements, security threats and the impacts of AI, you\u2019re pointing to long-term trends and saying \u201Cnone of this matters if we make the planet uninhabitable.\u201D',
      'You know states aren\u2019t the only actors \u2013 rivers, forests, biomes and climate systems shape politics too. These aren\u2019t just resources or constraints on human action \u2013 they\u2019re active participants that shape what\u2019s possible in politics.',
    ],
    watchOut: 'Watch out for: Don\u2019t let ecological crisis blind you to the everyday crises of global inequality; or to the risk that \u2018limits\u2019 discourses might be taken up by eco-fascists.',
    vibeWith: [
      'Robyn Eckersley \u2013 Green political theory and ecological democracy',
      'Andreas Malm \u2013 It\u2019s not \u201Cthe Anthropocene,\u201D it\u2019s the Capitalocene \u2013 capitalism did this',
      'Donna Haraway \u2013 On multispecies worlds and staying with the trouble',
    ],
    challengeYou: [
      'John Mearsheimer \u2013 States prioritise power over planet (unfortunately probably right)',
      'Robert Keohane \u2013 Thinks well-designed international institutions are vital to climate action (you think this piecemeal reformism is doomed to fail)',
    ],
    quote: { text: 'We can\u2019t solve problems by using the same kind of thinking we used when we created them.', attribution: 'Albert Einstein' },
  },
  indigenousDecolonial: {
    emoji: '\u{1F3D4}\uFE0F',
    heading: 'Indigenous / Decolonial',
    body: [
      'Indigenous and decolonial scholars don\u2019t just critique IR theory \u2013 they reveal that the entire discipline is implicated in erasing Indigenous peoples and their political systems. The \u201Cstate system\u201D isn\u2019t a natural, universal value-free system; it\u2019s a technology of dispossession that has been violently imposed on much of the world.',
      'For First Nations peoples, the most central questions are often the ones that mainstream IR theory ignores.',
      'You know that borders are violence. Sovereignty is a colonial concept. When liberals talk about reforming institutions, you\u2019re asking: why are we accepting the state as the unit of analysis at all? Indigenous peoples had governance before colonisation, and continue to practise and develop their political systems.',
    ],
    watchOut: 'Watch out for: As Eve Tuck and K Wayne Yang warn in \u201CDecolonisation is not a Metaphor\u201D, the radicalism of decolonial ideas is lost when decolonisation becomes a metaphor (e.g. people who want to \u201Cdecolonise education\u201D). Decolonisation means the repatriation of First Nations\u2019 land and life.',
    vibeWith: [
      'Aileen Moreton-Robinson (Week 9) \u2013 White possession is ongoing, not historical; the Australian state is built on theft',
      'Glen Coulthard \u2013 Recognition from the settler state isn\u2019t liberation; we need resurgence',
    ],
    challengeYou: [
      'Mainstream IR as a whole \u2013 The discipline treats states as natural units, erasing the colonial violence that created them',
      'Liberal multiculturalists \u2013 Think cultural recognition and minority rights are enough; miss that it\u2019s about sovereignty and land, not inclusion',
    ],
    quote: { text: 'The nation-state of Australia is predicated on the dispossession of Indigenous peoples. White possession is not merely a historical fact, but an ongoing structure.', attribution: 'Aileen Moreton-Robinson' },
  },
  confucianIR: {
    emoji: '\u262F\uFE0F',
    heading: 'Confucian IR / Moral Realism',
    body: [
      'You see international politics as fundamentally relational. States exist in webs of relationships where moral authority matters, not just material capabilities. A hegemon that acts without virtue loses legitimacy and breeds resistance. A rising power that demonstrates benevolence can lead without conquering. Harmony doesn\u2019t mean everyone agrees \u2013 it means each party fulfils their role: rulers showing benevolence, subjects showing loyalty, stronger states showing restraint.',
      'Confucian IR scholars think Western IR theory got some big things wrong. Not everything is anarchy and competition. Not all hierarchy is oppression. And power without virtue creates resentment, not order.',
    ],
    watchOut: 'Watch out for: Could \u2018harmony\u2019 be a euphemism for domination when taken up by powerful states?',
    vibeWith: [
      'Yan Xuetong \u2013 Power matters, but so does moral authority; leaders need both',
      'Qin Yaqing \u2013 Relationality and process in world politics',
    ],
    challengeYou: [
      'John Mearsheimer \u2013 Virtue is window-dressing; power is all that matters (you disagree)',
      'Rosenlee, Li-Hsiang and many other feminist scholars have debated whether Confucian hierarchy is inherently gendered, or is compatible with feminist care ethics. See: \u201CGender in Confucian Philosophy\u201D, The Stanford Encyclopedia of Philosophy (Spring 2023 Edition)',
    ],
    quote: null,
  },
  leftEcomodernism: {
    emoji: '\u{1F331}',
    heading: 'Left-Ecomodernism / Ecosocialism',
    body: [
      'Psst\u2026 don\u2019t tell anyone we said this, a political compass is supposed to be neutral. But your answers on climate and capitalism are objectively correct. You see what too many people miss: capitalism won\u2019t solve climate change, but we also can\u2019t meet the needs of 8 billion people and save the planet by rejecting technology.',
      'You believe technological progress and public investment in green infrastructure are necessary to address climate change, but you also recognise that capitalism itself is a deeper problem. You\u2019re not a techno-optimist who thinks markets will save us, but you\u2019re also not a primitivist who thinks humanity should abandon advanced technology. Your position: transition away from capitalism and use all our technological capacities to meet human needs while respecting planetary boundaries. Amen.',
    ],
    watchOut: 'Watch out for: This is a hard position to hold without contradictions.',
    vibeWith: [
      'Matt Huber \u2013 Climate change is class war',
      'Leigh Phillips \u2013 Large-scale planning is actually possible (see: Walmart, but socialist)',
      'Aaron Bastani \u2013 Fully automated luxury communism isn\u2019t just a meme, it\u2019s a program',
    ],
    challengeYou: [],
    quote: null,
  },
};

// ─── THEORY BRIEF BLURBS (for secondary matches 40-60%) ─────────────────────

const THEORY_BLURBS = {
  neorealism: 'You see power and material capabilities as the main drivers of state behaviour. In an anarchic world without world government, states must look after their own security because no-one else will.',
  liberalInstitutionalism: 'You recognise that states cooperate through institutions even if the world is anarchic (no government). Rules, norms, and international organisations help solve collective action problems and make cooperation more likely \u2013 but this requires that powerful states see it as in their interests.',
  constructivism: 'You understand that identities and interests aren\u2019t fixed \u2013 they\u2019re socially constructed through interaction. What states want changes when ideas about legitimacy and appropriate behaviour shift.',
  classicalRealism: 'You see human nature \u2013 fear, ambition, the desire for power \u2013 as driving conflict. Politics is tragic because human nature is flawed. The best we can hope for is prudent management of inevitable conflicts.',
  marxismWorldSystems: 'You see the world economy as hierarchically structured \u2013 core states extracting from the periphery. Global poverty isn\u2019t a bug in the system; it\u2019s how capitalism works, requiring exploitation to function.',
  feminism: 'You recognise how gender shapes what IR theory treats as important \u2013 who gets to speak, what counts as security, whose labour is valued. You see the invisible work (mostly done by women) that makes \u201Chigh politics\u201D possible.',
  postcolonial: 'You know the \u201Cinternational system\u201D is a colonial creation that continues to privilege European ways of knowing and being. Concepts like sovereignty, development, and civilisation carry colonial DNA that shapes world politics today.',
  greenTheory: 'The more-than-human world \u2013 rivers, forests, climate systems \u2013 isn\u2019t just \u201Cenvironment\u201D; it\u2019s political, active, and subject to abrupt shift. You see environmental parameters IR theory mostly ignores as central.',
  indigenousDecolonial: 'You understand the state system which many IR scholars take for granted, as a fundamental obstacle to First Nations\u2019 self-determination. Decolonisation isn\u2019t a metaphor or about recognition \u2013 it requires Land Back and material transformation.',
  confucianIR: 'You recognise that power without virtue creates resentment, not order. States exist in relationships where moral authority and proper conduct matter, not just material capabilities.',
};

// ─── MAIN SCORING FUNCTION ──────────────────────────────────────────────────

function calculateWarningFlags(answers) {
  const flags = [];
  // Q5 ranks option C (cultural explanation) in top 2
  if (Array.isArray(answers.Q5) && (answers.Q5[0] === 2 || answers.Q5[1] === 2)) {
    flags.push({
      question: 'Q5',
      flag: 'Cultural explanations for inequality — worth discussing critically',
      severity: 'discussion',
    });
  }
  // Q13 = option E (biological essentialism, index 4)
  if (answers.Q13 === 4) {
    flags.push({
      question: 'Q13',
      flag: 'Biological essentialism — important to examine assumptions',
      severity: 'discussion',
    });
  }
  return flags;
}

function computeScoring(answers) {
  const answered = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== null
  ).length;

  const axes = calculateAxes(answers);
  const subDiagnostics = calculateSubDiagnostics(answers);
  const tags = calculateTags(answers);
  const theories = calculateTheoryAffinities(answers, axes, subDiagnostics, tags);
  const warningFlags = calculateWarningFlags(answers);

  return { progress: { answered, total: QUESTIONS.length }, axes, subDiagnostics, tags, theories, warningFlags };
}

// ─── CALCULATION REPORT ─────────────────────────────────────────────────────

const OPTION_LETTERS = 'ABCDEFGHI';

function describeRankWeighted(answer, weights, multipliers, qOptions) {
  if (!Array.isArray(answer)) return { steps: [], total: 0 };
  const steps = [];
  let total = 0;
  for (let i = 0; i < answer.length; i++) {
    const optIdx = answer[i];
    const w = weights[optIdx] ?? 0;
    const m = multipliers[i] ?? 1;
    const contrib = w * m;
    total += contrib;
    const optText = qOptions?.[optIdx] ?? `Option ${OPTION_LETTERS[optIdx]}`;
    const short = optText.length > 60 ? optText.slice(0, 57) + '...' : optText;
    steps.push(`  Rank ${i + 1}: ${OPTION_LETTERS[optIdx]} "${short}" — weight ${w} × ${m} = ${contrib}`);
  }
  return { steps, total };
}

function describeRankRaw(answer, valuesMap, qOptions) {
  if (!Array.isArray(answer)) return { steps: [], total: 0 };
  const steps = [];
  let total = 0;
  for (let i = 0; i < answer.length; i++) {
    const optIdx = answer[i];
    const vals = valuesMap[optIdx];
    const contrib = (vals && vals[i] !== undefined) ? vals[i] : 0;
    total += contrib;
    const optText = qOptions?.[optIdx] ?? `Option ${OPTION_LETTERS[optIdx]}`;
    const short = optText.length > 60 ? optText.slice(0, 57) + '...' : optText;
    steps.push(`  Rank ${i + 1}: ${OPTION_LETTERS[optIdx]} "${short}" → raw value = ${contrib}`);
  }
  return { steps, total };
}

function describeForced(answer, valuesMap, qOptions) {
  if (answer == null) return { step: '  Not answered → 0', value: 0 };
  const val = valuesMap[answer] ?? 0;
  const optText = qOptions?.[answer] ?? `Option ${OPTION_LETTERS[answer]}`;
  const short = optText.length > 60 ? optText.slice(0, 57) + '...' : optText;
  return { step: `  Selected ${OPTION_LETTERS[answer]}: "${short}" → ${val}`, value: val };
}

function getQ(id) {
  return QUESTIONS.find(q => q.id === id);
}

function generateCalculationReport(answers) {
  const lines = [];
  const ln = (s = '') => lines.push(s);

  // ─── MATERIAL-IDEATIONAL ─────────────────────────────────────────
  ln('════════════════════════════════════════════');
  ln('AXIS: Material ← → Ideational');
  ln('Sources: Q6, Q9, Q10');
  ln('────────────────────────────────────────────');

  let miTotal = 0;

  // Q6
  const q6 = answers.Q6;
  if (q6 != null) {
    const q6contrib = (q6 - 3) * 2;
    miTotal += q6contrib;
    ln(`Q6 (Likert ${q6}/5): (${q6} - 3) × 2 = ${q6contrib}`);
  } else {
    ln('Q6: Not answered → 0');
  }

  // Q9
  ln('Q9 contributions (Material-Ideational):');
  const q9mi = describeRankWeighted(answers.Q9, Q9_MI_WEIGHTS, [2, 1], getQ('Q9')?.options);
  q9mi.steps.forEach(s => ln(s));
  ln(`  Q9 subtotal: ${q9mi.total}`);
  miTotal += q9mi.total;

  // Q10
  ln('Q10 contributions (Material-Ideational):');
  const q10mi = describeRankWeighted(answers.Q10, Q10_MI_WEIGHTS, [3, 2, 1], getQ('Q10')?.options);
  q10mi.steps.forEach(s => ln(s));
  ln(`  Q10 subtotal: ${q10mi.total}`);
  miTotal += q10mi.total;

  const miClamped = clamp(miTotal, -23, 22);
  ln(`RAW TOTAL: ${miTotal}${miTotal !== miClamped ? ` (clamped to ${miClamped})` : ''}`);
  ln(`CATEGORY: ${findCategory(AXIS_SCORING.materialIdeational.categories, miClamped)}`);
  ln();

  // ─── STRUCTURE-AGENCY ────────────────────────────────────────────
  ln('════════════════════════════════════════════');
  ln('AXIS: Structure ← → Agency');
  ln('Sources: Q9, Q10');
  ln('────────────────────────────────────────────');

  let saTotal = 0;

  ln('Q9 contributions (Structure-Agency):');
  const q9sa = describeRankWeighted(answers.Q9, Q9_SA_WEIGHTS, [2, 1], getQ('Q9')?.options);
  q9sa.steps.forEach(s => ln(s));
  ln(`  Q9 subtotal: ${q9sa.total}`);
  saTotal += q9sa.total;

  ln('Q10 contributions (Structure-Agency):');
  const q10sa = describeRankWeighted(answers.Q10, Q10_SA_WEIGHTS, [3, 2, 1], getQ('Q10')?.options);
  q10sa.steps.forEach(s => ln(s));
  ln(`  Q10 subtotal: ${q10sa.total}`);
  saTotal += q10sa.total;

  const saClamped = clamp(saTotal, -15, 19);
  ln(`RAW TOTAL: ${saTotal}${saTotal !== saClamped ? ` (clamped to ${saClamped})` : ''}`);
  ln(`CATEGORY: ${findCategory(AXIS_SCORING.structureAgency.categories, saClamped)}`);
  ln();

  // ─── IMMEDIATE-STRUCTURAL ────────────────────────────────────────
  ln('════════════════════════════════════════════');
  ln('AXIS: Immediate ← → Structural Injustice');
  ln('Sources: Q5');
  ln('────────────────────────────────────────────');

  let isTotal = 0;

  ln('Q5 contributions (raw rank values):');
  const q5is = describeRankRaw(answers.Q5, Q5_IS_VALUES, getQ('Q5')?.options);
  q5is.steps.forEach(s => ln(s));
  ln(`  Q5 subtotal: ${q5is.total}`);
  isTotal += q5is.total;

  const isClamped = clamp(isTotal, -4, 4);
  ln(`RAW TOTAL: ${isTotal}${isTotal !== isClamped ? ` (clamped to ${isClamped})` : ''}`);
  ln(`CATEGORY: ${findCategory(AXIS_SCORING.immediateStructural.categories, isClamped)}`);
  ln();

  // ─── REFORM-TRANSFORM ────────────────────────────────────────────
  ln('════════════════════════════════════════════');
  ln('AXIS: Reform ← → Transform');
  ln('Sources: Q16, Q18, Q19');
  ln('────────────────────────────────────────────');

  let rtTotal = 0;
  for (const [qId, valMap] of [['Q16', Q16_RT_VALUES], ['Q18', Q18_RT_VALUES], ['Q19', Q19_RT_VALUES]]) {
    const d = describeForced(answers[qId], valMap, getQ(qId)?.options);
    ln(`${qId}: ${d.step}`);
    rtTotal += d.value;
  }
  const rtClamped = clamp(rtTotal, -7, 9);
  ln(`RAW TOTAL: ${rtTotal}${rtTotal !== rtClamped ? ` (clamped to ${rtClamped})` : ''}`);
  ln(`CATEGORY: ${findCategory(AXIS_SCORING.reformTransform.categories, rtClamped)}`);
  ln();

  // ─── SUB-DIAGNOSTICS ─────────────────────────────────────────────
  ln('════════════════════════════════════════════');
  ln('SUB-DIAGNOSTICS');
  ln('────────────────────────────────────────────');

  // Epistemology
  ln('Epistemology (Q2 + Q3 + Q8):');
  let epistTotal = 0;
  const q2e = describeForced(answers.Q2, Q2_EPIST_VALUES, getQ('Q2')?.options);
  ln(`  Q2: ${q2e.step}`); epistTotal += q2e.value;
  const q3e = describeForced(answers.Q3, Q3_EPIST_VALUES, getQ('Q3')?.options);
  ln(`  Q3: ${q3e.step}`); epistTotal += q3e.value;
  if (answers.Q8 != null) {
    const q8v = 3 - answers.Q8;
    ln(`  Q8 (Likert ${answers.Q8}/5): 3 - ${answers.Q8} = ${q8v}`);
    epistTotal += q8v;
  } else { ln('  Q8: Not answered → 0'); }
  ln(`  TOTAL: ${epistTotal} → ${findCategory([{min:-6,max:-2,label:'Positivist'},{min:-1,max:2,label:'Critical realist'},{min:3,max:7,label:'Post-positivist'}], clamp(epistTotal, -6, 7))}`);
  ln();

  // Structures Reproduce Domination
  ln('Structures Reproduce Domination (Q15):');
  if (answers.Q15 != null) {
    const srdV = answers.Q15 - 3;
    ln(`  Q15 (Likert ${answers.Q15}/5): ${answers.Q15} - 3 = ${srdV}`);
  } else { ln('  Q15: Not answered → 0'); }
  ln();

  // Feminist IR
  ln('Feminist IR (Q12 + Q13):');
  let femTotal = 0;
  const q12f = describeForced(answers.Q12, Q12_FEMINIST_VALUES, getQ('Q12')?.options);
  ln(`  Q12: ${q12f.step}`); femTotal += q12f.value;
  const q13f = describeForced(answers.Q13, Q13_FEMINIST_VALUES, getQ('Q13')?.options);
  ln(`  Q13: ${q13f.step}`); femTotal += q13f.value;
  ln(`  TOTAL: ${femTotal} (clamped to ${clamp(femTotal, 0, 5)})`);
  ln();

  // Historicity
  ln('Historicity / System Ontology (Q1):');
  if (Array.isArray(answers.Q1)) {
    let hTotal = 0;
    for (const optIdx of answers.Q1) {
      const v = Q1_HISTORICITY_VALUES[optIdx] ?? 0;
      hTotal += v;
      ln(`  ${OPTION_LETTERS[optIdx]}: value = ${v}`);
    }
    ln(`  TOTAL: ${hTotal}`);
  } else { ln('  Q1: Not answered'); }
  ln();

  // Sovereignty
  ln('Sovereignty Orientation (Q17):');
  if (answers.Q17 != null) {
    ln(`  ${OPTION_LETTERS[answers.Q17]}: ${Q17_SOVEREIGNTY_LABELS[answers.Q17]}`);
  } else { ln('  Not answered'); }
  ln();

  // Epistemic Authority
  ln('Epistemic Authority (Q2):');
  ln('  Note: Derived from Q2 coding in spec — measures WHO produces knowledge');
  const q2a = describeForced(answers.Q2, Q2_AUTHORITY_VALUES, getQ('Q2')?.options);
  ln(`  ${q2a.step}`);
  ln();

  // ─── TAGS ────────────────────────────────────────────────────────
  ln('════════════════════════════════════════════');
  ln('TAG CALCULATIONS');
  ln('────────────────────────────────────────────');

  for (const [key, def] of Object.entries(TAG_DEFINITIONS)) {
    let tagScore = 0;
    const tagSteps = [];
    for (const rule of def.rules) {
      const pts = evaluateTagRule(rule, answers);
      tagScore += pts;
      if (pts > 0) {
        const a = answers[rule.q];
        tagSteps.push(`  ${rule.q}=${Array.isArray(a) ? a.map(i => OPTION_LETTERS[i]).join(',') : OPTION_LETTERS[a]} → +${pts}`);
      }
    }
    tagScore = Math.min(tagScore, def.max);
    ln(`${def.label}: ${tagScore}/${def.max}`);
    tagSteps.forEach(s => ln(s));
    if (tagSteps.length === 0) ln('  (no matches)');
  }
  ln();

  // ─── THEORY AFFINITIES ──────────────────────────────────────────
  ln('════════════════════════════════════════════');
  ln('THEORY AFFINITY CALCULATIONS');
  ln('────────────────────────────────────────────');

  // Recompute everything to show formulas
  const scoring = computeScoring(answers);
  const { axes, subDiagnostics: sd, tags: t } = scoring;

  function showTheory(name, steps, total) {
    ln(`\n${name}: ${clamp(Math.round(total), 0, 100)}%`);
    steps.forEach(s => ln(`  ${s}`));
  }

  // Structural Realism
  {
    const s = [];
    const v1 = (t.stateStrategic.score / t.stateStrategic.max) * 30;
    s.push(`State Strategic tags (${t.stateStrategic.score}/${t.stateStrategic.max}) × 30 = ${v1.toFixed(1)}`);
    const v2 = normalizeAxis(axes.materialIdeational.score, AXIS_SCORING.materialIdeational.range, 'low') * 20;
    s.push(`MI axis norm(low, score=${axes.materialIdeational.score}) × 20 = ${v2.toFixed(1)}`);
    const v3 = normalizeAxis(axes.structureAgency.score, AXIS_SCORING.structureAgency.range, 'low') * 15;
    s.push(`SA axis norm(low, score=${axes.structureAgency.score}) × 15 = ${v3.toFixed(1)}`);
    const v4 = normalizeDiag(sd.epistemology, 'low') * 10;
    s.push(`Epistemology norm(low, score=${sd.epistemology.score}) × 10 = ${v4.toFixed(1)}`);
    let bonus = 0;
    if (answers.Q11 === 0) { bonus += 10; s.push('Q11=A (unitary actors) → +10'); }
    if (answers.Q7 === 0) { bonus += 10; s.push('Q7=A (national security) → +10'); }
    if (answers.Q4 === 0) { bonus += 5; s.push('Q4=A (states lens) → +5'); }
    showTheory('Structural Realism', s, v1+v2+v3+v4+bonus);
  }

  // Feminism (detailed as requested)
  {
    const s = [];
    const v1 = (t.feministIR.score / t.feministIR.max) * 35;
    s.push(`Feminist IR tags (${t.feministIR.score}/${t.feministIR.max}) × 35 = ${v1.toFixed(1)}`);
    const v2 = normalizeDiag(sd.feministIR, 'high') * 25;
    s.push(`Feminist IR sub-diag norm(high, score=${sd.feministIR.score}, range=[0,5]) × 25 = ${v2.toFixed(1)}`);
    const v3 = normalizeDiag(sd.epistemology, 'high') * 10;
    s.push(`Epistemology norm(high, score=${sd.epistemology.score}) × 10 = ${v3.toFixed(1)}`);
    let bonus = 0;
    if (answers.Q12 === 1) { bonus += 15; s.push('Q12=B (patriarchal assumptions) → +15'); }
    if (answers.Q13 === 1 || answers.Q13 === 2) { bonus += 10; s.push(`Q13=${OPTION_LETTERS[answers.Q13]} (structural/intersectional) → +10`); }
    showTheory('Feminism', s, v1+v2+v3+bonus);
  }

  // All other theories (compact summary)
  for (const [key, theory] of Object.entries(scoring.theories)) {
    if (key === 'neorealism' || key === 'feminism') continue;
    ln(`\n${theory.label}: ${theory.percent}%`);
  }
  ln();

  // ─── WARNING FLAGS ──────────────────────────────────────────────
  const flags = scoring.warningFlags || [];
  if (flags.length > 0) {
    ln('════════════════════════════════════════════');
    ln('DISCUSSION POINTS');
    ln('────────────────────────────────────────────');
    for (const f of flags) {
      ln(`${f.question}: ${f.flag}`);
    }
    ln();
  }

  return lines.join('\n');
}

function generateExportJSON(answers) {
  const scoring = computeScoring(answers);
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    answers,
    calculations: {
      axes: scoring.axes,
      subDiagnostics: scoring.subDiagnostics,
      tags: scoring.tags,
      theories: scoring.theories,
    },
    detailedBreakdown: generateCalculationReport(answers),
  }, null, 2);
}

// ─── PDF GENERATION ─────────────────────────────────────────────────────────

function generateResultsPDF(answers) {
  const scoring = computeScoring(answers);
  const { axes, tags, theories } = scoring;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const textWidth = pageWidth - margin * 2;
  let y = margin;
  let pageNum = 1;

  // ── Helper: check for page break ──
  function checkPage(needed) {
    if (y + needed > pageHeight - 25) {
      addPageNumber();
      doc.addPage();
      pageNum++;
      y = margin;
    }
  }

  // ── Helper: add page number footer ──
  function addPageNumber() {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text('IR Theory Compass \u2014 worldpoliticscompass.com', margin, pageHeight - 10);
    doc.setTextColor(0);
  }

  // ── Helper: add wrapped text and advance y ──
  function addWrapped(text, fontSize, style, indent) {
    indent = indent || 0;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style || 'normal');
    const lines = doc.splitTextToSize(text, textWidth - indent);
    for (let i = 0; i < lines.length; i++) {
      checkPage(fontSize * 0.5);
      doc.text(lines[i], margin + indent, y);
      y += fontSize * 0.45;
    }
    y += 2;
  }

  // ── Helper: horizontal rule ──
  function addRule() {
    checkPage(8);
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  // ── Compute tiered display (same logic as Results component) ──
  const allTheories = Object.entries(theories)
    .map(([key, t]) => ({ key, ...t }))
    .sort((a, b) => b.percent - a.percent);

  const leftEco = theories.leftEcomodernism;
  const nonLeftEco = allTheories.filter(t => t.key !== 'leftEcomodernism');
  const highestNonLeftEco = nonLeftEco[0];

  const showLeftEco = leftEco && leftEco.percent >= 35 &&
    leftEco.percent >= (highestNonLeftEco ? highestNonLeftEco.percent : 0);

  const topTheory = highestNonLeftEco;
  const remaining = nonLeftEco.slice(1);
  const secondaryMatches = remaining.filter(t => t.percent >= 40 && t.percent <= 60);
  const otherAffinities = remaining.filter(t => t.percent >= 30 && t.percent < 40);
  const noStrongAffinity = !topTheory || topTheory.percent < 30;
  const noneAbove40 = topTheory && topTheory.percent < 40;

  // ═══════════════════════════════════════════════════════════════
  // PAGE CONTENT
  // ═══════════════════════════════════════════════════════════════

  // ── Header ──
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('IR Theory Compass Results', margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('Generated: ' + new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }), margin, y);
  doc.setTextColor(0);
  y += 12;
  addRule();

  // ── No strong affinity message ──
  if (noStrongAffinity) {
    addWrapped(
      'Your responses don\u2019t align strongly with any single theoretical tradition. ' +
      'This means you\u2019re drawn equally to multiple traditions, or that you\u2019re still exploring these ideas. ' +
      'Check back at the end of the course to see if your ideas have changed.',
      11, 'normal'
    );
    y += 6;
  }

  // ── Helper: render a full theory profile to PDF ──
  function renderProfile(theoryKey, percent) {
    const profile = THEORY_PROFILES[theoryKey];
    if (!profile) return;

    // Heading
    checkPage(14);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(profile.heading + ' \u2014 ' + percent + '%', margin, y);
    y += 10;

    // Body paragraphs
    profile.body.forEach(para => {
      addWrapped(para, 11, 'normal');
      y += 2;
    });

    // Watch out
    if (profile.watchOut) {
      y += 2;
      addWrapped(profile.watchOut, 11, 'italic');
      y += 2;
    }

    // Theorists you'd vibe with
    if (profile.vibeWith && profile.vibeWith.length > 0) {
      checkPage(10);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Theorists you\u2019d vibe with:', margin, y);
      y += 7;
      profile.vibeWith.forEach(t => {
        addWrapped('\u2022 ' + t, 10, 'normal', 5);
      });
      y += 2;
    }

    // Theorists who'd challenge you
    if (profile.challengeYou && profile.challengeYou.length > 0) {
      checkPage(10);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Theorists who\u2019d challenge you:', margin, y);
      y += 7;
      profile.challengeYou.forEach(t => {
        addWrapped('\u2022 ' + t, 10, 'normal', 5);
      });
      y += 2;
    }

    // Quote
    if (profile.quote) {
      checkPage(14);
      y += 2;
      addWrapped('\u201C' + profile.quote.text + '\u201D', 10, 'italic', 10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120);
      doc.text('\u2014 ' + profile.quote.attribution, margin + 10, y);
      doc.setTextColor(0);
      y += 8;
    }
  }

  // ── Top Theory Match ──
  if (!noStrongAffinity && topTheory && THEORY_PROFILES[topTheory.key]) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text('YOUR STRONGEST AFFINITY', margin, y);
    doc.setTextColor(0);
    y += 8;

    renderProfile(topTheory.key, topTheory.percent);
  }

  // ── Left-Ecomodernism (shown second when it's the top score) ──
  if (!noStrongAffinity && showLeftEco && THEORY_PROFILES.leftEcomodernism) {
    addRule();
    renderProfile('leftEcomodernism', leftEco.percent);
  }

  // ── Secondary Matches (40-60%) ──
  if (!noStrongAffinity && !noneAbove40 && secondaryMatches.length > 0) {
    addRule();
    checkPage(12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text('YOU ALSO RESONATE WITH', margin, y);
    doc.setTextColor(0);
    y += 8;

    secondaryMatches.forEach(t => {
      checkPage(16);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(t.label + ' (' + t.percent + '%)', margin, y);
      y += 7;
      if (THEORY_BLURBS[t.key]) {
        addWrapped(THEORY_BLURBS[t.key], 10, 'normal', 0);
        y += 3;
      }
    });
  }

  // ── Other Affinities (30-39%) ──
  if (!noStrongAffinity && otherAffinities.length > 0) {
    addRule();
    checkPage(12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text('OTHER AFFINITIES', margin, y);
    doc.setTextColor(0);
    y += 8;

    otherAffinities.forEach(t => {
      checkPage(7);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(t.label + ' (' + t.percent + '%)', margin + 5, y);
      y += 6;
    });
    y += 2;
  }

  // ── Axes Scores ──
  addRule();
  checkPage(12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('AXES SCORES', margin, y);
  doc.setTextColor(0);
  y += 8;

  const axisEntries = [
    { key: 'materialIdeational', label: 'Material \u2190 \u2192 Ideational' },
    { key: 'structureAgency', label: 'Structure \u2190 \u2192 Agency' },
    { key: 'immediateStructural', label: 'Immediate \u2190 \u2192 Structural' },
    { key: 'reformTransform', label: 'Reform \u2190 \u2192 Transform' },
  ];

  axisEntries.forEach(({ key, label }) => {
    const ax = axes[key];
    if (!ax) return;
    checkPage(7);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin + 5, y);
    doc.setFont('helvetica', 'normal');
    const scoreStr = (ax.score > 0 ? '+' : '') + ax.score + '  (' + ax.category + ')';
    doc.text(scoreStr, margin + 85, y);
    y += 7;
  });
  y += 4;

  // ── Active Tags (score >= 2) ──
  const activeTags = Object.entries(tags)
    .map(([key, t]) => ({ key, ...t }))
    .filter(t => t.score >= 2)
    .sort((a, b) => b.score - a.score);

  if (activeTags.length > 0) {
    addRule();
    checkPage(12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text('ACTIVE DIAGNOSTIC TAGS', margin, y);
    doc.setTextColor(0);
    y += 8;

    activeTags.forEach(t => {
      checkPage(7);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(t.label + ':  ' + t.score + '/' + t.max, margin + 5, y);
      y += 6;
    });
  }

  // ── Add final page number ──
  addPageNumber();

  // ── Save ──
  doc.save('ir-theory-compass-results-' + new Date().toISOString().slice(0, 10) + '.pdf');
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getOptionLabel(index) {
  return String.fromCharCode(65 + index);
}

// ─── SUBCOMPONENTS ──────────────────────────────────────────────────────────

function ProgressBar({ current, total }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
          fontSize: 13,
          color: '#94a3b8',
          fontFamily: "'Georgia', serif",
          letterSpacing: '0.04em',
        }}
      >
        <span>
          QUESTION {current + 1} OF {total}
        </span>
        <span>{pct}% COMPLETE</span>
      </div>
      <div style={{ height: 3, background: '#1e293b', borderRadius: 2 }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #4A6FA5, #2E7D4F)',
            borderRadius: 2,
            transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

function SchemaTag({ schema, color }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
      }}
    >
      <div
        style={{ width: 8, height: 8, borderRadius: '50%', background: color }}
      />
      <span
        style={{
          fontSize: 12,
          fontFamily: "'Georgia', serif",
          letterSpacing: '0.12em',
          color: '#64748b',
          textTransform: 'uppercase',
        }}
      >
        {schema}
      </span>
    </div>
  );
}

function TypeBadge({ type }) {
  const labels = {
    rank2: 'Rank top 2',
    rank3: 'Rank top 3',
    forced: 'Select one',
    likert: 'Agreement scale',
  };
  const colours = {
    rank2: '#7C4A9E',
    rank3: '#7C4A9E',
    forced: '#B45309',
    likert: '#0F766E',
  };
  return (
    <span
      style={{
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: 'monospace',
        color: colours[type] || '#64748b',
        background: '#0f172a',
        border: `1px solid ${colours[type] || '#334155'}`,
        padding: '2px 8px',
        borderRadius: 3,
      }}
    >
      {labels[type] || type}
    </span>
  );
}

function ForcedChoice({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map((opt, i) => {
        const label = getOptionLabel(i);
        const selected = value === i;
        return (
          <button
            key={i}
            onClick={() => onChange(selected ? null : i)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              background: selected
                ? 'rgba(74,111,165,0.15)'
                : 'rgba(255,255,255,0.03)',
              border: selected
                ? '1px solid rgba(74,111,165,0.6)'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '14px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              color: 'inherit',
            }}
          >
            <span
              style={{
                minWidth: 26,
                height: 26,
                borderRadius: 5,
                background: selected ? '#4A6FA5' : 'rgba(255,255,255,0.06)',
                border: selected ? 'none' : '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: selected ? '#fff' : '#64748b',
                fontFamily: 'monospace',
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                color: selected ? '#e2e8f0' : '#94a3b8',
                fontFamily: "'Georgia', serif",
              }}
            >
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LikertScale({ value, onChange, labels }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(selected ? null : n)}
              style={{
                flex: 1,
                aspectRatio: '1',
                borderRadius: 8,
                border: selected
                  ? '2px solid #4A6FA5'
                  : '1px solid rgba(255,255,255,0.1)',
                background: selected ? '#4A6FA5' : 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 700,
                color: selected ? '#fff' : '#475569',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 12,
            color: '#475569',
            fontFamily: "'Georgia', serif",
          }}
        >
          {labels[0]}
        </span>
        <span
          style={{
            fontSize: 12,
            color: '#475569',
            fontFamily: "'Georgia', serif",
          }}
        >
          {labels[4]}
        </span>
      </div>
    </div>
  );
}

function RankingInput({ options, value, onChange, maxRank }) {
  const handleClick = (optIndex) => {
    const pos = value.indexOf(optIndex);
    if (pos !== -1) {
      onChange(value.filter((_, i) => i !== pos));
    } else if (value.length < maxRank) {
      onChange([...value, optIndex]);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.length < maxRank && (
        <div
          style={{
            fontSize: 13,
            color: '#475569',
            fontFamily: "'Georgia', serif",
            marginBottom: 4,
            fontStyle: 'italic',
          }}
        >
          Select {maxRank - value.length} more option
          {maxRank - value.length !== 1 ? 's' : ''}
        </div>
      )}
      {options.map((opt, i) => {
        const rankPos = value.indexOf(i);
        const isSelected = rankPos !== -1;
        const rankNum = rankPos + 1;
        const isFull = value.length >= maxRank && !isSelected;
        return (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={isFull}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              background: isSelected
                ? 'rgba(124,74,158,0.15)'
                : 'rgba(255,255,255,0.03)',
              border: isSelected
                ? '1px solid rgba(124,74,158,0.5)'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '14px 16px',
              cursor: isFull ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              opacity: isFull ? 0.35 : 1,
              color: 'inherit',
            }}
          >
            <span
              style={{
                minWidth: 28,
                height: 28,
                borderRadius: 6,
                background: isSelected ? '#7C4A9E' : 'rgba(255,255,255,0.06)',
                border: isSelected
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
                color: isSelected ? '#fff' : '#475569',
                flexShrink: 0,
                marginTop: 1,
                transition: 'all 0.15s ease',
              }}
            >
              {isSelected ? rankNum : getOptionLabel(i)}
            </span>
            <span
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                color: isSelected ? '#e2e8f0' : '#94a3b8',
                fontFamily: "'Georgia', serif",
              }}
            >
              {opt}
            </span>
          </button>
        );
      })}
      {value.length > 0 && (
        <button
          onClick={() => onChange([])}
          style={{
            alignSelf: 'flex-start',
            marginTop: 4,
            fontSize: 12,
            color: '#475569',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Georgia', serif",
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Clear ranking
        </button>
      )}
    </div>
  );
}

// ─── RESULTS COMPONENT ──────────────────────────────────────────────────────

function AxisBar({ axisKey, axisData, config, explanation }) {
  const { score, category } = axisData;
  const [lo, hi] = config.range;
  const pct = ((score - lo) / (hi - lo)) * 100;
  return (
    <div style={{ marginBottom: 28 }}>
      {/* Title centered above */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: '#cbd5e1',
            fontFamily: "'Georgia', serif",
          }}
        >
          {config.leftLabel} ← → {config.rightLabel}
        </span>
        <span
          style={{
            fontSize: 12,
            color: config.schemaColor,
            fontFamily: 'monospace',
          }}
        >
          {category} ({score > 0 ? '+' : ''}{score})
        </span>
      </div>
      {/* Left label — Bar — Right label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontSize: 12,
            color: config.schemaColor,
            fontFamily: "'Georgia', serif",
            whiteSpace: 'nowrap',
            minWidth: 60,
            textAlign: 'right',
          }}
        >
          ← {config.leftLabel}
        </span>
        <div
          style={{
            position: 'relative',
            height: 28,
            flex: 1,
            background: '#1e293b',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${config.schemaColor}aa, ${config.schemaColor})`,
              borderRadius: 14,
              transition: 'width 0.6s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 1,
              background: 'rgba(255,255,255,0.15)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `calc(${pct}% - 10px)`,
              top: 4,
              width: 20,
              height: 20,
              background: '#fff',
              borderRadius: '50%',
              boxShadow: `0 0 0 3px ${config.schemaColor}`,
              transition: 'left 0.6s ease',
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            color: config.schemaColor,
            fontFamily: "'Georgia', serif",
            whiteSpace: 'nowrap',
            minWidth: 60,
            textAlign: 'left',
          }}
        >
          {config.rightLabel} →
        </span>
      </div>
      {/* Explanation text */}
      {explanation && (
        <p
          style={{
            fontSize: 13,
            color: '#64748b',
            fontFamily: "'Georgia', serif",
            lineHeight: 1.6,
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          {explanation}
        </p>
      )}
    </div>
  );
}

function QuadrantGraph({
  xScore, yScore, xRange, yRange,
  xLeftLabel, xRightLabel, yBottomLabel, yTopLabel,
  quadrantLabels, // { tl, tr, bl, br }
  accentColor,
  labelColor, // lighter version of accent for quadrant labels
  xCategory, yCategory,
}) {
  const SIZE = 368;
  const PAD = 50; // padding for labels
  const INNER = SIZE - PAD * 2;

  // Normalize scores to 0..1 within their ranges
  const xNorm = (xScore - xRange[0]) / (xRange[1] - xRange[0]);
  const yNorm = (yScore - yRange[0]) / (yRange[1] - yRange[0]);

  // Pixel positions (x: left to right, y: bottom to top → SVG inverts y)
  const dotX = PAD + xNorm * INNER;
  const dotY = PAD + (1 - yNorm) * INNER;

  // Center crosshair positions
  const cx0 = (0 - xRange[0]) / (xRange[1] - xRange[0]);
  const cy0 = (0 - yRange[0]) / (yRange[1] - yRange[0]);
  const centerX = PAD + cx0 * INNER;
  const centerY = PAD + (1 - cy0) * INNER;

  // Background grid tint derived from accent
  const gridTint = accentColor + '1a'; // ~10% opacity hex

  const axisLabelStyle = { fill: accentColor, fontSize: 11.5, fontFamily: 'monospace', fontWeight: 600 };
  const quadText = { fill: labelColor || accentColor, fontSize: 11, fontFamily: "'Georgia', serif", textAnchor: 'middle', opacity: 0.85 };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
        {/* Background */}
        <rect x={PAD} y={PAD} width={INNER} height={INNER} fill="#0f172a" rx={4} />

        {/* Background grid (tinted) */}
        {[0.25, 0.5, 0.75].map(f => (
          <g key={f}>
            <line x1={PAD + f * INNER} y1={PAD} x2={PAD + f * INNER} y2={PAD + INNER}
              stroke={gridTint} strokeWidth={1} />
            <line x1={PAD} y1={PAD + f * INNER} x2={PAD + INNER} y2={PAD + f * INNER}
              stroke={gridTint} strokeWidth={1} />
          </g>
        ))}

        {/* Center crosshairs */}
        <line x1={centerX} y1={PAD} x2={centerX} y2={PAD + INNER}
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />
        <line x1={PAD} y1={centerY} x2={PAD + INNER} y2={centerY}
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />

        {/* Quadrant labels */}
        <text x={PAD + INNER * 0.25} y={PAD + INNER * 0.22} {...quadText}>{quadrantLabels.tl}</text>
        <text x={PAD + INNER * 0.75} y={PAD + INNER * 0.22} {...quadText}>{quadrantLabels.tr}</text>
        <text x={PAD + INNER * 0.25} y={PAD + INNER * 0.82} {...quadText}>{quadrantLabels.bl}</text>
        <text x={PAD + INNER * 0.75} y={PAD + INNER * 0.82} {...quadText}>{quadrantLabels.br}</text>

        {/* Axis labels — brighter, using accent color */}
        <text x={PAD} y={PAD - 8} {...axisLabelStyle} textAnchor="start">{xLeftLabel} ←</text>
        <text x={PAD + INNER} y={PAD - 8} {...axisLabelStyle} textAnchor="end">→ {xRightLabel}</text>
        <text x={PAD - 6} y={PAD + 4} {...axisLabelStyle} textAnchor="end" transform={`rotate(-90, ${PAD - 6}, ${PAD + 4})`}>{yTopLabel} ↑</text>
        <text x={PAD - 6} y={PAD + INNER} {...axisLabelStyle} textAnchor="start" transform={`rotate(-90, ${PAD - 6}, ${PAD + INNER})`}>↓ {yBottomLabel}</text>

        {/* Border — accent colored */}
        <rect x={PAD} y={PAD} width={INNER} height={INNER}
          fill="none" stroke={accentColor} strokeWidth={2} rx={4} opacity={0.5} />

        {/* User position dot — glow + white border */}
        <circle cx={dotX} cy={dotY} r={16} fill={accentColor} opacity={0.12} />
        <circle cx={dotX} cy={dotY} r={10} fill={accentColor} opacity={0.25} />
        <circle cx={dotX} cy={dotY} r={6} fill={accentColor} stroke="#fff" strokeWidth={2} />

        {/* Score label near dot */}
        <text
          x={dotX + (xNorm > 0.75 ? -12 : 12)}
          y={dotY + (yNorm < 0.25 ? -16 : 18)}
          fill="#e2e8f0"
          fontSize={12.5}
          fontFamily="monospace"
          fontWeight={600}
          textAnchor={xNorm > 0.75 ? 'end' : 'start'}
        >
          ({xScore > 0 ? '+' : ''}{xScore}, {yScore > 0 ? '+' : ''}{yScore})
        </text>
      </svg>
    </div>
  );
}

function CalculationDebug({ answers }) {
  const [expanded, setExpanded] = useState(false);
  const report = useMemo(() => generateCalculationReport(answers), [answers]);

  const handleExport = () => {
    const json = generateExportJSON(answers);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ir-compass-results-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDF = () => {
    generateResultsPDF(answers);
  };

  const btnStyle = {
    padding: '10px 18px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'monospace',
    letterSpacing: '0.04em',
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={handlePDF} style={btnStyle}>
          Download Results (PDF)
        </button>
        <button onClick={handleExport} style={btnStyle}>
          Export Calculation Details (JSON)
        </button>
        <button onClick={() => setExpanded(e => !e)} style={btnStyle}>
          {expanded ? '▾ Hide' : '▸ Show'} Calculation Breakdown
        </button>
      </div>
      {expanded && (
        <pre
          style={{
            marginTop: 16,
            padding: 20,
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.6,
            color: '#94a3b8',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 600,
            overflow: 'auto',
          }}
        >
          {report}
        </pre>
      )}
    </div>
  );
}

function Results({ scoring, answers }) {
  const { progress, axes, subDiagnostics, tags, theories, warningFlags } = scoring;

  // ─── Tiered theory display logic ───────────────────────────────────────────
  // 1) Exclude Left-Ecomodernism from the main sorted list; handle it separately
  // 2) Top match gets full profile reading
  // 3) Secondary (40-60%) get brief blurbs
  // 4) Other (30-39%) get name + % only
  // 5) <30% hidden entirely

  const allTheories = Object.entries(theories)
    .map(([key, t]) => ({ key, ...t }))
    .sort((a, b) => b.percent - a.percent);

  // Left-Ecomodernism special handling
  const leftEco = theories.leftEcomodernism;
  const nonLeftEco = allTheories.filter(t => t.key !== 'leftEcomodernism');
  const highestNonLeftEco = nonLeftEco[0];

  // Left-Eco only shows when it IS the top or tied-top score AND >= 35%
  const showLeftEco = leftEco && leftEco.percent >= 35 &&
    leftEco.percent >= (highestNonLeftEco ? highestNonLeftEco.percent : 0);

  // The "featured" full-profile theory is always the highest NON-Left-Eco theory
  const topTheory = highestNonLeftEco;

  // Remaining non-Left-Eco theories (excluding the top one)
  const remaining = nonLeftEco.slice(1);
  const secondaryMatches = remaining.filter(t => t.percent >= 40 && t.percent <= 60);
  const otherAffinities = remaining.filter(t => t.percent >= 30 && t.percent < 40);

  // Edge-case flags
  const noStrongAffinity = !topTheory || topTheory.percent < 30; // no theory above 30%
  const noneAbove40 = topTheory && topTheory.percent < 40; // top theory below 40% — skip secondary section

  // Tag entries sorted by score descending
  const sortedTags = Object.entries(tags)
    .map(([key, t]) => ({ key, ...t }))
    .sort((a, b) => b.score - a.score);

  // Sub-diagnostic entries (non-categorical)
  const numericDiags = [
    { key: 'epistemology', label: 'Epistemology' },
    { key: 'structuresDomination', label: 'Structures Reproduce Domination' },
    { key: 'feministIR', label: 'Feminist IR' },
    { key: 'historicity', label: 'Historicity / System Ontology' },
    { key: 'epistemicAuthority', label: 'Epistemic Authority' },
  ];

  return (
    <div style={{ color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 41, marginBottom: 12 }}>🧭</div>
        <h2
          style={{
            fontSize: 27,
            fontFamily: "'Georgia', serif",
            fontWeight: 400,
            margin: '0 0 8px',
            color: '#f1f5f9',
          }}
        >
          Your IR Theory Compass
        </h2>
        <p
          style={{
            color: '#64748b',
            fontSize: 14,
            fontFamily: "'Georgia', serif",
            margin: 0,
          }}
        >
          Based on {progress.answered} of {progress.total} questions answered
        </p>
      </div>

      {/* ═══ YOUR THEORETICAL PROFILE ═══ */}

      {/* ─── No strong affinity message (all theories <30%) ─── */}
      {noStrongAffinity && (
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.12em',
              color: '#94a3b8',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
              marginBottom: 16,
            }}
          >
            Your Theoretical Profile
          </div>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: '#cbd5e1',
              fontFamily: "'Georgia', serif",
            }}
          >
            Your responses don&rsquo;t align strongly with any single theoretical tradition. This means you&rsquo;re drawn equally to multiple traditions, or that you&rsquo;re still exploring these ideas. Check back at the end of the course to see if your ideas have changed.
          </p>
        </div>
      )}

      {/* ─── Top Match: Full Profile Reading ─── */}
      {!noStrongAffinity && topTheory && THEORY_PROFILES[topTheory.key] && (() => {
        const profile = THEORY_PROFILES[topTheory.key];
        return (
          <div style={{ marginBottom: 36 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: '0.12em',
                color: '#94a3b8',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                marginBottom: 20,
              }}
            >
              Your strongest affinity
            </div>

            {/* Emoji + Title + Percentage */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 32, marginRight: 12 }}>{profile.emoji}</span>
              <span
                style={{
                  fontSize: 24,
                  fontFamily: "'Georgia', serif",
                  fontWeight: 400,
                  color: '#f1f5f9',
                }}
              >
                {profile.heading} &mdash; {topTheory.percent}%
              </span>
            </div>

            {/* Body paragraphs */}
            {profile.body.map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: '#cbd5e1',
                  fontFamily: "'Georgia', serif",
                  marginBottom: 16,
                }}
              >
                {para}
              </p>
            ))}

            {/* Watch out */}
            {profile.watchOut && (
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: '#fbbf24',
                  fontFamily: "'Georgia', serif",
                  marginBottom: 20,
                  fontStyle: 'italic',
                }}
              >
                {profile.watchOut}
              </p>
            )}

            {/* Theorists you'd vibe with */}
            {profile.vibeWith && profile.vibeWith.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#94a3b8',
                    fontFamily: "'Georgia', serif",
                    marginBottom: 8,
                  }}
                >
                  Theorists you&rsquo;d vibe with:
                </div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {profile.vibeWith.map((t, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: '#94a3b8',
                        fontFamily: "'Georgia', serif",
                        marginBottom: 4,
                      }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Theorists who'd challenge you */}
            {profile.challengeYou && profile.challengeYou.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#94a3b8',
                    fontFamily: "'Georgia', serif",
                    marginBottom: 8,
                  }}
                >
                  Theorists who&rsquo;d challenge you:
                </div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {profile.challengeYou.map((t, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: '#94a3b8',
                        fontFamily: "'Georgia', serif",
                        marginBottom: 4,
                      }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quote */}
            {profile.quote && (
              <div
                style={{
                  borderLeft: '3px solid #4A6FA5',
                  paddingLeft: 16,
                  marginTop: 20,
                  marginBottom: 8,
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    fontStyle: 'italic',
                    color: '#94a3b8',
                    fontFamily: "'Georgia', serif",
                    margin: '0 0 4px',
                    lineHeight: 1.6,
                  }}
                >
                  &ldquo;{profile.quote.text}&rdquo;
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: '#64748b',
                    fontFamily: "'Georgia', serif",
                    margin: 0,
                  }}
                >
                  &mdash; {profile.quote.attribution}
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* ─── Left-Ecomodernism (shown second, only when it's the top score) ─── */}
      {!noStrongAffinity && showLeftEco && THEORY_PROFILES.leftEcomodernism && (() => {
        const profile = THEORY_PROFILES.leftEcomodernism;
        return (
          <div style={{ marginBottom: 36 }}>
            <div
              style={{
                borderTop: '1px solid #334155',
                paddingTop: 24,
                marginTop: 8,
              }}
            >
              {/* Emoji + Title + Percentage */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 32, marginRight: 12 }}>{profile.emoji}</span>
                <span
                  style={{
                    fontSize: 24,
                    fontFamily: "'Georgia', serif",
                    fontWeight: 400,
                    color: '#f1f5f9',
                  }}
                >
                  {profile.heading} &mdash; {leftEco.percent}%
                </span>
              </div>

              {/* Body paragraphs */}
              {profile.body.map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: '#cbd5e1',
                    fontFamily: "'Georgia', serif",
                    marginBottom: 16,
                  }}
                >
                  {para}
                </p>
              ))}

              {/* Watch out */}
              {profile.watchOut && (
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: '#fbbf24',
                    fontFamily: "'Georgia', serif",
                    marginBottom: 20,
                    fontStyle: 'italic',
                  }}
                >
                  {profile.watchOut}
                </p>
              )}

              {/* Theorists you'd vibe with */}
              {profile.vibeWith && profile.vibeWith.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#94a3b8',
                      fontFamily: "'Georgia', serif",
                      marginBottom: 8,
                    }}
                  >
                    Theorists you&rsquo;d vibe with:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {profile.vibeWith.map((t, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: '#94a3b8',
                          fontFamily: "'Georgia', serif",
                          marginBottom: 4,
                        }}
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ─── Secondary Matches (40-60%): brief blurbs (skip if top theory <40%) ─── */}
      {!noStrongAffinity && !noneAbove40 && secondaryMatches.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              borderTop: '1px solid #334155',
              paddingTop: 24,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: '0.12em',
                color: '#94a3b8',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                marginBottom: 16,
              }}
            >
              You also resonate with
            </div>
            {secondaryMatches.map((t) => (
              <div key={t.key} style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontFamily: "'Georgia', serif",
                    fontWeight: 400,
                    color: '#f1f5f9',
                    marginBottom: 6,
                  }}
                >
                  {t.label} ({t.percent}%)
                </div>
                {THEORY_BLURBS[t.key] && (
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: '#94a3b8',
                      fontFamily: "'Georgia', serif",
                      margin: 0,
                    }}
                  >
                    {THEORY_BLURBS[t.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Other Affinities (30-39%): name + % only ─── */}
      {!noStrongAffinity && otherAffinities.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              borderTop: '1px solid #334155',
              paddingTop: 24,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: '0.12em',
                color: '#94a3b8',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                marginBottom: 12,
              }}
            >
              Other affinities
            </div>
            {otherAffinities.map((t) => (
              <div
                key={t.key}
                style={{
                  fontSize: 14,
                  fontFamily: "'Georgia', serif",
                  color: '#64748b',
                  marginBottom: 6,
                }}
              >
                {t.label} ({t.percent}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schema 1 Axes */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.12em',
            color: '#4A6FA5',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            marginBottom: 16,
          }}
        >
          Schema 1 — Explanatory Worldview
        </div>
        <QuadrantGraph
          xScore={axes.materialIdeational.score}
          yScore={axes.structureAgency.score}
          xRange={AXIS_SCORING.materialIdeational.range}
          yRange={AXIS_SCORING.structureAgency.range}
          xLeftLabel="Material"
          xRightLabel="Ideational"
          yBottomLabel="Structure"
          yTopLabel="Agency"
          quadrantLabels={{
            tl: 'Material + Agency',
            tr: 'Ideational + Agency',
            bl: 'Material + Structure',
            br: 'Ideational + Structure',
          }}
          accentColor="#4A6FA5"
          labelColor="#6B8DD6"
          xCategory={axes.materialIdeational.category}
          yCategory={axes.structureAgency.category}
        />
        <AxisBar
          axisKey="materialIdeational"
          axisData={axes.materialIdeational}
          config={AXIS_SCORING.materialIdeational}
          explanation="This axis measures what you think drives world politics. Material explanations emphasize economic interests, military power, and tangible resources. Ideational explanations emphasize ideas, norms, identities, and cultural beliefs."
        />
        <AxisBar
          axisKey="structureAgency"
          axisData={axes.structureAgency}
          config={AXIS_SCORING.structureAgency}
          explanation="This axis measures whether you see outcomes as determined by large structural forces (like the international system, capitalism, or institutions) or by the choices and actions of leaders, groups, and movements."
        />
      </div>

      {/* Schema 2 Axes */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.12em',
            color: '#2E7D4F',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            marginBottom: 16,
          }}
        >
          Schema 2 — Normative-Political Orientation
        </div>
        <QuadrantGraph
          xScore={axes.immediateStructural.score}
          yScore={axes.reformTransform.score}
          xRange={AXIS_SCORING.immediateStructural.range}
          yRange={AXIS_SCORING.reformTransform.range}
          xLeftLabel="Immediate"
          xRightLabel="Structural"
          yBottomLabel="Reform"
          yTopLabel="Transform"
          quadrantLabels={{
            tl: 'Immediate + Transform',
            tr: 'Structural + Transform',
            bl: 'Immediate + Reform',
            br: 'Structural + Reform',
          }}
          accentColor="#2E7D4F"
          labelColor="#4CAF7C"
          xCategory={axes.immediateStructural.category}
          yCategory={axes.reformTransform.category}
        />
        <AxisBar
          axisKey="immediateStructural"
          axisData={axes.immediateStructural}
          config={AXIS_SCORING.immediateStructural}
          explanation="This axis captures how you explain global inequality and injustice. Immediate responsibility focuses on poor governance or individual choices. Structural injustice emphasizes historical exploitation, colonialism, and ongoing systemic domination."
        />
        <AxisBar
          axisKey="reformTransform"
          axisData={axes.reformTransform}
          config={AXIS_SCORING.reformTransform}
          explanation="This axis shows whether you favour working within existing institutions to improve them (reform) or believe fundamental system change is needed (transform). It reflects your vision for how global justice can or should be achieved."
        />
      </div>

      {/* Sub-Diagnostics — hidden from display */}
      {false && <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.12em',
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            marginBottom: 16,
          }}
        >
          Sub-Diagnostics
        </div>

        {numericDiags.map(({ key, label }) => {
          const d = subDiagnostics[key];
          if (!d || d.range == null) return null;
          const [lo, hi] = d.range;
          const pct = ((d.score - lo) / (hi - lo)) * 100;
          return (
            <div key={key} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: '#cbd5e1',
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    fontFamily: 'monospace',
                  }}
                >
                  {d.category} ({d.score > 0 ? '+' : ''}{d.score})
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: '#1e293b',
                  borderRadius: 2,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: '#64748b',
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Sovereignty — categorical */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: '#cbd5e1',
                fontFamily: "'Georgia', serif",
              }}
            >
              Sovereignty Orientation
            </span>
            <span
              style={{
                fontSize: 13,
                color: subDiagnostics.sovereignty.label ? '#94a3b8' : '#334155',
                fontFamily: 'monospace',
              }}
            >
              {subDiagnostics.sovereignty.label || 'Not answered'}
            </span>
          </div>
        </div>
      </div>}

      {/* Discussion Points (Warning Flags) — hidden from display */}
      {false && warningFlags && warningFlags.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.12em',
              color: '#94a3b8',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
              marginBottom: 16,
            }}
          >
            Discussion Points
          </div>
          <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 16, fontFamily: "'Georgia', serif" }}>
            Some of your responses might benefit from further reflection:
          </p>
          {warningFlags.map((flag, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, color: '#fbbf24', fontFamily: "'Georgia', serif" }}>
                {flag.flag}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.12em',
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            marginBottom: 14,
          }}
        >
          Diagnostic Tags
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sortedTags.map((tag) => (
            <span
              key={tag.key}
              style={{
                fontSize: 13,
                padding: '5px 12px',
                borderRadius: 20,
                border: tag.score > 0
                  ? '1px solid rgba(124,74,158,0.5)'
                  : '1px solid rgba(255,255,255,0.1)',
                background: tag.score > 0
                  ? 'rgba(124,74,158,0.15)'
                  : 'rgba(255,255,255,0.03)',
                color: tag.score > 0 ? '#cbd5e1' : '#475569',
                fontFamily: "'Georgia', serif",
              }}
            >
              {tag.label} ({tag.score}/{tag.max})
            </span>
          ))}
        </div>
      </div>

      {/* Completion note */}
      {progress.answered < progress.total && (
        <div
          style={{
            background: 'rgba(74,111,165,0.1)',
            border: '1px solid rgba(74,111,165,0.25)',
            borderRadius: 8,
            padding: '16px 18px',
            fontSize: 14,
            color: '#64748b',
            fontFamily: "'Georgia', serif",
            lineHeight: 1.6,
          }}
        >
          {progress.total - progress.answered} question
          {progress.total - progress.answered !== 1 ? 's' : ''} unanswered —
          results will become more accurate as you answer more questions.
        </div>
      )}

      {/* Export and Debug */}
      <CalculationDebug answers={answers} />
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function IRCompass() {
  const [showLanding, setShowLanding] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef(null);

  const scoring = useMemo(() => computeScoring(answers), [answers]);

  const q = QUESTIONS[current];
  const answer = answers[q.id];

  const isAnswered = () => {
    if (!q) return false;
    const a = answers[q.id];
    if (q.type === 'forced') return a !== undefined && a !== null;
    if (q.type === 'likert') return a !== undefined && a !== null;
    if (q.type === 'rank2') return Array.isArray(a) && a.length === 2;
    if (q.type === 'rank3') return Array.isArray(a) && a.length === 3;
    return false;
  };

  const setAnswer = (val) => {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };

  const navigate = (dir) => {
    setTransitioning(true);
    setTimeout(() => {
      if (dir === 'next') {
        if (current < QUESTIONS.length - 1) setCurrent((c) => c + 1);
        else setShowResults(true);
      } else {
        if (current > 0) setCurrent((c) => c - 1);
      }
      setTransitioning(false);
      if (containerRef.current) containerRef.current.scrollTop = 0;
    }, 180);
  };

  const answeredCount = scoring.progress.answered;
  const isLastQuestion = current === QUESTIONS.length - 1;

  // ─── Landing Page ───────────────────────────────────────────────
  if (showLanding) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0f1a',
          display: 'flex',
          justifyContent: 'center',
          padding: '60px 20px',
          fontFamily: "'Georgia', serif",
          color: '#e2e8f0',
        }}
      >
        <div style={{ width: '100%', maxWidth: 660 }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 53, marginBottom: 16 }}>🧭</div>
            <h1
              style={{
                fontSize: 33,
                fontWeight: 400,
                fontFamily: "'Georgia', serif",
                color: '#f1f5f9',
                margin: '0 0 12px',
                lineHeight: 1.3,
              }}
            >
              World Politics Compass
            </h1>
            <p
              style={{
                fontSize: 16,
                color: '#94a3b8',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              This diagnostic tool helps you identify your theoretical orientation
              in International Relations. It takes about 10 minutes to complete 19
              questions.
            </p>
          </div>

          {/* Start Button — prominent position */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button
              onClick={() => setShowLanding(false)}
              style={{
                padding: '16px 48px',
                fontSize: 18,
                fontFamily: "'Georgia', serif",
                fontWeight: 600,
                color: '#fff',
                background: '#4A6FA5',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3d5f8f';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4A6FA5';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Start the Compass →
            </button>
          </div>

          {/* Subtle separator */}
          <div
            style={{
              height: 1,
              background: 'rgba(148, 163, 184, 0.12)',
              marginBottom: 36,
            }}
          />

          {/* About */}
          <div style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 400,
                fontFamily: "'Georgia', serif",
                color: '#cbd5e1',
                margin: '0 0 14px',
                letterSpacing: '0.02em',
              }}
            >
              About this tool
            </h2>
            <p
              style={{
                fontSize: 15,
                color: '#94a3b8',
                lineHeight: 1.7,
                margin: '0 0 14px',
              }}
            >
              Developed by Jon Symons with assistance from Govand Khalid Azeez and colleagues in the School of
              International Studies at Macquarie University for POIR2030 and
              other units. Design and vibecoding utilised Claude by Anthropic.
            </p>
            <p
              style={{
                fontSize: 15,
                color: '#94a3b8',
                lineHeight: 1.7,
                margin: '0 0 14px',
              }}
            >
              This tool tries to map where you stand across major IR theoretical
              traditions (realism, liberalism, constructivism, Marxism, feminism,
              postcolonial theory, and others). You'll answer 19 questions about
              world politics and receive a personalised profile that should help
              you navigate international relations theories.
            </p>
            <p
              style={{
                fontSize: 15,
                color: '#94a3b8',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Try taking the quiz at the beginning and end of semester to see
              where your answers fall. Please note, the results reflect
              tendencies, not fixed identities and a diagnostic tool like this
              can't hope to capture the nuance within any individual scholar's
              work.
            </p>
          </div>

          {/* Privacy */}
          <div style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 400,
                fontFamily: "'Georgia', serif",
                color: '#cbd5e1',
                margin: '0 0 14px',
                letterSpacing: '0.02em',
              }}
            >
              Privacy
            </h2>
            <p
              style={{
                fontSize: 15,
                color: '#94a3b8',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              We currently don't capture any data you enter here. No sign-in
              required.
            </p>
          </div>

          {/* Feedback */}
          <div style={{ marginBottom: 48 }}>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 400,
                fontFamily: "'Georgia', serif",
                color: '#cbd5e1',
                margin: '0 0 14px',
                letterSpacing: '0.02em',
              }}
            >
              Feedback
            </h2>
            <p
              style={{
                fontSize: 15,
                color: '#94a3b8',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              This compass is in pilot form. If you encounter issues or have
              feedback, please email jonathan.symons [at] mq.edu.au
            </p>
          </div>

        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0f1a',
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 620 }}>
          <button
            onClick={() => {
              setShowResults(false);
              setCurrent(0);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: "'Georgia', serif",
              marginBottom: 32,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ← Start over
          </button>
          <Results scoring={scoring} answers={answers} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0f1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'Georgia', serif",
        color: '#e2e8f0',
      }}
    >
      {/* Header */}
      <div
        style={{
          width: '100%',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,15,26,0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 620,
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              color: '#475569',
              letterSpacing: '0.05em',
            }}
          >
            🧭 IR THEORY COMPASS
          </span>
          <span
            style={{ fontSize: 12, color: '#334155', fontFamily: 'monospace' }}
          >
            {answeredCount}/{QUESTIONS.length} answered
          </span>
        </div>
      </div>

      {/* Main */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: 620,
          padding: '32px 20px 120px',
          flex: 1,
        }}
      >
        <ProgressBar current={current} total={QUESTIONS.length} />

        <div
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
        >
          {/* Schema + type row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <SchemaTag schema={q.schema} color={q.schemaColor} />
            <TypeBadge type={q.type} />
          </div>

          {/* Question ID */}
          <div
            style={{
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#334155',
              letterSpacing: '0.1em',
              marginBottom: 10,
            }}
          >
            {q.id}
          </div>

          {/* Question text */}
          <h2
            style={{
              fontSize: 21,
              fontWeight: 400,
              lineHeight: 1.45,
              margin: '0 0 10px',
              color: '#f1f5f9',
            }}
          >
            {q.text}
          </h2>

          {/* Detail / note */}
          {q.detail && (
            <p
              style={{
                fontSize: 15,
                color: '#64748b',
                lineHeight: 1.6,
                margin: '0 0 20px',
                fontStyle: 'italic',
              }}
            >
              {q.detail}
            </p>
          )}
          {q.note && (
            <p
              style={{
                fontSize: 14,
                color: '#475569',
                lineHeight: 1.6,
                margin: '0 0 20px',
                fontStyle: 'italic',
              }}
            >
              {q.note}
            </p>
          )}

          {/* Instruction */}
          <div
            style={{
              fontSize: 13,
              color: q.schemaColor,
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            {q.instruction}
          </div>

          {/* Input */}
          {q.type === 'forced' && (
            <ForcedChoice
              options={q.options}
              value={answer !== undefined ? answer : null}
              onChange={setAnswer}
            />
          )}
          {q.type === 'likert' && (
            <LikertScale
              value={answer !== undefined ? answer : null}
              onChange={setAnswer}
              labels={LIKERT_LABELS}
            />
          )}
          {(q.type === 'rank2' || q.type === 'rank3') && (
            <RankingInput
              options={q.options}
              value={Array.isArray(answer) ? answer : []}
              onChange={setAnswer}
              maxRank={q.type === 'rank2' ? 2 : 3}
            />
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(10,15,26,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 20px',
        }}
      >
        <div
          style={{ maxWidth: 620, margin: '0 auto', display: 'flex', gap: 10 }}
        >
          {current > 0 && (
            <button
              onClick={() => navigate('prev')}
              style={{
                flex: 0,
                padding: '12px 22px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: 15,
                fontFamily: "'Georgia', serif",
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={() => navigate('next')}
            disabled={!isAnswered()}
            style={{
              flex: 1,
              padding: '13px 22px',
              borderRadius: 8,
              background: isAnswered()
                ? isLastQuestion
                  ? '#2E7D4F'
                  : '#4A6FA5'
                : '#1e293b',
              border: 'none',
              color: isAnswered() ? '#fff' : '#334155',
              cursor: isAnswered() ? 'pointer' : 'not-allowed',
              fontSize: 15,
              fontFamily: "'Georgia', serif",
              transition: 'all 0.2s ease',
              fontWeight: isAnswered() ? 600 : 400,
            }}
          >
            {isLastQuestion ? 'See my results →' : 'Next →'}
          </button>
        </div>
        {!isAnswered() && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button
              onClick={() => navigate('next')}
              style={{
                background: 'none',
                border: 'none',
                color: '#334155',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: "'Georgia', serif",
              }}
            >
              Skip this question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
