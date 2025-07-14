/**
 * Configuration Jest pour échouer sur les erreurs console
 * Aide à détecter les erreurs silencieuses qui pourraient causer des problèmes en production
 */

const originalError = console.error;
const originalWarn = console.warn;

// Store original methods
const originalMethods = {
  error: console.error,
  warn: console.warn
};

// List of errors/warnings to ignore (known issues)
const IGNORE_PATTERNS = [
  // React testing warnings that are safe to ignore
  'Warning: ReactDOM.render is deprecated',
  'Warning: componentWillReceiveProps',
  'localStorage unavailable, falling back to memory cache',
  
  // Service worker warnings in test environment
  'SW registration failed',
  'Failed to register a ServiceWorker',
  
  // API key warnings in tests (expected)
  'Clé API Unsplash manquante',
  'API key invalid',
  'demo_key',
  
  // Network errors in tests (mocked)
  'Network Error',
  'Failed to fetch',
  
  // Météo France CORS in tests (expected)
  'blocked by CORS policy',
  
  // Oracle warnings in tests (expected behavior)
  'Oracle validation failed',
  'Oracle warnings',
  
  // Service failures in tests (expected)
  'service failed',
  'All weather services failed',
  
  // Deprecation warnings that don't affect functionality
  'DEP_WEBPACK_DEV_SERVER'
];

function shouldIgnoreMessage(message) {
  return IGNORE_PATTERNS.some(pattern => 
    typeof message === 'string' && message.includes(pattern)
  );
}

beforeEach(() => {
  // Intercept console.error
  console.error = (...args) => {
    const message = args.join(' ');
    
    if (!shouldIgnoreMessage(message)) {
      // Restore original to show the error
      console.error = originalError;
      console.error(...args);
      
      // Throw error to fail the test
      throw new Error(`Console error detected: ${message}`);
    }
    
    // Call original for ignored messages
    originalError(...args);
  };
  
  // Intercept console.warn for critical warnings
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Only fail on specific critical warnings
    const criticalWarnings = [
      'toFixed is not a function',
      'Cannot read properties of undefined',
      'Cannot read properties of null',
      'is not a function',
      'Maximum call stack size exceeded',
      'Converting circular structure to JSON'
    ];
    
    const isCritical = criticalWarnings.some(warning => 
      message.includes(warning)
    );
    
    if (isCritical && !shouldIgnoreMessage(message)) {
      // Restore original to show the warning
      console.warn = originalWarn;
      console.warn(...args);
      
      // Throw error to fail the test
      throw new Error(`Critical console warning detected: ${message}`);
    }
    
    // Call original for all warnings (logged but don't fail)
    originalWarn(...args);
  };
});

afterEach(() => {
  // Restore original methods
  console.error = originalMethods.error;
  console.warn = originalMethods.warn;
});

// Global error handler for uncaught exceptions in tests
const originalAddEventListener = window.addEventListener;
window.addEventListener = function(type, listener, options) {
  if (type === 'error') {
    const wrappedListener = (event) => {
      // Check if it's a critical error
      const message = event.error?.message || event.message || '';
      
      if (!shouldIgnoreMessage(message)) {
        // Critical errors should fail tests
        const error = new Error(`Uncaught error in test: ${message}`);
        error.stack = event.error?.stack || error.stack;
        throw error;
      }
      
      // Call original listener
      if (typeof listener === 'function') {
        listener(event);
      }
    };
    
    return originalAddEventListener.call(this, type, wrappedListener, options);
  }
  
  return originalAddEventListener.call(this, type, listener, options);
};