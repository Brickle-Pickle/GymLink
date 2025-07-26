import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
    FiEdit3, 
    FiTrash2, 
    FiPlus,
    FiSearch,
    FiFilter,
    FiTarget,
    FiClock,
    FiActivity,
    FiTrendingUp
} from 'react-icons/fi';
import workoutListContent from './content/WorkoutList.json';
import DeleteWorkoutModal from './modals/DeleteWorkoutModal';
import './styles/workoutList.css';

const WorkoutList = () => {
    const { navigateAndClose, addNotification } = useAppContext();
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        exercise: null,
        isDeleting: false
    });

    // Mock data - En una aplicación real, esto vendría de la API/contexto
    useEffect(() => {
        const mockExercises = [
            {
                id: '1',
                name: 'Flexiones',
                evaluationType: 'reps',
                bestRecord: { value: 50, unit: 'reps' },
                category: 'Pecho',
                createdAt: new Date('2024-01-15'),
                lastPerformed: new Date('2024-01-20')
            },
            {
                id: '2',
                name: 'Sentadillas',
                evaluationType: 'reps_weight',
                bestRecord: { reps: 15, weight: 80, weightUnit: 'kg' },
                category: 'Piernas',
                createdAt: new Date('2024-01-10'),
                lastPerformed: new Date('2024-01-18')
            },
            {
                id: '3',
                name: 'Plancha',
                evaluationType: 'time',
                bestRecord: { value: 120, unit: 'seconds' },
                category: 'Core',
                createdAt: new Date('2024-01-12'),
                lastPerformed: new Date('2024-01-19')
            },
            {
                id: '4',
                name: 'Carrera',
                evaluationType: 'time_distance',
                bestRecord: { time: 25, timeUnit: 'minutes', distance: 5, distanceUnit: 'km' },
                category: 'Cardio',
                createdAt: new Date('2024-01-08'),
                lastPerformed: new Date('2024-01-17')
            },
            {
                id: '5',
                name: 'Press Banca',
                evaluationType: 'reps_weight',
                bestRecord: { reps: 8, weight: 100, weightUnit: 'kg' },
                category: 'Pecho',
                createdAt: new Date('2024-01-05'),
                lastPerformed: new Date('2024-01-16')
            }
        ];

        // Simular carga
        setTimeout(() => {
            setExercises(mockExercises);
            setFilteredExercises(mockExercises);
            setIsLoading(false);
        }, 1000);
    }, []);

    // Filtrar ejercicios basado en búsqueda y filtro seleccionado
    useEffect(() => {
        let filtered = exercises;

        // Aplicar filtro por tipo de evaluación
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(exercise => 
                exercise.evaluationType.includes(selectedFilter)
            );
        }

        // Aplicar búsqueda por nombre
        if (searchTerm) {
            filtered = filtered.filter(exercise =>
                exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredExercises(filtered);
    }, [exercises, searchTerm, selectedFilter]);

    // Función para formatear el mejor registro
    const formatBestRecord = (exercise) => {
        const { evaluationType, bestRecord } = exercise;
        const { evaluationTypes, units } = workoutListContent;

        switch (evaluationType) {
            case 'reps':
                return `${bestRecord.value} ${units.reps}`;
            case 'time':
                return `${bestRecord.value} ${units.seconds}`;
            case 'weight':
                return `${bestRecord.value} ${bestRecord.unit}`;
            case 'distance':
                return `${bestRecord.value} ${bestRecord.unit}`;
            case 'reps_weight':
                return `${bestRecord.reps} ${units.reps} × ${bestRecord.weight} ${bestRecord.weightUnit}`;
            case 'reps_time':
                return `${bestRecord.reps} ${units.reps} en ${bestRecord.time} ${bestRecord.timeUnit}`;
            case 'time_distance':
                return `${bestRecord.distance} ${bestRecord.distanceUnit} en ${bestRecord.time} ${bestRecord.timeUnit}`;
            default:
                return 'N/A';
        }
    };

    // Función para obtener el icono según el tipo de evaluación
    const getEvaluationIcon = (evaluationType) => {
        if (evaluationType.includes('reps')) return <FiActivity />;
        if (evaluationType.includes('time')) return <FiClock />;
        if (evaluationType.includes('weight')) return <FiTarget />;
        if (evaluationType.includes('distance')) return <FiTrendingUp />;
        return <FiActivity />;
    };

    // Función para manejar la edición de un ejercicio
    const handleEditExercise = (exerciseId) => {
        navigateAndClose(`/workouts/edit/${exerciseId}`);
    };

    // Función para manejar la eliminación de un ejercicio
    const handleDeleteExercise = (exerciseId) => {
        const exercise = exercises.find(ex => ex.id === exerciseId);
        setDeleteModal({
            isOpen: true,
            exercise: exercise,
            isDeleting: false
        });
    };

    // Función para confirmar la eliminación
    const handleConfirmDelete = async (exerciseId) => {
        setDeleteModal(prev => ({ ...prev, isDeleting: true }));
        
        try {
            // En una aplicación real, aquí haríamos la llamada a la API
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de API
            
            const exercise = exercises.find(ex => ex.id === exerciseId);
            setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
            
            addNotification({
                type: 'success',
                title: 'Ejercicio eliminado',
                message: `El ejercicio "${exercise.name}" ha sido eliminado correctamente.`
            });
            
            setDeleteModal({ isOpen: false, exercise: null, isDeleting: false });
        } catch (error) {
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            throw error; // Re-throw para que el modal maneje el error
        }
    };

    // Función para cerrar el modal
    const handleCloseDeleteModal = () => {
        if (!deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, exercise: null, isDeleting: false });
        }
    };

    // Función para crear un nuevo ejercicio
    const handleCreateExercise = () => {
        navigateAndClose('/workouts/create');
    };

    if (isLoading) {
        return (
            <div className="workout_list">
                <div className="workout_list__loading">
                    <div className="workout_list__loading-spinner"></div>
                    <p>Cargando ejercicios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="workout_list">
            {/* Header */}
            <div className="workout_list__header">
                <div className="workout_list__title-section">
                    <h2 className="workout_list__title">{workoutListContent.title}</h2>
                    <p className="workout_list__subtitle">{workoutListContent.subtitle}</p>
                </div>
                <button 
                    className="workout_list__create-btn"
                    onClick={handleCreateExercise}
                >
                    <FiPlus className="workout_list__create-icon" />
                    {workoutListContent.actions.createExercise}
                </button>
            </div>

            {/* Search and Filters */}
            <div className="workout_list__controls">
                <div className="workout_list__search">
                    <FiSearch className="workout_list__search-icon" />
                    <input
                        type="text"
                        placeholder={workoutListContent.actions.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="workout_list__search-input"
                    />
                </div>
                <div className="workout_list__filter">
                    <FiFilter className="workout_list__filter-icon" />
                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="workout_list__filter-select"
                    >
                        <option value="all">{workoutListContent.filters.all}</option>
                        <option value="reps">{workoutListContent.filters.reps}</option>
                        <option value="time">{workoutListContent.filters.time}</option>
                        <option value="weight">{workoutListContent.filters.weight}</option>
                        <option value="distance">{workoutListContent.filters.distance}</option>
                    </select>
                </div>
            </div>

            {/* Exercise List */}
            <div className="workout_list__content">
                {filteredExercises.length === 0 ? (
                    <div className="workout_list__empty">
                        <div className="workout_list__empty-icon">
                            <FiActivity />
                        </div>
                        <h3 className="workout_list__empty-title">
                            {searchTerm || selectedFilter !== 'all' 
                                ? 'No se encontraron ejercicios' 
                                : workoutListContent.emptyState.title
                            }
                        </h3>
                        <p className="workout_list__empty-description">
                            {searchTerm || selectedFilter !== 'all'
                                ? 'Intenta ajustar tus filtros de búsqueda'
                                : workoutListContent.emptyState.description
                            }
                        </p>
                        {(!searchTerm && selectedFilter === 'all') && (
                            <button 
                                className="workout_list__empty-action"
                                onClick={handleCreateExercise}
                            >
                                {workoutListContent.emptyState.actionText}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="workout_list__grid">
                        {filteredExercises.map((exercise) => (
                            <div key={exercise.id} className="workout_list__card">
                                <div className="workout_list__card-header">
                                    <div className="workout_list__card-icon">
                                        {getEvaluationIcon(exercise.evaluationType)}
                                    </div>
                                    <div className="workout_list__card-info">
                                        <h3 className="workout_list__card-name">{exercise.name}</h3>
                                        <span className="workout_list__card-category">{exercise.category}</span>
                                    </div>
                                </div>

                                <div className="workout_list__card-details">
                                    <div className="workout_list__card-detail">
                                        <span className="workout_list__card-detail-label">
                                            {workoutListContent.exerciseCard.evaluationType}:
                                        </span>
                                        <span className="workout_list__card-detail-value">
                                            {workoutListContent.evaluationTypes[exercise.evaluationType]}
                                        </span>
                                    </div>
                                    <div className="workout_list__card-detail">
                                        <span className="workout_list__card-detail-label">
                                            {workoutListContent.exerciseCard.bestRecord}:
                                        </span>
                                        <span className="workout_list__card-detail-value workout_list__card-record">
                                            {formatBestRecord(exercise)}
                                        </span>
                                    </div>
                                </div>

                                <div className="workout_list__card-actions">
                                    <button 
                                        className="workout_list__card-btn workout_list__card-btn--edit"
                                        onClick={() => handleEditExercise(exercise.id)}
                                    >
                                        <FiEdit3 />
                                        {workoutListContent.exerciseCard.editButton}
                                    </button>
                                    <button 
                                        className="workout_list__card-btn workout_list__card-btn--delete"
                                        onClick={() => handleDeleteExercise(exercise.id)}
                                    >
                                        <FiTrash2 />
                                        {workoutListContent.exerciseCard.deleteButton}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <DeleteWorkoutModal
                isOpen={deleteModal.isOpen}
                onClose={handleCloseDeleteModal}
                exercise={deleteModal.exercise}
                onConfirmDelete={handleConfirmDelete}
                isDeleting={deleteModal.isDeleting}
            />
        </div>
    );
};

export default WorkoutList;