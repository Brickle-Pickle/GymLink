import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
    FiActivity, 
    FiClock, 
    FiTarget,
    FiTrendingUp,
    FiPlus,
    FiChevronRight,
    FiCalendar
} from 'react-icons/fi';
import recentWorkoutsContent from './content/recentWorkouts.json';
import './styles/recentWorkouts.css';

const RecentWorkouts = () => {
    const { user, isLoading, navigate } = useAppContext();
    const [recentWorkouts, setRecentWorkouts] = useState([]);

    // Mock data - this would come from API/context in real app
    useEffect(() => {
        // Simulate loading recent workouts
        const mockWorkouts = [
            {
                id: '1',
                name: 'Push Day - Pecho y Tríceps',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
                duration: 75, // minutes
                exercises: [
                    { name: 'Press Banca', sets: 4 },
                    { name: 'Press Inclinado', sets: 3 },
                    { name: 'Fondos', sets: 3 },
                    { name: 'Extensiones Tríceps', sets: 3 }
                ],
                totalSets: 13,
                notes: 'Buen entrenamiento, aumenté peso en press banca'
            },
            {
                id: '2',
                name: 'Pull Day - Espalda y Bíceps',
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                duration: 68,
                exercises: [
                    { name: 'Dominadas', sets: 4 },
                    { name: 'Remo con Barra', sets: 4 },
                    { name: 'Curl con Barra', sets: 3 },
                    { name: 'Curl Martillo', sets: 3 }
                ],
                totalSets: 14,
                notes: 'Logré hacer 2 dominadas más que la semana pasada'
            },
            {
                id: '3',
                name: 'Leg Day - Piernas',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                duration: 85,
                exercises: [
                    { name: 'Sentadillas', sets: 5 },
                    { name: 'Peso Muerto', sets: 4 },
                    { name: 'Prensa', sets: 3 },
                    { name: 'Extensiones', sets: 3 }
                ],
                totalSets: 15,
                notes: 'Día intenso, nuevo PR en sentadillas'
            }
        ];

        setRecentWorkouts(mockWorkouts);
    }, []);

    // Calculate time ago
    const getTimeAgo = (date) => {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return recentWorkoutsContent.workoutCard.timeAgo.today;
        if (diffDays === 1) return recentWorkoutsContent.workoutCard.timeAgo.yesterday;
        if (diffDays < 7) return recentWorkoutsContent.workoutCard.timeAgo.daysAgo.replace('{days}', diffDays);
        
        const diffWeeks = Math.floor(diffDays / 7);
        return recentWorkoutsContent.workoutCard.timeAgo.weeksAgo.replace('{weeks}', diffWeeks);
    };

    // Calculate summary stats
    const getSummaryStats = () => {
        if (recentWorkouts.length === 0) return null;

        const totalDuration = recentWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
        const totalExercises = recentWorkouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
        const totalSets = recentWorkouts.reduce((sum, workout) => sum + workout.totalSets, 0);
        const averageDuration = Math.round(totalDuration / recentWorkouts.length);

        return {
            totalDuration,
            totalExercises,
            totalSets,
            averageDuration
        };
    };

    const summaryStats = getSummaryStats();

    const handleViewWorkout = (workoutId) => {
        navigate(`/workouts/${workoutId}`);
    };

    const handleNewWorkout = () => {
        navigate('/workouts/create');
    };

    const handleViewAll = () => {
        navigate('/workouts');
    };

    return (
        <section className={`recent-workouts ${isLoading ? 'recent-workouts--loading' : ''}`}>
            <div className="recent-workouts__container">
                {/* Header */}
                <div className="recent-workouts__header">
                    <div className="recent-workouts__title-section">
                        <h2 className="recent-workouts__title">
                            <FiActivity className="recent-workouts__title-icon" />
                            {recentWorkoutsContent.title}
                        </h2>
                        <p className="recent-workouts__subtitle">
                            {recentWorkoutsContent.subtitle}
                        </p>
                    </div>
                    <div className="recent-workouts__actions">
                        <button 
                            className="recent-workouts__action-btn recent-workouts__action-btn--secondary"
                            onClick={handleViewAll}
                        >
                            {recentWorkoutsContent.actions.viewAll}
                            <FiChevronRight className="recent-workouts__action-icon" />
                        </button>
                        <button 
                            className="recent-workouts__action-btn recent-workouts__action-btn--primary"
                            onClick={handleNewWorkout}
                        >
                            <FiPlus className="recent-workouts__action-icon" />
                            {recentWorkoutsContent.actions.newWorkout}
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                {summaryStats && (
                    <div className="recent-workouts__summary">
                        <div className="recent-workouts__stat">
                            <FiClock className="recent-workouts__stat-icon" />
                            <div className="recent-workouts__stat-content">
                                <span className="recent-workouts__stat-value">{summaryStats.totalDuration}min</span>
                                <span className="recent-workouts__stat-label">{recentWorkoutsContent.stats.totalDuration}</span>
                            </div>
                        </div>
                        <div className="recent-workouts__stat">
                            <FiTarget className="recent-workouts__stat-icon" />
                            <div className="recent-workouts__stat-content">
                                <span className="recent-workouts__stat-value">{summaryStats.totalExercises}</span>
                                <span className="recent-workouts__stat-label">{recentWorkoutsContent.stats.totalExercises}</span>
                            </div>
                        </div>
                        <div className="recent-workouts__stat">
                            <FiActivity className="recent-workouts__stat-icon" />
                            <div className="recent-workouts__stat-content">
                                <span className="recent-workouts__stat-value">{summaryStats.totalSets}</span>
                                <span className="recent-workouts__stat-label">{recentWorkoutsContent.stats.totalSets}</span>
                            </div>
                        </div>
                        <div className="recent-workouts__stat">
                            <FiTrendingUp className="recent-workouts__stat-icon" />
                            <div className="recent-workouts__stat-content">
                                <span className="recent-workouts__stat-value">{summaryStats.averageDuration}min</span>
                                <span className="recent-workouts__stat-label">{recentWorkoutsContent.stats.averageDuration}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Workouts List */}
                <div className="recent-workouts__content">
                    {recentWorkouts.length === 0 ? (
                        <div className="recent-workouts__empty">
                            <FiCalendar className="recent-workouts__empty-icon" />
                            <h3 className="recent-workouts__empty-title">
                                {recentWorkoutsContent.emptyState.title}
                            </h3>
                            <p className="recent-workouts__empty-description">
                                {recentWorkoutsContent.emptyState.description}
                            </p>
                            <button 
                                className="recent-workouts__empty-action"
                                onClick={handleNewWorkout}
                            >
                                <FiPlus className="recent-workouts__action-icon" />
                                {recentWorkoutsContent.emptyState.actionText}
                            </button>
                        </div>
                    ) : (
                        <div className="recent-workouts__list">
                            {recentWorkouts.map((workout) => (
                                <div 
                                    key={workout.id} 
                                    className="recent-workouts__card"
                                    onClick={() => handleViewWorkout(workout.id)}
                                >
                                    <div className="recent-workouts__card-header">
                                        <h3 className="recent-workouts__card-title">{workout.name}</h3>
                                        <span className="recent-workouts__card-time">
                                            {getTimeAgo(workout.date)}
                                        </span>
                                    </div>
                                    
                                    <div className="recent-workouts__card-stats">
                                        <div className="recent-workouts__card-stat">
                                            <FiClock className="recent-workouts__card-stat-icon" />
                                            <span>{workout.duration}min</span>
                                        </div>
                                        <div className="recent-workouts__card-stat">
                                            <FiTarget className="recent-workouts__card-stat-icon" />
                                            <span>{workout.exercises.length} {recentWorkoutsContent.workoutCard.exercises}</span>
                                        </div>
                                        <div className="recent-workouts__card-stat">
                                            <FiActivity className="recent-workouts__card-stat-icon" />
                                            <span>{workout.totalSets} {recentWorkoutsContent.workoutCard.sets}</span>
                                        </div>
                                    </div>

                                    <div className="recent-workouts__card-exercises">
                                        {workout.exercises.slice(0, 3).map((exercise, index) => (
                                            <span key={index} className="recent-workouts__exercise-tag">
                                                {exercise.name}
                                            </span>
                                        ))}
                                        {workout.exercises.length > 3 && (
                                            <span className="recent-workouts__exercise-more">
                                                +{workout.exercises.length - 3} más
                                            </span>
                                        )}
                                    </div>

                                    <div className="recent-workouts__card-footer">
                                        <button className="recent-workouts__card-action">
                                            {recentWorkoutsContent.workoutCard.viewDetails}
                                            <FiChevronRight className="recent-workouts__card-action-icon" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RecentWorkouts;