import React from 'react';
import { useTranslation } from 'react-i18next';

const ScreenCaptureLayout = ({ weatherData }) => {
  const { t } = useTranslation();

  if (!weatherData || !weatherData.name) {
    return null;
  }

  const feelsLike = weatherData.main?.feels_like ? Math.round(weatherData.main.feels_like) : '--';
  const humidity = weatherData.main?.humidity ? `${weatherData.main.humidity}%` : '--';
  const windSpeed = weatherData.wind?.speed ? `${Math.round(weatherData.wind.speed)}km/h` : '--';

  return (
    <div className="simple-weather-layout">
      {/* Section principale avec ville et température */}
      <div className="weather-main-section">
        <h1 className="city-display">{weatherData.name}</h1>
        <div className="temperature-display">
          {weatherData.main?.temp ? Math.round(weatherData.main.temp) : '--'}°C
        </div>
      </div>

      {/* Carte métriques en bas */}
      <div className="metrics-card">
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-value">{feelsLike}°C</div>
            <div className="metric-label">{t('weather.metrics.feelsLike')}</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{humidity}</div>
            <div className="metric-label">{t('weather.metrics.humidity')}</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{windSpeed}</div>
            <div className="metric-label">{t('weather.metrics.wind')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenCaptureLayout;