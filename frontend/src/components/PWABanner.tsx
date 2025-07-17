import React from 'react';
import { Download, X, RefreshCw, WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const PWABanner: React.FC = () => {
  const { isInstallable, isOffline, hasUpdate, installApp, reloadApp } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = React.useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = React.useState(false);

  React.useEffect(() => {
    setShowInstallBanner(isInstallable);
  }, [isInstallable]);

  React.useEffect(() => {
    setShowUpdateBanner(hasUpdate);
  }, [hasUpdate]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowInstallBanner(false);
    }
  };

  const handleUpdate = () => {
    reloadApp();
    setShowUpdateBanner(false);
  };

  return (
    <>
      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium z-50 flex items-center justify-center gap-2">
          <WifiOff size={16} />
          You are currently offline. Some features may not be available.
        </div>
      )}

      {/* Install banner */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="bg-rose-100 p-2 rounded-lg">
              <Download className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Install Lakra</h3>
              <p className="text-sm text-gray-600 mt-1">
                Install our app for a better experience and offline access.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-rose-700 transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Update banner */}
      {showUpdateBanner && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 z-40 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Update Available</h3>
              <p className="text-sm text-gray-600 mt-1">
                A new version of Lakra is available. Reload to update.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Reload
                </button>
                <button
                  onClick={() => setShowUpdateBanner(false)}
                  className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowUpdateBanner(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
