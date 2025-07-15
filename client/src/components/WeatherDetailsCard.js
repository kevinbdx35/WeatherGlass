import React from 'react';
import useTranslation from '../hooks/useTranslation';

/**
 * Composant d'affichage des détails météo sous forme de carte
 * Affiche les métriques essentielles : température ressentie, humidité, vent, pression
 */
const WeatherDetailsCard = ({ data }) => {
  const { t } = useTranslation();

  if (!data || !data.main) {
    return (
      <div className="weather-details-card">
        <h3 className="details-title">{t('weather.details', 'Détails météo')}</h3>
        <div className="details-loading">
          {t('common.loading', 'Chargement...')}
        </div>
      </div>
    );
  }

  const details = [
    {
      label: t('weather.metrics.feelsLike', 'Ressenti'),
      value: data.main.feels_like ? `${Math.round(data.main.feels_like)}°C` : '--',
      icon: '🌡️'
    },
    {
      label: t('weather.metrics.humidity', 'Humidité'),
      value: data.main.humidity ? `${data.main.humidity}%` : '--',
      icon: '💧'
    },
    {
      label: t('weather.metrics.wind', 'Vent'),
      value: data.wind?.speed ? `${Math.round(data.wind.speed)} km/h` : '--',
      icon: '💨'
    },
    {
      label: t('weather.metrics.pressure', 'Pression'),
      value: data.main.pressure ? `${data.main.pressure} hPa` : '--',
      icon: '🌊'
    }
  ];

  return (
    <div className="weather-details-card">
      <h3 className="details-title">{t('weather.details', 'Détails météo')}</h3>
      <div className="details-grid">
        {details.map((detail, index) => (
          <div key={index} className="detail-item">
            <div className="detail-icon">{detail.icon}</div>
            <div className="detail-content">
              <div className="detail-label">{detail.label}</div>
              <div className="detail-value">{detail.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherDetailsCard;