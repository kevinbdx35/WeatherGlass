import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Performance measurement for Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Send performance metrics to analytics (implement your analytics endpoint)
function sendToAnalytics(metric) {
  // Replace with your analytics endpoint
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

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

