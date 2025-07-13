import React, { useState, useEffect } from 'react';

const DynamicBackground = ({ 
  currentBackground, 
  attribution = true 
}) => {
  const [displayedBackground, setDisplayedBackground] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (currentBackground && currentBackground.url !== displayedBackground?.url) {
      setIsChanging(true);
      
      // Délai court pour permettre la transition CSS
      const timer = setTimeout(() => {
        setDisplayedBackground(currentBackground);
        setIsChanging(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [currentBackground, displayedBackground]);

  return (
    <>
      {/* Background principal */}
      {displayedBackground && (
        <div 
          className={`dynamic-background ${isChanging ? 'changing' : 'stable'}`}
          style={{
            backgroundImage: `url(${displayedBackground.url})`,
          }}
        />
      )}
      
      {/* Attribution Unsplash */}
      {attribution && displayedBackground && displayedBackground.author && (
        <div className="background-attribution">
          Photo by{' '}
          <a 
            href={displayedBackground.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="attribution-link"
          >
            {displayedBackground.author}
          </a>
          {' '}on{' '}
          <a 
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="attribution-link"
          >
            Unsplash
          </a>
        </div>
      )}
    </>
  );
};

export default DynamicBackground;