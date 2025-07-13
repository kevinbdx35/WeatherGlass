import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-top">
        <div className="skeleton-location"></div>
        <div className="skeleton-temp"></div>
        <div className="skeleton-icon"></div>
      </div>
      
      <div className="skeleton-bottom">
        <div className="skeleton-card">
          <div className="skeleton-value"></div>
          <div className="skeleton-label"></div>
        </div>
        <div className="skeleton-card">
          <div className="skeleton-value"></div>
          <div className="skeleton-label"></div>
        </div>
        <div className="skeleton-card">
          <div className="skeleton-value"></div>
          <div className="skeleton-label"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;