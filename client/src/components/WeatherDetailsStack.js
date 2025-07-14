import React from 'react';
import useTranslation from '../hooks/useTranslation';

/**
 * Composant pour afficher les détails météo empilés verticalement
 * Remplace les cartes horizontales dans le grid layout
 */
const WeatherDetailsStack = ({ data }) => {
  const { t } = useTranslation();

  if (!data || !data.main) {
    return null;
  }

  const details = [
    {
      icon: '🌡️',
      label: t('weather.metrics.feelsLike'),
      value: data.main.feels_like ? `${data.main.feels_like.toFixed()}${t('weather.units.temperature')}` : '--',
      priority: 'high'
    },
    {
      icon: '💧',
      label: t('weather.metrics.humidity'),
      value: data.main.humidity ? `${data.main.humidity}${t('weather.units.percentage')}` : '--',
      priority: 'high'
    },
    {
      icon: '💨',
      label: t('weather.metrics.wind'),
      value: data.wind?.speed ? `${(data.wind.speed * 3.6).toFixed()} ${t('weather.units.speed')}` : '--',
      priority: 'medium'
    },
    {
      icon: '📊',
      label: t('weather.metrics.pressure'),
      value: data.main.pressure ? `${data.main.pressure} ${t('weather.units.pressure')}` : '--',
      priority: 'medium'
    },
    {
      icon: '👁️',
      label: t('weather.metrics.visibility'),
      value: data.visibility ? `${(data.visibility / 1000).toFixed(1)} ${t('weather.units.distance')}` : '--',
      priority: 'low'
    },
    {
      icon: '☁️',
      label: t('weather.metrics.clouds'),
      value: data.clouds?.all !== undefined ? `${data.clouds.all}${t('weather.units.percentage')}` : '--',
      priority: 'low'
    }
  ];

  return (
    <div className="weather-details-stack">
      {details.map((detail, index) => (
        <div key={index} className={`detail-stack-item priority-${detail.priority}`}>
          <div className="stack-item-icon">{detail.icon}</div>
          <div className="stack-item-content">
            <div className="stack-item-label">{detail.label}</div>
            <div className="stack-item-value">{detail.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherDetailsStack;