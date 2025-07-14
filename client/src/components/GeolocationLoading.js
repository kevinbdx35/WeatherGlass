import React from 'react';
import useTranslation from '../hooks/useTranslation';

/**
 * Composant d'indication de chargement spécifique à la géolocalisation
 * Affiche un message informatif pendant la récupération de la position
 */
const GeolocationLoading = () => {
  const { t } = useTranslation();

  return (
    <div className="geolocation-loading">
      <div className="geolocation-content">
        <div className="geolocation-icon">
          📍
        </div>
        <div className="geolocation-text">
          <h3 className="geolocation-title">
            {t('search.geolocation.detecting')}
          </h3>
          <p className="geolocation-subtitle">
            {t('search.geolocation.allowAccess')}
          </p>
        </div>
        <div className="geolocation-spinner">
          <div className="spinner-ring"></div>
        </div>
      </div>
    </div>
  );
};

export default GeolocationLoading;