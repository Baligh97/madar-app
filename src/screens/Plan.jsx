import React, { useEffect, useState } from 'react';
import { useApp, dayLabel, dateStr } from '../store.jsx';
import { Btn, Card, Chip, Ic, IconBox, Money } from '../ui.jsx';
import { optionTitle, optionIcon } from '../parts.jsx';
import { INTERESTS, PLACES, fmtTime, fmtDur, departures } from '../data.js';
import { generatePlan, swapItem } from '../planner.js';
import { dateKey, nowMin } from '../logic.js';
import sea3 from '../img/sea3.jpg';
import sea5 from '../img/sea5.jpg';

const THINK = [
  ['نحلّل اهتماماتك', 'Reading your interests'], ['نختار أنسب الأنشطة', 'Picking the best activities'],
  ['نحسب أوقات التنقل بين المواقع', 'Working out travel times'], ['نرتّب يومك', 'Arranging your day'],
];

function Seg({ value, onChange, items }) {
  const { L } = useApp();
  return <div className="seg">{items.map(([v, n]) => <button key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)} data-seg={v}>{L(n)}</button>)}</div>;
}

export default function Plan() {
  const { state, set, L, lang, push, say } = useApp();
  const plan = state.plan;
  const [mode, setMode] = useState(plan ? 'view' : 'form');
  const [f, setF] = useState(plan?.prefs || { interests: [], pace: 2, company: 'couple', budget: 2, text: '', day: 0 });
  const [step, setStep] = useState(0);
  const up = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggle = (id) => up('interests', f.interests.includes(id) ? f.interests.filter(x => x !== id) : [...f.interests, id]);

  const run = (prefs, seed, regen = 0) => {
    setMode('think'); setStep(0);
    let day = prefs.day || 0;
    let result = generatePlan({ ...prefs, start: state.location, notBefore: day === 0 ? nowMin() : null }, seed);
    if (!result.items.some(i => i.kind === 'act')) {   // too late today → plan tomorrow instead
      day = Math.max(1, day); result = generatePlan({ ...prefs, day, start: state.location, notBefore: null }, seed);
      say(L('الوقت متأخر اليوم، فجهّزنا خطة الغد', "It's late today, so we planned tomorrow"));
    }
    result.prefs = { ...result.prefs, day, notBefore: null };
    let i = 0;
    const t = setInterval(() => {
      i++; setStep(i);
      if (i >= THINK.length) { clearInterval(t); setTimeout(() => { set({ plan: { ...result, regen, date: dateKey(day), day } }); setMode('view'); }, 350); }
    }, 520);
  };
  const create = () => {
    if (!f.interests.length && !f.text.trim()) return say(L('اختر اهتمامًا واحدًا على الأقل', 'Pick at least one interest'));
    run(f, Math.floor(Math.random() * 9000) + 1);
  };
  const regen = () => {
    if (plan.regen >= 2 && !state.user.plus) { say(L('إعادة التوليد غير المحدودة ضمن مَدار بلس', 'Unlimited re-planning is part of Madar Plus')); return push('plus'); }
    run(plan.prefs, plan.seed + 17, plan.regen + 1);
  };
  const swap = (id) => { const np = swapItem({ ...plan, prefs: { ...plan.prefs, notBefore: plan.day === 0 ? Math.min(nowMin(), (plan.items[0]?.start ?? 1440) - 30) : null } }, id); set({ plan: { ...np, regen: plan.regen, date: plan.date, day: plan.day } }); say(L('استبدلنا النشاط ببديل مناسب', 'Swapped for a good alternative')); };
  const booked = (leg) => state.bookings.some(b => b.status === 'confirmed' && b.from === leg.from && b.to === leg.to && b.date === plan.date);
  const bookLeg = (leg) => {
    const dep = departures(leg.option, Math.max(0, leg.start - 5), 1)[0] ?? leg.start;
    push('checkout', { kind: 'transport', draft: { from: leg.from, to: leg.to, option: leg.option, depart: dep, date: plan.date, pax: plan.pax } });
  };

  if (mode === 'think') return (
    <div className="screen think" data-screen="plan-think">
      <div className="pulse"><Ic n="ai" s={46} style={{ color: 'var(--teal)' }} /></div>
      <h2 style={{ color: 'var(--teal)' }}>{L('مخطِّط مَدار يجهّز يومك', 'Madar is planning your day')}</h2>
      <ul>{THINK.map((t, i) => <li key={i} className={step > i ? 'done' : ''}><Ic n={step > i ? 'ok' : 'clock'} s={17} />{L(t)}</li>)}</ul>
    </div>
  );

  if (mode === 'form' || !plan) return (
    <div className="screen top-safe" data-screen="plan-form">
      <div className="pad">
        <div className="hero" style={{ backgroundImage: `url(${sea3})`, minHeight: 210, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <span className="kick" style={{ alignSelf: 'flex-start', marginBottom: 'auto' }}><Ic n="ai" s={15} />{L('المخطِّط الذكي', 'Smart planner')}</span>
          <h3 style={{ fontSize: '1.75rem' }}>{L('كيف تحب أن يكون يومك؟', 'How would you like your day?')}</h3>
        </div>

        <div className="sec"><div className="sec-h"><h2>{L('متى؟', 'When?')}</h2><span className="t-xs">{dateStr(f.day || 0, lang)}</span></div>
          <div className="chips">{[0, 1, 2].map(d => <Chip key={d} on={(f.day || 0) === d} onClick={() => up('day', d)}>{dayLabel(d, L)}</Chip>)}</div></div>

        <div className="sec"><div className="sec-h"><h2>{L('ماذا تحب؟', 'What do you love?')}</h2></div>
          <div className="chips">{INTERESTS.map(i => <Chip key={i.id} icon={i.icon} on={f.interests.includes(i.id)} onClick={() => toggle(i.id)} data-interest={i.id}>{L(i.name)}</Chip>)}</div></div>

        <div className="sec"><div className="sec-h"><h2>{L('وتيرة اليوم', 'Pace')}</h2></div>
          <Seg value={f.pace} onChange={v => up('pace', v)} items={[[1, ['هادئة', 'Relaxed']], [2, ['متوازنة', 'Balanced']], [3, ['نشيطة', 'Active']]]} /></div>

        <div className="sec"><div className="sec-h"><h2>{L('من معك؟', "Who's with you?")}</h2></div>
          <Seg value={f.company} onChange={v => up('company', v)} items={[['solo', ['بمفردي', 'Solo']], ['couple', ['شخصان', 'Couple']], ['family', ['عائلة', 'Family']]]} /></div>

        <div className="sec"><div className="sec-h"><h2>{L('الميزانية', 'Budget')}</h2></div>
          <Seg value={f.budget} onChange={v => up('budget', v)} items={[[1, ['اقتصادية', 'Economy']], [2, ['متوسطة', 'Mid-range']], [3, ['فاخرة', 'Premium']]]} /></div>

        <div className="sec"><div className="sec-h"><h2>{L('أخبرنا أكثر (اختياري)', 'Tell us more (optional)')}</h2></div>
          <textarea className="field" rows={2} placeholder={L('مثال: أحب الهدوء ومشاهدة النجوم، ومعي أطفال', 'e.g. I love quiet places and stargazing, travelling with kids')} value={f.text} onChange={e => up('text', e.target.value)} style={{ resize: 'none' }} data-testid="plan-text" /></div>

        <div className="t-xs" style={{ margin: '12px 0' }}><Ic n="pin" s={13} style={{ verticalAlign: '-2px', color: 'var(--coral)' }} /> {L('تبدأ الخطة من موقعك الحالي: ', 'Starting from your location: ')}{L(PLACES[state.location].name)}</div>
        <Btn full icon="ai" onClick={create} data-testid="plan-go">{L('أنشئ خطتي', 'Create my plan')}</Btn>
        {plan && <Btn full kind="ghost" onClick={() => setMode('view')} style={{ marginTop: 10 }}>{L('العودة إلى خطتي', 'Back to my plan')}</Btn>}
      </div>
    </div>
  );

  let prevEnd = null;
  return (
    <div className="screen top-safe" data-screen="plan-view">
      <div className="pad">
        <div className="row between">
          <div><h1 className="page-title">{L('خطة يومك', 'Your day plan')}</h1>
            <p className="page-sub">{dayLabel(plan.day, L)} · {dateStr(plan.day, lang)} · {plan.pax} {L('أشخاص', 'people')}</p></div>
          <button className="round" onClick={() => setMode('form')} aria-label={L('تعديل', 'Edit')} data-testid="plan-edit"><Ic n="exchange" s={20} /></button>
        </div>

        <div className="stats" style={{ margin: '18px 0 26px' }}>
          <div><b>{plan.totals.activities}</b><span>{L('أنشطة', 'activities')}</span></div>
          <div><b>{fmtDur(plan.totals.travelMin, lang)}</b><span>{L('تنقّل', 'travel')}</span></div>
          <div><b className="ltr">{Math.round(plan.totals.cost).toLocaleString('en-US')}</b><span>{L('ر.س تقديريًا', 'SAR est.')}</span></div>
        </div>

        <div className="tl">
          {plan.items.map((it, idx) => {
            const gap = prevEnd != null ? it.start - prevEnd : 0; prevEnd = it.end;
            const free = gap >= 75 ? <div className="tl-free" key={'f' + idx}>{L(`وقت حر للاستراحة: ${fmtDur(gap, 'ar')}`, `Free time: ${fmtDur(gap, 'en')}`)}</div> : null;
            if (it.kind === 'leg') {
              const done = booked(it);
              return <React.Fragment key={it.id + idx}>{free}
                <div className="tl-item leg" data-leg={it.to}>
                  <div className="tl-time" style={{ top: 8, opacity: .7 }}>{fmtTime(it.start, lang)}</div>
                  <div className="tl-leg"><Ic n={optionIcon(it.option)} s={18} />
                    <span className="grow">{optionTitle(it.option, L)} {L('إلى', 'to')} {L(PLACES[it.to].short)} · {fmtDur(it.option.minutes, lang)}</span>
                    {done ? <span className="tag green"><Ic n="check" s={12} />{L('محجوز', 'Booked')}</span>
                      : <button className="tag dark" onClick={() => bookLeg(it)} data-book-leg>{L('احجز', 'Book')} · <span className="ltr">{it.option.price}</span></button>}
                  </div>
                </div></React.Fragment>;
            }
            return <React.Fragment key={it.id + idx}>{free}
              <div className={`tl-item ${it.kind}`} data-item={it.id}>
                <div className="tl-time">{fmtTime(it.start, lang)}</div>
                <Card style={{ padding: 16 }}>
                  <div className="row" style={{ alignItems: 'flex-start' }}>
                    <IconBox n={it.act.icon} tone={it.kind === 'meal' ? 'coral' : 'mist'} size={48} s={24} />
                    <div className="grow">
                      <div className="t-title">{L(it.act.name)}</div>
                      <div className="t-sub">{L(PLACES[it.act.place].name)} · {fmtDur(it.act.dur, lang)}</div>
                      <div className="why"><Ic n="ai" s={13} /><span>{L(it.why)}</span></div>
                    </div>
                    {it.kind === 'act' && <button className="round sm" onClick={() => swap(it.id)} aria-label={L('استبدال', 'Swap')} data-swap><Ic n="refresh" s={16} /></button>}
                  </div>
                </Card>
              </div></React.Fragment>;
          })}
        </div>

        <div className="row" style={{ marginTop: 20 }}>
          <Btn kind="ghost" icon="refresh" onClick={regen} data-testid="regen" style={{ whiteSpace: 'nowrap', paddingInline: 18 }}>{L('خطة أخرى', 'Another plan')}</Btn>
          <Btn kind="dark" full icon="route" onClick={() => { const l = plan.items.find(i => i.kind === 'leg' && !booked(i)); l ? bookLeg(l) : say(L('كل تنقّلات الخطة محجوزة', 'All transfers are booked')); }} data-testid="book-next" style={{ whiteSpace: 'nowrap', paddingInline: 14 }}>{L('احجز التنقّل', 'Book transfer')}</Btn>
        </div>
        <p className="t-xs center" style={{ marginTop: 16 }}>{L('الأسعار والأوقات تقديرية.', 'Prices and times are estimates.')}</p>
      </div>
    </div>
  );
}
