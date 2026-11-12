import React, { useState } from 'react';
import { useApp } from '../store.jsx';
import { Btn, Ic, Orbits, Symbol, Wordmark } from '../ui.jsx';

export function Splash() {
  return (
    <div className="splash">
      <Orbits cx={50} cy={48} step={62} op={0.1} />
      <div className="logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Symbol size={150} variant="white" />
        <Wordmark color="#fff" size={62} />
        <div className="lat">MADAR</div>
      </div>
      <p style={{ marginTop: 14, fontSize: '1.02rem' }}>رحلتك كاملة… في تطبيق واحد</p>
    </div>
  );
}

const SLIDES = [
  { icon: 'boat', t: ['احجز تنقّلك في دقائق', 'Book transfers in minutes'], d: ['قارب سريع، طائرة مائية أو سيارة كهربائية. قارن واحجز وادفع من مكان واحد، وتذكرتك تصلك فورًا.', 'Speedboat, seaplane or electric car. Compare, book and pay in one place — your ticket arrives instantly.'] },
  { icon: 'ai', t: ['يومك يرتّبه الذكاء الاصطناعي', 'Your day, planned by AI'], d: ['أخبرنا بما تحب، ونقترح لك برنامجًا كاملًا مع أوقات التنقل بين الجزر والمنتجعات.', 'Tell us what you love and get a full-day plan, including travel times between islands and resorts.'] },
  { icon: 'parking', t: ['اعرف أين توقف سيارتك', 'Know where to park'], d: ['المواقف المتاحة لحظة بلحظة عند المطار والمراسي ونقاط الانطلاق، واحجز موقفك قبل أن تصل.', 'Live availability at the airport, marinas and departure points — reserve your spot before you arrive.'] },
];

export default function Onboarding() {
  const { set, L, lang, notify } = useApp();
  const [i, setI] = useState(0);
  const [name, setName] = useState('');
  const last = i === SLIDES.length;
  const finish = () => {
    set(s => ({ onboarded: true, user: { ...s.user, name: name.trim() || L('ضيفنا', 'Guest') } }));
    notify(L('أهلًا بك في مَدار', 'Welcome to Madar'), L('ابدأ بربط رحلتك الجوية أو خطّط يومك الآن.', 'Start by linking your flight, or plan your day now.'), 'ai');
  };
  return (
    <div className="ob">
      <div className="ob-art">
        <Orbits cx={18} cy={88} step={46} op={0.12} />
        <button className="chip" style={{ position: 'absolute', top: 'calc(var(--sat) + 16px)', insetInlineEnd: 18, background: 'rgba(255,255,255,.14)', color: '#fff', boxShadow: 'none' }}
          onClick={() => set({ lang: lang === 'ar' ? 'en' : 'ar' })} data-testid="lang"><Ic n="world" s={16} />{lang === 'ar' ? 'English' : 'العربية'}</button>
        {last
          ? <div style={{ position: 'relative', textAlign: 'center' }}><Symbol size={130} variant="white" /></div>
          : <div className="ob-icon" key={i}><Ic n={SLIDES[i].icon} s={78} w={1.5} /></div>}
      </div>
      <div className="ob-body">
        {last ? <>
          <h2>{L('بماذا نناديك؟', 'What should we call you?')}</h2>
          <p style={{ minHeight: 0, marginBottom: 14 }}>{L('نستخدم اسمك للترحيب بك وعلى تذاكرك فقط.', 'We only use your name to greet you and on your tickets.')}</p>
          <input className="field" placeholder={L('اسمك الأول', 'Your first name')} value={name} onChange={e => setName(e.target.value)} maxLength={24} data-testid="name" />
          <div style={{ height: 18 }} />
          <Btn full onClick={finish} data-testid="start">{L('ابدأ رحلتك', 'Start your journey')}</Btn>
        </> : <>
          <h2>{L(SLIDES[i].t)}</h2>
          <p>{L(SLIDES[i].d)}</p>
          <div className="dots">{SLIDES.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}<i /></div>
          <div className="row">
            <Btn kind="ghost" onClick={() => setI(SLIDES.length)}>{L('تخطَّ', 'Skip')}</Btn>
            <Btn full onClick={() => setI(i + 1)} data-testid="next">{L('التالي', 'Next')}</Btn>
          </div>
        </>}
      </div>
    </div>
  );
}
