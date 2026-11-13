import React, { useState } from 'react';
import { useApp } from '../store.jsx';
import { Btn, Card, Ic, IconBox, Sheet } from '../ui.jsx';
import dusk from '../img/dusk.jpg';

export default function Account() {
  const { state, set, L, lang, push, say } = useApp();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(state.user.name);
  const [ask, setAsk] = useState(false);
  const trips = state.bookings.filter(b => b.status === 'confirmed');
  const co2Saved = trips.reduce((s, b) => s + (b.option.kind === 'car' ? b.option.minutes * 0.18 * b.pax : 0), 0);
  const Row = ({ icon, title, sub, right, onClick, tid }) => (
    <button className="list-row" onClick={onClick} data-testid={tid}><IconBox n={icon} tone="mist" size={40} s={20} /><div className="grow"><div className="t-title">{title}</div>{sub && <div className="t-sub">{sub}</div>}</div>{right ?? <Ic n="fwd" s={18} style={{ color: '#93A1A6' }} />}</button>
  );
  return (
    <div className="screen top-safe" data-screen="account">
      <div className="pad">
        <div className="row">
          <div className="avatar" style={{ width: 68, height: 68, fontSize: '1.6rem' }}>{(state.user.name || '?').trim()[0]}</div>
          <div className="grow"><h1 className="page-title" style={{ fontSize: '1.6rem' }}>{state.user.name}</h1>
            <div className="t-sub">{state.user.plus ? <span className="tag coral"><Ic n="crown" s={12} />{L('عضو مَدار بلس', 'Madar Plus member')}</span> : L('الحساب الأساسي', 'Basic account')}</div></div>
          <button className="round" onClick={() => { setName(state.user.name); setEdit(true); }} aria-label={L('تعديل', 'Edit')}><Ic n="user" s={20} /></button>
        </div>

        {!state.user.plus && <div className="plus" style={{ marginTop: 24, backgroundImage: `url(${dusk})` }} onClick={() => push('plus')} data-testid="plus-card">
          <div className="row"><IconBox n="crown" tone="white" /><div className="grow"><div className="hx" style={{ fontWeight: 700, fontSize: '1.05rem' }}>{L('جرّب مَدار بلس', 'Try Madar Plus')}</div>
            <div style={{ fontSize: '.82rem', opacity: .88 }}>{L('خطط غير محدودة وخصم على التنقل بـ 29 ريالًا للرحلة.', 'Unlimited plans and transfer discounts for SAR 29 per trip.')}</div></div><Ic n="fwd" s={20} /></div>
        </div>}

        <div className="stats" style={{ marginTop: 16 }}>
          {[[trips.length, ['رحلات', 'Trips'], 'ticket'], [state.passes.filter(p => p.status === 'confirmed').length, ['مواقف', 'Parking'], 'parking'], [co2Saved.toFixed(1), ['كجم CO₂ وفّرتها', 'kg CO₂ saved'], 'leaf']].map(([v, n, ic], i) => (
            <div key={i}><b>{v}</b><span>{L(n)}</span></div>
          ))}
        </div>

        <Card style={{ marginTop: 16, padding: '4px 18px' }}>
          <Row icon="ticket" title={L('حجوزاتي وتذاكري', 'My bookings & tickets')} sub={L(`${state.bookings.length + state.passes.length} حجوزات`, `${state.bookings.length + state.passes.length} bookings`)} onClick={() => push('bookings')} tid="my-bookings" />
          <Row icon="crown" title={L('مَدار بلس', 'Madar Plus')} sub={state.user.plus ? L('مفعّلة لهذه الرحلة', 'Active for this trip') : L('غير مفعّلة', 'Not active')} onClick={() => push('plus')} />
        </Card>

        <Card style={{ marginTop: 16, padding: '4px 18px' }}>
          <Row icon="lang" title={L('اللغة', 'Language')} sub={lang === 'ar' ? 'العربية' : 'English'} onClick={() => set({ lang: lang === 'ar' ? 'en' : 'ar' })} tid="toggle-lang"
            right={<span className="tag">{lang === 'ar' ? 'English' : 'العربية'}</span>} />
          <Row icon="text" title={L('خط أكبر', 'Larger text')} sub={L('لقراءة أسهل', 'Easier to read')} onClick={() => set(s => ({ user: { ...s.user, largeText: !s.user.largeText } }))} tid="toggle-text"
            right={<i className={`switch${state.user.largeText ? ' on' : ''}`} />} />
          <Row icon="info" title={L('عن مَدار', 'About Madar')} onClick={() => push('about')} tid="about" />
        </Card>

        <button className="list-row" style={{ marginTop: 8, color: '#FF9484' }} onClick={() => setAsk(true)} data-testid="reset"><Ic n="trash" s={20} /><span className="t-title" style={{ color: '#FF9484' }}>{L('مسح بيانات التجربة والبدء من جديد', 'Reset demo data')}</span></button>
      </div>

      <Sheet open={edit} onClose={() => setEdit(false)} title={L('اسمك', 'Your name')}>
        <input className="field" value={name} onChange={e => setName(e.target.value)} maxLength={24} />
        <div style={{ height: 14 }} />
        <Btn full onClick={() => { set(s => ({ user: { ...s.user, name: name.trim() || s.user.name } })); setEdit(false); say(L('تم الحفظ', 'Saved')); }}>{L('حفظ', 'Save')}</Btn>
      </Sheet>
      <Sheet open={ask} onClose={() => setAsk(false)} title={L('مسح كل البيانات؟', 'Erase all data?')}>
        <p className="t-sub" style={{ marginBottom: 14 }}>{L('ستُحذف الحجوزات والخطة وتعود شاشة البداية.', 'Bookings and plan will be deleted and you return to the start.')}</p>
        <div className="row"><Btn kind="ghost" full onClick={() => setAsk(false)}>{L('تراجع', 'Cancel')}</Btn>
          <Btn kind="danger" full onClick={() => { try { localStorage.removeItem('madar.state.v1'); } catch (e) { /* ignore */ } location.reload(); }} data-testid="reset-yes">{L('نعم، امسح', 'Yes, erase')}</Btn></div>
      </Sheet>
    </div>
  );
}
