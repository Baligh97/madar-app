import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);

// offline support when served over https (hosted web-app version)
if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.Capacitor) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
