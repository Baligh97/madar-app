import React from 'react';
import { useApp } from '../store.jsx';
import { Btn, Card, Ic, IconBox, Money, Orbits, TopBar } from '../ui.jsx';
import { PLUS_PRICE } from '../data.js';

const PERKS = [
  ['ai', ['خطط غير محدودة', 'Unlimited plans'], ['أعد توليد خطة يومك كما تشاء.', 'Re-plan your day as often as you like.']],
  ['wallet', ['خصم 5% على كل تنقّل', '5% off every transfer'], ['يُطبَّق تلقائيًا عند الدفع.', 'Applied automatically at checkout.']],
  ['parking', ['حجز المواقف بلا رسوم خدمة', 'No parking reservation fee'], ['توفّر 15 ريالًا في كل حجز.', 'Save SAR 15 on every reservation.']],
  ['heart', ['أولوية في الدعم', 'Priority support'], ['نرد عليك أولًا على مدار الساعة.', 'We answer you first, around the clock.']],
];
export default function Plus() {
  const { state, set, L, push, say } = useApp();
  const on = state.user.plus;
  return (
    <>
      <TopBar title={L('مَدار بلس', 'Madar Plus')} />
      <div className="screen" data-screen="plus">
        <div className="pad stack">
          <div className="plus" style={{ padding: 22 }}>
            <Orbits cx={10} cy={100} step={34} op={0.14} />
            <IconBox n="crown" tone="white" size={54} s={28} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 10 }}>{L('رحلة أسهل بمزايا أكثر', 'An easier trip, with more perks')}</h2>
            <div style={{ marginTop: 6, fontSize: '1.6rem', fontFamily: 'var(--head)', fontWeight: 800 }}><span className="ltr">{PLUS_PRICE}</span> <small style={{ fontSize: '.5em', fontWeight: 500 }}>{L('ر.س للرحلة الواحدة', 'SAR per trip')}</small></div>
          </div>
          <Card style={{ padding: '4px 14px' }}>
            {PERKS.map(([ic, t, d]) => <div className="list-row" key={ic}><IconBox n={ic} tone="mist" size={40} s={20} /><div className="grow"><div className="t-title">{L(t)}</div><div className="t-sub">{L(d)}</div></div><Ic n="check" s={18} style={{ color: 'var(--ok)' }} /></div>)}
          </Card>
          {on ? <>
            <div className="tag green" style={{ alignSelf: 'center', fontSize: '.9rem', padding: '8px 14px' }}><Ic n="check" s={15} />{L('الباقة مفعّلة لهذه الرحلة', 'Active for this trip')}</div>
            <Btn kind="line" full onClick={() => { set(s => ({ user: { ...s.user, plus: false } })); say(L('أُلغي الاشتراك', 'Subscription cancelled')); }}>{L('إلغاء الاشتراك', 'Cancel subscription')}</Btn>
          </> : <Btn full onClick={() => push('checkout', { kind: 'plus' })} data-testid="plus-buy">{L('اشترك الآن', 'Subscribe now')}</Btn>}
        </div>
      </div>
    </>
  );
}
