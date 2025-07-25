import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  FiTrendingUp, 
  FiActivity, 
  FiCalendar, 
  FiTarget,
  FiFilter,
  FiChevronDown
} from 'react-icons/fi';
import {
    FaChartBar
} from 'react-icons/fa';
import progressChartContent from './content/progressChart.json';
import './styles/progressChart.css';

const ProgressChart = () => {
  const { user, isLoading } = useAppContext();
  const [selectedExercise, setSelectedExercise] = useState('all');
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartData, setChartData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  // Mock data - En una aplicación real, esto vendría de la API
  useEffect(() => {
    const mockExercises = [
      { id: 'press-banca', name: 'Press de Banca', type: 'reps-weight' },
      { id: 'sentadillas', name: 'Sentadillas', type: 'reps-weight' },
      { id: 'peso-muerto', name: 'Peso Muerto', type: 'reps-weight' },
      { id: 'flexiones', name: 'Flexiones', type: 'reps-time' },
      { id: 'correr', name: 'Correr', type: 'time-distance' }
    ];
    setExercises(mockExercises);
  }, []);

  // Generar datos del gráfico basado en filtros
  const generateChartData = useMemo(() => {
    setChartLoading(true);
    
    // Simular delay de carga
    setTimeout(() => setChartLoading(false), 500);

    const now = new Date();
    const dataPoints = [];
    let periods = 0;
    let interval = 0;

    // Configurar períodos según el rango de tiempo
    switch (timeRange) {
      case 'weekly':
        periods = 12; // 12 semanas
        interval = 7 * 24 * 60 * 60 * 1000; // 1 semana en ms
        break;
      case 'monthly':
        periods = 12; // 12 meses
        interval = 30 * 24 * 60 * 60 * 1000; // 1 mes aprox en ms
        break;
      case 'quarterly':
        periods = 8; // 8 trimestres (2 años)
        interval = 90 * 24 * 60 * 60 * 1000; // 3 meses en ms
        break;
      default:
        periods = 12;
        interval = 30 * 24 * 60 * 60 * 1000;
    }

    // Generar datos mock progresivos
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * interval));
      const baseValue = 50 + Math.random() * 20;
      const progressMultiplier = (periods - i) / periods;
      
      dataPoints.push({
        date: date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          ...(timeRange === 'quarterly' && { year: '2-digit' })
        }),
        value: Math.round(baseValue + (progressMultiplier * 30) + (Math.random() * 10 - 5)),
        sets: Math.floor(3 + Math.random() * 2),
        reps: Math.floor(8 + Math.random() * 4)
      });
    }

    return dataPoints;
  }, [selectedExercise, timeRange]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (generateChartData.length < 2) return null;

    const firstValue = generateChartData[0].value;
    const lastValue = generateChartData[generateChartData.length - 1].value;
    const improvement = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
    const bestSession = Math.max(...generateChartData.map(d => d.value));
    const totalSessions = generateChartData.length;
    const averageProgress = (improvement / totalSessions).toFixed(1);

    return {
      improvement: `${improvement}%`,
      bestSession: `${bestSession}kg`,
      totalSessions,
      averageProgress: `${averageProgress}%`
    };
  }, [generateChartData]);

  // Obtener el ejercicio seleccionado
  const selectedExerciseData = exercises.find(ex => ex.id === selectedExercise);

  // Determinar el tipo de gráfico y unidades
  const getChartConfig = () => {
    if (selectedExercise === 'all') {
      return {
        yAxisLabel: progressChartContent.chart.axes.weight,
        unit: 'kg',
        color: 'var(--color-primary)'
      };
    }

    const exerciseType = selectedExerciseData?.type || 'reps-weight';
    
    switch (exerciseType) {
      case 'reps-weight':
        return {
          yAxisLabel: progressChartContent.chart.axes.weight,
          unit: 'kg',
          color: 'var(--color-primary)'
        };
      case 'reps-time':
        return {
          yAxisLabel: progressChartContent.chart.axes.reps,
          unit: 'reps',
          color: 'var(--color-secondary)'
        };
      case 'time-distance':
        return {
          yAxisLabel: progressChartContent.chart.axes.distance,
          unit: 'km',
          color: 'var(--color-accent)'
        };
      default:
        return {
          yAxisLabel: progressChartContent.chart.axes.weight,
          unit: 'kg',
          color: 'var(--color-primary)'
        };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <div className="progress_chart">
      <div className="progress_chart__container">
        {/* Header */}
        <div className="progress_chart__header">
          <div className="progress_chart__title-section">
            <h2 className="progress_chart__title">
              <FiTrendingUp className="progress_chart__title-icon" />
              {progressChartContent.title}
            </h2>
            <p className="progress_chart__subtitle">
              {progressChartContent.subtitle}
            </p>
          </div>

          {/* Filters */}
          <div className="progress_chart__filters">
            {/* Exercise Filter */}
            <div className="progress_chart__filter-group">
              <label className="progress_chart__filter-label">
                <FiTarget className="progress_chart__filter-icon" />
                {progressChartContent.filters.exercise.label}
              </label>
              <div className="progress_chart__dropdown">
                <button 
                  className="progress_chart__dropdown-trigger"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>
                    {selectedExercise === 'all' 
                      ? progressChartContent.filters.exercise.all
                      : exercises.find(ex => ex.id === selectedExercise)?.name || progressChartContent.filters.exercise.placeholder
                    }
                  </span>
                  <FiChevronDown className={`progress_chart__dropdown-icon ${isDropdownOpen ? 'progress_chart__dropdown-icon--open' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="progress_chart__dropdown-menu">
                    <button
                      className={`progress_chart__dropdown-item ${selectedExercise === 'all' ? 'progress_chart__dropdown-item--active' : ''}`}
                      onClick={() => {
                        setSelectedExercise('all');
                        setIsDropdownOpen(false);
                      }}
                    >
                      {progressChartContent.filters.exercise.all}
                    </button>
                    {exercises.map(exercise => (
                      <button
                        key={exercise.id}
                        className={`progress_chart__dropdown-item ${selectedExercise === exercise.id ? 'progress_chart__dropdown-item--active' : ''}`}
                        onClick={() => {
                          setSelectedExercise(exercise.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {exercise.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="progress_chart__filter-group">
              <label className="progress_chart__filter-label">
                <FiCalendar className="progress_chart__filter-icon" />
                {progressChartContent.filters.timeRange.label}
              </label>
              <div className="progress_chart__time-filters">
                {Object.entries(progressChartContent.filters.timeRange.options).map(([key, label]) => (
                  <button
                    key={key}
                    className={`progress_chart__time-filter ${timeRange === key ? 'progress_chart__time-filter--active' : ''}`}
                    onClick={() => setTimeRange(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="progress_chart__content">
          {chartLoading ? (
            <div className="progress_chart__loading">
              <FiActivity className="progress_chart__loading-icon" />
              <p>{progressChartContent.chart.loading}</p>
            </div>
          ) : generateChartData.length > 0 ? (
            <>
              {/* Chart Container */}
              <div className="progress_chart__chart-container">
                <div className="progress_chart__chart">
                  {/* Y-Axis Label */}
                  <div className="progress_chart__y-axis-label">
                    {chartConfig.yAxisLabel}
                  </div>
                  
                  {/* Chart Area */}
                  <div className="progress_chart__chart-area">
                    <svg className="progress_chart__svg" viewBox="0 0 800 300">
                      {/* Grid Lines */}
                      <defs>
                        <pattern id="grid" width="80" height="60" patternUnits="userSpaceOnUse">
                          <path d="M 80 0 L 0 0 0 60" fill="none" stroke="var(--color-chart-grid)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Chart Line */}
                      <polyline
                        fill="none"
                        stroke={chartConfig.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={generateChartData.map((point, index) => {
                          const x = (index / (generateChartData.length - 1)) * 760 + 20;
                          const maxValue = Math.max(...generateChartData.map(d => d.value));
                          const minValue = Math.min(...generateChartData.map(d => d.value));
                          const y = 280 - ((point.value - minValue) / (maxValue - minValue)) * 240;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      
                      {/* Data Points */}
                      {generateChartData.map((point, index) => {
                        const x = (index / (generateChartData.length - 1)) * 760 + 20;
                        const maxValue = Math.max(...generateChartData.map(d => d.value));
                        const minValue = Math.min(...generateChartData.map(d => d.value));
                        const y = 280 - ((point.value - minValue) / (maxValue - minValue)) * 240;
                        
                        return (
                          <g key={index}>
                            <circle
                              cx={x}
                              cy={y}
                              r="6"
                              fill={chartConfig.color}
                              className="progress_chart__data-point"
                            />
                            <text
                              x={x}
                              y={y - 15}
                              textAnchor="middle"
                              className="progress_chart__data-label"
                              fill="var(--color-text-secondary)"
                              fontSize="12"
                            >
                              {point.value}{chartConfig.unit}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  
                  {/* X-Axis Labels */}
                  <div className="progress_chart__x-axis">
                    {generateChartData.map((point, index) => (
                      <div key={index} className="progress_chart__x-axis-label">
                        {point.date}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <div className="progress_chart__stats">
                  <div className="progress_chart__stat-card">
                    <FiTrendingUp className="progress_chart__stat-icon progress_chart__stat-icon--improvement" />
                    <div className="progress_chart__stat-content">
                      <span className="progress_chart__stat-value">{stats.improvement}</span>
                      <span className="progress_chart__stat-label">{progressChartContent.stats.improvement}</span>
                    </div>
                  </div>
                  
                  <div className="progress_chart__stat-card">
                    <FiTarget className="progress_chart__stat-icon progress_chart__stat-icon--best" />
                    <div className="progress_chart__stat-content">
                      <span className="progress_chart__stat-value">{stats.bestSession}</span>
                      <span className="progress_chart__stat-label">{progressChartContent.stats.bestSession}</span>
                    </div>
                  </div>
                  
                  <div className="progress_chart__stat-card">
                    <FiActivity className="progress_chart__stat-icon progress_chart__stat-icon--sessions" />
                    <div className="progress_chart__stat-content">
                      <span className="progress_chart__stat-value">{stats.totalSessions}</span>
                      <span className="progress_chart__stat-label">{progressChartContent.stats.totalSessions}</span>
                    </div>
                  </div>
                  
                  <div className="progress_chart__stat-card">
                    <FaChartBar className="progress_chart__stat-icon progress_chart__stat-icon--average" />
                    <div className="progress_chart__stat-content">
                      <span className="progress_chart__stat-value">{stats.averageProgress}</span>
                      <span className="progress_chart__stat-label">{progressChartContent.stats.averageProgress}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="progress_chart__no-data">
              <FaChartBar className="progress_chart__no-data-icon" />
              <h3>{progressChartContent.messages.noExercises}</h3>
              <p>{progressChartContent.messages.startWorkout}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;