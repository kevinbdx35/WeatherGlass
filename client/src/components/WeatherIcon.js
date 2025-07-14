import React from 'react';

/**
 * Composant d'icône météo SVG animée
 * Affiche une icône personnalisée selon la condition météorologique
 * @param {string} condition - Condition météo (Clear, Clouds, Rain, etc.)
 * @param {number} size - Taille de l'icône en pixels
 * @param {boolean} animated - Active/désactive les animations
 */
const WeatherIcon = ({ condition, size = 64, animated = true }) => {

  /**
   * Génère l'icône SVG correspondant à la condition météo
   * @param {string} condition - Condition météorologique
   * @returns {JSX.Element} Élément SVG animé
   */
  const getSVGIcon = (condition) => {
    switch (condition) {
      case 'Clear':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="weather-svg">
            <circle cx="12" cy="12" r="5" fill="#FFD700" className={animated ? 'animate-pulse' : ''} />
            <g stroke="#FFD700" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="3" className={animated ? 'animate-ray' : ''} />
              <line x1="12" y1="21" x2="12" y2="23" className={animated ? 'animate-ray' : ''} />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" className={animated ? 'animate-ray' : ''} />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" className={animated ? 'animate-ray' : ''} />
              <line x1="1" y1="12" x2="3" y2="12" className={animated ? 'animate-ray' : ''} />
              <line x1="21" y1="12" x2="23" y2="12" className={animated ? 'animate-ray' : ''} />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" className={animated ? 'animate-ray' : ''} />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" className={animated ? 'animate-ray' : ''} />
            </g>
          </svg>
        );
      
      case 'Clouds':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="weather-svg">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#87CEEB" className={animated ? 'animate-float' : ''} />
          </svg>
        );
      
      case 'Rain':
      case 'Drizzle':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="weather-svg">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#87CEEB" />
            <g stroke="#4169E1" strokeWidth="2" strokeLinecap="round" className={animated ? 'animate-rain' : ''}>
              <line x1="8" y1="19" x2="8" y2="21" />
              <line x1="8" y1="13" x2="8" y2="15" />
              <line x1="12" y1="19" x2="12" y2="21" />
              <line x1="12" y1="13" x2="12" y2="15" />
              <line x1="16" y1="19" x2="16" y2="21" />
              <line x1="16" y1="13" x2="16" y2="15" />
            </g>
          </svg>
        );
      
      case 'Thunderstorm':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="weather-svg">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#696969" />
            <path d="M13 11l-4 6h2l-2 4 4-6h-2l2-4z" fill="#FFD700" className={animated ? 'animate-flash' : ''} />
          </svg>
        );
      
      case 'Snow':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="weather-svg">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#87CEEB" />
            <g fill="#FFFFFF" className={animated ? 'animate-snow' : ''}>
              <circle cx="8" cy="16" r="1" />
              <circle cx="12" cy="18" r="1" />
              <circle cx="16" cy="16" r="1" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="14" cy="20" r="1" />
            </g>
          </svg>
        );
      
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" className="weather-svg">
            <circle cx="12" cy="12" r="5" fill="#FFD700" opacity="0.7" />
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#87CEEB" opacity="0.8" />
          </svg>
        );
    }
  };

  return (
    <div 
      className="weather-icon" 
      style={{ width: size, height: size }}
      title={condition}
    >
      {getSVGIcon(condition)}
    </div>
  );
};

export default WeatherIcon;