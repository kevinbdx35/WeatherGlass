import React from 'react';
import useTranslation from '../hooks/useTranslation';
import usePWA from '../hooks/usePWA';

const InstallPrompt = () => {
  const { t } = useTranslation();
  const { isInstallable, installApp } = usePWA();

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
        <div className="install-icon">📱</div>
        <div className="install-text">
          <h3>{t('pwa.installTitle', 'Install Weather App')}</h3>
          <p>{t('pwa.installDescription', 'Get quick access to weather updates right from your home screen')}</p>
        </div>
        <div className="install-actions">
          <button 
            className="install-button"
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