import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Performance measurement for Core Web Vitals (lazy loaded to avoid blocking)
const loadWebVitals = async () => {
  try {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
    
    // Send performance metrics to analytics
    function sendToAnalytics(metric) {
      console.log('Performance metric:', metric);
      
      // Example: Send to Google Analytics 4
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    }

    // Measure Core Web Vitals
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  } catch (error) {
    console.warn('Web Vitals not available:', error);
  }
};

// Load Web Vitals after the app has mounted
if (typeof window !== 'undefined') {
  loadWebVitals();
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

