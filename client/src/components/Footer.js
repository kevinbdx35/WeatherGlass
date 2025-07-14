import React from 'react';
import useTranslation from '../hooks/useTranslation';

const Footer = ({ currentBackground }) => {
  const { t } = useTranslation();

  // Toujours afficher le footer avec un contenu par défaut si pas d'attribution
  const showAttribution = currentBackground && currentBackground.author;

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
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
              WeatherGlass © 2025 - Powered by Open-Meteo
            </div>
          )}
        </div>
        
        <div className="footer-right">
          <div className="kofi-container">
            <a 
              href="https://ko-fi.com/W7W61I0YBJ" 
              target="_blank" 
              rel="noopener noreferrer"
              className="kofi-button"
              style={{
                backgroundColor: '#72a4f2',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              ☕ Support me on Ko-fi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;