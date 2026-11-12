import React, { useState } from 'react';
import { useApp, dayLabel } from '../store.jsx';
import { Btn, Card, Empty, IconBox, Money, TopBar } from '../ui.jsx';
import { optionTitle, optionIcon } from '../parts.jsx';
import { PLACES, LOTS, fmtTime } from '../data.js';
import { offsetOf } from '../logic.js';

export default function Bookings() {
  const { state, L, lang, push, go } = useApp();
  const [tab, setTab] = useState('trips');
  const tag = (s, shifted) => s === 'cancelled' ? <span className="tag coral">{L('ملغى', 'Cancelled')}</span> : shifted ? <span className="tag warn">{L('عُدّل الموعد', 'Rescheduled')}</span> : <span className="tag green">{L('مؤكَّد', 'Confirmed')}</span>;
  return (
    <>
      <TopBar title={L('حجوزاتي', 'My bookings')} />
      <div className="screen" data-screen="bookings">
        <div className="pad">
          <div className="seg" style={{ marginBottom: 14 }}>
            <button className={tab === 'trips' ? 'on' : ''} onClick={() => setTab('trips')}>{L('التنقّل', 'Transfers')} ({state.bookings.length})</button>
            <button className={tab === 'park' ? 'on' : ''} onClick={() => setTab('park')} data-testid="tab-park">{L('المواقف', 'Parking')} ({state.passes.length})</button>
          </div>
          <div className="stack">
            {tab === 'trips' && (state.bookings.length ? state.bookings.map(b => (
              <Card key={b.id} className="row" onClick={() => push('ticket', { id: b.id })} data-booking={b.id}>
                <IconBox n={optionIcon(b.option)} tone={b.status === 'cancelled' ? 'sand' : 'coral'} />
                <div className="grow"><div className="t-title">{L(PLACES[b.from].short)} {L('←', '→')} {L(PLACES[b.to].short)}</div>
                  <div className="t-sub">{optionTitle(b.option, L)} · {dayLabel(offsetOf(b.date), L)} <span className="ltr">{fmtTime(b.depart, lang)}</span></div>
                  <div className="t-xs ltr" style={{ textAlign: 'start' }}>{b.id}</div></div>
                <div style={{ textAlign: 'end' }}>{tag(b.status, b.shifted)}<div style={{ marginTop: 4 }}><Money v={b.total} /></div></div>
              </Card>
            )) : <Empty icon="ticket" title={L('لا توجد حجوزات تنقّل', 'No transfers yet')} body={L('احجز قاربك أو سيارتك وستجد التذكرة هنا.', 'Book a boat or a car and your ticket appears here.')} action={<Btn onClick={() => go('transport')}>{L('احجز الآن', 'Book now')}</Btn>} />)}
            {tab === 'park' && (state.passes.length ? state.passes.map(p => { const lot = LOTS.find(l => l.id === p.lot); return (
              <Card key={p.id} className="row" onClick={() => push('pass', { id: p.id })} data-pass={p.id}>
                <IconBox n="parking" tone={p.status === 'cancelled' ? 'sand' : 'mist'} />
                <div className="grow"><div className="t-title">{L(lot.name)}</div><div className="t-sub">{L('الموقف', 'Spot')} <span className="ltr">{p.spot}</span> · {dayLabel(offsetOf(p.date), L)} · {p.days} {L('يوم', 'day')}</div><div className="t-xs ltr" style={{ textAlign: 'start' }}>{p.id}</div></div>
                <div style={{ textAlign: 'end' }}>{tag(p.status)}<div style={{ marginTop: 4 }}><Money v={p.total} /></div></div>
              </Card>); }) : <Empty icon="parking" title={L('لا توجد حجوزات مواقف', 'No parking yet')} body={L('احجز موقفك قبل أن تصل.', 'Reserve your spot before you arrive.')} action={<Btn onClick={() => go('parking')}>{L('دليل المواقف', 'Parking guide')}</Btn>} />)}
          </div>
        </div>
      </div>
    </>
  );
}
