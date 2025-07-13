import React from 'react';
import useTranslation from '../hooks/useTranslation';
import useWeatherBackground from '../hooks/useWeatherBackground';

const Footer = () => {
  const { t } = useTranslation();
  const { currentBackground } = useWeatherBackground();

  if (!currentBackground || !currentBackground.author) {
    return null;
  }

  return (
    <footer className="app-footer">
      <div className="footer-content">
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
      </div>
    </footer>
  );
};

export default Footer;