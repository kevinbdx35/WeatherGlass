import React from 'react';
import WeatherIcon from './WeatherIcon';
import DataQualityBadge from './DataQualityBadge';
import useTranslation from '../hooks/useTranslation';

/**
 * Composant d'affichage principal des données météo
 * Inclut la température, les conditions et les détails météorologiques
 * @param {Object} data - Données météo de l'API
 */
const WeatherDisplay = ({ data }) => {
  const { t } = useTranslation();
  
  // Ne pas afficher si aucune donnée
  if (!data.name) return null;

  return (
    <div className="weather-container">
      {/* Badge de qualité des données */}
      <DataQualityBadge data={data} compact={true} className="weather-quality-badge" />
      
      <div className="weather-main">
        <div className="location-info">
          <h2 className="city-name">{data.name}</h2>
          {data.sys && (
            <span className="country-name">{data.sys.country}</span>
          )}
        </div>
        
        <div className="temperature-display">
          <div className="temp-main">
            {data.main && data.main.temp && <span className="temp-value">{data.main.temp.toFixed()}</span>}
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
                  <p className="weather-main-desc">
                    {t(`weather.conditions.${data.weather[0].main}`) || data.weather[0].main}
                  </p>
                  <p className="weather-detail-desc">{data.weather[0].description}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;