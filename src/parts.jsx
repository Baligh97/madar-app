import React from 'react';
import { useApp } from './store.jsx';
import { Ic, Sheet, IconBox } from './ui.jsx';
import { PLACE_LIST, PLACES, MODES } from './data.js';

const TYPE = { airport: ['مطار', 'Airport'], marina: ['مرسى', 'Marina'], island: ['جزيرة', 'Island'], coast: ['ساحل', 'Coast'], desert: ['صحراء', 'Desert'], mountain: ['جبل', 'Mountain'] };

export function PlacePicker({ open, onClose, onPick, title, exclude, current }) {
  const { L } = useApp();
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {PLACE_LIST.filter(p => p.id !== exclude).map(p => (
        <button key={p.id} className="opt" onClick={() => { onPick(p.id); onClose(); }} data-place={p.id}>
          <IconBox n={p.type} tone={p.id === current ? 'dark' : 'mist'} size={44} s={22} />
          <div className="grow"><div className="t-title">{L(p.name)}</div><div className="t-sub">{L(TYPE[p.type])}</div></div>
          {p.id === current && <Ic n="check" s={20} style={{ color: 'var(--turq)' }} />}
        </button>
      ))}
    </Sheet>
  );
}

/** stylised (illustrative) map of the destination — sea on the west, mainland on the east */
export function MapView({ pins = [], here, route, onPin, height }) {
  const { L } = useApp();
  const pt = id => PLACES[id];
  return (
    <div className="mapbox" style={height ? { height } : null}>
      <svg viewBox="0 0 110 140" preserveAspectRatio="xMidYMid slice" style={height ? { height: '100%' } : null}>
        <defs>
          <linearGradient id="sea" x1="0" x2="1"><stop offset="0" stopColor="#8FD3D6" /><stop offset="1" stopColor="#C9ECEA" /></linearGradient>
          <linearGradient id="land" x1="0" x2="1"><stop offset="0" stopColor="#F3E7D3" /><stop offset="1" stopColor="#E9D6B8" /></linearGradient>
        </defs>
        <rect width="110" height="140" fill="url(#sea)" />
        {[18, 34, 52].map(r => <circle key={r} cx="44" cy="64" r={r} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".5" />)}
        <path d="M110 0H70C64 12 58 22 60 34C61 42 56 50 57 58C58 66 52 72 56 82C59 90 62 98 66 108C70 118 72 130 74 140H110Z" fill="url(#land)" />
        <path d="M70 0C64 12 58 22 60 34C61 42 56 50 57 58C58 66 52 72 56 82C59 90 62 98 66 108C70 118 72 130 74 140" fill="none" stroke="#fff" strokeWidth="1.2" strokeOpacity=".8" />
        {/* islands */}
        <path d="M37 60C40 56 48 56 51 61C53 65 51 71 46 72C41 73 35 70 35 65C35 63 36 61 37 60Z" fill="#F3E7D3" stroke="#fff" strokeWidth=".8" />
        <path d="M17 31C20 28 26 29 28 33C29 37 27 41 23 42C19 43 15 40 15 36C15 34 16 32 17 31Z" fill="#F3E7D3" stroke="#fff" strokeWidth=".8" />
        <circle cx="29" cy="45" r="2.2" fill="#F3E7D3" stroke="#fff" strokeWidth=".6" />
        <path d="M19 104C22 100 29 101 30 106C31 110 28 114 24 114C20 114 17 111 17 108C17 106 18 105 19 104Z" fill="#F3E7D3" stroke="#fff" strokeWidth=".8" />
        <circle cx="13" cy="80" r="1.6" fill="#F3E7D3" /><circle cx="33" cy="88" r="1.3" fill="#F3E7D3" />
        {/* bridge to Shura + roads */}
        <path d="M51 66L57 70" stroke="#0B3C49" strokeWidth="1" strokeOpacity=".5" strokeDasharray="1.5 1" />
        <path d="M60 76L78 62L63 44M78 62L88 30M78 62L86 112M60 76L86 112" fill="none" stroke="#0B3C49" strokeOpacity=".16" strokeWidth=".9" />
        {route && route.length > 1 && <polyline points={route.map(id => `${pt(id).x},${pt(id).y}`).join(' ')} fill="none" stroke="#FF6B57" strokeWidth="1.6" strokeDasharray="3 2" strokeLinecap="round" />}
        {pins.map(p => {
          const q = pt(p.place); const dx = p.dx || 0, dy = p.dy || 0;
          return (
            <g key={p.id} transform={`translate(${q.x + dx} ${q.y + dy})`} onClick={() => onPin?.(p.id)} style={{ cursor: onPin ? 'pointer' : 'default' }} data-pin={p.id}>
              <circle r={p.active ? 6.2 : 5} fill={p.color || '#0B3C49'} stroke="#fff" strokeWidth="1.2" />
              <text y="1.9" textAnchor="middle" fontSize={p.label && String(p.label).length > 2 ? 3.6 : 4.4} fontWeight="700" fill="#fff" fontFamily="Alexandria">{p.label}</text>
            </g>
          );
        })}
        {here && <g transform={`translate(${pt(here).x} ${pt(here).y})`}><circle r="7" fill="#FF6B57" fillOpacity=".22"><animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" /></circle><circle r="2.6" fill="#FF6B57" stroke="#fff" strokeWidth="1" /></g>}
      </svg>
      <span className="map-note">{L('خريطة توضيحية', 'Illustrative map')}</span>
    </div>
  );
}

export function LegPills({ option }) {
  const { L } = useApp();
  return (
    <div className="legs">
      {option.legs.map((l, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Ic n="fwd" s={12} style={{ color: '#93A1A6' }} />}
          <span className="leg-pill"><Ic n={MODES[l.mode].icon} s={13} />{L(PLACES[l.to].short)}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
export const optionTitle = (o, L) => o.legs.length === 1 ? L(MODES[o.legs[0].mode].name)
  : o.legs.map(l => L(MODES[l.mode].name)).filter((v, i, a) => a.indexOf(v) === i).join(L(' + ', ' + '));
export const optionIcon = (o) => MODES[o.kind].icon;
