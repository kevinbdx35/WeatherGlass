import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

// Mock des composants
jest.mock('../../components/LanguageToggle', () => {
  return function MockLanguageToggle() {
    return <div data-testid="language-toggle">Language</div>;
  };
});

jest.mock('../../components/ThemeToggle', () => {
  return function MockThemeToggle({ themeMode, theme, onToggle }) {
    return (
      <div 
        data-testid="theme-toggle" 
        data-theme={theme}
        data-mode={themeMode}
        onClick={onToggle}
      >
        Theme
      </div>
    );
  };
});

// Mock du hook useTranslation
jest.mock('../../hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key) => {
      const translations = {
        'search.autoRefreshActive': 'Actualisation automatique active'
      };
      return translations[key] || key;
    }
  })
}));

describe('Header', () => {
  const defaultProps = {
    themeMode: 'auto',
    theme: 'light',
    onThemeToggle: jest.fn(),
    autoRefresh: jest.fn(),
    showAutoRefresh: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header with basic components', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('language-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('should pass correct props to ThemeToggle', () => {
    render(<Header {...defaultProps} />);

    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toHaveAttribute('data-theme', 'light');
    expect(themeToggle).toHaveAttribute('data-mode', 'auto');
  });

  it('should call onThemeToggle when theme toggle is clicked', () => {
    const mockToggle = jest.fn();
    render(<Header {...defaultProps} onThemeToggle={mockToggle} />);

    const themeToggle = screen.getByTestId('theme-toggle');
    fireEvent.click(themeToggle);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('should not show auto-refresh indicator by default', () => {
    render(<Header {...defaultProps} />);

    expect(screen.queryByText('🔄')).not.toBeInTheDocument();
  });

  it('should show auto-refresh indicator when showAutoRefresh is true', () => {
    render(<Header {...defaultProps} showAutoRefresh={true} />);

    const refreshIndicator = screen.getByText('🔄');
    expect(refreshIndicator).toBeInTheDocument();
    expect(refreshIndicator).toHaveClass('auto-refresh-indicator');
  });

  it('should call autoRefresh when refresh indicator is clicked', () => {
    const mockAutoRefresh = jest.fn();
    render(
      <Header 
        {...defaultProps} 
        showAutoRefresh={true} 
        autoRefresh={mockAutoRefresh} 
      />
    );

    const refreshIndicator = screen.getByText('🔄');
    fireEvent.click(refreshIndicator);

    expect(mockAutoRefresh).toHaveBeenCalledTimes(1);
  });

  it('should have correct title for auto-refresh indicator', () => {
    render(<Header {...defaultProps} showAutoRefresh={true} />);

    const refreshIndicator = screen.getByText('🔄');
    expect(refreshIndicator).toHaveAttribute('title', 'Actualisation automatique active');
  });

  it('should have proper semantic structure', () => {
    render(<Header {...defaultProps} />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('app-header');

    const controls = header.querySelector('.header-controls');
    expect(controls).toBeInTheDocument();
  });

  it('should handle different theme modes', () => {
    const { rerender } = render(<Header {...defaultProps} themeMode="dark" theme="dark" />);

    let themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toHaveAttribute('data-mode', 'dark');
    expect(themeToggle).toHaveAttribute('data-theme', 'dark');

    rerender(<Header {...defaultProps} themeMode="light" theme="light" />);
    
    themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toHaveAttribute('data-mode', 'light');
    expect(themeToggle).toHaveAttribute('data-theme', 'light');
  });

  it('should handle missing autoRefresh function gracefully', () => {
    render(<Header {...defaultProps} showAutoRefresh={true} autoRefresh={undefined} />);

    const refreshIndicator = screen.getByText('🔄');
    
    // Should not throw when clicked even without autoRefresh function
    expect(() => fireEvent.click(refreshIndicator)).not.toThrow();
  });
});