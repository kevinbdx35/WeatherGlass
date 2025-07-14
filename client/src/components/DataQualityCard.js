import React from 'react';
import useTranslation from '../hooks/useTranslation';

const DataQualityCard = ({ data, className = '' }) => {
  const { t } = useTranslation();

  if (!data?.aggregator) {
    return null;
  }

  const aggregatorInfo = data.aggregator;
  const source = aggregatorInfo.usedSource || 'unknown';
  const confidence = aggregatorInfo.confidence || 0;
  const strategy = aggregatorInfo.strategy || 'fallback';
  const timestamp = aggregatorInfo.timestamp ? new Date(aggregatorInfo.timestamp) : new Date();
  const validation = aggregatorInfo.validation || {};
  const oracleScore = validation.score || 0;
  const isValid = validation.isValid ?? true;
  const warnings = validation.warnings || [];
  const errors = validation.errors || [];

  // Informations sur les sources
  const sourceInfo = {
    'primary': { icon: '🌐', name: 'Open-Meteo', description: 'Service météo open-source européen' },
    'backup': { icon: '🔄', name: 'WeatherAPI', description: 'Service commercial de secours' },
    'alerts': { icon: '🇫🇷', name: 'Météo-France', description: 'Service météorologique national' },
    'legacy': { icon: '☁️', name: 'OpenWeatherMap', description: 'Service météo traditionnel' },
    'unknown': { icon: '❓', name: 'Source inconnue', description: 'Source non identifiée' }
  };

  const currentSource = sourceInfo[source] || sourceInfo.unknown;

  // Couleur de qualité
  const getQualityColor = (score, valid) => {
    if (!valid || score < 0.7) return '#ef4444'; // Rouge
    if (score < 0.9) return '#f59e0b'; // Orange
    return '#22c55e'; // Vert
  };

  const qualityColor = getQualityColor(oracleScore, isValid);

  // Icône de qualité
  const getQualityIcon = (score, valid) => {
    if (!valid || score < 0.7) return '❌';
    if (score < 0.9) return '⚠️';
    return '✅';
  };

  const qualityIcon = getQualityIcon(oracleScore, isValid);

  // Formatage du temps
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return t('dataQuality.justNow');
    if (diffMins === 1) return t('dataQuality.oneMinuteAgo');
    if (diffMins < 60) return t('dataQuality.minutesAgo', { minutes: diffMins });
    if (diffHours === 1) return t('dataQuality.oneHourAgo');
    if (diffHours < 24) return t('dataQuality.hoursAgo', { hours: diffHours });
    return t('dataQuality.moreThanOneDay');
  };

  return (
    <div className={`data-quality-card ${className}`}>
      <div className="quality-card-header">
        <div className="quality-card-icon">
          <span className="source-icon">{currentSource.icon}</span>
        </div>
        <div className="quality-card-title">
          <h3>{t('dataQuality.title')}</h3>
          <p className="source-name">{currentSource.name}</p>
        </div>
        <div className="quality-indicator-large">
          <span className="quality-icon" style={{ color: qualityColor }}>
            {qualityIcon}
          </span>
          <span className="quality-score" style={{ color: qualityColor }}>
            {Math.round(oracleScore * 100)}%
          </span>
        </div>
      </div>

      <div className="quality-card-body">
        <div className="quality-metrics">
          <div className="quality-metric">
            <span className="metric-label">{t('dataQuality.oracleScore')}</span>
            <div className="metric-value">
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${oracleScore * 100}%`, 
                    backgroundColor: qualityColor 
                  }}
                />
              </div>
              <span className="score-text">{Math.round(oracleScore * 100)}%</span>
            </div>
          </div>

          <div className="quality-metric">
            <span className="metric-label">{t('dataQuality.confidence')}</span>
            <div className="metric-value">
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${confidence * 100}%`, 
                    backgroundColor: confidence > 0.8 ? '#22c55e' : confidence > 0.6 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <span className="score-text">{Math.round(confidence * 100)}%</span>
            </div>
          </div>

          <div className="quality-metric">
            <span className="metric-label">{t('dataQuality.strategy')}</span>
            <span className="metric-text">{t(`dataQuality.strategies.${strategy}`)}</span>
          </div>

          <div className="quality-metric">
            <span className="metric-label">{t('dataQuality.lastUpdate')}</span>
            <span className="metric-text">{formatTimeAgo(timestamp)}</span>
          </div>
        </div>

        {/* Statut de validation */}
        <div className="validation-status">
          <div className={`status-indicator ${isValid ? 'valid' : 'invalid'}`}>
            <span className="status-icon">{isValid ? '✅' : '❌'}</span>
            <span className="status-text">
              {isValid ? t('dataQuality.dataValid') : t('dataQuality.dataInvalid')}
            </span>
          </div>
        </div>

        {/* Avertissements et erreurs */}
        {warnings.length > 0 && (
          <div className="alerts-section warnings">
            <h4>
              <span className="alert-icon">⚠️</span>
              {t('dataQuality.warnings')} ({warnings.length})
            </h4>
            <ul className="alert-list">
              {warnings.slice(0, 3).map((warning, index) => (
                <li key={index} className="alert-item">{warning}</li>
              ))}
              {warnings.length > 3 && (
                <li className="alert-more">
                  +{warnings.length - 3} {t('dataQuality.moreWarnings')}
                </li>
              )}
            </ul>
          </div>
        )}

        {errors.length > 0 && (
          <div className="alerts-section errors">
            <h4>
              <span className="alert-icon">❌</span>
              {t('dataQuality.errors')} ({errors.length})
            </h4>
            <ul className="alert-list">
              {errors.slice(0, 3).map((error, index) => (
                <li key={index} className="alert-item">{error}</li>
              ))}
              {errors.length > 3 && (
                <li className="alert-more">
                  +{errors.length - 3} {t('dataQuality.moreErrors')}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="quality-card-footer">
        <div className="source-description">
          <small>{currentSource.description}</small>
        </div>
      </div>
    </div>
  );
};

export default DataQualityCard;