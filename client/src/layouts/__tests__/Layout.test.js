import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../Layout';

// Mock des composants
jest.mock('../Header', () => {
  return function MockHeader(props) {
    return <header data-testid="header" data-props={JSON.stringify(props)}>Header</header>;
  };
});

jest.mock('../../components/Footer', () => {
  return function MockFooter(props) {
    return <footer data-testid="footer" data-props={JSON.stringify(props)}>Footer</footer>;
  };
});

jest.mock('../../components/DynamicBackground', () => {
  return function MockDynamicBackground(props) {
    return <div data-testid="dynamic-background" data-props={JSON.stringify(props)}>Background</div>;
  };
});

jest.mock('../../components/BackgroundParticles', () => {
  return function MockBackgroundParticles(props) {
    return <div data-testid="background-particles" data-props={JSON.stringify(props)}>Particles</div>;
  };
});

jest.mock('../../components/OfflineIndicator', () => {
  return function MockOfflineIndicator() {
    return <div data-testid="offline-indicator">Offline</div>;
  };
});

jest.mock('../../components/InstallPrompt', () => {
  return function MockInstallPrompt() {
    return <div data-testid="install-prompt">Install</div>;
  };
});

jest.mock('../../components/AutoThemeIndicator', () => {
  return function MockAutoThemeIndicator(props) {
    return <div data-testid="auto-theme-indicator" data-props={JSON.stringify(props)}>Theme</div>;
  };
});

describe('Layout', () => {
  const defaultProps = {
    theme: 'light',
    themeMode: 'auto',
    onThemeToggle: jest.fn(),
    currentBackground: 'clear-sky.jpg',
    autoRefresh: jest.fn(),
    showAutoRefresh: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all layout components', () => {
    render(
      <Layout {...defaultProps}>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('dynamic-background')).toBeInTheDocument();
    expect(screen.getByTestId('background-particles')).toBeInTheDocument();
    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('auto-theme-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render children in main content area', () => {
    render(
      <Layout {...defaultProps}>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveClass('main-content');
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should pass correct props to Header', () => {
    render(
      <Layout {...defaultProps} showAutoRefresh={true}>
        <div>Content</div>
      </Layout>
    );

    const header = screen.getByTestId('header');
    const headerProps = JSON.parse(header.getAttribute('data-props'));
    
    expect(headerProps.themeMode).toBe('auto');
    expect(headerProps.theme).toBe('light');
    expect(headerProps.showAutoRefresh).toBe(true);
  });

  it('should pass correct props to background components', () => {
    render(
      <Layout {...defaultProps}>
        <div>Content</div>
      </Layout>
    );

    const dynamicBackground = screen.getByTestId('dynamic-background');
    const backgroundParticles = screen.getByTestId('background-particles');
    
    const bgProps = JSON.parse(dynamicBackground.getAttribute('data-props'));
    const particlesProps = JSON.parse(backgroundParticles.getAttribute('data-props'));
    
    expect(bgProps.currentBackground).toBe('clear-sky.jpg');
    expect(particlesProps.theme).toBe('light');
  });

  it('should pass theme props to AutoThemeIndicator', () => {
    render(
      <Layout {...defaultProps}>
        <div>Content</div>
      </Layout>
    );

    const autoThemeIndicator = screen.getByTestId('auto-theme-indicator');
    const props = JSON.parse(autoThemeIndicator.getAttribute('data-props'));
    
    expect(props.themeMode).toBe('auto');
    expect(props.theme).toBe('light');
  });

  it('should have proper semantic structure', () => {
    render(
      <Layout {...defaultProps}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(
      <Layout {...defaultProps}>
        <div>Content</div>
      </Layout>
    );

    const appDiv = container.firstChild;
    expect(appDiv).toHaveClass('app');
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveClass('main-content');
  });
});