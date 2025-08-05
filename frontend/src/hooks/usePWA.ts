import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  isUpdating: boolean;
  updateProgress: number;
}

// Extend Navigator interface for iOS standalone detection
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export const usePWA = () => {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOffline: false,
    hasUpdate: false,
    isUpdating: false,
    updateProgress: 0
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = Boolean('standalone' in window.navigator && window.navigator.standalone);
    const isInstalled = isStandalone || isInWebAppiOS;

    // Check if app is offline
    const isOffline = !navigator.onLine;

    setPWAState(prev => ({
      ...prev,
      isInstalled,
      isOffline
    }));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPWAState(prev => ({ ...prev, isInstallable: true }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setPWAState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      setDeferredPrompt(null);
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOffline: true }));
    };

    // Enhanced automatic update handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          // Check for waiting service worker
          if (registration.waiting) {
            // Auto-update if there's a waiting service worker
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            setPWAState(prev => ({ 
              ...prev, 
              hasUpdate: true, 
              isUpdating: true,
              updateProgress: 50 
            }));
            
            // Simulate update progress
            const progressInterval = setInterval(() => {
              setPWAState(prev => ({ 
                ...prev, 
                updateProgress: Math.min(prev.updateProgress + 10, 90) 
              }));
            }, 200);

            // Listen for controller change (when new service worker takes over)
            const handleControllerChange = () => {
              clearInterval(progressInterval);
              setPWAState(prev => ({ 
                ...prev, 
                hasUpdate: false, 
                isUpdating: false,
                updateProgress: 100 
              }));
              
              // Reload after a short delay to ensure smooth transition
              setTimeout(() => {
                window.location.reload();
              }, 500);
            };

            navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
            
            // Cleanup
            return () => {
              clearInterval(progressInterval);
              navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            };
          }

          // Listen for new service worker installation
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Auto-update when new service worker is installed
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  setPWAState(prev => ({ 
                    ...prev, 
                    hasUpdate: true, 
                    isUpdating: true,
                    updateProgress: 50 
                  }));
                  
                  // Simulate update progress
                  const progressInterval = setInterval(() => {
                    setPWAState(prev => ({ 
                      ...prev, 
                      updateProgress: Math.min(prev.updateProgress + 10, 90) 
                    }));
                  }, 200);

                  // Listen for controller change
                  const handleControllerChange = () => {
                    clearInterval(progressInterval);
                    setPWAState(prev => ({ 
                      ...prev, 
                      hasUpdate: false, 
                      isUpdating: false,
                      updateProgress: 100 
                    }));
                    
                    // Reload after a short delay
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  };

                  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
                }
              });
            }
          });
        }
      });
    }

    // Register event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setPWAState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error installing app:', error);
      return false;
    }
  };

  const reloadApp = () => {
    window.location.reload();
  };

  return {
    ...pwaState,
    installApp,
    reloadApp
  };
};
