// بيانات توضيحية لوجهة البحر الأحمر — الأسماء حقيقية، والأوقات والأسعار تقديرية لأغراض العرض
// Each bilingual value is [ar, en]

export const PLACES = {
  rsi:      { id: 'rsi',      name: ['مطار البحر الأحمر الدولي', 'Red Sea International Airport'], short: ['المطار', 'Airport'],            type: 'airport', x: 78, y: 62 },
  jetty:    { id: 'jetty',    name: ['المرسى الرئيسي', 'Main Jetty'],                              short: ['المرسى', 'Jetty'],               type: 'marina',  x: 60, y: 76 },
  shura:    { id: 'shura',    name: ['جزيرة شُورى', 'Shura Island'],                               short: ['شُورى', 'Shura'],                type: 'island',  x: 44, y: 64 },
  ummahat:  { id: 'ummahat',  name: ['جزر أمهات', 'Ummahat Islands'],                              short: ['أمهات', 'Ummahat'],              type: 'island',  x: 22, y: 36 },
  sheybarah:{ id: 'sheybarah',name: ['جزيرة شيبارة', 'Sheybarah Island'],                          short: ['شيبارة', 'Sheybarah'],           type: 'island',  x: 24, y: 108 },
  turtle:   { id: 'turtle',   name: ['خليج السلاحف', 'Turtle Bay'],                                short: ['خليج السلاحف', 'Turtle Bay'],    type: 'coast',   x: 63, y: 44 },
  dunes:    { id: 'dunes',    name: ['الكثبان الجنوبية', 'Southern Dunes'],                        short: ['الكثبان', 'Dunes'],              type: 'desert',  x: 86, y: 112 },
  rock:     { id: 'rock',     name: ['ديزرت روك', 'Desert Rock'],                                  short: ['ديزرت روك', 'Desert Rock'],      type: 'mountain',x: 88, y: 30 },
};
export const PLACE_LIST = Object.values(PLACES);

// minutes
const E = (a, b, m) => [a, b, m];
export const EDGES = {
  car: [E('rsi','shura',30), E('rsi','jetty',25), E('rsi','turtle',20), E('rsi','dunes',45), E('rsi','rock',25),
        E('shura','jetty',10), E('turtle','jetty',20), E('turtle','shura',25), E('dunes','shura',60), E('rock','shura',45),
        E('rock','turtle',30), E('dunes','rock',55), E('dunes','jetty',55), E('dunes','turtle',60), E('rock','jetty',40)],
  boat: [E('jetty','ummahat',45), E('jetty','sheybarah',40), E('shura','ummahat',40), E('shura','sheybarah',45), E('ummahat','sheybarah',70)],
  seaplane: [E('rsi','ummahat',20), E('rsi','sheybarah',25), E('ummahat','sheybarah',20)],
};

export const MODES = {
  car:      { id: 'car',      name: ['سيارة كهربائية', 'Electric car'],  icon: 'car',   co2: 0,    seatBased: false, base: 60,  perMin: 2.5, every: 15, first: 0,   last: 1440, access: true },
  boat:     { id: 'boat',     name: ['قارب سريع', 'Speedboat'],          icon: 'boat',  co2: 0.35, seatBased: true,  base: 90,  perMin: 2,   every: 45, first: 420, last: 1320, access: true },
  seaplane: { id: 'seaplane', name: ['طائرة مائية', 'Seaplane'],         icon: 'plane', co2: 1.6,  seatBased: true,  base: 250, perMin: 14,  every: 120,first: 480, last: 990,  access: false },
};
export const TRANSFER_WAIT = 10;

function edgeMap(list) {
  const m = {};
  for (const [a, b, d] of list) { (m[a] ||= {})[b] = d; (m[b] ||= {})[a] = d; }
  return m;
}
const CAR = edgeMap(EDGES.car), BOAT = edgeMap(EDGES.boat), SEA = edgeMap(EDGES.seaplane);
const carTime = (a, b) => (a === b ? 0 : (CAR[a] && CAR[a][b]) ?? Infinity);

function legPrice(mode, min, pax) {
  const m = MODES[mode];
  const unit = Math.round((m.base + m.perMin * min) / 5) * 5;
  return m.seatBased ? unit * pax : unit * Math.ceil(pax / 4);
}

/** All sensible ways to go from a to b. Returns [{id, kind, legs:[{mode,from,to,min}], minutes, price, co2}] */
export function findOptions(a, b, pax = 1) {
  if (a === b) return [];
  const out = [];
  const build = (kind, legs) => {
    const ride = legs.reduce((s, l) => s + l.min, 0);
    const minutes = ride + TRANSFER_WAIT * (legs.length - 1);
    const price = legs.reduce((s, l) => s + legPrice(l.mode, l.min, pax), 0);
    const co2 = +(legs.reduce((s, l) => s + MODES[l.mode].co2 * l.min, 0) * pax).toFixed(1);
    out.push({ id: kind + ':' + legs.map(l => l.mode[0] + l.from + l.to).join('-'), kind, legs, minutes, price, co2 });
  };
  if (carTime(a, b) < Infinity) build('car', [{ mode: 'car', from: a, to: b, min: carTime(a, b) }]);
  for (const [kind, M] of [['boat', BOAT], ['seaplane', SEA]]) {
    let best = null;
    for (const u of Object.keys(M)) for (const v of Object.keys(M[u])) {
      const pre = carTime(a, u), post = carTime(v, b);
      if (pre === Infinity || post === Infinity) continue;
      const legs = [];
      if (pre) legs.push({ mode: 'car', from: a, to: u, min: pre });
      legs.push({ mode: kind, from: u, to: v, min: M[u][v] });
      if (post) legs.push({ mode: 'car', from: v, to: b, min: post });
      const total = legs.reduce((s, l) => s + l.min, 0) + TRANSFER_WAIT * (legs.length - 1);
      if (!best || total < best.total) best = { total, legs };
    }
    if (best) build(kind, best.legs);
  }
  // drop a combined option that is slower AND pricier than plain car
  const car = out.find(o => o.kind === 'car');
  return out.filter(o => o === car || !car || o.minutes < car.minutes || o.legs.length === 1).sort((x, y) => x.minutes - y.minutes);
}

/** next departures (minutes from midnight) for an option, after `fromMin` */
export function departures(option, fromMin, count = 4) {
  const main = option.legs.find(l => l.mode !== 'car') || option.legs[0];
  const m = MODES[main.mode];
  const lead = option.legs.slice(0, option.legs.indexOf(main)).reduce((s, l) => s + l.min + TRANSFER_WAIT, 0);
  const res = [];
  let t = Math.max(m.first, Math.ceil((fromMin + lead) / m.every) * m.every);
  while (res.length < count && t <= m.last) { res.push(t - lead); t += m.every; }
  return res;
}

export const fmtTime = (min, lang = 'ar') => {
  min = ((Math.round(min) % 1440) + 1440) % 1440;
  const h = Math.floor(min / 60), m = min % 60, h12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = lang === 'ar' ? (h < 12 ? 'ص' : 'م') : (h < 12 ? 'AM' : 'PM');
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};
export const fmtDur = (min, lang = 'ar') => {
  const h = Math.floor(min / 60), m = min % 60;
  if (lang === 'ar') return h ? (m ? `${h} س ${m} د` : `${h} س`) : `${m} دقيقة`;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m} min`;
};

// ---------------- activities for the smart planner ----------------
export const INTERESTS = [
  { id: 'sea',     name: ['بحر وغوص', 'Sea & diving'],        icon: 'fish' },
  { id: 'relax',   name: ['استرخاء وسبا', 'Relax & spa'],     icon: 'spa' },
  { id: 'adventure', name: ['مغامرة', 'Adventure'],           icon: 'mountain' },
  { id: 'food',    name: ['طعام', 'Food'],                    icon: 'food' },
  { id: 'nature',  name: ['طبيعة وحياة فطرية', 'Nature'],     icon: 'leaf' },
  { id: 'culture', name: ['ثقافة وتراث', 'Culture'],          icon: 'culture' },
  { id: 'stars',   name: ['نجوم وفلك', 'Stargazing'],         icon: 'stars' },
];

// win: m=morning, a=afternoon, s=sunset, n=night
const A = (id, ar, en, place, tags, dur, win, cost, kids, icon, dar, den) => ({ id, name: [ar, en], place, tags, dur, win, cost, kids, icon, desc: [dar, den] });
export const ACTIVITIES = [
  A('dive',   'غوص في الشعاب المرجانية', 'Coral reef diving', 'ummahat', ['sea', 'adventure', 'nature'], 150, 'm', 650, false, 'fish', 'غوص مع مدرب معتمد بين شعاب لم تُمس.', 'Guided dive on untouched reefs.'),
  A('snork',  'سنوركلينغ مع السلاحف', 'Snorkelling with turtles', 'sheybarah', ['sea', 'nature'], 120, 'ma', 280, true, 'fish', 'سباحة سطحية في مياه ضحلة صافية.', 'Shallow, clear-water snorkelling.'),
  A('kayak',  'كاياك بين أشجار المانغروف', 'Mangrove kayaking', 'shura', ['nature', 'adventure', 'sea'], 90, 'ms', 180, true, 'kayak', 'تجديف هادئ في قنوات المانغروف.', 'A calm paddle through mangrove channels.'),
  A('spa',    'جلسة سبا صحراوية', 'Desert spa session', 'dunes', ['relax'], 120, 'a', 750, false, 'spa', 'علاجات مستوحاة من أعشاب المنطقة.', 'Treatments inspired by local botanicals.'),
  A('yoga',   'يوغا عند الشروق', 'Sunrise yoga', 'shura', ['relax'], 60, 'm', 120, false, 'yoga', 'جلسة على الشاطئ مع أول ضوء.', 'A beach session at first light.'),
  A('safari', 'سفاري الكثبان بعربات كهربائية', 'Electric dune safari', 'dunes', ['adventure', 'nature'], 120, 'as', 420, true, 'buggy', 'جولة صامتة بين الكثبان حتى الغروب.', 'A silent ride through the dunes.'),
  A('climb',  'مسار جبلي وتسلق', 'Mountain trail & climb', 'rock', ['adventure', 'nature'], 150, 'm', 380, false, 'mountain', 'مسار مع مرشد وإطلالات على الوادي.', 'Guided trail with valley views.'),
  A('zip',    'الانزلاق بالحبل', 'Zipline', 'rock', ['adventure'], 60, 'a', 300, true, 'bolt', 'انزلاق بين الصخور بسرعة آمنة.', 'A safe, fast glide between the rocks.'),
  A('stars',  'مراقبة النجوم مع مرشد فلكي', 'Guided stargazing', 'dunes', ['stars', 'nature', 'culture'], 90, 'n', 260, true, 'stars', 'سماء معتمة وتلسكوبات ومنازل القمر.', 'Dark skies, telescopes and star lore.'),
  A('stars2', 'ليلة النجوم في الوادي', 'Valley night sky', 'rock', ['stars', 'relax'], 75, 'n', 220, true, 'stars', 'جلسة تأمل تحت درب التبانة.', 'A quiet session under the Milky Way.'),
  A('sunset', 'رحلة قارب عند الغروب', 'Sunset cruise', 'jetty', ['sea', 'relax'], 90, 's', 390, true, 'sail', 'إبحار هادئ مع ضيافة خفيفة.', 'A gentle sail with light refreshments.'),
  A('sup',    'التجديف وقوفًا', 'Stand-up paddle', 'ummahat', ['sea', 'relax'], 60, 'ma', 160, true, 'kayak', 'مياه ساكنة تناسب المبتدئين.', 'Flat water, beginner friendly.'),
  A('birds',  'جولة الطيور والحياة الفطرية', 'Birds & wildlife tour', 'ummahat', ['nature'], 90, 'm', 200, true, 'leaf', 'مشاهدة الطيور المهاجرة مع مختص.', 'Spot migratory birds with a ranger.'),
  A('cook',   'ورشة طهي مع الشيف', 'Chef cooking class', 'shura', ['food', 'culture'], 120, 'a', 350, true, 'food', 'أطباق حجازية بمكونات محلية.', 'Hijazi dishes with local produce.'),
  A('sail',   'إبحار شراعي', 'Sailing', 'shura', ['sea', 'adventure'], 120, 'a', 520, false, 'sail', 'تعلّم الأساسيات مع قبطان.', 'Learn the ropes with a skipper.'),
  A('herit',  'تراث البحر وصناعة القوارب', 'Sea heritage tour', 'turtle', ['culture'], 90, 'ma', 150, true, 'culture', 'حكايات الصيادين وصناعة السنبوك.', 'Fishermen stories and dhow craft.'),
  A('coffee', 'قهوة سعودية وجلسة حكواتي', 'Saudi coffee & storytelling', 'dunes', ['culture', 'food'], 60, 'as', 90, true, 'coffee', 'قهوة وتمور وحكايات المكان.', 'Coffee, dates and local tales.'),
  A('golf',   'جولة غولف', 'Golf round', 'shura', ['relax'], 180, 'm', 900, false, 'golf', 'ملعب مطل على البحر.', 'A course overlooking the sea.'),
  A('kids',   'نادي المستكشف الصغير', 'Junior explorer club', 'shura', ['nature', 'culture'], 120, 'ma', 150, true, 'kids', 'أنشطة تعليمية ممتعة للأطفال.', 'Fun learning activities for kids.'),
  A('reef',   'قارب بقاع زجاجي', 'Glass-bottom boat', 'jetty', ['sea', 'nature'], 75, 'ma', 210, true, 'boat', 'مشاهدة الشعاب دون نزول للماء.', 'See the reef without getting wet.'),
];
const R = (id, ar, en, place, cost, dar, den) => ({ id, name: [ar, en], place, cost, tags: ['food'], dur: 75, icon: 'food', meal: true, kids: true, desc: [dar, den] });
export const RESTAURANTS = [
  R('r-shura',  'مطعم المرسى للمأكولات البحرية', 'Marina seafood restaurant', 'shura', 260, 'صيد اليوم مشويًا على الفحم.', 'Catch of the day, charcoal grilled.'),
  R('r-umm',    'مطعم الشعاب', 'Reef restaurant', 'ummahat', 340, 'مائدة فوق الماء.', 'Dining over the water.'),
  R('r-shey',   'عشاء على الشاطئ', 'Beach dinner', 'sheybarah', 420, 'عشاء تحت النجوم.', 'Dinner under the stars.'),
  R('r-dunes',  'مطبخ الواحة', 'Oasis kitchen', 'dunes', 280, 'أطباق سعودية بلمسة حديثة.', 'Modern Saudi dishes.'),
  R('r-rock',   'مطعم الصخرة', 'The Rock restaurant', 'rock', 300, 'إطلالة على الوادي.', 'Views across the valley.'),
  R('r-turtle', 'مقهى الخليج', 'Bay café', 'turtle', 140, 'وجبات خفيفة وسريعة.', 'Light, quick meals.'),
  R('r-jetty',  'مقهى المرسى', 'Jetty café', 'jetty', 120, 'سندويشات وعصائر طازجة.', 'Sandwiches and fresh juice.'),
];

// ---------------- parking ----------------
const P = (id, ar, en, place, cap, tariff, feats, walk, base) => ({ id, name: [ar, en], place, cap, tariff, feats, walk, base });
// feats: shade, ev, access, valet, cctv
export const LOTS = [
  P('p-rsi-a',  'مواقف المطار — المنطقة A', 'Airport parking — Zone A', 'rsi', 180, 40, ['shade', 'ev', 'access', 'cctv'], 3, 0.72),
  P('p-rsi-b',  'مواقف المطار — المنطقة B', 'Airport parking — Zone B', 'rsi', 240, 25, ['cctv'], 7, 0.45),
  P('p-sea',    'مواقف صالة الطائرات المائية', 'Seaplane terminal parking', 'rsi', 60, 40, ['shade', 'access', 'cctv'], 2, 0.8),
  P('p-jetty',  'مواقف المرسى الرئيسي', 'Main jetty parking', 'jetty', 120, 30, ['shade', 'valet', 'access', 'cctv'], 4, 0.66),
  P('p-shura',  'مواقف جزيرة شُورى', 'Shura Island parking', 'shura', 90, 30, ['shade', 'ev', 'cctv'], 5, 0.58),
  P('p-turtle', 'مواقف خليج السلاحف', 'Turtle Bay parking', 'turtle', 150, 0, ['cctv'], 6, 0.35),
  P('p-dunes',  'مواقف بوابة الكثبان الجنوبية', 'Southern Dunes gate parking', 'dunes', 70, 0, ['shade', 'ev'], 4, 0.4),
  P('p-rock',   'مواقف استقبال ديزرت روك', 'Desert Rock arrival parking', 'rock', 50, 0, ['shade', 'access'], 3, 0.5),
];
export const FEATS = {
  shade:  ['مظلَّلة', 'Shaded'],
  ev:     ['شحن كهربائي', 'EV charging'],
  access: ['ذوو الإعاقة', 'Accessible'],
  valet:  ['صف السيارات', 'Valet'],
  cctv:   ['مراقبة', 'CCTV'],
};
export const PARK_FEE = 15, PLUS_PRICE = 29;

/** pseudo-live availability: smooth daily curve + slow drift, deterministic per lot & 20-second tick */
export function lotAvailable(lot, now = Date.now()) {
  const d = new Date(now), hour = d.getHours() + d.getMinutes() / 60;
  const peak = Math.exp(-Math.pow((hour - 11) / 3.2, 2)) * 0.22 + Math.exp(-Math.pow((hour - 17.5) / 2.4, 2)) * 0.14;
  const tick = Math.floor(now / 20000);
  let h = 0; for (const ch of lot.id + tick) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const wobble = ((h % 1000) / 1000 - 0.5) * 0.06;
  const occ = Math.min(0.985, Math.max(0.05, lot.base + peak + wobble));
  return Math.max(0, Math.round(lot.cap * (1 - occ)));
}
