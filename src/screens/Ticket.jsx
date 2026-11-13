import React, { useEffect, useState } from 'react';
import { useApp, dayLabel, dateStr } from '../store.jsx';
import { Btn, Card, Ic, IconBox, Money, QR, TopBar, Wordmark, Symbol, Sheet, Empty } from '../ui.jsx';
import { optionTitle, optionIcon, MapView } from '../parts.jsx';
import { PLACES, fmtTime, fmtDur, MODES } from '../data.js';
import { offsetOf } from '../logic.js';

const STEPS = [
  [0, ['بانتظار الانطلاق', 'Waiting to depart']], [12, ['وصل السائق إلى نقطة الالتقاء', 'Driver arrived at pick-up']],
  [25, ['انطلقت الرحلة', 'Trip started']], [70, ['اقتربت من الوجهة', 'Almost there']], [100, ['وصلت بالسلامة', 'You have arrived']],
];

export default function Ticket({ id, fresh }) {
  const { state, set, L, lang, pop, go, say, notify } = useApp();
  const b = state.bookings.find(x => x.id === id);
  const [track, setTrack] = useState(false);
  const [p, setP] = useState(0);
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    if (!track) return;
    const t = setInterval(() => setP(v => Math.min(100, v + 1.25)), 400);
    return () => clearInterval(t);
  }, [track]);
  if (!b) return <><TopBar title={L('التذكرة', 'Ticket')} /><Empty icon="ticket" title={L('التذكرة غير موجودة', 'Ticket not found')} body="" /></>;
  const o = b.option, cancelled = b.status === 'cancelled';
  const step = [...STEPS].reverse().find(s => p >= s[0]);
  const eta = Math.max(0, Math.round(o.minutes * (1 - p / 100)));
  const cancel = () => {
    set(s => ({ bookings: s.bookings.map(x => x.id === id ? { ...x, status: 'cancelled' } : x) }));
    notify(L('أُلغي الحجز', 'Booking cancelled'), L(`سيُعاد مبلغ ${b.total} ر.س إلى وسيلة الدفع نفسها.`, `SAR ${b.total} will be refunded to your payment method.`), 'ticket');
    setAsk(false); say(L('أُلغي الحجز وسيُسترد المبلغ', 'Booking cancelled — refund on its way'));
  };
  const share = async () => {
    const text = L(`تذكرتي على مَدار ${b.id}: ${PLACES[b.from].name[0]} ← ${PLACES[b.to].name[0]} ${fmtTime(b.depart, 'ar')}`, `My Madar ticket ${b.id}: ${PLACES[b.from].name[1]} → ${PLACES[b.to].name[1]} ${fmtTime(b.depart, 'en')}`);
    try { if (navigator.share) await navigator.share({ title: 'مَدار', text }); else { await navigator.clipboard.writeText(text); say(L('نُسخت تفاصيل التذكرة', 'Ticket details copied')); } } catch (e) { /* user dismissed */ }
  };
  return (
    <>
      <TopBar title={L('تذكرتك', 'Your ticket')} sub={fresh ? L('تم الحجز بنجاح', 'Booked successfully') : null} right={<button className="round" onClick={share} aria-label={L('مشاركة', 'Share')}><Ic n="share" s={20} /></button>} />
      <div className="screen" data-screen="ticket">
        <div className="pad stack">
          <div className="ticket light" style={cancelled ? { opacity: .6 } : null}>
            <div className="ticket-top">
              <div className="row between">
                <div className="row" style={{ gap: 8 }}><Symbol size={34} /><Wordmark size={28} /></div>
                <span className="chip soft" style={{ padding: '6px 12px' }}><Ic n={optionIcon(o)} s={17} style={{ color: 'var(--coral)' }} />{optionTitle(o, L)}</span>
              </div>
              <div className="row between" style={{ marginTop: 16, alignItems: 'flex-end' }}>
                <div><div className="t-xs">{L('من', 'From')}</div><div className="hx" style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--teal)' }}>{L(PLACES[b.from].short)}</div></div>
                <div className="grow" style={{ borderTop: '2.5px dashed #C9D6D4', margin: '0 12px 12px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '50%', top: -15, transform: 'translateX(-50%)', background: '#fff', padding: '0 8px', color: 'var(--turq)' }}><Ic n={optionIcon(o)} s={24} /></span></div>
                <div style={{ textAlign: 'end' }}><div className="t-xs">{L('إلى', 'To')}</div><div className="hx" style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--teal)' }}>{L(PLACES[b.to].short)}</div></div>
              </div>
              <div className="kv">
                <div>{L('التاريخ', 'Date')}<b>{dayLabel(offsetOf(b.date), L)}</b></div>
                <div>{L('الانطلاق', 'Departs')}<b className="ltr" style={{ textAlign: 'start' }}>{fmtTime(b.depart, lang)}</b></div>
                <div>{L('المدة', 'Duration')}<b>{fmtDur(o.minutes, lang)}</b></div>
                <div>{L('الركاب', 'Passengers')}<b>{b.pax}</b></div>
                <div>{o.kind === 'car' ? L('نقطة الالتقاء', 'Pick-up') : L('الرصيف', 'Gate')}<b>{b.gate}</b></div>
                <div>{L('المبلغ', 'Paid')}<b><Money v={b.total} /></b></div>
              </div>
              {b.shifted && !cancelled && <div className="tag warn" style={{ marginTop: 12 }}><Ic n="clock" s={13} />{L('عُدّل الموعد تلقائيًا بسبب تأخر رحلتك', 'Rescheduled automatically — your flight was late')}</div>}
            </div>
            <div className="ticket-cut" />
            <div className="ticket-qr">
              {cancelled ? <div className="tag coral" style={{ fontSize: '.9rem', padding: '8px 14px' }}>{L('حجز ملغى', 'Cancelled')}</div> : <QR text={`MADAR|${b.id}|${b.from}>${b.to}|${b.date}|${b.depart}|${b.pax}`} />}
              <div className="hx ltr" style={{ fontWeight: 700, color: 'var(--teal)', letterSpacing: '.08em' }}>{b.id}</div>
              <div className="t-xs">{L('أظهر الرمز عند الصعود', 'Show this code when boarding')}</div>
            </div>
          </div>

          {!cancelled && <Card data-testid="track">
            <div className="row between">
              <div><div className="t-title">{L('تتبّع الرحلة', 'Track your trip')}</div><div className="t-sub">{track ? L(step[1]) : L('اعرف مكان وسيلتك وموعد وصولك.', 'See where your ride is and when you arrive.')}</div></div>
              {!track ? <Btn small kind="dark" icon="nav" onClick={() => { setTrack(true); setP(0); }} data-testid="track-go">{L('ابدأ', 'Start')}</Btn>
                : <div className="center"><div className="num" style={{ color: 'var(--turq)' }}>{eta}</div><div className="t-xs">{L('دقيقة', 'min')}</div></div>}
            </div>
            {track && <>
              <div className="trackline"><i style={{ width: p + '%' }} /><b style={{ insetInlineStart: p + '%' }}><Ic n={optionIcon(o)} s={17} /></b></div>
              <div className="row between t-xs"><span>{L(PLACES[b.from].short)}</span><span>{L('محاكاة للعرض', 'Demo simulation')}</span><span>{L(PLACES[b.to].short)}</span></div>
            </>}
          </Card>}

          <MapView height={150} here={b.from} route={[o.legs[0].from, ...o.legs.map(l => l.to)]} pins={[{ id: 'to', place: b.to, color: '#FF6B57', label: '' }]} />

          {o.legs.length > 1 && <Card><div className="t-title" style={{ marginBottom: 6 }}>{L('مراحل الرحلة', 'Trip stages')}</div>
            {o.legs.map((l, i) => <div className="row" key={i} style={{ padding: '7px 0' }}><IconBox n={MODES[l.mode].icon} tone="mist" size={36} s={19} /><div className="grow"><div className="t-title" style={{ fontSize: '.86rem' }}>{L(MODES[l.mode].name)}</div><div className="t-sub">{L(PLACES[l.from].short)} {L('←', '→')} {L(PLACES[l.to].short)} · {fmtDur(l.min, lang)}</div></div></div>)}</Card>}

          {!cancelled && <div className="row">
            <Btn kind="ghost" full icon="parking" onClick={() => go('parking')}>{L('أضف موقفًا', 'Add parking')}</Btn>
            <Btn kind="danger" full onClick={() => setAsk(true)} data-testid="cancel">{L('إلغاء الحجز', 'Cancel')}</Btn>
          </div>}
          <div className="t-xs center"><Ic n="leaf" s={13} style={{ verticalAlign: '-2px', color: 'var(--ok)' }} /> {o.co2 === 0 ? L('رحلة بلا انبعاثات كربونية', 'A zero-emission trip') : L(`الأثر البيئي التقديري: ${o.co2} كجم CO₂`, `Estimated footprint: ${o.co2} kg CO₂`)}</div>
        </div>
      </div>
      <Sheet open={ask} onClose={() => setAsk(false)} title={L('إلغاء الحجز؟', 'Cancel booking?')}>
        <p className="t-sub" style={{ marginBottom: 14 }}>{L('الإلغاء مجاني قبل الانطلاق بساعتين، ويُعاد المبلغ كاملًا.', 'Free cancellation up to 2 hours before departure, with a full refund.')}</p>
        <div className="row"><Btn kind="ghost" full onClick={() => setAsk(false)}>{L('تراجع', 'Keep it')}</Btn><Btn kind="danger" full onClick={cancel} data-testid="cancel-yes">{L('نعم، ألغِ', 'Yes, cancel')}</Btn></div>
      </Sheet>
    </>
  );
}
