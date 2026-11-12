import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';

const KEY = 'madar.state.v1';
const initial = {
  onboarded: false,
  user: { name: '', plus: false, largeText: false },
  lang: 'ar',
  location: 'rsi',
  flight: null,          // { no, eta, delay }
  bookings: [],          // transport tickets
  passes: [],            // parking passes
  plan: null,
  notes: [],             // notifications
};
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...initial, ...JSON.parse(raw) }; } catch (e) { /* storage unavailable */ }
  return initial;
}
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const code = (p) => p + '-' + Math.floor(1000 + Math.random() * 9000);

export function AppProvider({ children }) {
  const [state, setState] = useState(load);
  const [tab, setTab] = useState('home');
  const [stack, setStack] = useState([]);       // pushed screens: {name, props}
  const [toast, setToast] = useState(null);
  const tmr = useRef();
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }, [state]);
  useEffect(() => {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('large', !!state.user.largeText);
  }, [state.lang, state.user.largeText]);

  const set = useCallback((patch) => setState(s => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), []);
  const L = useCallback((ar, en) => (Array.isArray(ar) ? ar[state.lang === 'ar' ? 0 : 1] : (state.lang === 'ar' ? ar : en)), [state.lang]);
  const push = useCallback((name, props = {}) => setStack(s => [...s, { name, props, key: Date.now() + Math.random() }]), []);
  const pop = useCallback((n = 1) => setStack(s => s.slice(0, Math.max(0, s.length - n))), []);
  const reset = useCallback(() => setStack([]), []);
  const go = useCallback((t) => { setStack([]); setTab(t); }, []);
  const say = useCallback((msg) => { setToast(msg); clearTimeout(tmr.current); tmr.current = setTimeout(() => setToast(null), 2600); }, []);
  const notify = useCallback((title, body, icon = 'bell') => set(s => ({ notes: [{ id: Date.now(), title, body, icon, at: Date.now(), unread: true }, ...s.notes].slice(0, 20) })), [set]);

  const value = useMemo(() => ({ state, set, L, lang: state.lang, tab, go, stack, push, pop, reset, toast, say, notify }),
    [state, set, L, tab, go, stack, push, pop, reset, toast, say, notify]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const todayMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
export const dayLabel = (offset, L) => offset === 0 ? L('اليوم', 'Today') : offset === 1 ? L('غدًا', 'Tomorrow') : L('بعد غد', 'In 2 days');
export const dateStr = (offset, lang) => {
  const d = new Date(Date.now() + offset * 86400000);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};
