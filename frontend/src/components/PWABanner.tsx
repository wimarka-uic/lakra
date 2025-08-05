import React from 'react';
import { Download, X, RefreshCw, WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const PWABanner: React.FC = () => {
  const { isInstallable, isOffline, isUpdating, updateProgress, installApp } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = React.useState(false);

  React.useEffect(() => {
    setShowInstallBanner(isInstallable);
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowInstallBanner(false);
    }
  };

  const handleCloseInstall = () => {
    setShowInstallBanner(false);
  };

  // Show update progress overlay
  if (isUpdating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Updating Lakra</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please wait while we update to the latest version...
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${updateProgress}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-gray-500">
            {updateProgress}% complete
          </div>
        </div>
      </div>
    );
  }

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
        <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40 max-w-sm animate-in slide-in-from-right-2 duration-300">
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
                  onClick={handleCloseInstall}
                  className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={handleCloseInstall}
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
