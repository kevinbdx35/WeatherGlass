import React from 'react';
import useTranslation from '../hooks/useTranslation';
import usePWA from '../hooks/usePWA';

const OfflineIndicator = () => {
  const { t } = useTranslation();
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <div className="offline-content">
        <span className="offline-icon">📡</span>
        <span className="offline-text">
          {t('pwa.offline', 'You are offline')}
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;