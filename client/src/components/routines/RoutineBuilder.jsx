import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import content from './content/routineBuilder.json';
import './styles/routineBuilder.css';

// Icons
import { 
    FiSearch, 
    FiPlus, 
    FiTrash2, 
    FiEdit3, 
    FiMove, 
    FiClock,
    FiTarget,
    FiSave,
    FiX,
    FiEye
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';

const RoutineBuilder = () => {
    const {
        currentRoutine,
        setCurrentRoutine,
        availableExercises,
        setAvailableExercises,
        isDragActive,
        setIsDragActive,
        addExerciseToRoutine,
        removeExerciseFromRoutine,
        updateRoutineExercise,
        reorderRoutineExercises,
        resetRoutineBuilder,
        saveRoutine,
        addNotification,
        navigateAndClose
    } = useAppContext();

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [draggedExercise, setDraggedExercise] = useState(null);
    const [draggedRoutineIndex, setDraggedRoutineIndex] = useState(null);
    const [errors, setErrors] = useState({});
    const dropZoneRef = useRef(null);

    // Mock exercises data
    useEffect(() => {
        const mockExercises = [
            {
                id: '1',
                name: 'Press Banca',
                type: 'reps-weight',
                category: 'chest',
                description: 'Ejercicio básico para pecho'
            },
            {
                id: '2',
                name: 'Sentadillas',
                type: 'reps-weight',
                category: 'legs',
                description: 'Ejercicio fundamental para piernas'
            },
            {
                id: '3',
                name: 'Flexiones',
                type: 'reps-only',
                category: 'chest',
                description: 'Ejercicio de peso corporal'
            },
            {
                id: '4',
                name: 'Plancha',
                type: 'time-only',
                category: 'core',
                description: 'Ejercicio isométrico para core'
            },
            {
                id: '5',
                name: 'Correr',
                type: 'time-distance',
                category: 'cardio',
                description: 'Ejercicio cardiovascular'
            },
            {
                id: '6',
                name: 'Dominadas',
                type: 'reps-only',
                category: 'back',
                description: 'Ejercicio para espalda'
            },
            {
                id: '7',
                name: 'Press Militar',
                type: 'reps-weight',
                category: 'shoulders',
                description: 'Ejercicio para hombros'
            },
            {
                id: '8',
                name: 'Curl de Bíceps',
                type: 'reps-weight',
                category: 'arms',
                description: 'Ejercicio para bíceps'
            }
        ];
        setAvailableExercises(mockExercises);
    }, [setAvailableExercises]);

    // Filter exercises
    const filteredExercises = availableExercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Handle form changes
    const handleFormChange = (field, value) => {
        setCurrentRoutine(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Drag and drop handlers for exercise library
    const handleDragStart = (e, exercise) => {
        setDraggedExercise(exercise);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragEnd = () => {
        setDraggedExercise(null);
        setIsDragActive(false);
    };

    // Drag and drop handlers for routine reordering
    const handleRoutineDragStart = (e, index) => {
        setDraggedRoutineIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleRoutineDragEnd = () => {
        setDraggedRoutineIndex(null);
    };

    // Drop zone handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = draggedExercise ? 'copy' : 'move';
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        if (!dropZoneRef.current?.contains(e.relatedTarget)) {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);

        if (draggedExercise) {
            // Adding new exercise from library
            addExerciseToRoutine(draggedExercise);
            addNotification({
                type: 'success',
                message: content.notifications.exerciseAdded
            });
        } else if (draggedRoutineIndex !== null) {
            // Reordering exercises in routine
            const dropIndex = getCurrentDropIndex(e);
            if (dropIndex !== draggedRoutineIndex) {
                reorderRoutineExercises(draggedRoutineIndex, dropIndex);
            }
        }
    };

    const getCurrentDropIndex = (e) => {
        const dropZone = dropZoneRef.current;
        const exercises = dropZone.querySelectorAll('.routine_builder__exercise-card');
        const mouseY = e.clientY;
        
        for (let i = 0; i < exercises.length; i++) {
            const rect = exercises[i].getBoundingClientRect();
            if (mouseY < rect.top + rect.height / 2) {
                return i;
            }
        }
        return exercises.length;
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};
        
        if (!currentRoutine.name.trim()) {
            newErrors.name = content.validation.nameRequired;
        }
        
        if (!currentRoutine.level) {
            newErrors.level = content.validation.levelRequired;
        }
        
        if (currentRoutine.exercises.length === 0) {
            newErrors.exercises = content.validation.exercisesRequired;
        }
        
        if (currentRoutine.estimatedDuration && isNaN(Number(currentRoutine.estimatedDuration))) {
            newErrors.estimatedDuration = content.validation.durationInvalid;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }
        
        const result = await saveRoutine(currentRoutine);
        if (result.success) {
            navigateAndClose('/routines');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        resetRoutineBuilder();
        navigateAndClose('/routines');
    };

    // Calculate estimated time
    const calculateEstimatedTime = () => {
        if (currentRoutine.estimatedDuration) {
            return Number(currentRoutine.estimatedDuration);
        }
        
        // Auto-calculate based on exercises (rough estimate)
        const baseTimePerExercise = 5; // minutes
        const timePerSet = 2; // minutes
        
        return currentRoutine.exercises.reduce((total, exercise) => {
            return total + baseTimePerExercise + (exercise.sets * timePerSet);
        }, 0);
    };

    return (
        <div className="routine_builder">
            <div className="routine_builder__container">
                {/* Header */}
                <div className="routine_builder__header">
                    <h1 className="routine_builder__title">{content.title}</h1>
                    <p className="routine_builder__subtitle">{content.subtitle}</p>
                </div>

                <div className="routine_builder__content">
                    {/* Form Section */}
                    <div className="routine_builder__form-section">
                        <div className="routine_builder__form">
                            <div className="routine_builder__form-row">
                                <div className="routine_builder__field">
                                    <label className="routine_builder__label">
                                        {content.form.routineName.label}
                                    </label>
                                    <input
                                        type="text"
                                        className={`routine_builder__input ${errors.name ? 'routine_builder__input--error' : ''}`}
                                        placeholder={content.form.routineName.placeholder}
                                        value={currentRoutine.name}
                                        onChange={(e) => handleFormChange('name', e.target.value)}
                                    />
                                    {errors.name && (
                                        <span className="routine_builder__error">{errors.name}</span>
                                    )}
                                </div>

                                <div className="routine_builder__field">
                                    <label className="routine_builder__label">
                                        {content.form.routineLevel.label}
                                    </label>
                                    <select
                                        className={`routine_builder__select ${errors.level ? 'routine_builder__select--error' : ''}`}
                                        value={currentRoutine.level}
                                        onChange={(e) => handleFormChange('level', e.target.value)}
                                    >
                                        <option value="">Seleccionar nivel</option>
                                        {Object.entries(content.form.routineLevel.options).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                    {errors.level && (
                                        <span className="routine_builder__error">{errors.level}</span>
                                    )}
                                </div>
                            </div>

                            <div className="routine_builder__form-row">
                                <div className="routine_builder__field">
                                    <label className="routine_builder__label">
                                        {content.form.routineDescription.label}
                                    </label>
                                    <textarea
                                        className="routine_builder__textarea"
                                        placeholder={content.form.routineDescription.placeholder}
                                        value={currentRoutine.description}
                                        onChange={(e) => handleFormChange('description', e.target.value)}
                                        rows="3"
                                    />
                                </div>

                                <div className="routine_builder__field">
                                    <label className="routine_builder__label">
                                        {content.form.estimatedDuration.label}
                                    </label>
                                    <input
                                        type="number"
                                        className={`routine_builder__input ${errors.estimatedDuration ? 'routine_builder__input--error' : ''}`}
                                        placeholder={content.form.estimatedDuration.placeholder}
                                        value={currentRoutine.estimatedDuration}
                                        onChange={(e) => handleFormChange('estimatedDuration', e.target.value)}
                                        min="1"
                                        max="300"
                                    />
                                    {errors.estimatedDuration && (
                                        <span className="routine_builder__error">{errors.estimatedDuration}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="routine_builder__main">
                        {/* Exercise Library */}
                        <div className="routine_builder__library">
                            <h2 className="routine_builder__section-title">
                                {content.exerciseLibrary.title}
                            </h2>

                            {/* Search and Filter */}
                            <div className="routine_builder__library-controls">
                                <div className="routine_builder__search">
                                    <FiSearch className="routine_builder__search-icon" />
                                    <input
                                        type="text"
                                        className="routine_builder__search-input"
                                        placeholder={content.exerciseLibrary.searchPlaceholder}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="routine_builder__category-filter"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {Object.entries(content.exerciseLibrary.categories).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Exercise List */}
                            <div className="routine_builder__exercise-list">
                                {filteredExercises.map(exercise => (
                                    <div
                                        key={exercise.id}
                                        className="routine_builder__library-exercise"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, exercise)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="routine_builder__library-exercise-icon">
                                            <FaDumbbell />
                                        </div>
                                        <div className="routine_builder__library-exercise-info">
                                            <h4 className="routine_builder__library-exercise-name">
                                                {exercise.name}
                                            </h4>
                                            <span className="routine_builder__library-exercise-type">
                                                {content.exerciseLibrary.exerciseTypes[exercise.type]}
                                            </span>
                                        </div>
                                        <button
                                            className="routine_builder__add-button"
                                            onClick={() => {
                                                addExerciseToRoutine(exercise);
                                                addNotification({
                                                    type: 'success',
                                                    message: content.notifications.exerciseAdded
                                                });
                                            }}
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Routine Builder */}
                        <div className="routine_builder__routine">
                            <div className="routine_builder__routine-header">
                                <h2 className="routine_builder__section-title">
                                    {content.routineBuilder.title}
                                </h2>
                                <div className="routine_builder__routine-stats">
                                    <span className="routine_builder__stat">
                                        <FiTarget className="routine_builder__stat-icon" />
                                        {currentRoutine.exercises.length} {
                                            currentRoutine.exercises.length === 1 
                                                ? content.routineBuilder.totalExercise 
                                                : content.routineBuilder.totalExercises
                                        }
                                    </span>
                                    <span className="routine_builder__stat">
                                        <FiClock className="routine_builder__stat-icon" />
                                        {content.routineBuilder.estimatedTime} {calculateEstimatedTime()} min
                                    </span>
                                </div>
                            </div>

                            {/* Drop Zone */}
                            <div
                                ref={dropZoneRef}
                                className={`routine_builder__drop-zone ${
                                    isDragActive ? 'routine_builder__drop-zone--active' : ''
                                } ${
                                    currentRoutine.exercises.length === 0 ? 'routine_builder__drop-zone--empty' : ''
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {currentRoutine.exercises.length === 0 ? (
                                    <div className="routine_builder__empty-state">
                                        <FaDumbbell className="routine_builder__empty-icon" />
                                        <h3 className="routine_builder__empty-title">
                                            {content.routineBuilder.emptyState.title}
                                        </h3>
                                        <p className="routine_builder__empty-description">
                                            {content.routineBuilder.emptyState.description}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="routine_builder__exercise-cards">
                                        {currentRoutine.exercises.map((exercise, index) => (
                                            <div
                                                key={exercise.id}
                                                className="routine_builder__exercise-card"
                                                draggable
                                                onDragStart={(e) => handleRoutineDragStart(e, index)}
                                                onDragEnd={handleRoutineDragEnd}
                                            >
                                                <div className="routine_builder__exercise-card-header">
                                                    <div className="routine_builder__exercise-card-drag">
                                                        <FiMove />
                                                    </div>
                                                    <h4 className="routine_builder__exercise-card-name">
                                                        {exercise.name}
                                                    </h4>
                                                    <button
                                                        className="routine_builder__exercise-card-remove"
                                                        onClick={() => {
                                                            removeExerciseFromRoutine(exercise.id);
                                                            addNotification({
                                                                type: 'info',
                                                                message: content.notifications.exerciseRemoved
                                                            });
                                                        }}
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>

                                                <div className="routine_builder__exercise-card-params">
                                                    <div className="routine_builder__param">
                                                        <label>{content.routineBuilder.exerciseCard.setsLabel}</label>
                                                        <input
                                                            type="number"
                                                            value={exercise.sets}
                                                            onChange={(e) => updateRoutineExercise(exercise.id, { sets: Number(e.target.value) })}
                                                            min="1"
                                                            max="10"
                                                        />
                                                    </div>

                                                    {exercise.reps !== null && (
                                                        <div className="routine_builder__param">
                                                            <label>{content.routineBuilder.exerciseCard.repsLabel}</label>
                                                            <input
                                                                type="number"
                                                                value={exercise.reps}
                                                                onChange={(e) => updateRoutineExercise(exercise.id, { reps: Number(e.target.value) })}
                                                                min="1"
                                                                max="100"
                                                            />
                                                        </div>
                                                    )}

                                                    {exercise.weight !== null && (
                                                        <div className="routine_builder__param">
                                                            <label>{content.routineBuilder.exerciseCard.weightLabel}</label>
                                                            <input
                                                                type="number"
                                                                value={exercise.weight}
                                                                onChange={(e) => updateRoutineExercise(exercise.id, { weight: Number(e.target.value) })}
                                                                min="0"
                                                                step="0.5"
                                                            />
                                                        </div>
                                                    )}

                                                    {exercise.time !== null && (
                                                        <div className="routine_builder__param">
                                                            <label>{content.routineBuilder.exerciseCard.timeLabel}</label>
                                                            <input
                                                                type="number"
                                                                value={exercise.time}
                                                                onChange={(e) => updateRoutineExercise(exercise.id, { time: Number(e.target.value) })}
                                                                min="0"
                                                            />
                                                        </div>
                                                    )}

                                                    {exercise.distance !== null && (
                                                        <div className="routine_builder__param">
                                                            <label>{content.routineBuilder.exerciseCard.distanceLabel}</label>
                                                            <input
                                                                type="number"
                                                                value={exercise.distance}
                                                                onChange={(e) => updateRoutineExercise(exercise.id, { distance: Number(e.target.value) })}
                                                                min="0"
                                                                step="0.1"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="routine_builder__param">
                                                        <label>{content.routineBuilder.exerciseCard.restLabel}</label>
                                                        <input
                                                            type="number"
                                                            value={exercise.restTime}
                                                            onChange={(e) => updateRoutineExercise(exercise.id, { restTime: Number(e.target.value) })}
                                                            min="0"
                                                            max="600"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isDragActive && (
                                    <div className="routine_builder__drag-overlay">
                                        <div className="routine_builder__drag-message">
                                            {draggedExercise ? content.dragAndDrop.dragActive : content.dragAndDrop.reorderHint}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {errors.exercises && (
                                <span className="routine_builder__error routine_builder__error--center">
                                    {errors.exercises}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="routine_builder__actions">
                        <button
                            className="routine_builder__button routine_builder__button--secondary"
                            onClick={handleCancel}
                        >
                            <FiX className="routine_builder__button-icon" />
                            {content.buttons.cancel}
                        </button>

                        <button
                            className="routine_builder__button routine_builder__button--outline"
                            onClick={() => {
                                // TODO: Implement preview functionality
                                addNotification({
                                    type: 'info',
                                    message: 'Vista previa próximamente'
                                });
                            }}
                        >
                            <FiEye className="routine_builder__button-icon" />
                            {content.buttons.preview}
                        </button>

                        <button
                            className="routine_builder__button routine_builder__button--primary"
                            onClick={handleSave}
                            disabled={currentRoutine.exercises.length === 0}
                        >
                            <FiSave className="routine_builder__button-icon" />
                            {content.buttons.saveRoutine}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoutineBuilder;