import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import useTranslation from '../hooks/useTranslation';
import useTheme from '../hooks/useTheme';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeatherChart = ({ forecastData, currentData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [chartType, setChartType] = useState('temperature');

  // Theme-based colors
  const colors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      primary: 'rgba(96, 165, 250, 1)',
      primaryLight: 'rgba(96, 165, 250, 0.3)',
      secondary: 'rgba(34, 197, 94, 1)',
      secondaryLight: 'rgba(34, 197, 94, 0.3)',
      accent: 'rgba(251, 146, 60, 1)',
      accentLight: 'rgba(251, 146, 60, 0.3)',
      text: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(31, 41, 55, 0.9)',
      textMuted: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(107, 114, 128, 0.8)',
      gridLines: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };
  }, [theme]);

  // Process forecast data for charts
  const chartData = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return null;

    const labels = forecastData.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString(t('common.locale', 'fr-FR'), {
        weekday: 'short',
        day: 'numeric'
      });
    });

    const temperatureData = {
      labels,
      datasets: [
        {
          label: t('charts.maxTemperature', 'Température Max'),
          data: forecastData.map(day => day.maxTemp),
          borderColor: colors.primary,
          backgroundColor: colors.primaryLight,
          fill: '+1',
          tension: 0.4,
          pointBackgroundColor: colors.primary,
          pointBorderColor: 'rgba(255, 255, 255, 0.8)',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: t('charts.minTemperature', 'Température Min'),
          data: forecastData.map(day => day.minTemp),
          borderColor: colors.secondary,
          backgroundColor: colors.secondaryLight,
          fill: 'origin',
          tension: 0.4,
          pointBackgroundColor: colors.secondary,
          pointBorderColor: 'rgba(255, 255, 255, 0.8)',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    const humidityData = {
      labels,
      datasets: [
        {
          label: t('charts.humidity', 'Humidité'),
          data: forecastData.map(day => day.humidity),
          backgroundColor: forecastData.map((_, index) => 
            `rgba(96, 165, 250, ${0.3 + (index * 0.1)})`
          ),
          borderColor: colors.primary,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    };

    const windData = {
      labels,
      datasets: [
        {
          label: t('charts.windSpeed', 'Vitesse du Vent'),
          data: forecastData.map(day => day.windSpeed),
          borderColor: colors.accent,
          backgroundColor: colors.accentLight,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: colors.accent,
          pointBorderColor: 'rgba(255, 255, 255, 0.8)',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };

    return { temperatureData, humidityData, windData };
  }, [forecastData, colors, t]);

  // Chart options with glassmorphism styling
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.text,
          font: {
            family: 'Dosis, sans-serif',
            size: 12,
            weight: '600'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleFont: {
          family: 'Dosis, sans-serif',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Dosis, sans-serif',
          size: 13
        },
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const unit = chartType === 'temperature' ? '°C' : 
                        chartType === 'humidity' ? '%' : 'km/h';
            return `${context.dataset.label}: ${value}${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: colors.gridLines,
          drawBorder: false
        },
        ticks: {
          color: colors.textMuted,
          font: {
            family: 'Dosis, sans-serif',
            size: 11,
            weight: '500'
          }
        }
      },
      y: {
        grid: {
          color: colors.gridLines,
          drawBorder: false
        },
        ticks: {
          color: colors.textMuted,
          font: {
            family: 'Dosis, sans-serif',
            size: 11,
            weight: '500'
          },
          callback: function(value) {
            const unit = chartType === 'temperature' ? '°C' : 
                        chartType === 'humidity' ? '%' : 'km/h';
            return `${value}${unit}`;
          }
        }
      }
    }
  }), [colors, chartType, t]);

  if (!chartData) {
    return (
      <div className="weather-chart-container">
        <div className="chart-placeholder">
          <p>{t('charts.noData', 'Aucune donnée de prévision disponible')}</p>
        </div>
      </div>
    );
  }

  const getCurrentChartData = () => {
    switch (chartType) {
      case 'temperature':
        return chartData.temperatureData;
      case 'humidity':
        return chartData.humidityData;
      case 'wind':
        return chartData.windData;
      default:
        return chartData.temperatureData;
    }
  };

  return (
    <div className="weather-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">
          {t('charts.title', 'Tendances Météorologiques')}
        </h3>
        
        <div className="chart-controls">
          <button
            className={`chart-control-btn ${chartType === 'temperature' ? 'active' : ''}`}
            onClick={() => setChartType('temperature')}
          >
            <span className="control-icon">🌡️</span>
            {t('charts.temperature', 'Température')}
          </button>
          
          <button
            className={`chart-control-btn ${chartType === 'humidity' ? 'active' : ''}`}
            onClick={() => setChartType('humidity')}
          >
            <span className="control-icon">💧</span>
            {t('charts.humidity', 'Humidité')}
          </button>
          
          <button
            className={`chart-control-btn ${chartType === 'wind' ? 'active' : ''}`}
            onClick={() => setChartType('wind')}
          >
            <span className="control-icon">💨</span>
            {t('charts.wind', 'Vent')}
          </button>
        </div>
      </div>

      <div className="chart-wrapper">
        {chartType === 'humidity' ? (
          <Bar data={getCurrentChartData()} options={chartOptions} />
        ) : (
          <Line data={getCurrentChartData()} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default WeatherChart;