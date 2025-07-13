import React from 'react';
import ForecastCard from './ForecastCard';
import useTranslation from '../hooks/useTranslation';

const WeeklyForecast = ({ forecastData }) => {
  const { t } = useTranslation();

  if (!forecastData || forecastData.length === 0) {
    return null;
  }

  return (
    <div className="weekly-forecast">
      <h2 className="forecast-title">
        {t('forecast.weeklyTitle', 'Prévisions sur 7 jours')}
      </h2>
      
      <div className="forecast-grid">
        {forecastData.map((dayForecast, index) => (
          <ForecastCard
            key={index}
            forecast={dayForecast}
            isToday={index === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default WeeklyForecast;