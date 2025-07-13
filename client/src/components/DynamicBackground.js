import React, { useState, useEffect } from 'react';

const DynamicBackground = ({ 
  currentBackground
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
    </>
  );
};

export default DynamicBackground;