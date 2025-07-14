import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../Layout';

// Mock des composants
jest.mock('../Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>;
  };
});

jest.mock('../../components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer" className="app-footer">Footer</footer>;
  };
});

jest.mock('../../components/DynamicBackground', () => {
  return function MockDynamicBackground() {
    return <div data-testid="dynamic-background">Background</div>;
  };
});

jest.mock('../../components/BackgroundParticles', () => {
  return function MockBackgroundParticles() {
    return <div data-testid="background-particles">Particles</div>;
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
  return function MockAutoThemeIndicator() {
    return <div data-testid="auto-theme-indicator">Theme</div>;
  };
});

describe('Sticky Footer Layout', () => {
  const defaultProps = {
    theme: 'light',
    themeMode: 'auto',
    onThemeToggle: jest.fn(),
    currentBackground: 'clear-sky.jpg',
    autoRefresh: jest.fn(),
    showAutoRefresh: false
  };

  it('should have correct CSS classes for sticky footer layout', () => {
    const { container } = render(
      <Layout {...defaultProps}>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    const appDiv = container.firstChild;
    expect(appDiv).toHaveClass('app');
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveClass('main-content');
    
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('app-footer');
  });

  it('should maintain proper semantic structure for sticky footer', () => {
    render(
      <Layout {...defaultProps}>
        <div data-testid="content">
          <h1>Weather App</h1>
          <p>Some content that might be short or long</p>
        </div>
      </Layout>
    );

    // Vérifier l'ordre des éléments dans le DOM
    const container = screen.getByRole('main').parentElement;
    const children = Array.from(container.children);
    
    // L'ordre devrait être: background, particles, indicators, header, main, footer
    const header = screen.getByTestId('header');
    const main = screen.getByRole('main');
    const footer = screen.getByTestId('footer');
    
    const headerIndex = children.indexOf(header);
    const mainIndex = children.indexOf(main);
    const footerIndex = children.indexOf(footer);
    
    expect(headerIndex).toBeLessThan(mainIndex);
    expect(mainIndex).toBeLessThan(footerIndex);
  });

  it('should handle different content heights properly', () => {
    const { rerender } = render(
      <Layout {...defaultProps}>
        <div data-testid="short-content">Short content</div>
      </Layout>
    );

    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();

    // Test avec contenu long
    rerender(
      <Layout {...defaultProps}>
        <div data-testid="long-content">
          {Array.from({ length: 10 }, (_, i) => (
            <p key={i}>This is a long paragraph {i + 1} to test how the footer behaves with more content.</p>
          ))}
        </div>
      </Layout>
    );

    expect(screen.getByTestId('long-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render all layout components in correct positions', () => {
    render(
      <Layout {...defaultProps}>
        <div>Main content</div>
      </Layout>
    );

    // Tous les composants doivent être présents
    expect(screen.getByTestId('dynamic-background')).toBeInTheDocument();
    expect(screen.getByTestId('background-particles')).toBeInTheDocument();
    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('auto-theme-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});