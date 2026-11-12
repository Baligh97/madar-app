// المخطِّط الذكي — محرك توصيات يعمل داخل التطبيق:
// يقيّم الأنشطة حسب اهتمامات الزائر ووتيرته وميزانيته ومن معه، ثم يرتبها زمنيًا
// ويحسب التنقل بينها من شبكة المسارات نفسها المستخدمة في الحجز.
import { ACTIVITIES, RESTAURANTS, MODES, findOptions, INTERESTS } from './data.js';

const SLOTS = {
  1: [['m', 570], ['lunch', 780], ['a', 930], ['dinner', 1170]],
  2: [['m', 510], ['lunch', 765], ['a', 900], ['s', 1035], ['dinner', 1185]],
  3: [['m', 480], ['m2', 645], ['lunch', 795], ['a', 915], ['s', 1040], ['dinner', 1185]],
};
const BUDGET_CAP = { 1: 260, 2: 520, 3: 99999 };
const KEYWORDS = [
  [/غوص|سباح|بحر|شعاب|سنورك|dive|swim|sea|reef|snork/i, 'sea'],
  [/هدوء|استرخاء|سبا|راحة|يوغا|relax|spa|calm|yoga/i, 'relax'],
  [/مغامر|تسلق|حماس|إثارة|adventure|climb|thrill/i, 'adventure'],
  [/أكل|طعام|مطعم|طبخ|مأكولات|food|eat|dinner|cook/i, 'food'],
  [/طبيعة|طيور|سلاحف|مانغروف|nature|bird|turtle|wild/i, 'nature'],
  [/تراث|ثقاف|تاريخ|قهوة|culture|heritage|history/i, 'culture'],
  [/نجوم|فلك|سماء|star|sky|astro/i, 'stars'],
];
const KIDS_RE = /أطفال|طفل|عائل|kids|child|family/i;

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function travel(a, b, pax, pref, at = 720) {
  if (a === b) return null;
  // respect operating hours: seaplanes fly in daylight only, boats stop at night
  const opts = findOptions(a, b, pax).filter(o => o.legs.every(l => l.mode === 'car' || (at >= MODES[l.mode].first && at <= MODES[l.mode].last)));
  if (!opts.length) return null;
  const pick = pref === 'cheap' ? [...opts].sort((x, y) => x.price - y.price)[0] : opts[0];
  return pick;
}

/**
 * prefs: { interests:[], pace:1|2|3, company:'solo'|'couple'|'family', budget:1|2|3, text:'', start:placeId, pax:n }
 * returns { items:[...], totals:{cost,travelMin,co2,activities}, notes:[] }
 */
export function generatePlan(prefs, seed = 1) {
  const rand = rng(seed * 7919 + 13);
  const pax = prefs.pax || (prefs.company === 'solo' ? 1 : prefs.company === 'couple' ? 2 : 4);
  const interests = new Set(prefs.interests || []);
  for (const [re, tag] of KEYWORDS) if (re.test(prefs.text || '')) interests.add(tag);
  const family = prefs.company === 'family' || KIDS_RE.test(prefs.text || '');
  if (!interests.size) ['sea', 'nature', 'food'].forEach(t => interests.add(t));
  const cap = BUDGET_CAP[prefs.budget || 2];
  const pref = prefs.budget === 1 ? 'cheap' : 'fast';

  let slots = SLOTS[prefs.pace || 2].map(s => [...s]);
  if (interests.has('stars')) slots.push(['n', 1290]);
  if (prefs.notBefore != null) slots = slots.filter(s => s[1] >= prefs.notBefore + 20);

  const avoid = new Set(prefs.avoid || []);
  const used = new Set(); const items = []; let here = prefs.start || 'shura'; let clock = 0; let hops = 0;
  const why = (act, tr) => {
    const hit = act.tags.find(t => interests.has(t));
    const tagName = hit && INTERESTS.find(i => i.id === hit)?.name;
    if (act.meal) return tr ? ['الأقرب إلى محطتك السابقة', 'Closest to your previous stop'] : ['في مكانك نفسه دون تنقل', 'Right where you are — no transfer'];
    if (act.win === 's' || (act.win.includes('s') && tr === null)) return ['أجمل وقت له عند الغروب', 'Best enjoyed at sunset'];
    if (tagName) return [`يناسب اهتمامك بـ«${tagName[0]}»`, `Matches your interest in ${tagName[1].toLowerCase()}`];
    return ['اختيار متوازن ليومك', 'A balanced pick for your day'];
  };

  for (const [slot, slotTime] of slots) {
    const meal = slot === 'lunch' || slot === 'dinner';
    const win = slot === 'm2' ? 'm' : slot;
    const pool = meal ? RESTAURANTS : ACTIVITIES.filter(a => a.win.includes(win));
    let best = null;
    for (const act of pool) {
      if (used.has(act.id) || avoid.has(act.id)) continue;
      const tr = travel(here, act.place, pax, pref, Math.max(clock, slotTime - 60));
      if (here !== act.place && !tr) continue;
      const tmin = tr ? tr.minutes : 0;
      let score = rand() * 1.4;
      score += act.tags.filter(t => interests.has(t)).length * 3;
      score -= tmin / (meal ? 9 : 16);
      if (family) score += act.kids ? 1.5 : -6;
      if (act.cost > cap) score -= 4 + (act.cost - cap) / 120;
      if (tr && tr.legs.some(l => l.mode !== 'car')) score -= hops >= 2 ? 5 : 0.8;
      if (meal && tmin === 0) score += 2.5;
      if (!best || score > best.score) best = { act, tr, score, tmin };
    }
    if (!best) continue;
    const { act, tr, tmin } = best;
    const depart = Math.max(clock, slotTime - tmin);
    if (tr) {
      items.push({ kind: 'leg', id: 'leg' + items.length, from: here, to: act.place, option: tr, start: depart, end: depart + tmin });
      if (tr.legs.some(l => l.mode !== 'car')) hops++;
    }
    const start = Math.max(slotTime, depart + tmin);
    items.push({ kind: meal ? 'meal' : 'act', id: act.id, act, start, end: start + act.dur, why: why(act, tr), slot });
    clock = start + act.dur + 10; here = act.place; used.add(act.id);
  }

  const acts = items.filter(i => i.kind !== 'leg'), legs = items.filter(i => i.kind === 'leg');
  const totals = {
    cost: acts.reduce((s, i) => s + i.act.cost * pax, 0) + legs.reduce((s, l) => s + l.option.price, 0),
    transport: legs.reduce((s, l) => s + l.option.price, 0),
    travelMin: legs.reduce((s, l) => s + l.option.minutes, 0),
    co2: +legs.reduce((s, l) => s + l.option.co2, 0).toFixed(1),
    activities: acts.filter(i => i.kind === 'act').length,
  };
  return { items, totals, pax, interests: [...interests], family, seed, prefs, end: here };
}

/** replace one activity with the next-best alternative in the same slot */
export function swapItem(plan, itemId) {
  return generatePlan({ ...plan.prefs, avoid: [...(plan.prefs.avoid || []), itemId] }, plan.seed);
}
