import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// The browser fires this event when the app meets installability criteria.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Floating "Install App" button shown on BOTH the public website and the admin
 * panel. It uses the standard `beforeinstallprompt` flow so the installed app
 * looks exactly like the website. The button only appears when the app is
 * actually installable and is not already installed.
 */
export default function InstallAppButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If already running as an installed app, never show the button.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } finally {
      setDeferred(null);
      setVisible(false);
    }
  };

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <div className="flex items-center gap-2 rounded-2xl bg-brand-orange text-brand-white shadow-2xl shadow-black/40 pl-4 pr-2 py-2.5 ring-1 ring-white/20 animate-fade-in">
        <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
        <button onClick={handleInstall} className="text-sm font-semibold whitespace-nowrap">
          Install App
        </button>
        <button
          onClick={() => setVisible(false)}
          aria-label="Dismiss install prompt"
          className="p-1 rounded-lg hover:bg-white/15 transition-colors"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
