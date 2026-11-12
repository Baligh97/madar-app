import React, { useState } from 'react';
import { useApp, code, dayLabel } from '../store.jsx';
import { Btn, Card, Ic, IconBox, Money, TopBar } from '../ui.jsx';
import { optionTitle, optionIcon, LegPills } from '../parts.jsx';
import { PLACES, fmtTime, fmtDur, PARK_FEE, PLUS_PRICE } from '../data.js';
import { offsetOf, spotCode } from '../logic.js';

const METHODS = [['apple', 'apple', ['Apple Pay', 'Apple Pay']], ['mada', 'card', ['بطاقة مدى', 'mada card']], ['card', 'wallet', ['بطاقة ائتمانية', 'Credit card']]];

export default function Checkout({ kind, draft }) {
  const { state, set, L, lang, pop, push, notify } = useApp();
  const [method, setMethod] = useState('apple');
  const [phase, setPhase] = useState('form');   // form | paying | done
  const plus = state.user.plus;

  let lines = [], title = '', head = null;
  if (kind === 'transport') {
    const o = draft.option;
    title = L('تأكيد الحجز', 'Confirm booking');
    lines.push([optionTitle(o, L) + (o.kind === 'car' ? '' : ` × ${draft.pax}`), o.price]);
    if (plus) lines.push([L('خصم مَدار بلس 5%', 'Madar Plus 5% off'), -Math.round(o.price * 0.05)]);
    head = (
      <Card>
        <div className="row"><IconBox n={optionIcon(o)} tone="dark" />
          <div className="grow"><div className="t-title">{L(PLACES[draft.from].short)} {L('←', '→')} {L(PLACES[draft.to].short)}</div>
            <div className="t-sub">{dayLabel(offsetOf(draft.date), L)} <span className="ltr">{fmtTime(draft.depart, lang)}</span> · {fmtDur(o.minutes, lang)} · {draft.pax} {L('ركاب', 'pax')}</div></div></div>
        {o.legs.length > 1 && <LegPills option={o} />}
      </Card>
    );
  } else if (kind === 'parking') {
    title = L('حجز موقف', 'Reserve parking');
    if (draft.lot.tariff) lines.push([L(`تعرفة الموقف × ${draft.days} يوم`, `Parking tariff × ${draft.days} day`), draft.lot.tariff * draft.days]);
    else lines.push([L('تعرفة الموقف', 'Parking tariff'), 0]);
    lines.push([L('رسوم خدمة الحجز', 'Reservation fee'), plus ? 0 : PARK_FEE]);
    head = (
      <Card className="row"><IconBox n="parking" tone="dark" />
        <div className="grow"><div className="t-title">{L(draft.lot.name)}</div><div className="t-sub">{dayLabel(offsetOf(draft.date), L)} · {draft.days} {L('يوم', 'day(s)')}{plus ? L(' · رسوم الحجز مجانية مع بلس', ' · free reservation with Plus') : ''}</div></div></Card>
    );
  } else {
    title = L('اشتراك مَدار بلس', 'Madar Plus');
    lines.push([L('باقة مَدار بلس — للرحلة الواحدة', 'Madar Plus — per trip'), PLUS_PRICE]);
    head = <Card className="row"><IconBox n="crown" tone="coral" /><div className="grow"><div className="t-title">{L('مَدار بلس', 'Madar Plus')}</div><div className="t-sub">{L('خطط غير محدودة، خصم 5% على التنقل، وحجز المواقف بلا رسوم.', 'Unlimited plans, 5% off transfers, free parking reservations.')}</div></div></Card>;
  }
  const total = Math.max(0, lines.reduce((s, l) => s + l[1], 0));

  const pay = () => {
    setPhase('paying');
    setTimeout(() => {
      if (kind === 'transport') {
        const id = code('MDR');
        const b = { id, type: 'transport', ...draft, total, pay: method, status: 'confirmed', createdAt: Date.now(), gate: 1 + Math.floor(Math.random() * 4), name: state.user.name };
        set(s => ({ bookings: [b, ...s.bookings] }));
        notify(L('تم تأكيد حجزك', 'Booking confirmed'), `${optionTitle(draft.option, L)} ${L('إلى', 'to')} ${L(PLACES[draft.to].name)} · ${fmtTime(draft.depart, lang)}`, 'ticket');
        setPhase('done'); setTimeout(() => { pop(99); push('ticket', { id, fresh: true }); }, 900);
      } else if (kind === 'parking') {
        const id = code('PRK');
        const p = { id, lot: draft.lot.id, date: draft.date, days: draft.days, total, pay: method, spot: spotCode(id), status: 'confirmed', createdAt: Date.now(), name: state.user.name };
        set(s => ({ passes: [p, ...s.passes] }));
        notify(L('تم حجز موقفك', 'Parking reserved'), L(`${draft.lot.name[0]} — الموقف ${p.spot}`, `${draft.lot.name[1]} — spot ${p.spot}`), 'parking');
        setPhase('done'); setTimeout(() => { pop(99); push('pass', { id, fresh: true }); }, 900);
      } else {
        set(s => ({ user: { ...s.user, plus: true } }));
        notify(L('أهلًا بك في مَدار بلس', 'Welcome to Madar Plus'), L('فُعّلت مزاياك لهذه الرحلة.', 'Your perks are active for this trip.'), 'crown');
        setPhase('done'); setTimeout(() => pop(99), 1100);
      }
    }, 1300);
  };

  if (phase !== 'form') return (
    <div className="think" data-testid="paying">
      {phase === 'paying' ? <><div className="spin" /><h3 style={{ color: 'var(--teal)' }}>{L('جارٍ إتمام الدفع…', 'Processing payment…')}</h3></>
        : <><div className="success"><Ic n="check" s={44} w={2.6} /></div><h3 style={{ color: 'var(--teal)' }}>{L('تم بنجاح', 'All done')}</h3></>}
    </div>
  );
  return (
    <>
      <TopBar title={title} />
      <div className="screen" data-screen="checkout">
        <div className="pad stack">
          {head}
          <Card>
            <div className="t-title" style={{ marginBottom: 8 }}>{L('تفاصيل المبلغ', 'Price details')}</div>
            {lines.map(([l, v], i) => <div className="row between" key={i} style={{ padding: '5px 0' }}><span className="t-sub" style={{ color: v < 0 ? '#0B7F71' : undefined }}>{l}</span><span style={{ fontSize: '.92rem' }}>{v === 0 ? <b className="tag green">{L('مجانًا', 'Free')}</b> : <Money v={v} />}</span></div>)}
            <div className="hr" />
            <div className="row between"><b className="t-title">{L('الإجمالي', 'Total')}</b><span style={{ fontSize: '1.25rem' }}><Money v={total} /></span></div>
            <div className="t-xs" style={{ marginTop: 4 }}>{L('السعر نهائي دون رسوم مخفية.', 'Final price — no hidden fees.')}</div>
          </Card>
          <div>
            <div className="t-title" style={{ margin: '6px 0 8px' }}>{L('طريقة الدفع', 'Payment method')}</div>
            <div className="stack">{METHODS.map(([id, ic, n]) => (
              <button key={id} className={`pay${method === id ? ' on' : ''}`} onClick={() => setMethod(id)} data-pay={id}><Ic n={ic} s={22} /><span className="grow t-title">{L(n)}</span><i className="radio" /></button>
            ))}</div>
          </div>
          <p className="t-xs center">{L('نسخة تجريبية: الدفع محاكاة ولا يُخصم أي مبلغ.', 'Demo version: payment is simulated and nothing is charged.')}</p>
        </div>
      </div>
      <div className="bar"><Btn full onClick={pay} data-testid="pay">{total ? <>{L('ادفع ', 'Pay ')}<span className="ltr">{total.toLocaleString('en-US')}</span>{L(' ر.س', ' SAR')}</> : L('أكّد الحجز', 'Confirm')}</Btn></div>
    </>
  );
}
