import React from 'react';

/**
 * Composant d'affichage météo simple et épuré
 * Design minimaliste avec seulement ville + température
 */
const SimpleWeatherDisplay = ({ data }) => {
  
  // Ne pas afficher si aucune donnée
  if (!data.name) return null;

  return (
    <div className="simple-weather-main">
      <h1 className="simple-city-name">{data.name}</h1>
      <div className="simple-temperature">
        {data.main && data.main.temp && data.main.temp.toFixed()}°C
      </div>
    </div>
  );
};

export default SimpleWeatherDisplay;