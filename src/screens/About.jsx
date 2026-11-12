import React from 'react';
import { useApp } from '../store.jsx';
import { Card, Symbol, TopBar, Wordmark } from '../ui.jsx';

export default function About() {
  const { L } = useApp();
  return (
    <>
      <TopBar title={L('عن مَدار', 'About Madar')} />
      <div className="screen" data-screen="about">
        <div className="pad stack">
          <div className="center" style={{ padding: '14px 0 4px' }}>
            <div style={{ display: 'inline-block' }}><Symbol size={96} /></div>
            <div><Wordmark size={44} /></div>
            <div className="lat" style={{ color: 'var(--teal)' }}>MADAR</div>
            <p className="t-sub" style={{ marginTop: 8 }}>{L('رحلتك كاملة… في تطبيق واحد', 'Your whole trip… in one app')}</p>
            <p className="t-xs">{L('الإصدار 1.0 (نسخة تجريبية)', 'Version 1.0 (prototype)')}</p>
          </div>
          <Card><div className="t-title">{L('ما هو مَدار؟', 'What is Madar?')}</div>
            <p className="t-sub" style={{ marginTop: 4 }}>{L('تطبيق يرافق زائر وجهة البحر الأحمر من لحظة وصوله إلى المطار حتى آخر يوم في رحلته: حجز التنقل بين الجزر والمنتجعات، وتخطيط اليوم بالذكاء الاصطناعي، ودليل المواقف.', 'An app that accompanies Red Sea visitors from landing to their last day: transfers between islands and resorts, AI day planning and a parking guide.')}</p></Card>
          <Card><div className="t-title">{L('تنبيه عن هذه النسخة', 'About this version')}</div>
            <p className="t-sub" style={{ marginTop: 4 }}>{L('هذه نسخة تجريبية لمشروع مقرر ريادة أعمال الحاسب الآلي وتقنية المعلومات. الأسعار والمواعيد وتوفر المواقف بيانات توضيحية، والدفع محاكاة، والتطبيق غير مرتبط بأنظمة وجهة البحر الأحمر.', 'This is a prototype for an entrepreneurship course project. Prices, schedules and parking availability are illustrative, payment is simulated, and the app is not connected to Red Sea destination systems.')}</p></Card>
          <Card><div className="t-title">{L('فريق المشروع', 'Project team')}</div>
            <p className="t-sub" style={{ marginTop: 4 }}>ريماس علي الشمراني · مي محمد حلواني · لانا فهد النهدي · صبا نايف العلاسي</p>
            <p className="t-xs" style={{ marginTop: 4 }}>{L('الكلية التقنية العالمية للبنات بجدة — إشراف د. نسرين نوفل', 'International Technical College for Girls, Jeddah — supervised by Dr. Nisreen Nofal')}</p></Card>
        </div>
      </div>
    </>
  );
}
