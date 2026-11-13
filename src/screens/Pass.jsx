import React, { useState } from 'react';
import { useApp, dayLabel } from '../store.jsx';
import { Btn, Card, Ic, Money, QR, TopBar, Wordmark, Symbol, Sheet, Empty } from '../ui.jsx';
import { MapView } from '../parts.jsx';
import { LOTS, PLACES, FEATS } from '../data.js';
import { offsetOf } from '../logic.js';

export default function Pass({ id, fresh }) {
  const { state, set, L, say, notify } = useApp();
  const p = state.passes.find(x => x.id === id);
  const [ask, setAsk] = useState(false);
  if (!p) return <><TopBar title={L('تصريح الموقف', 'Parking pass')} /><Empty icon="parking" title={L('التصريح غير موجود', 'Pass not found')} body="" /></>;
  const lot = LOTS.find(l => l.id === p.lot), cancelled = p.status === 'cancelled';
  const cancel = () => {
    set(s => ({ passes: s.passes.map(x => x.id === id ? { ...x, status: 'cancelled' } : x) }));
    notify(L('أُلغي حجز الموقف', 'Parking cancelled'), L(lot.name), 'parking'); setAsk(false); say(L('أُلغي حجز الموقف', 'Parking reservation cancelled'));
  };
  return (
    <>
      <TopBar title={L('تصريح الموقف', 'Parking pass')} sub={fresh ? L('تم حجز موقفك', 'Your spot is reserved') : null} />
      <div className="screen" data-screen="pass">
        <div className="pad stack">
          <div className="ticket light" style={cancelled ? { opacity: .6 } : null}>
            <div className="ticket-top">
              <div className="row between"><div className="row" style={{ gap: 8 }}><Symbol size={34} /><Wordmark size={28} /></div><span className="chip soft" style={{ padding: '6px 12px' }}><Ic n="parking" s={17} style={{ color: 'var(--coral)' }} />{L('موقف', 'Parking')}</span></div>
              <div className="hx" style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--teal)', marginTop: 14 }}>{L(lot.name)}</div>
              <div className="kv">
                <div>{L('رقم الموقف', 'Spot')}<b className="ltr" style={{ textAlign: 'start', fontSize: '1.2rem' }}>{p.spot}</b></div>
                <div>{L('التاريخ', 'Date')}<b>{dayLabel(offsetOf(p.date), L)}</b></div>
                <div>{L('المدة', 'Duration')}<b>{p.days} {L('يوم', 'day')}</b></div>
              </div>
              <div className="legs" style={{ marginTop: 12 }}>{lot.feats.map(f => <span className="tag" key={f}><Ic n={f} s={12} />{L(FEATS[f])}</span>)}</div>
            </div>
            <div className="ticket-cut" />
            <div className="ticket-qr">
              {cancelled ? <div className="tag coral" style={{ fontSize: '.9rem', padding: '8px 14px' }}>{L('حجز ملغى', 'Cancelled')}</div> : <QR text={`MADAR|${p.id}|${p.lot}|${p.spot}|${p.date}|${p.days}`} />}
              <div className="hx ltr" style={{ fontWeight: 700, color: 'var(--teal)', letterSpacing: '.08em' }}>{p.id}</div>
              <div className="t-xs">{L('امسح الرمز عند بوابة الموقف', 'Scan at the parking gate')}</div>
            </div>
          </div>
          <MapView height={150} here={state.location} pins={[{ id: lot.id, place: lot.place, color: '#EEF7F5', label: '' }]} route={state.location !== lot.place ? [state.location, lot.place] : null} />
          {!cancelled && <div className="row">
            <Btn kind="dark" full icon="nav" onClick={() => say(L(`الموقف على بُعد ${lot.walk} دقائق مشيًا من نقطة الانطلاق`, `The lot is a ${lot.walk}-minute walk from the departure point`))}>{L('الاتجاهات', 'Directions')}</Btn>
            <Btn kind="danger" full onClick={() => setAsk(true)}>{L('إلغاء', 'Cancel')}</Btn>
          </div>}
          <div className="t-xs center">{L('المبلغ المدفوع: ', 'Paid: ')}<Money v={p.total} /></div>
        </div>
      </div>
      <Sheet open={ask} onClose={() => setAsk(false)} title={L('إلغاء حجز الموقف؟', 'Cancel parking?')}>
        <div className="row"><Btn kind="ghost" full onClick={() => setAsk(false)}>{L('تراجع', 'Keep it')}</Btn><Btn kind="danger" full onClick={cancel}>{L('نعم، ألغِ', 'Yes, cancel')}</Btn></div>
      </Sheet>
    </>
  );
}
