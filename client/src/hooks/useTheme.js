import { useState, useEffect, useCallback } from 'react';

const useTheme = () => {
  // Mode peut être 'light', 'dark', ou 'auto'
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('weather-app-theme');
    return savedTheme || 'auto';
  });

  // Fonction pour déterminer le thème selon l'heure
  const getThemeByTime = useCallback(() => {
    const hour = new Date().getHours();
    // Mode sombre de 19h à 7h (7pm à 7am)
    return (hour >= 19 || hour < 7) ? 'dark' : 'light';
  }, []);

  // Thème effectif (résolu depuis le mode)
  const [effectiveTheme, setEffectiveTheme] = useState(() => {
    if (themeMode === 'auto') {
      return getThemeByTime();
    }
    return themeMode;
  });

  // Mise à jour du thème effectif quand le mode change
  useEffect(() => {
    let interval;
    
    if (themeMode === 'auto') {
      // Mettre à jour immédiatement
      setEffectiveTheme(getThemeByTime());
      
      // Vérifier toutes les minutes si on est en mode auto
      interval = setInterval(() => {
        const newTheme = getThemeByTime();
        setEffectiveTheme(currentTheme => {
          if (currentTheme !== newTheme) {
            return newTheme;
          }
          return currentTheme;
        });
      }, 60000); // Vérification toutes les minutes
    } else {
      setEffectiveTheme(themeMode);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [themeMode, getThemeByTime]);

  // Appliquer le thème au DOM
  useEffect(() => {
    localStorage.setItem('weather-app-theme', themeMode);
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [themeMode, effectiveTheme]);

  // Fonction pour cycler entre les modes : auto -> light -> dark -> auto
  const toggleTheme = () => {
    setThemeMode(prevMode => {
      if (prevMode === 'auto') return 'light';
      if (prevMode === 'light') return 'dark';
      return 'auto';
    });
  };

  return {
    themeMode,           // Mode sélectionné ('auto', 'light', 'dark')
    theme: effectiveTheme, // Thème effectif ('light', 'dark')
    toggleTheme,
    isDark: effectiveTheme === 'dark',
    isAuto: themeMode === 'auto'
  };
};

export default useTheme;