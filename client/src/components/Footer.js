import React from 'react';
import useTranslation from '../hooks/useTranslation';

const Footer = ({ currentBackground }) => {
  const { t } = useTranslation();

  // Toujours afficher le footer avec un contenu par défaut si pas d'attribution
  const showAttribution = currentBackground && currentBackground.author;

  return (
    <footer className="app-footer">
      <div className="footer-content">
        {showAttribution ? (
          <div className="attribution-text">
            {t('attribution.photoBy')}{' '}
            <a 
              href={currentBackground.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="attribution-link"
            >
              {currentBackground.author}
            </a>
            {' '}{t('attribution.onUnsplash')}{' '}
            <a 
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="attribution-link"
            >
              Unsplash
            </a>
          </div>
        ) : (
          <div className="attribution-text">
            WeatherGlass © 2025 - Powered by OpenWeatherMap
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;