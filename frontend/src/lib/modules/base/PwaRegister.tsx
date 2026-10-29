'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true,
    );
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      void (async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          await reg.update().catch(() => undefined);
        } catch (error) {
          console.error('PWA service worker registration failed', error);
        }
      })();
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    const onInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
      setShowIosHint(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => undefined);
    setDeferredPrompt(null);
    setCanInstall(false);
  }

  if (isStandalone || (!canInstall && !isIos)) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 shadow-lg backdrop-blur-md">
        {canInstall ? (
          <>
            <p className="min-w-0 flex-1 leading-snug">Install Fast-Next on your device</p>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-sky-500 px-3 py-1.5 font-medium text-slate-950 transition hover:bg-sky-400"
              onClick={() => void installApp()}
            >
              Install
            </button>
          </>
        ) : isIos ? (
          showIosHint ? (
            <>
              <p className="min-w-0 flex-1 leading-snug">
                Tap Share, then <strong>Add to Home Screen</strong>
              </p>
              <button
                type="button"
                className="shrink-0 text-slate-400 hover:text-white"
                onClick={() => setShowIosHint(false)}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              type="button"
              className="font-medium text-sky-300 hover:text-sky-200"
              onClick={() => setShowIosHint(true)}
            >
              Add to Home Screen
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
