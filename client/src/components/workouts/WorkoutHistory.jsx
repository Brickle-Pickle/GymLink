import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
    FiCalendar,
    FiClock,
    FiActivity,
    FiTrendingUp,
    FiSearch,
    FiFilter,
    FiTarget,
    FiAward,
    FiChevronRight,
    FiRefreshCw,
    FiPlus
} from 'react-icons/fi';
import workoutHistoryContent from './content/workoutHistory.json';
import './styles/workoutHistory.css';

const WorkoutHistory = () => {
    const { navigateAndClose, addNotification } = useAppContext();
    const [workouts, setWorkouts] = useState([]);
    const [filteredWorkouts, setFilteredWorkouts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedSort, setSelectedSort] = useState('newest');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalWorkouts: 0,
        totalTime: 0,
        averageDuration: 0,
        favoriteExercise: '',
        currentStreak: 0,
        longestStreak: 0
    });

    // Mock data - En una aplicación real, esto vendría de la API
    useEffect(() => {
        const fetchWorkoutHistory = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Simular delay de API
                await new Promise(resolve => setTimeout(resolve, 1500));

                const mockWorkouts = [
                    {
                        id: '1',
                        date: new Date('2024-01-20T10:30:00'),
                        duration: 45, // minutos
                        exercises: [
                            {
                                id: 'ex1',
                                name: 'Press Banca',
                                sets: [
                                    { reps: 10, weight: 80, weightUnit: 'kg' },
                                    { reps: 8, weight: 85, weightUnit: 'kg' },
                                    { reps: 6, weight: 90, weightUnit: 'kg' }
                                ],
                                personalRecord: true
                            },
                            {
                                id: 'ex2',
                                name: 'Sentadillas',
                                sets: [
                                    { reps: 12, weight: 100, weightUnit: 'kg' },
                                    { reps: 10, weight: 105, weightUnit: 'kg' },
                                    { reps: 8, weight: 110, weightUnit: 'kg' }
                                ]
                            }
                        ]
                    },
                    {
                        id: '2',
                        date: new Date('2024-01-18T16:15:00'),
                        duration: 35,
                        exercises: [
                            {
                                id: 'ex3',
                                name: 'Flexiones',
                                sets: [
                                    { reps: 20 },
                                    { reps: 18 },
                                    { reps: 15 }
                                ]
                            },
                            {
                                id: 'ex4',
                                name: 'Plancha',
                                sets: [
                                    { time: 60, timeUnit: 'seconds' },
                                    { time: 55, timeUnit: 'seconds' },
                                    { time: 50, timeUnit: 'seconds' }
                                ]
                            }
                        ]
                    },
                    {
                        id: '3',
                        date: new Date('2024-01-15T09:00:00'),
                        duration: 60,
                        exercises: [
                            {
                                id: 'ex5',
                                name: 'Carrera',
                                sets: [
                                    { distance: 5, distanceUnit: 'km', time: 25, timeUnit: 'minutes' }
                                ],
                                personalRecord: true
                            }
                        ]
                    },
                    {
                        id: '4',
                        date: new Date('2024-01-12T18:30:00'),
                        duration: 40,
                        exercises: [
                            {
                                id: 'ex6',
                                name: 'Dominadas',
                                sets: [
                                    { reps: 8 },
                                    { reps: 6 },
                                    { reps: 5 }
                                ]
                            },
                            {
                                id: 'ex7',
                                name: 'Peso Muerto',
                                sets: [
                                    { reps: 5, weight: 120, weightUnit: 'kg' },
                                    { reps: 5, weight: 125, weightUnit: 'kg' },
                                    { reps: 3, weight: 130, weightUnit: 'kg' }
                                ]
                            }
                        ]
                    }
                ];

                // Calcular estadísticas
                const totalWorkouts = mockWorkouts.length;
                const totalTime = mockWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
                const averageDuration = totalTime / totalWorkouts;
                
                // Encontrar ejercicio favorito (más frecuente)
                const exerciseCount = {};
                mockWorkouts.forEach(workout => {
                    workout.exercises.forEach(exercise => {
                        exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
                    });
                });
                const favoriteExercise = Object.keys(exerciseCount).reduce((a, b) => 
                    exerciseCount[a] > exerciseCount[b] ? a : b, ''
                );

                setWorkouts(mockWorkouts);
                setFilteredWorkouts(mockWorkouts);
                setStats({
                    totalWorkouts,
                    totalTime,
                    averageDuration: Math.round(averageDuration),
                    favoriteExercise,
                    currentStreak: 3,
                    longestStreak: 7
                });

            } catch (error) {
                console.error('Error fetching workout history:', error);
                setError(error.message);
                addNotification({
                    type: 'error',
                    title: workoutHistoryContent.error.title,
                    message: workoutHistoryContent.error.message
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkoutHistory();
    }, [addNotification]);

    // Filtrar y ordenar entrenamientos
    useEffect(() => {
        let filtered = [...workouts];

        // Aplicar filtro por fecha
        const now = new Date();
        switch (selectedFilter) {
            case 'thisWeek':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(workout => workout.date >= weekAgo);
                break;
            case 'thisMonth':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                filtered = filtered.filter(workout => workout.date >= monthAgo);
                break;
            case 'last3Months':
                const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                filtered = filtered.filter(workout => workout.date >= threeMonthsAgo);
                break;
            case 'thisYear':
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                filtered = filtered.filter(workout => workout.date >= yearAgo);
                break;
            default:
                break;
        }

        // Aplicar búsqueda
        if (searchTerm) {
            filtered = filtered.filter(workout =>
                workout.exercises.some(exercise =>
                    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
                ) ||
                formatDate(workout.date).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Aplicar ordenamiento
        switch (selectedSort) {
            case 'oldest':
                filtered.sort((a, b) => a.date - b.date);
                break;
            case 'duration':
                filtered.sort((a, b) => b.duration - a.duration);
                break;
            case 'exercises':
                filtered.sort((a, b) => b.exercises.length - a.exercises.length);
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => b.date - a.date);
                break;
        }

        setFilteredWorkouts(filtered);
    }, [workouts, searchTerm, selectedFilter, selectedSort]);

    // Función para formatear fecha
    const formatDate = (date) => {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return workoutHistoryContent.workoutCard.today;
        if (diffDays === 2) return workoutHistoryContent.workoutCard.yesterday;
        if (diffDays <= 7) return workoutHistoryContent.workoutCard.daysAgo.replace('{days}', diffDays - 1);
        if (diffDays <= 30) {
            const weeks = Math.floor(diffDays / 7);
            return workoutHistoryContent.workoutCard.weeksAgo.replace('{weeks}', weeks);
        }
        
        const months = Math.floor(diffDays / 30);
        if (months < 12) {
            return workoutHistoryContent.workoutCard.monthsAgo.replace('{months}', months);
        }

        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Función para formatear duración
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}${workoutHistoryContent.stats.hours} ${mins}${workoutHistoryContent.stats.minutes}`;
        }
        return `${mins} ${workoutHistoryContent.stats.minutes}`;
    };

    // Función para formatear tiempo total
    const formatTotalTime = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours > 0) {
            return `${hours} ${workoutHistoryContent.stats.hours} ${minutes} ${workoutHistoryContent.stats.minutes}`;
        }
        return `${minutes} ${workoutHistoryContent.stats.minutes}`;
    };

    // Función para manejar retry
    const handleRetry = () => {
        window.location.reload();
    };

    // Función para ver detalles del entrenamiento
    const handleViewWorkoutDetails = (workoutId) => {
        navigateAndClose(`/workouts/history/${workoutId}`);
    };

    // Función para crear nuevo entrenamiento
    const handleCreateWorkout = () => {
        navigateAndClose('/workouts/create');
    };

    if (isLoading) {
        return (
            <div className="workout_history">
                <div className="workout_history__loading">
                    <div className="workout_history__loading-spinner"></div>
                    <p className="workout_history__loading-text">
                        {workoutHistoryContent.loading.message}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="workout_history">
                <div className="workout_history__error">
                    <div className="workout_history__error-content">
                        <h3 className="workout_history__error-title">
                            {workoutHistoryContent.error.title}
                        </h3>
                        <p className="workout_history__error-message">
                            {workoutHistoryContent.error.message}
                        </p>
                        <button 
                            className="workout_history__error-retry"
                            onClick={handleRetry}
                        >
                            <FiRefreshCw />
                            {workoutHistoryContent.error.retryButton}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="workout_history">
            {/* Header */}
            <div className="workout_history__header">
                <div className="workout_history__title-section">
                    <h1 className="workout_history__title">
                        {workoutHistoryContent.title}
                    </h1>
                    <p className="workout_history__subtitle">
                        {workoutHistoryContent.subtitle}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="workout_history__stats">
                <div className="workout_history__stat-card">
                    <div className="workout_history__stat-icon">
                        <FiActivity />
                    </div>
                    <div className="workout_history__stat-content">
                        <span className="workout_history__stat-value">{stats.totalWorkouts}</span>
                        <span className="workout_history__stat-label">
                            {workoutHistoryContent.stats.totalWorkouts}
                        </span>
                    </div>
                </div>

                <div className="workout_history__stat-card">
                    <div className="workout_history__stat-icon">
                        <FiClock />
                    </div>
                    <div className="workout_history__stat-content">
                        <span className="workout_history__stat-value">
                            {formatTotalTime(stats.totalTime)}
                        </span>
                        <span className="workout_history__stat-label">
                            {workoutHistoryContent.stats.totalTime}
                        </span>
                    </div>
                </div>

                <div className="workout_history__stat-card">
                    <div className="workout_history__stat-icon">
                        <FiTarget />
                    </div>
                    <div className="workout_history__stat-content">
                        <span className="workout_history__stat-value">
                            {stats.averageDuration} {workoutHistoryContent.stats.minutes}
                        </span>
                        <span className="workout_history__stat-label">
                            {workoutHistoryContent.stats.averageDuration}
                        </span>
                    </div>
                </div>

                <div className="workout_history__stat-card">
                    <div className="workout_history__stat-icon">
                        <FiAward />
                    </div>
                    <div className="workout_history__stat-content">
                        <span className="workout_history__stat-value">
                            {stats.currentStreak} {workoutHistoryContent.stats.days}
                        </span>
                        <span className="workout_history__stat-label">
                            {workoutHistoryContent.stats.currentStreak}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="workout_history__controls">
                <div className="workout_history__search">
                    <FiSearch className="workout_history__search-icon" />
                    <input
                        type="text"
                        placeholder={workoutHistoryContent.search.placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="workout_history__search-input"
                    />
                </div>

                <div className="workout_history__filters">
                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="workout_history__filter-select"
                    >
                        {Object.entries(workoutHistoryContent.filters).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    <select
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className="workout_history__sort-select"
                    >
                        {Object.entries(workoutHistoryContent.sorting).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Workout List */}
            <div className="workout_history__content">
                {filteredWorkouts.length === 0 ? (
                    <div className="workout_history__empty">
                        <div className="workout_history__empty-content">
                            <FiActivity className="workout_history__empty-icon" />
                            <h3 className="workout_history__empty-title">
                                {workoutHistoryContent.emptyState.title}
                            </h3>
                            <p className="workout_history__empty-message">
                                {workoutHistoryContent.emptyState.message}
                            </p>
                            <button 
                                className="workout_history__empty-button"
                                onClick={handleCreateWorkout}
                            >
                                <FiPlus />
                                {workoutHistoryContent.emptyState.buttonText}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="workout_history__list">
                        {filteredWorkouts.map((workout) => (
                            <div key={workout.id} className="workout_history__card">
                                <div className="workout_history__card-header">
                                    <div className="workout_history__card-date">
                                        <FiCalendar className="workout_history__card-date-icon" />
                                        <span>{formatDate(workout.date)}</span>
                                    </div>
                                    <div className="workout_history__card-duration">
                                        <FiClock className="workout_history__card-duration-icon" />
                                        <span>{formatDuration(workout.duration)}</span>
                                    </div>
                                </div>

                                <div className="workout_history__card-content">
                                    <div className="workout_history__card-exercises">
                                        {workout.exercises.map((exercise, index) => (
                                            <div key={exercise.id} className="workout_history__exercise">
                                                <div className="workout_history__exercise-header">
                                                    <span className="workout_history__exercise-name">
                                                        {exercise.name}
                                                    </span>
                                                    {exercise.personalRecord && (
                                                        <span className="workout_history__pr-badge">
                                                            <FiAward />
                                                            {workoutHistoryContent.workoutCard.personalRecord}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="workout_history__exercise-sets">
                                                    {exercise.sets.length} {exercise.sets.length === 1 
                                                        ? workoutHistoryContent.workoutCard.set 
                                                        : workoutHistoryContent.workoutCard.sets}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="workout_history__card-summary">
                                        <span className="workout_history__card-exercise-count">
                                            {workout.exercises.length} {workout.exercises.length === 1 
                                                ? workoutHistoryContent.workoutCard.exercise 
                                                : workoutHistoryContent.workoutCard.exercises}
                                        </span>
                                    </div>
                                </div>

                                <div className="workout_history__card-footer">
                                    <button 
                                        className="workout_history__card-details-btn"
                                        onClick={() => handleViewWorkoutDetails(workout.id)}
                                    >
                                        {workoutHistoryContent.workoutCard.viewDetails}
                                        <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutHistory;