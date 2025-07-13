import React from 'react';
import WeatherIcon from './WeatherIcon';

const WeatherDisplay = React.memo(({ data }) => {
  if (!data.name) return null;

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  return (
    <div className="weather-container">
      <div className="weather-main">
        <div className="location-info">
          <h2 className="city-name">{data.name}</h2>
          {data.sys && (
            <span className="country-name">{data.sys.country}</span>
          )}
        </div>
        
        <div className="temperature-display">
          <div className="temp-main">
            {data.main && <span className="temp-value">{data.main.temp.toFixed()}</span>}
            <span className="temp-unit">°C</span>
          </div>
          
          <div className="weather-info">
            <div className="weather-icon-container">
              {data.weather && (
                <WeatherIcon 
                  condition={data.weather[0].main} 
                  size={80}
                  animated={true}
                />
              )}
            </div>
            <div className="weather-description">
              {data.weather && (
                <>
                  <p className="weather-main-desc">{data.weather[0].main}</p>
                  <p className="weather-detail-desc">{data.weather[0].description}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="weather-details">
        <div className="detail-card feels-like">
          <div className="card-icon">🌡️</div>
          <div className="card-content">
            {data.main && (
              <span className="card-value">{data.main.feels_like.toFixed()}°C</span>
            )}
            <span className="card-label">Ressenti</span>
          </div>
        </div>
        
        <div className="detail-card humidity">
          <div className="card-icon">💧</div>
          <div className="card-content">
            {data.main && (
              <span className="card-value">{data.main.humidity}%</span>
            )}
            <span className="card-label">Humidité</span>
          </div>
        </div>
        
        <div className="detail-card wind">
          <div className="card-icon">💨</div>
          <div className="card-content">
            {data.wind && (
              <>
                <span className="card-value">
                  {data.wind.speed.toFixed()} km/h
                </span>
                {data.wind.deg && (
                  <span className="wind-direction">
                    {getWindDirection(data.wind.deg)}
                  </span>
                )}
              </>
            )}
            <span className="card-label">Vent</span>
          </div>
        </div>

        {data.main && (
          <div className="detail-card pressure">
            <div className="card-icon">🌊</div>
            <div className="card-content">
              <span className="card-value">{data.main.pressure} hPa</span>
              <span className="card-label">Pression</span>
            </div>
          </div>
        )}

        {data.visibility && (
          <div className="detail-card visibility">
            <div className="card-icon">👁️</div>
            <div className="card-content">
              <span className="card-value">{(data.visibility / 1000).toFixed(1)} km</span>
              <span className="card-label">Visibilité</span>
            </div>
          </div>
        )}

        {data.clouds && (
          <div className="detail-card clouds">
            <div className="card-icon">☁️</div>
            <div className="card-content">
              <span className="card-value">{data.clouds.all}%</span>
              <span className="card-label">Couverture nuageuse</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

WeatherDisplay.displayName = 'WeatherDisplay';

export default WeatherDisplay;