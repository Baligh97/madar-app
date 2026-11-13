import React, { useState } from 'react';
import { useApp } from '../store.jsx';
import { Btn, Ic, Symbol, Wordmark } from '../ui.jsx';
import sea1 from '../img/sea1.jpg';
import sea2 from '../img/sea2.jpg';
import sea3 from '../img/sea3.jpg';
import night from '../img/night.jpg';

export function Splash() {
  return (
    <div className="splash" style={{ backgroundImage: `url(${sea3})` }}>
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
  { img: sea1, t: ['احجز تنقّلك في دقائق', 'Book transfers in minutes'], d: ['قارب سريع أو طائرة مائية أو سيارة كهربائية. قارن واحجز وادفع من مكان واحد.', 'Speedboat, seaplane or electric car. Compare, book and pay in one place.'] },
  { img: sea3, t: ['يومك يرتّبه الذكاء الاصطناعي', 'Your day, planned by AI'], d: ['أخبرنا بما تحب، ونقترح برنامجًا كاملًا مع أوقات التنقل بين الجزر.', 'Tell us what you love and get a full-day plan with travel times.'] },
  { img: sea2, t: ['اعرف أين توقف سيارتك', 'Know where to park'], d: ['المواقف المتاحة لحظة بلحظة، واحجز موقفك قبل أن تصل.', 'Live availability — reserve your spot before you arrive.'] },
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
    <div className="ob" style={{ backgroundImage: `url(${last ? night : SLIDES[i].img})` }}>
      <div className="ob-top">
        <div className="row" style={{ gap: 8 }}><Symbol size={34} variant="white" /><Wordmark color="#fff" size={26} /></div>
        <button className="chip soft" onClick={() => set({ lang: lang === 'ar' ? 'en' : 'ar' })} data-testid="lang"><Ic n="world" s={16} />{lang === 'ar' ? 'English' : 'العربية'}</button>
      </div>
      <div className="ob-panel glass">
        {last ? <>
          <h2>{L('بماذا نناديك؟', 'What should we call you?')}</h2>
          <p style={{ minHeight: 0, marginBottom: 18 }}>{L('نستخدم اسمك للترحيب بك وعلى تذاكرك فقط.', 'We only use your name to greet you and on your tickets.')}</p>
          <input className="field" placeholder={L('اسمك الأول', 'Your first name')} value={name} onChange={e => setName(e.target.value)} maxLength={24} data-testid="name" />
          <div style={{ height: 18 }} />
          <Btn full onClick={finish} data-testid="start">{L('ابدأ رحلتك', 'Start your journey')}</Btn>
        </> : <>
          <h2 key={i}>{L(SLIDES[i].t)}</h2>
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
