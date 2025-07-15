import React from 'react';
import useTranslation from '../hooks/useTranslation';

/**
 * Bouton Clear simple pour le nouveau layout épuré
 */
const SimpleClearButton = ({ onClear }) => {
  const { t } = useTranslation();

  return (
    <button 
      className="simple-clear-button"
      onClick={onClear}
      aria-label={t('search.clear')}
    >
      {t('search.clear') || 'Clear'}
    </button>
  );
};

export default SimpleClearButton;