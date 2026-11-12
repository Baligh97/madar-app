import React, { useEffect, useState } from 'react';
import { useApp } from '../store.jsx';
import { Btn, Card, Chip, Ic, IconBox, Orbits, Section, Sheet, Symbol, Empty } from '../ui.jsx';
import { PlacePicker, optionTitle, optionIcon } from '../parts.jsx';
import { PLACES, LOTS, ACTIVITIES, lotAvailable, fmtTime, fmtDur, departures } from '../data.js';
import { mockFlight, upcoming, shiftForDelay, nearestLot, offsetOf } from '../logic.js';
import { dayLabel } from '../store.jsx';

function InstallHint() {
  const { L, state, set } = useApp();
  const [evt, setEvt] = useState(null);
  useEffect(() => { const f = e => { e.preventDefault(); setEvt(e); }; window.addEventListener('beforeinstallprompt', f); return () => window.removeEventListener('beforeinstallprompt', f); }, []);
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone || !!window.Capacitor;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (standalone || state.hideInstall || (!ios && !evt)) return null;
  return (
    <div className="pad" style={{ marginTop: 12 }}>
      <div className="install" data-testid="install">
        <IconBox n="plus" tone="dark" size={40} s={20} />
        <div className="grow"><div className="t-title">{L('ثبّت مَدار على جوالك', 'Install Madar on your phone')}</div>
          <div className="t-sub">{ios ? L(<>اضغط زر <b>المشاركة</b> في Safari ثم <b>«إضافة إلى الشاشة الرئيسية»</b>.</>, <>Tap <b>Share</b> in Safari, then <b>“Add to Home Screen”</b>.</>) : L('يعمل كتطبيق كامل بأيقونة على شاشتك.', 'Runs as a full app with its own icon.')}</div></div>
        {evt ? <Btn small kind="dark" onClick={async () => { evt.prompt(); await evt.userChoice; setEvt(null); }}>{L('تثبيت', 'Install')}</Btn>
          : <button className="round sm" onClick={() => set({ hideInstall: true })} aria-label="close"><Ic n="x" s={16} /></button>}
      </div>
    </div>
  );
}

