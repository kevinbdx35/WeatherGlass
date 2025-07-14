import React, { useEffect } from 'react';
import useTranslation from '../hooks/useTranslation';

const Footer = ({ currentBackground }) => {
  const { t } = useTranslation();

  // Charger le widget Ko-fi
  useEffect(() => {
    // Charger le script Ko-fi s'il n'est pas déjà chargé
    if (!window.kofiwidget2) {
      const script = document.createElement('script');
      script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
      script.async = true;
      script.onload = () => {
        if (window.kofiwidget2) {
          window.kofiwidget2.init('Support me on Ko-fi', '#72a4f2', 'W7W61I0YBJ');
          window.kofiwidget2.draw();
        }
      };
      document.head.appendChild(script);
    } else {
      // Si le script est déjà chargé, initialiser directement
      window.kofiwidget2.init('Support me on Ko-fi', '#72a4f2', 'W7W61I0YBJ');
      window.kofiwidget2.draw();
    }
  }, []);

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
          <div id="kofi-widget-container" className="kofi-container">
            {/* Le widget Ko-fi sera inséré ici automatiquement */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;