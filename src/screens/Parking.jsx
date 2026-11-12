import React, { useEffect, useMemo, useState } from 'react';
import { useApp, dayLabel } from '../store.jsx';
import { Btn, Card, Chip, Ic, IconBox, Money, Sheet, Stepper } from '../ui.jsx';
import { MapView } from '../parts.jsx';
import { LOTS, PLACES, FEATS, lotAvailable, PARK_FEE } from '../data.js';
import { nearestLot, dateKey, kmBetween } from '../logic.js';

const color = (free, cap) => free / cap > 0.3 ? '#0E9F8E' : free / cap > 0.1 ? '#D9822B' : '#D2472F';
const OFFS = { 'p-rsi-a': [-5, -6], 'p-rsi-b': [6, -5], 'p-sea': [0, 7] };

export default function Parking() {
  const { state, L, push } = useApp();
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState([]);
  const [open, setOpen] = useState(null);
  const [day, setDay] = useState(0);
  const [days, setDays] = useState(1);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 5000); return () => clearInterval(t); }, []);
  const lots = useMemo(() => nearestLot(LOTS, state.location).filter(l => filter.every(f => l.feats.includes(f))), [state.location, filter]);
  const lot = LOTS.find(l => l.id === open);
  const tog = (f) => setFilter(v => v.includes(f) ? v.filter(x => x !== f) : [...v, f]);
  const totalFree = lots.reduce((s, l) => s + lotAvailable(l, now), 0);

  return (
    <div className="screen top-safe" data-screen="parking">
      <div className="pad">
        <div className="row between">
          <div><h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--teal)' }}>{L('دليل المواقف', 'Parking guide')}</h1>
            <p className="t-sub">{L('التوفر لحظة بلحظة عند المطار والمراسي ونقاط الانطلاق.', 'Live availability at the airport, marinas and departure points.')}</p></div>
          <span className="live">{L('مباشر', 'Live')}</span>
        </div>

        <div style={{ marginTop: 12 }}>
          <MapView height={230} here={state.location} onPin={setOpen}
            pins={lots.map(l => ({ id: l.id, place: l.place, dx: OFFS[l.id]?.[0], dy: OFFS[l.id]?.[1], color: color(lotAvailable(l, now), l.cap), label: lotAvailable(l, now), active: open === l.id }))} />
        </div>

        <div className="chips scroll" style={{ marginTop: 12 }}>
          {['shade', 'ev', 'access', 'valet'].map(f => <Chip key={f} icon={f} on={filter.includes(f)} onClick={() => tog(f)} data-filter={f}>{L(FEATS[f])}</Chip>)}
        </div>

        <div className="sec-h" style={{ marginTop: 16 }}><h2 style={{ fontSize: '1.02rem', color: 'var(--teal)' }}>{L('الأقرب إليك', 'Nearest to you')}</h2><span className="t-xs">{totalFree} {L('موقفًا متاحًا', 'free spots')}</span></div>
        <div className="stack">
          {lots.map(l => {
            const free = lotAvailable(l, now), km = kmBetween(state.location, l.place);
            return (
              <Card key={l.id} onClick={() => { setOpen(l.id); setDays(1); setDay(0); }} data-lot={l.id}>
                <div className="row">
                  <IconBox n="parking" tone="mist" />
                  <div className="grow">
                    <div className="t-title">{L(l.name)}</div>
                    <div className="t-sub">{km ? L(`${km} كم`, `${km} km`) : L(`${l.walk} دقائق مشيًا`, `${l.walk} min walk`)} · {l.tariff ? <><Money v={l.tariff} /> {L('/ يوم', '/ day')}</> : L('مجانًا', 'Free')}</div>
                  </div>
                  <div className="center"><div className="num" style={{ color: color(free, l.cap) }}>{free}</div><div className="t-xs">{L(`من ${l.cap}`, `of ${l.cap}`)}</div></div>
                </div>
                <div className="avail"><i style={{ width: Math.round(100 * (1 - free / l.cap)) + '%', background: color(free, l.cap) }} /></div>
                <div className="legs">{l.feats.map(f => <span className="tag" key={f}><Ic n={f} s={12} />{L(FEATS[f])}</span>)}</div>
              </Card>
            );
          })}
          {!lots.length && <p className="t-sub center" style={{ padding: 20 }}>{L('لا توجد مواقف بهذه المواصفات.', 'No lots match these filters.')}</p>}
        </div>
      </div>

      <Sheet open={!!lot} onClose={() => setOpen(null)} title={lot ? L(lot.name) : ''}>
        {lot && (() => {
          const free = lotAvailable(lot, now); const fee = state.user.plus ? 0 : PARK_FEE; const total = lot.tariff * days + fee;
          return <>
            <div className="row" style={{ gap: 16 }}>
              <div className="center"><div className="num" style={{ fontSize: '2rem', color: color(free, lot.cap) }}>{free}</div><div className="t-xs">{L('موقفًا متاحًا الآن', 'free right now')}</div></div>
              <div className="grow"><div className="avail" style={{ height: 10 }}><i style={{ width: Math.round(100 * (1 - free / lot.cap)) + '%', background: color(free, lot.cap) }} /></div>
                <div className="t-xs" style={{ marginTop: 6 }}>{L(`الإشغال ${Math.round(100 * (1 - free / lot.cap))}% · ${lot.walk} دقائق مشيًا إلى نقطة الانطلاق`, `${Math.round(100 * (1 - free / lot.cap))}% full · ${lot.walk} min walk to departures`)}</div></div>
            </div>
            <div className="legs" style={{ margin: '12px 0' }}>{lot.feats.map(f => <span className="tag" key={f}><Ic n={f} s={12} />{L(FEATS[f])}</span>)}</div>
            <div className="hr" />
            <div className="t-title" style={{ marginBottom: 8 }}>{L('احجز موقفك مسبقًا', 'Reserve ahead')}</div>
            <div className="row between"><div className="chips">{[0, 1, 2].map(d => <Chip key={d} on={day === d} onClick={() => setDay(d)}>{dayLabel(d, L)}</Chip>)}</div></div>
            <div className="row between" style={{ marginTop: 12 }}><span className="t-sub">{L('عدد الأيام', 'Number of days')}</span><Stepper value={days} onChange={setDays} max={14} /></div>
            <div className="row between" style={{ marginTop: 12 }}><span className="t-sub">{L('التعرفة + رسوم الحجز', 'Tariff + reservation fee')}</span><span style={{ fontSize: '1.15rem' }}><Money v={total} /></span></div>
            <div style={{ height: 14 }} />
            <Btn full disabled={free === 0} onClick={() => { setOpen(null); push('checkout', { kind: 'parking', draft: { lot, date: dateKey(day), days } }); }} data-testid="reserve">{free ? L('احجز الموقف', 'Reserve spot') : L('الموقف ممتلئ', 'Lot is full')}</Btn>
          </>;
        })()}
      </Sheet>
    </div>
  );
}
