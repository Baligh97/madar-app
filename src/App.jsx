import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './store.jsx';
import { Ic, Sheet, Empty } from './ui.jsx';
import Onboarding, { Splash } from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Transport from './screens/Transport.jsx';
import Plan from './screens/Plan.jsx';
import Parking from './screens/Parking.jsx';
import Account from './screens/Account.jsx';
import Checkout from './screens/Checkout.jsx';
import Ticket from './screens/Ticket.jsx';
import Pass from './screens/Pass.jsx';
import Bookings from './screens/Bookings.jsx';
import Plus from './screens/Plus.jsx';
import About from './screens/About.jsx';

const LAYERS = { checkout: Checkout, ticket: Ticket, pass: Pass, bookings: Bookings, plus: Plus, about: About, transport: Transport };
const TABS = [
  ['home', 'home', ['الرئيسية', 'Home']], ['transport', 'route', ['التنقّل', 'Transport']], ['plan', 'cal', ['خطتي', 'My plan']],
  ['parking', 'parking', ['المواقف', 'Parking']], ['account', 'user', ['حسابي', 'Account']],
];

function Shell() {
  const { state, tab, go, stack, toast, L } = useApp();
  const [splash, setSplash] = useState(true);
  useEffect(() => { const t = setTimeout(() => setSplash(false), 1700); return () => clearTimeout(t); }, []);
  const Screen = { home: Home, transport: Transport, plan: Plan, parking: Parking, account: Account }[tab];
  return (
    <div className="app">
      {splash && <Splash />}
      {!state.onboarded ? <Onboarding /> : <>
        <Screen key={tab} />
        <nav className="tabbar">
          {TABS.map(([id, icon, name]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => go(id)} data-tab={id}><Ic n={icon} s={23} /><span>{L(name)}</span></button>
          ))}
        </nav>
        {stack.map(l => { const C = LAYERS[l.name]; return <div className="layer" key={l.key}><C {...l.props} layer /></div>; })}
      </>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
export default function App() { return <AppProvider><Shell /></AppProvider>; }
