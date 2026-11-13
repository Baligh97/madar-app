import React, { useMemo, useState } from 'react';
import { useApp, dayLabel, dateStr } from '../store.jsx';
import { Btn, Card, Chip, Ic, IconBox, Money, Stepper, TopBar, Empty } from '../ui.jsx';
import { PlacePicker, LegPills, optionTitle, optionIcon, MapView } from '../parts.jsx';
import { PLACES, findOptions, departures, fmtTime, fmtDur, MODES } from '../data.js';
import { nowMin, dateKey } from '../logic.js';

export default function Transport({ layer, from: pFrom, to: pTo, mode, after }) {
  const { state, L, lang, push } = useApp();
  const [from, setFrom] = useState(pFrom || state.location);
  const [to, setTo] = useState(pTo || (mode === 'car' ? ((pFrom || state.location) === 'dunes' ? 'rsi' : 'dunes') : ((pFrom || state.location) === 'ummahat' ? 'shura' : 'ummahat')));
  const [day, setDay] = useState(0);
  const [pax, setPax] = useState(2);
  const [pick, setPick] = useState(null);       // 'from' | 'to'
  const [sel, setSel] = useState(null);         // option id
  const [dep, setDep] = useState(null);
  const refMin = day === 0 ? Math.max(nowMin() + 10, after || 0) : 480;

  const options = useMemo(() => {
    const list = findOptions(from, to, pax).map(o => ({ ...o, deps: departures(o, refMin, 5) }));
    if (mode) list.sort((a, b) => (b.kind === mode) - (a.kind === mode));
    return list;
  }, [from, to, pax, refMin, mode]);
  const fastest = options.length ? [...options].sort((a, b) => a.minutes - b.minutes)[0].id : null;
  const cheapest = options.length ? [...options].sort((a, b) => a.price - b.price)[0].id : null;
  const greenest = options.length ? [...options].sort((a, b) => a.co2 - b.co2)[0].id : null;
  const chosen = options.find(o => o.id === sel) || null;
  const choose = (o) => { setSel(o.id); setDep(o.deps[0] ?? null); };
  const swap = () => { setFrom(to); setTo(from); setSel(null); setDep(null); };
  const change = (fn) => (v) => { fn(v); setSel(null); setDep(null); };
  const route = chosen ? [chosen.legs[0].from, ...chosen.legs.map(l => l.to)] : [from, to];

  return (
    <>
      {layer ? <TopBar title={L('احجز تنقّلك', 'Book a transfer')} /> : (
        <div className="pad top-safe" style={{ paddingBottom: 14 }}><h1 className="page-title">{L('احجز تنقّلك', 'Book a transfer')}</h1>
          <p className="page-sub">{L('قارن الوسائل واحجز في دقائق.', 'Compare and book in minutes.')}</p></div>
      )}
      <div className="screen" data-screen="transport" style={{ paddingBottom: chosen ? 8 : 24 }}>
        <div className="pad">
          <Card className="routebox" style={{ padding: '4px 18px' }}>
            <button className="rb" onClick={() => setPick('from')} data-testid="from"><span className="dot a" /><div><div className="t-xs">{L('من', 'From')}</div><div className="t-title">{L(PLACES[from].name)}</div></div></button>
            <button className="rb" onClick={() => setPick('to')} data-testid="to"><span className="dot b" /><div><div className="t-xs">{L('إلى', 'To')}</div><div className="t-title">{L(PLACES[to].name)}</div></div></button>
            <button className="swapbtn" onClick={swap} aria-label={L('تبديل', 'Swap')} data-testid="swap"><Ic n="swap" s={19} /></button>
          </Card>

          <div className="row between" style={{ marginTop: 16 }}>
            <div className="chips">
              {[0, 1, 2].map(d => <Chip key={d} on={day === d} onClick={() => change(setDay)(d)} data-day={d}>{dayLabel(d, L)}</Chip>)}
            </div>
            <div className="row" style={{ gap: 6 }}><Ic n="user" s={18} style={{ color: 'var(--gray)' }} /><Stepper value={pax} onChange={change(setPax)} /></div>
          </div>
          <div className="t-xs" style={{ marginTop: 10 }}>{dateStr(day, lang)}{after && day === 0 ? L(' · بعد هبوط رحلتك واستلام الأمتعة', ' · after landing and baggage') : ''}</div>


          <div className="sec-h" style={{ marginTop: 28 }}><h2>{L('الوسائل المتاحة', 'Available options')}</h2></div>
          {!options.length && <Empty icon="route" title={L('لا يوجد مسار مباشر', 'No route found')} body={L('جرّب وجهة أخرى.', 'Try another destination.')} />}
          <div className="stack">
            {options.map(o => (
              <Card key={o.id} className={`option${sel === o.id ? ' sel' : ''}`} onClick={() => choose(o)} data-option={o.kind}>
                <IconBox n={optionIcon(o)} tone={sel === o.id ? 'dark' : 'mist'} size={52} s={26} />
                <div className="grow">
                  <div className="row" style={{ gap: 8 }}><span className="t-title">{optionTitle(o, L)}</span>
                    {o.id === fastest ? <span className="tag coral">{L('الأسرع', 'Fastest')}</span> : o.id === cheapest ? <span className="tag">{L('الأوفر', 'Best price')}</span> : o.id === greenest ? <span className="tag green">{L('أقل أثرًا', 'Greenest')}</span> : null}</div>
                  <div className="t-sub">{fmtDur(o.minutes, lang)} · {o.deps.length ? <>{L('يغادر ', 'Departs ')}<span className="ltr">{fmtTime(o.deps[0], lang)}</span></> : <span style={{ color: '#C8402D' }}>{L('لا رحلات متبقية اليوم', 'No more departures today')}</span>}</div>
                  {o.legs.length > 1 ? <LegPills option={o} /> : null}
                </div>
                <div style={{ textAlign: 'end' }}><div style={{ fontSize: '1.1rem' }}><Money v={o.price} /></div><div className="t-xs">{o.kind === 'car' ? L('للسيارة', 'per car') : L(`لـ ${pax} ركاب`, `for ${pax} pax`)}</div></div>
              </Card>
            ))}
          </div>

          {chosen && <div style={{ marginTop: 16 }}>
            <div className="t-title" style={{ marginBottom: 8 }}>{L('اختر موعد الانطلاق', 'Choose a departure')}</div>
            {chosen.deps.length ? <div className="chips">{chosen.deps.map(t => <Chip key={t} on={dep === t} onClick={() => setDep(t)} data-dep={t}><span className="ltr">{fmtTime(t, lang)}</span></Chip>)}</div>
              : <p className="t-sub">{L('انتهت رحلات هذه الوسيلة اليوم؛ اختر «غدًا» من الأعلى.', 'This option has finished for today — choose “Tomorrow” above.')}</p>}
          </div>}
        </div>
      </div>
      {chosen && (
        <div className="bar">
          <div><div className="t-xs">{L('الإجمالي', 'Total')}</div><div style={{ fontSize: '1.3rem' }}><Money v={chosen.price} /></div></div>
          <Btn full disabled={dep == null} onClick={() => push('checkout', { kind: 'transport', draft: { from, to, option: chosen, depart: dep, date: dateKey(day), pax } })} data-testid="continue">{L('متابعة للدفع', 'Continue to pay')}</Btn>
        </div>
      )}
      <PlacePicker open={!!pick} onClose={() => setPick(null)} title={pick === 'from' ? L('من أين؟', 'From where?') : L('إلى أين؟', 'Where to?')} exclude={pick === 'from' ? to : from} current={pick === 'from' ? from : to} onPick={change(pick === 'from' ? setFrom : setTo)} />
    </>
  );
}
