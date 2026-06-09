import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Register a minimal, NON-CACHING service worker. It enables installability
// (the "Install App" button) but never precaches app assets, so the site always
// loads fresh content. On activation it also deletes any caches created by the
// previous PWA build, which is what had been serving stale admin/main-site data.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