const ART = ['linear-gradient(135deg,#14B8A6,#0B3C49)', 'linear-gradient(135deg,#FF8B7A,#C8402D)', 'linear-gradient(135deg,#11566A,#072A34)', 'linear-gradient(135deg,#E9B872,#C97B3C)'];

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

  return (
    <div className="screen top-safe" data-screen="home">
      <div className="pad row between">
        <div>
          <div className="t-sub">{L('أهلًا بك في البحر الأحمر', 'Welcome to the Red Sea')}</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--teal)' }}>{L('مرحبًا، ', 'Hello, ')}{state.user.name}</h1>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="round" onClick={openNotes} aria-label={L('التنبيهات', 'Notifications')} data-testid="bell"><Ic n="bell" />{unread && <i className="badge" />}</button>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'var(--teal)', display: 'grid', placeItems: 'center' }}><Symbol size={27} variant="white" /></div>
        </div>
      </div>

      <div className="pad" style={{ marginTop: 10 }}>
        <Chip className="soft" onClick={() => setSheet('loc')} data-testid="loc"><Ic n="pin" s={16} style={{ color: 'var(--coral)' }} />{L(PLACES[state.location].name)}<Ic n="down" s={14} /></Chip>
      </div>

      <InstallHint />

      {/* flight */}
      <div className="pad" style={{ marginTop: 12 }}>
        {f ? (
          <Card data-testid="flight-card">
            <div className="row">
              <IconBox n="flight" tone={f.delay ? 'coral' : 'mist'} />
              <div className="grow">
                <div className="t-title">{L('رحلتك ', 'Flight ')}<span className="ltr">{f.no}</span>{L(' من ', ' from ')}{L(f.from)}</div>
                <div className="t-sub">{L('الهبوط ', 'Lands ')}<b className="ltr">{fmtTime(f.eta + f.delay, lang)}</b>{f.delay ? <span style={{ color: '#C8402D' }}>{L(` · متأخرة ${f.delay} د`, ` · ${f.delay} min late`)}</span> : L(' · في موعدها', ' · on time')}</div>
              </div>
              <span className={`tag ${f.delay ? 'warn' : 'green'}`}>{f.delay ? L('متأخرة', 'Delayed') : L('في الموعد', 'On time')}</span>
            </div>
            <div className="hr" />
            <div className="row between">
              <Btn small kind="dark" icon="route" onClick={() => push('transport', { from: 'rsi', after: f.eta + f.delay + 30 })} data-testid="flight-book">{L('احجز تنقّلك من المطار', 'Book airport transfer')}</Btn>
              <button className="link" onClick={delay} data-testid="sim-delay">{L('محاكاة تأخير', 'Simulate delay')}</button>
            </div>
          </Card>
        ) : (
          <Card onClick={() => setSheet('flight')} className="row" data-testid="flight-link">
            <IconBox n="flight" tone="mist" />
            <div className="grow"><div className="t-title">{L('اربط رحلتك الجوية', 'Link your flight')}</div><div className="t-sub">{L('نرتّب تنقّلك على موعد الهبوط، ونعدّله إن تأخرت الرحلة.', 'We time your transfer to landing and adjust if the flight is late.')}</div></div>
            <Ic n="fwd" s={18} style={{ color: '#93A1A6' }} />
          </Card>
        )}
      </div>

      {/* AI planner */}
      <div className="pad" style={{ marginTop: 12 }}>
        <div className="hero">
          <Orbits cx={12} cy={96} step={34} op={0.14} />
          <div className="kick"><Ic n="ai" s={16} />{L('مخطِّط مَدار الذكي', 'Madar smart planner')}</div>
          <h3 style={{ marginTop: 4 }}>{state.plan ? L('خطة يومك جاهزة', 'Your day plan is ready') : L('خطّط يومك في ثوانٍ', 'Plan your day in seconds')}</h3>
          <p>{state.plan ? L(`${state.plan.totals.activities} أنشطة مع التنقل بينها.`, `${state.plan.totals.activities} activities with transfers.`) : L('أخبرنا بما تحب، ونرتّب لك يومك مع التنقل والحجوزات.', 'Tell us what you love — we arrange your day, transfers included.')}</p>
          <Btn small onClick={() => go('plan')} style={{ marginTop: 12 }} data-testid="hero-plan">{state.plan ? L('اعرض خطتي', 'View my plan') : L('ابدأ التخطيط', 'Start planning')}</Btn>
        </div>
      </div>

      <div className="pad">
        <Section title={L('احجز تنقّلك', 'Book a transfer')} action={<button className="link" onClick={() => go('transport')}>{L('عرض الكل', 'See all')}</button>}>
          <div className="svc">
            {[['boat', 'boat', ['قارب', 'Boat'], 'coral'], ['seaplane', 'plane', ['طائرة مائية', 'Seaplane'], 'mist'], ['car', 'car', ['سيارة', 'Car'], 'mist']].map(([m, ic, n, tone]) => (
              <button key={m} onClick={() => push('transport', { mode: m })} data-svc={m}><IconBox n={ic} tone={tone} s={32} />{L(n)}</button>
            ))}
            <button onClick={() => go('parking')} data-svc="parking"><IconBox n="parking" tone="mist" s={32} />{L('مواقف', 'Parking')}</button>
          </div>
        </Section>

        <Section title={L('رحلتك القادمة', 'Your next trip')} action={state.bookings.length ? <button className="link" onClick={() => push('bookings')}>{L('كل الحجوزات', 'All bookings')}</button> : null}>
          {next ? (
            <Card className="row" onClick={() => push('ticket', { id: next.id })} data-testid="next-trip">
              <IconBox n={optionIcon(next.option)} tone="coral" />
              <div className="grow">
                <div className="t-title">{optionTitle(next.option, L)}{L(' إلى ', ' to ')}{L(PLACES[next.to].name)}</div>
                <div className="t-sub">{dayLabel(offsetOf(next.date), L)} <span className="ltr">{fmtTime(next.depart, lang)}</span> · {fmtDur(next.option.minutes, lang)}</div>
              </div>
              <span className={`tag ${next.shifted ? 'warn' : ''}`}>{next.shifted ? L('عُدّل الموعد', 'Rescheduled') : L('مؤكَّد', 'Confirmed')}</span>
            </Card>
          ) : (
            <Card className="row"><IconBox n="ticket" tone="sand" /><div className="grow"><div className="t-title">{L('لا توجد رحلات قادمة', 'No upcoming trips')}</div><div className="t-sub">{L('احجز أول تنقّل لك وستظهر تذكرتك هنا.', 'Book your first transfer and the ticket shows here.')}</div></div></Card>
          )}
        </Section>

        <Section title={L('أقرب موقف إليك', 'Nearest parking')} action={<button className="link" onClick={() => go('parking')}>{L('كل المواقف', 'All parking')}</button>}>
          <Card className="row" onClick={() => go('parking')} data-testid="near-lot">
            <IconBox n="parking" tone="mist" />
            <div className="grow"><div className="t-title">{L(lot.name)}</div><div className="t-sub">{L(`${lot.walk} دقائق مشيًا`, `${lot.walk} min walk`)} · <span className="live">{L('مباشر', 'Live')}</span></div></div>
            <div className="center"><div className="num" style={{ color: free > 15 ? 'var(--turq)' : 'var(--coral)' }}>{free}</div><div className="t-xs">{L('موقفًا متاحًا', 'free spots')}</div></div>
          </Card>
        </Section>

        <Section title={L('اكتشف الوجهة', 'Discover')}>
          <div className="hscroll">
            {ACTIVITIES.slice(0, 8).map((a, i) => (
              <button key={a.id} className="disc" onClick={() => go('plan')}>
                <div className="disc-art" style={{ background: ART[i % 4] }}><Orbits cx={10} cy={110} step={20} op={0.2} dots={false} /><Ic n={a.icon} s={38} w={1.5} /></div>
                <div className="disc-b"><div className="t-title" style={{ fontSize: '.84rem' }}>{L(a.name)}</div><div className="t-xs">{L(PLACES[a.place].short)} · {fmtDur(a.dur, lang)}</div></div>
              </button>
            ))}
          </div>
        </Section>
      </div>

      <PlacePicker open={sheet === 'loc'} onClose={() => setSheet(null)} title={L('أين أنت الآن؟', 'Where are you now?')} current={state.location} onPick={id => { set({ location: id }); say(L('تم تحديث موقعك', 'Location updated')); }} />
      <Sheet open={sheet === 'flight'} onClose={() => setSheet(null)} title={L('اربط رحلتك الجوية', 'Link your flight')}>
        <p className="t-sub" style={{ marginBottom: 12 }}>{L('اكتب رقم رحلتك لنجهّز تنقّلك على موعد هبوطك.', 'Enter your flight number so we can time your transfer.')}</p>
        <input className="field ltr" placeholder="SV1543" value={fno} onChange={e => setFno(e.target.value)} maxLength={8} style={{ textAlign: 'center', fontFamily: 'var(--head)', fontWeight: 700, letterSpacing: '.08em' }} data-testid="fno" />
        <div style={{ height: 14 }} />
        <Btn full onClick={linkFlight} data-testid="fno-go">{L('اربط الرحلة', 'Link flight')}</Btn>
      </Sheet>
      <Sheet open={sheet === 'notes'} onClose={() => setSheet(null)} title={L('التنبيهات', 'Notifications')}>
        {state.notes.length ? state.notes.map(n => (
          <div className="opt" key={n.id}><IconBox n={n.icon} tone="mist" size={42} s={21} /><div className="grow"><div className="t-title">{n.title}</div><div className="t-sub">{n.body}</div></div></div>
        )) : <Empty icon="bell" title={L('لا توجد تنبيهات', 'No notifications')} body={L('سنخبرك هنا بكل جديد عن رحلتك.', 'Updates about your trip will appear here.')} />}
      </Sheet>
    </div>
  );
}
