import { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import NewsTicker from '../ui/NewsTicker';
import WhatsAppButton from './WhatsAppButton';
import SEOHead from './SEOHead';
import InstallPrompt from '../pwa/InstallPrompt';
import NotificationPrompt from '../pwa/NotificationPrompt';
export default function Layout() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && !sessionStorage.getItem('mk-ref-handled')) {
      localStorage.setItem('mk-referred-by', ref);
      sessionStorage.setItem('mk-ref-handled', '1');
    }
  }, [searchParams]);

  return (
    <>
      <SEOHead />
      <header className="fixed top-0 left-0 right-0 z-50">
        <NewsTicker />
        <Navbar />
      </header>
      <div className="site-header-spacer" aria-hidden="true" />
      <NotificationPrompt />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <InstallPrompt />
    </>
  );
}
