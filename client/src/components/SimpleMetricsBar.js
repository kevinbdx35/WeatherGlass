import React from 'react';
import useTranslation from '../hooks/useTranslation';

/**
 * Barre de métriques simple en bas du layout
 * Affiche 3 métriques principales : Feels Like, Humidity, Wind Speed
 */
const SimpleMetricsBar = ({ data }) => {
  const { t } = useTranslation();
  
  // Ne pas afficher si aucune donnée
  if (!data || !data.main) return null;

  const metrics = [
    {
      value: data.main.feels_like ? `${data.main.feels_like.toFixed()}°C` : '--',
      label: t('weather.metrics.feelsLike')
    },
    {
      value: data.main.humidity ? `${data.main.humidity}%` : '--',
      label: t('weather.metrics.humidity')
    },
    {
      value: data.wind?.speed ? `${(data.wind.speed * 3.6).toFixed()}km/h` : '--',
      label: t('weather.metrics.wind')
    }
  ];

  return (
    <div className="simple-metrics-bar">
      {metrics.map((metric, index) => (
        <div key={index} className="simple-metric">
          <div className="simple-metric-value">{metric.value}</div>
          <div className="simple-metric-label">{metric.label}</div>
        </div>
      ))}
    </div>
  );
};

export default SimpleMetricsBar;