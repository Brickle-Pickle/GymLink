import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import './styles/routineGrid.css';
import content from './content/routineGrid.json';

// Icons (assuming you're using react-icons)
import { 
    FiSearch, 
    FiPlus, 
    FiGrid, 
    FiList, 
    FiClock, 
    FiTarget, 
    FiPlay, 
    FiEdit, 
    FiCopy, 
    FiShare2, 
    FiTrash2,
} from 'react-icons/fi';
import {
    FaDumbbell
} from 'react-icons/fa';

const RoutineGrid = () => {
    const { user, isLoading, navigateAndClose } = useAppContext();
    
    // State management
    const [routines, setRoutines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('grid');
    const [isLoadingRoutines, setIsLoadingRoutines] = useState(true);

    // Mock data - Replace with actual API call
    const mockRoutines = [
        {
            id: '1',
            name: 'Rutina de Pecho y Tríceps',
            description: 'Entrenamiento intensivo para desarrollar pecho y tríceps',
            exercises: [
                { id: '1', name: 'Press de banca', sets: 4, reps: '8-12' },
                { id: '2', name: 'Press inclinado', sets: 3, reps: '10-12' },
                { id: '3', name: 'Fondos', sets: 3, reps: '12-15' },
                { id: '4', name: 'Extensiones de tríceps', sets: 3, reps: '12-15' }
            ],
            difficulty: 'intermediate',
            estimatedDuration: 45,
            targetMuscles: ['chest', 'arms'],
            lastUsed: new Date('2024-01-15'),
            createdAt: new Date('2024-01-01'),
            isFavorite: true
        },
        {
            id: '2',
            name: 'Rutina de Piernas Completa',
            description: 'Entrenamiento completo para desarrollar toda la musculatura de las piernas',
            exercises: [
                { id: '5', name: 'Sentadillas', sets: 4, reps: '12-15' },
                { id: '6', name: 'Peso muerto rumano', sets: 3, reps: '10-12' },
                { id: '7', name: 'Prensa de piernas', sets: 3, reps: '15-20' },
                { id: '8', name: 'Curl de femoral', sets: 3, reps: '12-15' },
                { id: '9', name: 'Elevaciones de gemelos', sets: 4, reps: '15-20' }
            ],
            difficulty: 'advanced',
            estimatedDuration: 60,
            targetMuscles: ['legs'],
            lastUsed: new Date('2024-01-10'),
            createdAt: new Date('2023-12-15'),
            isFavorite: false
        },
        {
            id: '3',
            name: 'Rutina de Espalda y Bíceps',
            description: 'Desarrollo de la musculatura dorsal y bíceps',
            exercises: [
                { id: '10', name: 'Dominadas', sets: 4, reps: '6-10' },
                { id: '11', name: 'Remo con barra', sets: 4, reps: '8-12' },
                { id: '12', name: 'Curl de bíceps', sets: 3, reps: '12-15' },
                { id: '13', name: 'Curl martillo', sets: 3, reps: '12-15' }
            ],
            difficulty: 'intermediate',
            estimatedDuration: 50,
            targetMuscles: ['back', 'arms'],
            lastUsed: null,
            createdAt: new Date('2024-01-05'),
            isFavorite: true
        }
    ];

    // Load routines on component mount
    useEffect(() => {
        const loadRoutines = async () => {
            setIsLoadingRoutines(true);
            try {
                // TODO: Replace with actual API call
                // const response = await fetch('/api/routines');
                // const data = await response.json();
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setRoutines(mockRoutines);
            } catch (error) {
                console.error('Error loading routines:', error);
            } finally {
                setIsLoadingRoutines(false);
            }
        };

        loadRoutines();
    }, []);

    // Filter and sort routines
    const filteredAndSortedRoutines = useMemo(() => {
        let filtered = routines;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(routine =>
                routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                routine.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        switch (selectedFilter) {
            case 'recent':
                filtered = filtered.filter(routine => 
                    routine.lastUsed && 
                    (new Date() - routine.lastUsed) / (1000 * 60 * 60 * 24) <= 7
                );
                break;
            case 'favorites':
                filtered = filtered.filter(routine => routine.isFavorite);
                break;
            default:
                break;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'dateCreated':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'lastUsed':
                    if (!a.lastUsed && !b.lastUsed) return 0;
                    if (!a.lastUsed) return 1;
                    if (!b.lastUsed) return -1;
                    return new Date(b.lastUsed) - new Date(a.lastUsed);
                case 'difficulty':
                    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
                    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                case 'duration':
                    return a.estimatedDuration - b.estimatedDuration;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [routines, searchTerm, selectedFilter, sortBy]);

    // Event handlers
    const handleCreateRoutine = () => {
        navigateAndClose('/routines/create');
    };

    const handleStartWorkout = (routineId) => {
        navigateAndClose(`/workout/start/${routineId}`);
    };

    const handleEditRoutine = (routineId) => {
        navigateAndClose(`/routines/edit/${routineId}`);
    };

    const handleShareRoutine = (routineId) => {
        // TODO: Implement share functionality
        console.log('Sharing routine:', routineId);
    };

    const handleDeleteRoutine = (routineId) => {
        if (window.confirm(`${content.confirmDelete.message}`)) {
            setRoutines(prev => prev.filter(routine => routine.id !== routineId));
        }
    };

    // Helper functions
    const formatLastUsed = (lastUsed) => {
        if (!lastUsed) return content.routineCard.neverUsedLabel;
        
        const now = new Date();
        const diffTime = Math.abs(now - lastUsed);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Ayer';
        if (diffDays <= 7) return `Hace ${diffDays} días`;
        if (diffDays <= 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
        return lastUsed.toLocaleDateString();
    };

    const getDifficultyLabel = (difficulty) => {
        return content.difficulty[difficulty] || difficulty;
    };

    const getMuscleGroupLabel = (muscleGroup) => {
        return content.muscleGroups[muscleGroup] || muscleGroup;
    };

    // Render routine card
    const renderRoutineCard = (routine) => {
        const isListView = viewMode === 'list';
        
        return (
            <div 
                key={routine.id} 
                className={`routines_grid__card ${isListView ? 'routines_grid__card--list' : ''}`}
            >
                <div className="routines_grid__card_header">
                    <div>
                        <h3 className="routines_grid__card_title">{routine.name}</h3>
                        <span className={`routines_grid__card_difficulty routines_grid__card_difficulty--${routine.difficulty}`}>
                            {getDifficultyLabel(routine.difficulty)}
                        </span>
                    </div>
                </div>

                <div className="routines_grid__card_stats">
                    <div className="routines_grid__card_stat">
                        <FiTarget className="routines_grid__card_stat_icon" />
                        <span>
                            {routine.exercises.length} {routine.exercises.length === 1 ? content.routineCard.exerciseLabel : content.routineCard.exercisesLabel}
                        </span>
                    </div>
                    <div className="routines_grid__card_stat">
                        <FiClock className="routines_grid__card_stat_icon" />
                        <span>{routine.estimatedDuration} {content.routineCard.durationLabel}</span>
                    </div>
                </div>

                <div className="routines_grid__card_muscles">
                    <p className="routines_grid__card_muscles_title">{content.routineCard.targetMusclesLabel}</p>
                    <div className="routines_grid__card_muscle_tags">
                        {routine.targetMuscles.map(muscle => (
                            <span key={muscle} className="routines_grid__card_muscle_tag">
                                {getMuscleGroupLabel(muscle)}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="routines_grid__card_last_used">
                    {content.routineCard.lastUsedLabel} {formatLastUsed(routine.lastUsed)}
                </p>

                <div className="routines_grid__card_actions">
                    <button 
                        className="routines_grid__card_action routines_grid__card_action--primary"
                        onClick={() => handleStartWorkout(routine.id)}
                    >
                        <FiPlay />
                        {content.routineCard.startWorkoutButton}
                    </button>
                    <button 
                        className="routines_grid__card_action"
                        onClick={() => handleEditRoutine(routine.id)}
                    >
                        <FiEdit />
                        {content.routineCard.editButton}
                    </button>
                    <button 
                        className="routines_grid__card_action"
                        onClick={() => handleShareRoutine(routine.id)}
                    >
                        <FiShare2 />
                        {content.routineCard.shareButton}
                    </button>
                    <button 
                        className="routines_grid__card_action routines_grid__card_action--danger"
                        onClick={() => handleDeleteRoutine(routine.id)}
                    >
                        <FiTrash2 />
                        {content.routineCard.deleteButton}
                    </button>
                </div>
            </div>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <div className="routines_grid__empty_state">
            <FaDumbbell className="routines_grid__empty_icon" />
            <h3 className="routines_grid__empty_title">{content.emptyState.title}</h3>
            <p className="routines_grid__empty_description">{content.emptyState.description}</p>
            <button 
                className="routines_grid__empty_button"
                onClick={handleCreateRoutine}
            >
                <FiPlus />
                {content.emptyState.buttonText}
            </button>
        </div>
    );

    // Render loading state
    const renderLoadingState = () => (
        <div className="routines_grid__loading">
            <div className="routines_grid__loading_spinner"></div>
        </div>
    );

    if (isLoading || isLoadingRoutines) {
        return renderLoadingState();
    }

    return (
        <div className="routines_grid">
            <div className="routines_grid__header">
                <h1 className="routines_grid__title">{content.title}</h1>
                <p className="routines_grid__subtitle">{content.subtitle}</p>
            </div>

            <div className="routines_grid__controls">
                <div className="routines_grid__top_controls">
                    <div className="routines_grid__search_container">
                        <FiSearch className="routines_grid__search_icon" />
                        <input
                            type="text"
                            className="routines_grid__search"
                            placeholder={content.actions.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="routines_grid__action_buttons">
                        <button 
                            className="routines_grid__create_button"
                            onClick={handleCreateRoutine}
                        >
                            <FiPlus />
                            {content.actions.createNew}
                        </button>
                        
                        <div className="routines_grid__view_toggle">
                            <button 
                                className={`routines_grid__view_button ${viewMode === 'grid' ? 'routines_grid__view_button--active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <FiGrid />
                            </button>
                            <button 
                                className={`routines_grid__view_button ${viewMode === 'list' ? 'routines_grid__view_button--active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <FiList />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="routines_grid__filters">
                    <div className="routines_grid__filter_group">
                        <label className="routines_grid__filter_label">Filtrar:</label>
                        <select 
                            className="routines_grid__filter_select"
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                        >
                            <option value="all">{content.filters.all}</option>
                            <option value="recent">{content.filters.recent}</option>
                            <option value="favorites">{content.filters.favorites}</option>
                        </select>
                    </div>
                    
                    <div className="routines_grid__filter_group">
                        <label className="routines_grid__filter_label">{content.actions.sortBy}</label>
                        <select 
                            className="routines_grid__filter_select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name">{content.sortOptions.name}</option>
                            <option value="dateCreated">{content.sortOptions.dateCreated}</option>
                            <option value="lastUsed">{content.sortOptions.lastUsed}</option>
                            <option value="difficulty">{content.sortOptions.difficulty}</option>
                            <option value="duration">{content.sortOptions.duration}</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredAndSortedRoutines.length === 0 ? (
                renderEmptyState()
            ) : (
                <div className={`routines_grid__content ${viewMode === 'list' ? 'routines_grid__content--list' : ''}`}>
                    {filteredAndSortedRoutines.map(renderRoutineCard)}
                </div>
            )}
        </div>
    );
};

export default RoutineGrid;