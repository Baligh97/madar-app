import React, { useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  IconSpeedboat, IconPlaneInflight, IconCar, IconParkingCircle, IconMapPin, IconSparkles, IconCalendarEvent, IconTicket, IconRoute,
  IconHome, IconUser, IconBell, IconClock, IconSailboat, IconChevronLeft, IconChevronRight, IconArrowsUpDown, IconStar, IconWallet,
  IconFish, IconShieldCheck, IconBolt, IconLeaf, IconCheck, IconX, IconPlus, IconMinus, IconAnchor, IconMountain, IconToolsKitchen2,
  IconBuildingMonument, IconMoonStars, IconYoga, IconKayak, IconCoffee, IconGolf, IconMoodKid, IconMassage, IconSunset2, IconUmbrella,
  IconChargingPile, IconWheelchair, IconKey, IconVideo, IconRefresh, IconArrowsExchange, IconLanguage, IconTextSize, IconInfoCircle,
  IconTrash, IconCrown, IconPlaneArrival, IconNavigation, IconCreditCard, IconBrandApple, IconSun, IconChevronDown, IconSearch,
  IconWorld, IconHeartHandshake, IconLogout, IconCurrentLocation, IconCar4wd, IconBeach, IconCircleCheck, IconAlertTriangle, IconShare2,
} from '@tabler/icons-react';
import { useApp } from './store.jsx';
import SYMBOL from './symbol.json';

const MAP = {
  boat: IconSpeedboat, plane: IconPlaneInflight, car: IconCar, parking: IconParkingCircle, pin: IconMapPin, ai: IconSparkles, cal: IconCalendarEvent,
  ticket: IconTicket, route: IconRoute, home: IconHome, user: IconUser, bell: IconBell, clock: IconClock, sail: IconSailboat, back: IconChevronRight,
  fwd: IconChevronLeft, swap: IconArrowsUpDown, star: IconStar, wallet: IconWallet, fish: IconFish, shield: IconShieldCheck, bolt: IconBolt, leaf: IconLeaf,
  check: IconCheck, x: IconX, plus: IconPlus, minus: IconMinus, anchor: IconAnchor, mountain: IconMountain, food: IconToolsKitchen2,
  culture: IconBuildingMonument, stars: IconMoonStars, yoga: IconYoga, kayak: IconKayak, coffee: IconCoffee, golf: IconGolf, kids: IconMoodKid,
  spa: IconMassage, sunset: IconSunset2, shade: IconUmbrella, ev: IconChargingPile, access: IconWheelchair, valet: IconKey, cctv: IconVideo,
  refresh: IconRefresh, exchange: IconArrowsExchange, lang: IconLanguage, text: IconTextSize, info: IconInfoCircle, trash: IconTrash, crown: IconCrown,
  flight: IconPlaneArrival, nav: IconNavigation, card: IconCreditCard, apple: IconBrandApple, sun: IconSun, down: IconChevronDown, search: IconSearch,
  world: IconWorld, heart: IconHeartHandshake, logout: IconLogout, locate: IconCurrentLocation, buggy: IconCar4wd, beach: IconBeach,
  ok: IconCircleCheck, warn: IconAlertTriangle, share: IconShare2,
  airport: IconPlaneArrival, marina: IconAnchor, island: IconBeach, coast: IconSailboat, desert: IconSun,
};
export function Ic({ n, s = 22, w = 1.8, className, style }) {
  const C = MAP[n] || IconMapPin;
  const flip = n === 'back' || n === 'fwd';
  return <C size={s} stroke={w} className={(className || '') + (flip ? ' dir-flip' : '')} style={style} aria-hidden="true" />;
}

export function Symbol({ size = 40, variant = 'color', className }) {
  // real brand geometry (see symbol.json) — body + coral dot
  const c = { color: ['url(#mg)', '#FF6B57'], white: ['#fff', '#FF6B57'], mono: ['#0B3C49', '#0B3C49'] }[variant];
  return (
    <svg className={className} viewBox="38 20 130 178" height={size} style={{ display: 'block' }} role="img" aria-label="مَدار">
      <defs><linearGradient id="mg" gradientUnits="userSpaceOnUse" x1="0" y1="118" x2="0" y2="194"><stop offset="0" stopColor="#0B3C49" /><stop offset="1" stopColor="#14B8A6" /></linearGradient></defs>
      <path d={SYMBOL.body} fill={c[0]} /><path d={SYMBOL.dot} fill={c[1]} />
    </svg>
  );
}
export function Wordmark({ color = '#0B3C49', size = 34 }) {
  return (
    <span className="wordmark" style={{ fontSize: size, color }}>
      <span style={{ color: '#FF6B57' }}>مَدار</span><span className="wm-over" style={{ color }}>مدار</span>
    </span>
  );
}

export function Orbits({ cx = 20, cy = 85, step = 34, color = '#fff', op = 0.12, dots = true }) {
  const rings = [];
  for (let i = 1; i <= 9; i++) rings.push(i * step);
  return (
    <svg className="orbits" width="100%" height="100%" preserveAspectRatio="xMinYMax slice" aria-hidden="true">
      <g style={{ transform: `translate(${cx}%, ${cy}%)` }}>
        {rings.map((r, i) => <circle key={r} r={r} fill="none" stroke={color} strokeOpacity={op} strokeWidth="1.2" />)}
        {dots && <><circle cx={step * 2 * Math.cos(-0.9)} cy={step * 2 * Math.sin(-0.9)} r="4.5" fill="#FF6B57" fillOpacity=".85" />
          <circle cx={step * 4 * Math.cos(-0.35)} cy={step * 4 * Math.sin(-0.35)} r="4" fill="#14B8A6" fillOpacity=".8" /></>}
      </g>
    </svg>
  );
}

export function Btn({ children, onClick, kind = 'primary', icon, disabled, full, small, className = '', ...rest }) {
  return (
    <button className={`btn btn-${kind}${full ? ' full' : ''}${small ? ' small' : ''} ${className}`} onClick={onClick} disabled={disabled} {...rest}>
      {icon && <Ic n={icon} s={small ? 17 : 20} />}<span>{children}</span>
    </button>
  );
}
export const Chip = ({ children, on, onClick, icon, className = '', ...rest }) => (
  <button className={`chip${on ? ' on' : ''} ${className}`} onClick={onClick} {...rest}>{icon && <Ic n={icon} s={16} />}{children}</button>
);
export const Card = ({ children, className = '', onClick, ...rest }) => (
  <div className={`card ${onClick ? 'tap ' : ''}${className}`} onClick={onClick} {...rest}>{children}</div>
);
export const IconBox = ({ n, tone = 'mist', s = 26, size = 48 }) => (
  <div className={`ibox tone-${tone}`} style={{ width: size, height: size }}><Ic n={n} s={s} /></div>
);
export const Money = ({ v, small }) => { const { L } = useApp(); return <span className="money">{Math.round(v).toLocaleString('en-US')}<small>{' '}{L('ر.س', 'SAR')}</small></span>; };

export function TopBar({ title, onBack, right, sub }) {
  const { pop, L } = useApp();
  return (
    <header className="topbar">
      <button className="round" onClick={onBack || (() => pop())} aria-label={L('رجوع', 'Back')}><Ic n="back" /></button>
      <div className="topbar-t"><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      <div className="topbar-r">{right}</div>
    </header>
  );
}

export function Sheet({ open, onClose, title, children, tall }) {
  useEffect(() => { if (!open) return; const k = e => e.key === 'Escape' && onClose?.(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true">
      <div className="scrim" onClick={onClose} />
      <div className={`sheet${tall ? ' tall' : ''}`}>
        <div className="grab" />
        {title && <div className="sheet-h"><h2>{title}</h2><button className="round sm" onClick={onClose} aria-label="close"><Ic n="x" s={18} /></button></div>}
        <div className="sheet-b">{children}</div>
      </div>
    </div>
  );
}

export function QR({ text, size = 190, color = '#0B3C49' }) {
  const m = useMemo(() => { try { return QRCode.create(text, { errorCorrectionLevel: 'M' }).modules; } catch (e) { return null; } }, [text]);
  if (!m) return null;
  const n = m.size, cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m.data[y * n + x]) cells.push(<rect key={x + '-' + y} x={x + 0.04} y={y + 0.04} width="0.92" height="0.92" rx="0.22" />);
  return <svg className="qr" viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} role="img" aria-label="QR"><rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" rx="1.6" /><g fill={color}>{cells}</g></svg>;
}

export const Empty = ({ icon, title, body, action }) => (
  <div className="empty"><div className="empty-i"><Ic n={icon} s={34} /></div><h3>{title}</h3><p>{body}</p>{action}</div>
);
export const Stepper = ({ value, onChange, min = 1, max = 8 }) => (
  <div className="stepper"><button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="-"><Ic n="minus" s={18} /></button>
    <b>{value}</b><button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="+"><Ic n="plus" s={18} /></button></div>
);
export const Section = ({ title, action, children }) => (
  <section className="sec"><div className="sec-h"><h2>{title}</h2>{action}</div>{children}</section>
);
