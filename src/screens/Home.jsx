import React, { useEffect, useState } from 'react';
import { useApp, dayLabel } from '../store.jsx';
import { Btn, Card, Chip, Ic, IconBox, Sheet, Empty } from '../ui.jsx';
import { PlacePicker, optionTitle, optionIcon } from '../parts.jsx';
import { PLACES, LOTS, lotAvailable, fmtTime, fmtDur } from '../data.js';
import { mockFlight, upcoming, shiftForDelay, nearestLot, offsetOf } from '../logic.js';
import sea1 from '../img/sea1.jpg';
import sea2 from '../img/sea2.jpg';

function InstallHint() {
  const { L, state, set } = useApp();
  const [evt, setEvt] = useState(null);
  useEffect(() => { const f = e => { e.preventDefault(); setEvt(e); }; window.addEventListener('beforeinstallprompt', f); return () => window.removeEventListener('beforeinstallprompt', f); }, []);
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone || !!window.Capacitor;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (standalone || state.hideInstall || (!ios && !evt)) return null;
  return (
    <div className="install" style={{ marginTop: 30 }} data-testid="install">
      <IconBox n="plus" tone="dark" size={42} s={20} />
      <div className="grow"><div className="t-title">{L('ثبّت مَدار على جوالك', 'Install Madar on your phone')}</div>
        <div className="t-sub">{ios ? L(<>اضغط زر <b>المشاركة</b> ثم <b>«إضافة إلى الشاشة الرئيسية»</b>.</>, <>Tap <b>Share</b>, then <b>“Add to Home Screen”</b>.</>) : L('يعمل كتطبيق كامل بأيقونة على شاشتك.', 'Runs as a full app with its own icon.')}</div></div>
      {evt ? <Btn small kind="dark" onClick={async () => { evt.prompt(); await evt.userChoice; setEvt(null); }}>{L('تثبيت', 'Install')}</Btn>
        : <button className="round sm" onClick={() => set({ hideInstall: true })} aria-label="close"><Ic n="x" s={16} /></button>}
    </div>
  );
}

export default function Home() {
  const { state, set, L, lang, go, push, say, notify } = useApp();
  const [sheet, setSheet] = useState(null);   // 'loc' | 'notes' | 'flight'
  const [fno, setFno] = useState('');
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick(x => x + 1), 20000); return () => clearInterval(t); }, []);
  const next = upcoming(state.bookings)[0];
  const lot = nearestLot(LOTS, state.location)[0];
  const free = lotAvailable(lot);
  const unread = state.notes.some(n => n.unread);
  const f = state.flight;

  const linkFlight = () => {
    if (fno.trim().length < 3) return say(L('اكتب رقم الرحلة، مثل SV1543', 'Enter a flight number, e.g. SV1543'));
    const fl = mockFlight(fno); set({ flight: fl, location: 'rsi' }); setSheet(null); setFno('');
    notify(L('تم ربط رحلتك', 'Flight linked'), L(`الرحلة ${fl.no} تهبط ${fmtTime(fl.eta, 'ar')}. سننبهك لأفضل موعد تنقل.`, `Flight ${fl.no} lands ${fmtTime(fl.eta, 'en')}. We'll suggest the best transfer.`), 'flight');
    say(L('تم ربط الرحلة', 'Flight linked'));
  };
  const delay = () => {
    const fl = { ...f, delay: f.delay + 40 };
    const { bookings, changed } = shiftForDelay(state.bookings, fl);
    set({ flight: fl, bookings });
    if (changed.length) {
      notify(L('عدّلنا موعد تنقّلك تلقائيًا', 'We moved your transfer automatically'), L(`تأخرت رحلتك 40 دقيقة، فنقلنا حجزك إلى ${fmtTime(changed[0].to, 'ar')} دون رسوم.`, `Your flight is 40 min late, so we moved your booking to ${fmtTime(changed[0].to, 'en')} at no charge.`), 'clock');
      say(L('تأخرت الرحلة — عُدّل موعد حجزك تلقائيًا', 'Flight delayed — your booking was moved'));
    } else {
      notify(L('تأخرت رحلتك 40 دقيقة', 'Your flight is 40 min late'), L('لا توجد حجوزات تتأثر بالتأخير.', 'No bookings are affected.'), 'clock');
      say(L('تأخرت الرحلة 40 دقيقة', 'Flight delayed by 40 min'));
    }
  };
  const openNotes = () => { setSheet('notes'); set(s => ({ notes: s.notes.map(n => ({ ...n, unread: false })) })); };
  const QUICK = [['boat', 'boat', ['قارب', 'Boat']], ['seaplane', 'plane', ['طائرة مائية', 'Seaplane']], ['car', 'car', ['سيارة', 'Car']]];

  return (
    <div className="screen" data-screen="home">
      <div className="photo home-hero" style={{ backgroundImage: `url(${sea1})` }}>
        <div className="row between">
          <div className="row" style={{ gap: 10 }}>
            <div className="avatar">{(state.user.name || '?').trim()[0]}</div>
            <Chip className="soft" onClick={() => setSheet('loc')} data-testid="loc"><Ic n="pin" s={16} style={{ color: 'var(--coral)' }} />{L(PLACES[state.location].short)}<Ic n="down" s={14} /></Chip>
          </div>
          <button className="round" onClick={openNotes} aria-label={L('التنبيهات', 'Notifications')} data-testid="bell"><Ic n="bell" />{unread && <i className="badge" />}</button>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div className="home-hello" data-testid="hello">{L('مرحبًا، ', 'Hello, ')}{state.user.name}</div>
          <h1 className="home-title">{L(<>إلى أين<br />اليوم؟</>, <>Where to<br />today?</>)}</h1>
          <button className="search glass" onClick={() => go('transport')} data-testid="search">
            <Ic n="search" s={20} /><span className="grow">{L('اختر وجهتك واحجز تنقّلك', 'Pick a destination and book')}</span><i className="go"><Ic n="fwd" s={20} /></i>
          </button>
        </div>
      </div>

      <div className="pad">
        <div className="quick">
          {QUICK.map(([m, ic, n]) => <button key={m} onClick={() => push('transport', { mode: m })} data-svc={m}><i className="glass"><Ic n={ic} s={28} w={1.6} /></i>{L(n)}</button>)}
          <button onClick={() => go('parking')} data-svc="parking"><i className="glass"><Ic n="parking" s={28} w={1.6} /></i>{L('مواقف', 'Parking')}</button>
        </div>

        {next && <section className="sec">
          <div className="sec-h"><h2>{L('رحلتك القادمة', 'Your next trip')}</h2><button className="link" onClick={() => push('bookings')}>{L('كل الحجوزات', 'All bookings')}</button></div>
          <Card className="row" onClick={() => push('ticket', { id: next.id })} data-testid="next-trip">
            <IconBox n={optionIcon(next.option)} tone="coral" size={52} s={26} />
            <div className="grow">
              <div className="t-title">{L(PLACES[next.to].name)}</div>
              <div className="t-sub">{dayLabel(offsetOf(next.date), L)} <span className="ltr">{fmtTime(next.depart, lang)}</span> · {optionTitle(next.option, L)}</div>
            </div>
            <span className={`tag ${next.shifted ? 'warn' : 'green'}`}>{next.shifted ? L('عُدّل الموعد', 'Rescheduled') : L('مؤكَّد', 'Confirmed')}</span>
          </Card>
        </section>}

        <section className="sec">
          <div className="hero" style={{ backgroundImage: `url(${sea2})`, minHeight: 230, display: 'flex', flexDirection: 'column' }}>
            <span className="kick" style={{ alignSelf: 'flex-start' }}><Ic n="ai" s={15} />{L('المخطِّط الذكي', 'Smart planner')}</span>
            <div style={{ marginTop: 'auto' }}>
              <h3>{state.plan ? L('خطة يومك جاهزة', 'Your day plan is ready') : L('خطّط يومك في ثوانٍ', 'Plan your day in seconds')}</h3>
              <p style={{ marginTop: 4 }}>{state.plan ? L(`${state.plan.totals.activities} أنشطة مع التنقل بينها.`, `${state.plan.totals.activities} activities with transfers.`) : L('أخبرنا بما تحب، ونرتّب لك اليوم كله.', 'Tell us what you love — we arrange the day.')}</p>
              <Btn small kind="white" onClick={() => go('plan')} style={{ marginTop: 14 }} data-testid="hero-plan">{state.plan ? L('اعرض خطتي', 'View my plan') : L('ابدأ التخطيط', 'Start planning')}</Btn>
            </div>
          </div>
        </section>

        <section className="sec stack">
          {f ? (
            <Card data-testid="flight-card">
              <div className="row">
                <IconBox n="flight" tone={f.delay ? 'coral' : 'mist'} size={52} s={26} />
                <div className="grow">
                  <div className="t-title"><span className="ltr">{f.no}</span>{L(' من ', ' from ')}{L(f.from)}</div>
                  <div className="t-sub">{L('الهبوط ', 'Lands ')}<b className="ltr">{fmtTime(f.eta + f.delay, lang)}</b></div>
                </div>
                <span className={`tag ${f.delay ? 'warn' : 'green'}`}>{f.delay ? L(`متأخرة ${f.delay} د`, `${f.delay} min late`) : L('في الموعد', 'On time')}</span>
              </div>
              <div className="row between" style={{ marginTop: 16 }}>
                <Btn small kind="dark" onClick={() => push('transport', { from: 'rsi', after: f.eta + f.delay + 30 })} data-testid="flight-book">{L('احجز تنقّلك من المطار', 'Book airport transfer')}</Btn>
                <button className="link" onClick={delay} data-testid="sim-delay">{L('محاكاة تأخير', 'Simulate delay')}</button>
              </div>
            </Card>
          ) : (
            <Card onClick={() => setSheet('flight')} className="row" data-testid="flight-link">
              <IconBox n="flight" tone="mist" size={52} s={26} />
              <div className="grow"><div className="t-title">{L('اربط رحلتك الجوية', 'Link your flight')}</div><div className="t-sub">{L('نضبط تنقّلك على موعد الهبوط.', 'We time your transfer to landing.')}</div></div>
              <Ic n="fwd" s={18} style={{ color: 'var(--gray)' }} />
            </Card>
          )}
          <Card className="row" onClick={() => go('parking')} data-testid="near-lot">
            <IconBox n="parking" tone="mist" size={52} s={26} />
            <div className="grow"><div className="t-title">{L(lot.name)}</div><div className="t-sub"><span className="live">{L('مباشر', 'Live')}</span></div></div>
            <div className="center"><div className="num" style={{ color: free > 15 ? 'var(--turq)' : 'var(--coral)' }}>{free}</div><div className="t-xs">{L('موقفًا متاحًا', 'free spots')}</div></div>
          </Card>
        </section>
        <InstallHint />
      </div>

      <PlacePicker open={sheet === 'loc'} onClose={() => setSheet(null)} title={L('أين أنت الآن؟', 'Where are you now?')} current={state.location} onPick={id => { set({ location: id }); say(L('تم تحديث موقعك', 'Location updated')); }} />
      <Sheet open={sheet === 'flight'} onClose={() => setSheet(null)} title={L('اربط رحلتك الجوية', 'Link your flight')}>
        <p className="t-sub" style={{ marginBottom: 14 }}>{L('اكتب رقم رحلتك لنجهّز تنقّلك على موعد هبوطك.', 'Enter your flight number so we can time your transfer.')}</p>
        <input className="field ltr" placeholder="SV1543" value={fno} onChange={e => setFno(e.target.value)} maxLength={8} style={{ textAlign: 'center', fontFamily: 'var(--head)', fontWeight: 700, letterSpacing: '.08em' }} data-testid="fno" />
        <div style={{ height: 16 }} />
        <Btn full onClick={linkFlight} data-testid="fno-go">{L('اربط الرحلة', 'Link flight')}</Btn>
      </Sheet>
      <Sheet open={sheet === 'notes'} onClose={() => setSheet(null)} title={L('التنبيهات', 'Notifications')}>
        {state.notes.length ? state.notes.map(n => (
          <div className="opt" key={n.id}><IconBox n={n.icon} tone="mist" size={44} s={21} /><div className="grow"><div className="t-title">{n.title}</div><div className="t-sub">{n.body}</div></div></div>
        )) : <Empty icon="bell" title={L('لا توجد تنبيهات', 'No notifications')} body={L('سنخبرك هنا بكل جديد عن رحلتك.', 'Updates about your trip will appear here.')} />}
      </Sheet>
    </div>
  );
}
