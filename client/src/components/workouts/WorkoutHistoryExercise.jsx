import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
    FiArrowLeft,
    FiCalendar,
    FiClock,
    FiActivity,
    FiTarget,
    FiAward,
    FiRepeat,
    FiEdit3,
    FiTrash2,
    FiShare2,
    FiAlertCircle
} from 'react-icons/fi';
import workoutHistoryExerciseContent from './content/workoutHistoryExercise.json';
import './styles/workoutHistoryExercise.css';

const WorkoutHistoryExercise = () => {
    const { workoutId } = useParams();
    const { navigateAndClose, addNotification } = useAppContext();
    const [workout, setWorkout] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

        // Mock data - En una aplicación real, esto vendría de la API
    useEffect(() => {
        const fetchWorkoutDetails = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Debug: Log the workoutId to see what we're getting
                console.log('Fetching workout with ID:', workoutId);

                // Simular delay de API
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock workout data basado en el ID
                const mockWorkouts = {
                    '1': {
                        id: '1',
                        date: new Date('2024-01-20T10:30:00'),
                        duration: 45,
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
                    '2': {
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
                    '3': {
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
                    '4': {
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
                };

                const workoutData = mockWorkouts[workoutId];
                
                // Debug: Log available workout IDs and the requested ID
                console.log('Available workout IDs:', Object.keys(mockWorkouts));
                console.log('Requested workout ID:', workoutId);
                console.log('Found workout data:', workoutData);

                if (!workoutData) {
                    throw new Error(`Workout with ID ${workoutId} not found`);
                }

                setWorkout(workoutData);
            } catch (err) {
                console.error('Error fetching workout:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        // Only fetch if workoutId exists
        if (workoutId) {
            fetchWorkoutDetails();
        } else {
            setError('No workout ID provided');
            setIsLoading(false);
        }
    }, [workoutId]);
    
    // Funciones de utilidad
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getTotalSets = () => {
        if (!workout) return 0;
        return workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
    };

    const getPersonalRecords = () => {
        if (!workout) return 0;
        return workout.exercises.filter(exercise => exercise.personalRecord).length;
    };

    const renderSetValue = (set, type) => {
        switch (type) {
            case 'reps':
                return set.reps ? `${set.reps}` : '-';
            case 'weight':
                return set.weight ? (
                    <>
                        {set.weight}
                        <span className="workout_history_exercise__set-unit">
                            {workoutHistoryExerciseContent.units[set.weightUnit] || set.weightUnit}
                        </span>
                    </>
                ) : '-';
            case 'time':
                return set.time ? (
                    <>
                        {set.time}
                        <span className="workout_history_exercise__set-unit">
                            {workoutHistoryExerciseContent.units[set.timeUnit] || set.timeUnit}
                        </span>
                    </>
                ) : '-';
            case 'distance':
                return set.distance ? (
                    <>
                        {set.distance}
                        <span className="workout_history_exercise__set-unit">
                            {workoutHistoryExerciseContent.units[set.distanceUnit] || set.distanceUnit}
                        </span>
                    </>
                ) : '-';
            default:
                return '-';
        }
    };

    const getSetHeaders = (exercise) => {
        const hasWeight = exercise.sets.some(set => set.weight !== undefined);
        const hasTime = exercise.sets.some(set => set.time !== undefined);
        const hasDistance = exercise.sets.some(set => set.distance !== undefined);
        const hasReps = exercise.sets.some(set => set.reps !== undefined);

        const headers = ['#'];
        if (hasReps) headers.push(workoutHistoryExerciseContent.exerciseDetails.reps);
        if (hasWeight) headers.push(workoutHistoryExerciseContent.exerciseDetails.weight);
        if (hasTime) headers.push(workoutHistoryExerciseContent.exerciseDetails.time);
        if (hasDistance) headers.push(workoutHistoryExerciseContent.exerciseDetails.distance);

        return headers;
    };

    const getSetColumns = (exercise) => {
        const hasWeight = exercise.sets.some(set => set.weight !== undefined);
        const hasTime = exercise.sets.some(set => set.time !== undefined);
        const hasDistance = exercise.sets.some(set => set.distance !== undefined);
        const hasReps = exercise.sets.some(set => set.reps !== undefined);

        const columns = [];
        if (hasReps) columns.push('reps');
        if (hasWeight) columns.push('weight');
        if (hasTime) columns.push('time');
        if (hasDistance) columns.push('distance');

        return columns;
    };

    // Handlers
    const handleBack = () => {
        navigateAndClose('/workouts/history');
    };

    const handleRepeatWorkout = () => {
        // TODO: Implementar repetir entrenamiento
        addNotification({
            type: 'info',
            message: 'Función de repetir entrenamiento próximamente'
        });
    };

    const handleEditWorkout = () => {
        // TODO: Implementar editar entrenamiento
        addNotification({
            type: 'info',
            message: 'Función de editar entrenamiento próximamente'
        });
    };

    const handleDeleteWorkout = () => {
        // TODO: Implementar eliminar entrenamiento con confirmación
        if (window.confirm(`${workoutHistoryExerciseContent.confirmDelete.title}\n\n${workoutHistoryExerciseContent.confirmDelete.message}`)) {
            addNotification({
                type: 'success',
                message: 'Entrenamiento eliminado correctamente'
            });
            navigateAndClose('/workouts/history');
        }
    };

    const handleShareWorkout = () => {
        // TODO: Implementar compartir entrenamiento
        addNotification({
            type: 'info',
            message: 'Función de compartir entrenamiento próximamente'
        });
    };

    if (isLoading) {
        return (
            <div className="workout_history_exercise">
                <div className="workout_history_exercise__loading">
                    <div className="workout_history_exercise__loading-spinner"></div>
                    <p className="workout_history_exercise__loading-text">
                        {workoutHistoryExerciseContent.loading.message}
                    </p>
                </div>
            </div>
        );
    }

    if (error || !workout) {
        return (
            <div className="workout_history_exercise">
                <div className="workout_history_exercise__error">
                    <FiAlertCircle className="workout_history_exercise__error-icon" />
                    <h2 className="workout_history_exercise__error-title">
                        {workoutHistoryExerciseContent.error.notFound}
                    </h2>
                    <p className="workout_history_exercise__error-message">
                        {workoutHistoryExerciseContent.error.loadError}
                    </p>
                    <button 
                        className="workout_history_exercise__error-button"
                        onClick={handleBack}
                    >
                        {workoutHistoryExerciseContent.backButton}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="workout_history_exercise">
            {/* Header */}
            <div className="workout_history_exercise__header">
                <div className="workout_history_exercise__nav">
                    <button 
                        className="workout_history_exercise__back-btn"
                        onClick={handleBack}
                    >
                        <FiArrowLeft />
                        {workoutHistoryExerciseContent.backButton}
                    </button>
                    <h1 className="workout_history_exercise__title">
                        {workoutHistoryExerciseContent.title}
                    </h1>
                </div>
            </div>

            {/* Workout Info */}
            <div className="workout_history_exercise__info-card">
                <div className="workout_history_exercise__info-grid">
                    <div className="workout_history_exercise__info-item">
                        <FiCalendar className="workout_history_exercise__info-icon" />
                        <span className="workout_history_exercise__info-value">
                            {formatDate(workout.date)}
                        </span>
                        <span className="workout_history_exercise__info-label">
                            {workoutHistoryExerciseContent.workoutInfo.date}
                        </span>
                    </div>
                    <div className="workout_history_exercise__info-item">
                        <FiClock className="workout_history_exercise__info-icon" />
                        <span className="workout_history_exercise__info-value">
                            {formatDuration(workout.duration)}
                        </span>
                        <span className="workout_history_exercise__info-label">
                            {workoutHistoryExerciseContent.workoutInfo.duration}
                        </span>
                    </div>
                    <div className="workout_history_exercise__info-item">
                        <FiActivity className="workout_history_exercise__info-icon" />
                        <span className="workout_history_exercise__info-value">
                            {workout.exercises.length}
                        </span>
                        <span className="workout_history_exercise__info-label">
                            {workoutHistoryExerciseContent.workoutInfo.totalExercises}
                        </span>
                    </div>
                    <div className="workout_history_exercise__info-item">
                        <FiTarget className="workout_history_exercise__info-icon" />
                        <span className="workout_history_exercise__info-value">
                            {getTotalSets()}
                        </span>
                        <span className="workout_history_exercise__info-label">
                            {workoutHistoryExerciseContent.workoutInfo.totalSets}
                        </span>
                    </div>
                    <div className="workout_history_exercise__info-item">
                        <FiAward className="workout_history_exercise__info-icon" />
                        <span className="workout_history_exercise__info-value">
                            {getPersonalRecords()}
                        </span>
                        <span className="workout_history_exercise__info-label">
                            {workoutHistoryExerciseContent.workoutInfo.personalRecords}
                        </span>
                    </div>
                </div>
            </div>

            {/* Exercises */}
            <div className="workout_history_exercise__exercises">
                {workout.exercises.map((exercise) => {
                    const headers = getSetHeaders(exercise);
                    const columns = getSetColumns(exercise);
                    const gridCols = `60px ${'1fr '.repeat(columns.length)}`;

                    return (
                        <div key={exercise.id} className="workout_history_exercise__exercise-card">
                            <div className="workout_history_exercise__exercise-header">
                                <h3 className="workout_history_exercise__exercise-name">
                                    {exercise.name}
                                </h3>
                                {exercise.personalRecord && (
                                    <span className="workout_history_exercise__pr-badge">
                                        <FiAward />
                                        {workoutHistoryExerciseContent.exerciseDetails.personalRecord}
                                    </span>
                                )}
                            </div>

                            <div className="workout_history_exercise__sets">
                                <div 
                                    className="workout_history_exercise__sets-header"
                                    style={{ gridTemplateColumns: gridCols }}
                                >
                                    {headers.map((header, index) => (
                                        <span key={index}>{header}</span>
                                    ))}
                                </div>

                                {exercise.sets.map((set, index) => (
                                    <div 
                                        key={index}
                                        className="workout_history_exercise__set-row"
                                        style={{ gridTemplateColumns: gridCols }}
                                    >
                                        <span className="workout_history_exercise__set-number">
                                            {index + 1}
                                        </span>
                                        {columns.map((column, colIndex) => (
                                            <span 
                                                key={colIndex}
                                                className="workout_history_exercise__set-value"
                                            >
                                                {renderSetValue(set, column)}
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="workout_history_exercise__actions">
                <button 
                    className="workout_history_exercise__action-btn workout_history_exercise__action-btn--primary"
                    onClick={handleRepeatWorkout}
                >
                    <FiRepeat />
                    {workoutHistoryExerciseContent.actions.repeatWorkout}
                </button>
                <button 
                    className="workout_history_exercise__action-btn"
                    onClick={handleEditWorkout}
                >
                    <FiEdit3 />
                    {workoutHistoryExerciseContent.actions.editWorkout}
                </button>
                <button 
                    className="workout_history_exercise__action-btn"
                    onClick={handleShareWorkout}
                >
                    <FiShare2 />
                    {workoutHistoryExerciseContent.actions.shareWorkout}
                </button>
                <button 
                    className="workout_history_exercise__action-btn workout_history_exercise__action-btn--danger"
                    onClick={handleDeleteWorkout}
                >
                    <FiTrash2 />
                    {workoutHistoryExerciseContent.actions.deleteWorkout}
                </button>
            </div>
        </div>
    );
};

export default WorkoutHistoryExercise;