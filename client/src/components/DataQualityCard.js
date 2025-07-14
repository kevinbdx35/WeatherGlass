import React from 'react';
import useTranslation from '../hooks/useTranslation';

const DataQualityCard = ({ data, className = '' }) => {
  const { t } = useTranslation();

  if (!data?.aggregator) {
    return null;
  }

  const aggregatorInfo = data.aggregator;
  const source = aggregatorInfo.usedSource || 'unknown';
  const sources = aggregatorInfo.sources || [source]; // Array of sources for consensus mode
  const confidence = aggregatorInfo.confidence || 0;
  const strategy = aggregatorInfo.strategy || 'fallback';
  const timestamp = aggregatorInfo.timestamp ? new Date(aggregatorInfo.timestamp) : new Date();
  const validation = aggregatorInfo.validation || {};
  const multiSourceValidation = aggregatorInfo.multiSourceValidation || null;
  const agreement = aggregatorInfo.agreement || null;
  // Specialized mode specific data
  const selectedReason = aggregatorInfo.selectedReason || null;
  const geographicalContext = aggregatorInfo.context || null;
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
    // Validation des types pour éviter les erreurs
    const numericScore = typeof score === 'number' && isFinite(score) ? score : 0;
    const booleanValid = typeof valid === 'boolean' ? valid : true;
    
    if (!booleanValid || numericScore < 0.7) return '#ef4444'; // Rouge
    if (numericScore < 0.9) return '#f59e0b'; // Orange
    return '#22c55e'; // Vert
  };

  const qualityColor = getQualityColor(oracleScore, isValid);

  // Icône de qualité
  const getQualityIcon = (score, valid) => {
    // Validation des types pour éviter les erreurs
    const numericScore = typeof score === 'number' && isFinite(score) ? score : 0;
    const booleanValid = typeof valid === 'boolean' ? valid : true;
    
    if (!booleanValid || numericScore < 0.7) return '❌';
    if (numericScore < 0.9) return '⚠️';
    return '✅';
  };

  const qualityIcon = getQualityIcon(oracleScore, isValid);

  // Formatage du temps
  // Fonction utilitaire pour convertir n'importe quelle valeur en string sécurisée
  const safeStringify = (value) => {
    try {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'boolean') return value.toString();
      if (typeof value === 'symbol') return value.toString();
      if (typeof value === 'function') return '[Function]';
      if (typeof value === 'object') {
        // Éviter les erreurs de sérialisation circulaire
        try {
          return JSON.stringify(value);
        } catch (circularError) {
          return '[Object with circular references]';
        }
      }
      return String(value);
    } catch (error) {
      return '[Unserializable value]';
    }
  };

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

  // Render specialized mode information
  const renderSpecializedInfo = () => {
    if (strategy !== 'specialized') {
      return null;
    }

    return (
      <div className="specialized-info">
        <div className="specialized-header">
          <span className="specialized-label">{t('dataQuality.specializedMode')}</span>
          <span className="specialized-source">
            {currentSource.icon} {currentSource.name}
          </span>
        </div>
        
        {geographicalContext && (
          <div className="specialized-context">
            <span className="context-label">{t('dataQuality.geographicalContext')}:</span>
            <span className="context-value">{geographicalContext}</span>
          </div>
        )}
        
        {selectedReason && (
          <div className="specialized-reason">
            <div className="reason-label">{t('dataQuality.selectionReason')}:</div>
            <div className="reason-text">{selectedReason}</div>
          </div>
        )}
      </div>
    );
  };

  // Render multiple sources for consensus mode
  const renderMultipleSources = () => {
    if (strategy !== 'consensus' || sources.length <= 1) {
      return null;
    }

    return (
      <div className="consensus-sources">
        <div className="consensus-header">
          <span className="consensus-label">{t('dataQuality.consensusFrom')} {sources.length} {t('dataQuality.sources')}</span>
          {typeof agreement === 'number' && isFinite(agreement) && (
            <span className="consensus-agreement">
              {t('dataQuality.agreement')}: {Math.round(agreement * 100)}%
            </span>
          )}
        </div>
        <div className="consensus-sources-list">
          {Array.isArray(sources) && sources.map((sourceName, index) => {
            const sourceDetails = sourceInfo[sourceName] || sourceInfo.unknown;
            return (
              <div key={index} className="consensus-source-item">
                <span className="consensus-source-icon">{sourceDetails.icon}</span>
                <span className="consensus-source-name">{sourceDetails.name}</span>
              </div>
            );
          })}
        </div>
        {multiSourceValidation && (
          <div className="consensus-validation">
            <div className="consensus-coherence">
              <span className={`coherence-indicator ${multiSourceValidation.isCoherent ? 'coherent' : 'incoherent'}`}>
                {multiSourceValidation.isCoherent ? '✅' : '⚠️'}
              </span>
              <span className="coherence-text">
                {multiSourceValidation.isCoherent ? t('dataQuality.coherentData') : t('dataQuality.incoherentData')}
              </span>
            </div>
            {multiSourceValidation.variance && multiSourceValidation.variance.temperature && typeof multiSourceValidation.variance.temperature === 'number' && (
              <div className="consensus-variance">
                <span className="variance-label">{t('dataQuality.variance')}:</span>
                <span className="variance-value">{multiSourceValidation.variance.temperature.toFixed(2)}°C</span>
              </div>
            )}
            {multiSourceValidation.recommendedSource && (
              <div className="consensus-recommendation">
                <span className="recommendation-label">{t('dataQuality.recommendedSource')}:</span>
                <span className="recommendation-value">
                  {sourceInfo[multiSourceValidation.recommendedSource]?.name || multiSourceValidation.recommendedSource}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`data-quality-card ${className}`}>
      <div className="quality-card-header">
        <div className="quality-card-icon">
          <span className="source-icon">
            {strategy === 'consensus' && sources.length > 1 
              ? '🔄' 
              : strategy === 'specialized' 
                ? '🎯' 
                : currentSource.icon}
          </span>
        </div>
        <div className="quality-card-title">
          <h3>{t('dataQuality.title')}</h3>
          <p className="source-name">
            {strategy === 'consensus' && sources.length > 1 
              ? t('dataQuality.consensusMode') 
              : strategy === 'specialized'
                ? t('dataQuality.specializedMode')
                : currentSource.name}
          </p>
        </div>
        <div className="quality-indicator-large">
          <span className="quality-icon" style={{ color: qualityColor }}>
            {qualityIcon}
          </span>
          <span className="quality-score" style={{ color: qualityColor }}>
            {Math.round((typeof oracleScore === 'number' && isFinite(oracleScore) ? oracleScore : 0) * 100)}%
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
                    width: `${(typeof oracleScore === 'number' && isFinite(oracleScore) ? oracleScore : 0) * 100}%`, 
                    backgroundColor: qualityColor 
                  }}
                />
              </div>
              <span className="score-text">{Math.round((typeof oracleScore === 'number' && isFinite(oracleScore) ? oracleScore : 0) * 100)}%</span>
            </div>
          </div>

          <div className="quality-metric">
            <span className="metric-label">{t('dataQuality.confidence')}</span>
            <div className="metric-value">
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${(typeof confidence === 'number' && isFinite(confidence) ? confidence : 0) * 100}%`, 
                    backgroundColor: (typeof confidence === 'number' && isFinite(confidence) && confidence > 0.8) ? '#22c55e' : (typeof confidence === 'number' && isFinite(confidence) && confidence > 0.6) ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <span className="score-text">{Math.round((typeof confidence === 'number' && isFinite(confidence) ? confidence : 0) * 100)}%</span>
            </div>
          </div>

          <div className="quality-metric">
            <span className="metric-label">{t('dataQuality.strategy')}</span>
            <span className="metric-text">{t(`dataQuality.strategies.${safeStringify(strategy)}`)}</span>
          </div>

          <div className="quality-metric">
            <span className="metric-label">{t('dataQuality.lastUpdate')}</span>
            <span className="metric-text">{formatTimeAgo(timestamp)}</span>
          </div>
        </div>

        {/* Multiple sources for consensus mode */}
        {renderMultipleSources()}

        {/* Specialized mode information */}
        {renderSpecializedInfo()}

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
        {Array.isArray(warnings) && warnings.length > 0 && (
          <div className="alerts-section warnings">
            <h4>
              <span className="alert-icon">⚠️</span>
              {t('dataQuality.warnings')} ({warnings.length})
            </h4>
            <ul className="alert-list">
              {warnings.slice(0, 3).map((warning, index) => (
                <li key={index} className="alert-item">
                  {typeof warning === 'string' ? warning : 
                   typeof warning === 'symbol' ? warning.toString() :
                   typeof warning === 'object' ? JSON.stringify(warning) : 
                   String(warning)}
                </li>
              ))}
              {warnings.length > 3 && (
                <li className="alert-more">
                  +{warnings.length - 3} {t('dataQuality.moreWarnings')}
                </li>
              )}
            </ul>
          </div>
        )}

        {Array.isArray(errors) && errors.length > 0 && (
          <div className="alerts-section errors">
            <h4>
              <span className="alert-icon">❌</span>
              {t('dataQuality.errors')} ({errors.length})
            </h4>
            <ul className="alert-list">
              {errors.slice(0, 3).map((error, index) => (
                <li key={index} className="alert-item">
                  {typeof error === 'string' ? error : 
                   typeof error === 'symbol' ? error.toString() :
                   typeof error === 'object' ? JSON.stringify(error) : 
                   String(error)}
                </li>
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