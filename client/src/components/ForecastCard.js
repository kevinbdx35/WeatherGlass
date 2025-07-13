import React from 'react';
import useTranslation from '../hooks/useTranslation';

const ForecastCard = ({ forecast, isToday }) => {
  const { t } = useTranslation();

  const formatDate = (date) => {
    if (isToday) {
      return t('forecast.today', 'Aujourd\'hui');
    }
    
    return date.toLocaleDateString(t('common.locale', 'fr-FR'), {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeatherIcon = (iconCode, main) => {
    // Map weather conditions to emojis for better visual appeal
    const iconMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
      'Dust': '💨',
      'Sand': '💨',
      'Ash': '🌋',
      'Squall': '💨',
      'Tornado': '🌪️'
    };

    return iconMap[main] || '🌤️';
  };

  const translateCondition = (condition) => {
    return t(`weather.conditions.${condition}`, condition);
  };

  return (
    <div className={`forecast-card ${isToday ? 'today' : ''}`}>
      <div className="forecast-date">
        {formatDate(forecast.date)}
      </div>
      
      <div className="forecast-icon">
        {getWeatherIcon(forecast.icon, forecast.main)}
      </div>
      
      <div className="forecast-condition">
        {translateCondition(forecast.main)}
      </div>
      
      <div className="forecast-temps">
        <span className="temp-max">
          {forecast.maxTemp}{t('weather.units.temperature', '°C')}
        </span>
        <span className="temp-min">
          {forecast.minTemp}{t('weather.units.temperature', '°C')}
        </span>
      </div>
      
      <div className="forecast-details">
        <div className="detail-item">
          <span className="detail-icon">💧</span>
          <span className="detail-value">
            {forecast.humidity}{t('weather.units.percentage', '%')}
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-icon">💨</span>
          <span className="detail-value">
            {forecast.windSpeed} {t('weather.units.speed', 'km/h')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForecastCard;