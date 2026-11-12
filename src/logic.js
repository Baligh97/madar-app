import { departures, findOptions, PLACES } from './data.js';

export const dateKey = (offset = 0) => { const d = new Date(Date.now() + offset * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
export const offsetOf = (key) => Math.round((new Date(key + 'T00:00:00') - new Date(dateKey(0) + 'T00:00:00')) / 86400000);

const CITIES = [['الرياض', 'Riyadh', 'RUH'], ['جدة', 'Jeddah', 'JED'], ['دبي', 'Dubai', 'DXB'], ['الدمام', 'Dammam', 'DMM'], ['الدوحة', 'Doha', 'DOH']];
/** demo flight lookup — deterministic from the flight number, lands ~35 min from now */
export function mockFlight(no) {
  const clean = no.toUpperCase().replace(/\s+/g, '');
  let h = 0; for (const c of clean) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  const city = CITIES[h % CITIES.length];
  const eta = Math.min(1380, Math.ceil((nowMin() + 30 + (h % 4) * 5) / 5) * 5);
  return { no: clean, from: [city[0], city[1]], iata: city[2], eta, delay: 0, date: dateKey(0), belt: 1 + (h % 3) };
}

/** upcoming confirmed bookings, soonest first */
export function upcoming(bookings) {
  const today = dateKey(0), now = nowMin();
  return bookings.filter(b => b.status === 'confirmed' && (b.date > today || (b.date === today && b.depart + b.option.minutes > now)))
    .sort((a, b) => (a.date + String(a.depart).padStart(4, '0')).localeCompare(b.date + String(b.depart).padStart(4, '0')));
}

/** when the flight is delayed, move airport pick-ups that would be missed to the next departure */
export function shiftForDelay(bookings, flight) {
  const ready = flight.eta + flight.delay + 30; // landing + baggage
  const changed = [];
  const next = bookings.map(b => {
    if (b.status !== 'confirmed' || b.from !== 'rsi' || b.date !== flight.date || b.depart >= ready) return b;
    const dep = departures(b.option, ready, 1)[0];
    if (dep == null) return b;
    changed.push({ id: b.id, from: b.depart, to: dep });
    return { ...b, depart: dep, shifted: true };
  });
  return { bookings: next, changed };
}

export function nearestLot(lots, placeId) {
  const here = PLACES[placeId];
  return [...lots].sort((a, b) => dist(PLACES[a.place], here) - dist(PLACES[b.place], here) || a.walk - b.walk);
}
const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
export const kmBetween = (a, b) => Math.round(dist(PLACES[a], PLACES[b]) * 0.9);
export const spotCode = (id) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 'ABCD'[h % 4] + '-' + (10 + (h % 80)); };
export { findOptions };
