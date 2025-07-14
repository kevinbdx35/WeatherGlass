import React, { useState } from 'react';
import useTranslation from '../hooks/useTranslation';

/**
 * Badge d'indication de qualité des données météo
 * Affiche la source, le score Oracle et la confiance
 */
const DataQualityBadge = ({ 
  data, 
  compact = true,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  // Extraire les informations de qualité
  const aggregatorInfo = data?.aggregator;
  const source = aggregatorInfo?.usedSource || 'unknown';
  const confidence = aggregatorInfo?.confidence || 0;
  const validation = aggregatorInfo?.validation;
  const oracleScore = validation?.score || 0;
  const isValid = validation?.isValid ?? true;
  const warnings = validation?.warnings || [];
  const errors = validation?.errors || [];

  // Déterminer l'icône et couleur selon la source
  const getSourceInfo = (sourceName) => {
    const sources = {
      primary: { 
        icon: '🌐', 
        name: 'Open-Meteo',
        description: 'Service météo open-source européen'
      },
      backup: { 
        icon: '🔄', 
        name: 'WeatherAPI',
        description: 'Service météo commercial de secours'
      },
      alerts: { 
        icon: '🇫🇷', 
        name: 'Météo-France',
        description: 'Service météorologique officiel français'
      },
      legacy: { 
        icon: '☁️', 
        name: 'OpenWeatherMap',
        description: 'Service météo de référence'
      },
      unknown: { 
        icon: '❓', 
        name: 'Source inconnue',
        description: 'Source de données non identifiée'
      }
    };
    return sources[sourceName] || sources.unknown;
  };

  // Déterminer la couleur selon le score Oracle
  const getQualityColor = (score, valid) => {
    if (!valid || score < 0.7) return '#ef4444'; // Rouge
    if (score < 0.9) return '#f59e0b'; // Orange
    return '#22c55e'; // Vert
  };

  // Déterminer l'icône de qualité
  const getQualityIcon = (score, valid) => {
    if (!valid || score < 0.7) return '❌';
    if (score < 0.9) return '⚠️';
    return '✅';
  };

  const sourceInfo = getSourceInfo(source);
  const qualityColor = getQualityColor(oracleScore, isValid);
  const qualityIcon = getQualityIcon(oracleScore, isValid);

  // Formatage du score en pourcentage
  const scorePercentage = Math.round(oracleScore * 100);
  const confidencePercentage = Math.round(confidence * 100);

  // Formatage de l'horodatage
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffMinutes = Math.round((now - updateTime) / (1000 * 60));
    
    if (diffMinutes < 1) return t('dataQuality.justNow');
    if (diffMinutes === 1) return t('dataQuality.oneMinuteAgo');
    if (diffMinutes < 60) return t('dataQuality.minutesAgo', { minutes: diffMinutes });
    
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours === 1) return t('dataQuality.oneHourAgo');
    if (diffHours < 24) return t('dataQuality.hoursAgo', { hours: diffHours });
    
    return t('dataQuality.moreThanOneDay');
  };

  if (!aggregatorInfo) return null;

  return (
    <div 
      className={`data-quality-badge ${compact ? 'compact' : 'expanded'} ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      aria-label={t('dataQuality.ariaLabel', { 
        source: sourceInfo.name, 
        score: scorePercentage 
      })}
      tabIndex={0}
    >
      {/* Badge principal */}
      <div className="quality-badge-main">
        <span className="source-icon" title={sourceInfo.name}>
          {sourceInfo.icon}
        </span>
        <span 
          className="quality-indicator" 
          style={{ color: qualityColor }}
          title={t('dataQuality.scoreTitle', { score: scorePercentage })}
        >
          {qualityIcon}
        </span>
        {!compact && (
          <span className="score-text">
            {scorePercentage}%
          </span>
        )}
      </div>

      {/* Tooltip détaillé */}
      {showTooltip && (
        <div className="quality-tooltip">
          <div className="tooltip-header">
            <h4>{t('dataQuality.title')}</h4>
          </div>
          
          <div className="tooltip-content">
            {/* Informations sur la source */}
            <div className="tooltip-section">
              <div className="tooltip-label">{t('dataQuality.source')}</div>
              <div className="tooltip-value">
                <span className="source-name">
                  {sourceInfo.icon} {sourceInfo.name}
                </span>
                <small className="source-description">
                  {sourceInfo.description}
                </small>
              </div>
            </div>

            {/* Score Oracle */}
            <div className="tooltip-section">
              <div className="tooltip-label">{t('dataQuality.oracleScore')}</div>
              <div className="tooltip-value">
                <span style={{ color: qualityColor }}>
                  {qualityIcon} {scorePercentage}%
                </span>
                <small>
                  {isValid 
                    ? t('dataQuality.dataValid') 
                    : t('dataQuality.dataInvalid')
                  }
                </small>
              </div>
            </div>

            {/* Confiance */}
            <div className="tooltip-section">
              <div className="tooltip-label">{t('dataQuality.confidence')}</div>
              <div className="tooltip-value">
                <span>{confidencePercentage}%</span>
                <small>{t('dataQuality.confidenceDescription')}</small>
              </div>
            </div>

            {/* Stratégie */}
            <div className="tooltip-section">
              <div className="tooltip-label">{t('dataQuality.strategy')}</div>
              <div className="tooltip-value">
                <span>
                  {t(`dataQuality.strategies.${aggregatorInfo.strategy}`) || aggregatorInfo.strategy}
                </span>
              </div>
            </div>

            {/* Horodatage */}
            {aggregatorInfo.timestamp && (
              <div className="tooltip-section">
                <div className="tooltip-label">{t('dataQuality.lastUpdate')}</div>
                <div className="tooltip-value">
                  <span>{getTimeAgo(aggregatorInfo.timestamp)}</span>
                </div>
              </div>
            )}

            {/* Avertissements */}
            {warnings.length > 0 && (
              <div className="tooltip-section warnings">
                <div className="tooltip-label">⚠️ {t('dataQuality.warnings')}</div>
                <ul className="warning-list">
                  {warnings.slice(0, 3).map((warning, index) => (
                    <li key={index} className="warning-item">
                      {warning}
                    </li>
                  ))}
                  {warnings.length > 3 && (
                    <li className="warning-more">
                      +{warnings.length - 3} {t('dataQuality.moreWarnings')}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Erreurs */}
            {errors.length > 0 && (
              <div className="tooltip-section errors">
                <div className="tooltip-label">❌ {t('dataQuality.errors')}</div>
                <ul className="error-list">
                  {errors.slice(0, 2).map((error, index) => (
                    <li key={index} className="error-item">
                      {error}
                    </li>
                  ))}
                  {errors.length > 2 && (
                    <li className="error-more">
                      +{errors.length - 2} {t('dataQuality.moreErrors')}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Flèche du tooltip */}
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default DataQualityBadge;