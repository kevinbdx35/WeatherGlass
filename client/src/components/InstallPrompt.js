import React from 'react';
import useTranslation from '../hooks/useTranslation';
import usePWA from '../hooks/usePWA';

const InstallPrompt = () => {
  const { t } = useTranslation();
  const { isInstallable, installApp, dismissInstallPrompt } = usePWA();

  if (!isInstallable) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      console.log('App installed successfully');
    }
  };

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <button 
          className="install-close-button"
          onClick={dismissInstallPrompt}
          aria-label={t('pwa.dismiss', 'Dismiss install prompt')}
          title={t('pwa.dismiss', 'Dismiss install prompt')}
        >
          ✕
        </button>
        <div className="install-icon">📱</div>
        <div className="install-text">
          <h3>{t('pwa.installTitle', 'Install WeatherGlass')}</h3>
          <p>{t('pwa.installDescription', 'Get quick access to weather updates right from your home screen')}</p>
        </div>
        <div className="install-actions">
          <button 
            className="install-button secondary"
            onClick={dismissInstallPrompt}
          >
            {t('pwa.notNow', 'Not now')}
          </button>
          <button 
            className="install-button primary"
            onClick={handleInstall}
          >
            {t('pwa.install', 'Install')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;