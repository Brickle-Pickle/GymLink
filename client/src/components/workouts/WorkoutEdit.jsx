import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { FiEdit3, FiArrowLeft, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import DeleteWorkoutModal from './modals/DeleteWorkoutModal';
import content from './content/workoutEdit.json';
import './styles/workoutEdit.css';

const WorkoutEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addNotification, isLoading, setIsLoading } = useAppContext();
    
    // Component state
    const [exercise, setExercise] = useState(null);
    const [isLoadingExercise, setIsLoadingExercise] = useState(true);
    const [loadError, setLoadError] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        category: '',
        description: '',
        instructions: [''],
        muscleGroups: [],
        difficulty: 'beginner',
        equipment: '',
        isPublic: false,
        createdAt: '',
        updatedAt: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});
    
    // Form submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Maximum instructions limit
    const MAX_INSTRUCTIONS = 10;

    // Load exercise data on component mount
    useEffect(() => {
        loadExercise();
    }, [id]);

    // Track unsaved changes
    useEffect(() => {
        if (exercise && formData.name) {
            const hasChanges = JSON.stringify(formData) !== JSON.stringify(exercise);
            setHasUnsavedChanges(hasChanges);
        }
    }, [formData, exercise]);

    // Load exercise from API/storage
    const loadExercise = async () => {
        setIsLoadingExercise(true);
        setLoadError(null);

        try {
            // Mock data - En una aplicación real, esto vendría de la API
            const mockExercises = {
                '1': {
                    id: '1',
                    name: 'Flexiones',
                    type: 'reps-only',
                    category: 'chest',
                    description: 'Ejercicio básico para fortalecer el pecho y los brazos',
                    instructions: [
                        'Colócate en posición de plancha con las manos separadas al ancho de los hombros',
                        'Mantén el cuerpo recto desde la cabeza hasta los talones',
                        'Baja el pecho hacia el suelo doblando los codos',
                        'Empuja hacia arriba hasta la posición inicial'
                    ],
                    muscleGroups: ['chest', 'arms'],
                    difficulty: 'beginner',
                    equipment: 'Peso corporal',
                    isPublic: false,
                    createdAt: '2024-01-15T10:00:00.000Z',
                    updatedAt: '2024-01-15T10:00:00.000Z'
                },
                '2': {
                    id: '2',
                    name: 'Sentadillas',
                    type: 'reps-weight',
                    category: 'legs',
                    description: 'Ejercicio fundamental para el desarrollo de las piernas',
                    instructions: [
                        'Párate con los pies separados al ancho de los hombros',
                        'Baja como si fueras a sentarte en una silla',
                        'Mantén el peso en los talones',
                        'Sube hasta la posición inicial'
                    ],
                    muscleGroups: ['legs'],
                    difficulty: 'intermediate',
                    equipment: 'Barra, Discos',
                    isPublic: true,
                    createdAt: '2024-01-10T10:00:00.000Z',
                    updatedAt: '2024-01-18T15:30:00.000Z'
                }
            };

            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));

            const exerciseData = mockExercises[id];
            
            if (!exerciseData) {
                throw new Error(content.messages.notFound);
            }

            setExercise(exerciseData);
            setFormData({
                ...exerciseData,
                instructions: exerciseData.instructions?.length > 0 ? exerciseData.instructions : ['']
            });

        } catch (error) {
            console.error('Error loading exercise:', error);
            setLoadError(error.message || content.messages.loadingError);
        } finally {
            setIsLoadingExercise(false);
        }
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Handle instruction changes
    const handleInstructionChange = (index, value) => {
        const newInstructions = [...formData.instructions];
        newInstructions[index] = value;
        setFormData(prev => ({
            ...prev,
            instructions: newInstructions
        }));
    };

    // Add new instruction
    const addInstruction = () => {
        if (formData.instructions.length < MAX_INSTRUCTIONS) {
            setFormData(prev => ({
                ...prev,
                instructions: [...prev.instructions, '']
            }));
        }
    };

    // Remove instruction
    const removeInstruction = (index) => {
        if (formData.instructions.length > 1) {
            const newInstructions = formData.instructions.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                instructions: newInstructions
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.name.trim()) {
            newErrors.name = content.messages.validation.nameRequired;
        } else if (formData.name.trim().length < 3) {
            newErrors.name = content.messages.validation.nameMinLength;
        } else if (formData.name.trim().length > 50) {
            newErrors.name = content.messages.validation.nameMaxLength;
        }

        if (!formData.type) {
            newErrors.type = content.messages.validation.typeRequired;
        }

        if (!formData.category) {
            newErrors.category = content.messages.validation.categoryRequired;
        }

        if (formData.description.length > 200) {
            newErrors.description = content.messages.validation.descriptionMaxLength;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setIsLoading(true);

        try {
            // Filter out empty instructions
            const cleanedInstructions = formData.instructions.filter(instruction => 
                instruction.trim() !== ''
            );

            const exerciseData = {
                ...formData,
                name: formData.name.trim(),
                description: formData.description.trim(),
                equipment: formData.equipment.trim(),
                instructions: cleanedInstructions,
                updatedAt: new Date().toISOString()
            };

            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update local state
            setExercise(exerciseData);

            // Show success notification
            addNotification({
                type: 'success',
                message: content.messages.success,
                persistent: false
            });

            setHasUnsavedChanges(false);

        } catch (error) {
            console.error('Error updating exercise:', error);
            addNotification({
                type: 'error',
                message: content.messages.error,
                persistent: false
            });
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                `${content.confirmations.unsavedChanges.title}\n\n${content.confirmations.unsavedChanges.message}`
            );
            if (!confirmed) return;
        }
        
        navigate('/workouts');
    };

    // Handle delete - modified to use modal
    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    // Handle confirm delete from modal
    const handleConfirmDelete = async (exerciseId) => {
        setIsDeleting(true);
        setIsLoading(true);

        try {
            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 1000));

            addNotification({
                type: 'success',
                message: content.messages.deleteSuccess,
                persistent: false
            });

            navigate('/workouts');

        } catch (error) {
            console.error('Error deleting exercise:', error);
            addNotification({
                type: 'error',
                message: content.messages.deleteError,
                persistent: false
            });
            throw error; // Re-throw to let modal handle it
        } finally {
            setIsDeleting(false);
            setIsLoading(false);
        }
    };

    // Close delete modal
    const handleCloseDeleteModal = () => {
        if (!isDeleting) {
            setIsDeleteModalOpen(false);
        }
    };

    // Reset form to original values
    const handleReset = () => {
        if (exercise) {
            setFormData({
                ...exercise,
                instructions: exercise.instructions?.length > 0 ? exercise.instructions : ['']
            });
            setErrors({});
        }
    };

    // Get character count class for description
    const getCharCountClass = (count, max) => {
        if (count > max) return 'workout_edit__char-count--error';
        if (count > max * 0.8) return 'workout_edit__char-count--warning';
        return '';
    };

    // Loading state
    if (isLoadingExercise) {
        return (
            <div className="workout_edit">
                <div className="workout_edit__container">
                    <div className="workout_edit__loading">
                        <div className="workout_edit__loading-spinner"></div>
                        <p className="workout_edit__loading-text">Cargando ejercicio...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (loadError) {
        return (
            <div className="workout_edit">
                <div className="workout_edit__container">
                    <div className="workout_edit__error">
                        <FiAlertTriangle className="workout_edit__error-icon" />
                        <h2 className="workout_edit__error-title">Error al cargar</h2>
                        <p className="workout_edit__error-message">{loadError}</p>
                        <div className="workout_edit__error-actions">
                            <button
                                className="workout_edit__button workout_edit__button--secondary"
                                onClick={() => navigate('/workouts')}
                            >
                                <FiArrowLeft />
                                Volver a ejercicios
                            </button>
                            <button
                                className="workout_edit__button workout_edit__button--primary"
                                onClick={loadExercise}
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="workout_edit">
            <div className="workout_edit__container">
                <div className="workout_edit__header">
                    <div className="workout_edit__title-section">
                        <h1 className="workout_edit__title">
                            <FiEdit3 className="workout_edit__title-icon" />
                            {content.title}
                        </h1>
                        <p className="workout_edit__subtitle">{content.subtitle}</p>
                    </div>
                </div>

                <form className="workout_edit__form" onSubmit={handleSubmit}>
                    {/* Basic Information Section */}
                    <div className="workout_edit__section">
                        <h2 className="workout_edit__section-title">Información Básica</h2>
                        
                        {/* Exercise Name */}
                        <div className="workout_edit__field">
                            <label className="workout_edit__label workout_edit__label--required">
                                {content.form.exerciseName.label}
                            </label>
                            <input
                                type="text"
                                className={`workout_edit__input ${errors.name ? 'workout_edit__input--error' : ''}`}
                                placeholder={content.form.exerciseName.placeholder}
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                maxLength={50}
                            />
                            {errors.name && (
                                <span className="workout_edit__error">{errors.name}</span>
                            )}
                        </div>

                        {/* Exercise Type and Category */}
                        <div className="workout_edit__row workout_edit__row--two-columns">
                            <div className="workout_edit__field">
                                <label className="workout_edit__label workout_edit__label--required">
                                    {content.form.exerciseType.label}
                                    <span 
                                        className="workout_edit__tooltip" 
                                        data-tooltip={content.tooltips.exerciseType}
                                    >
                                        ?
                                    </span>
                                </label>
                                <select
                                    className={`workout_edit__select ${errors.type ? 'workout_edit__select--error' : ''}`}
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                >
                                    <option value="">Selecciona un tipo</option>
                                    {Object.entries(content.form.exerciseType.options).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.type && (
                                    <span className="workout_edit__error">{errors.type}</span>
                                )}
                            </div>

                            <div className="workout_edit__field">
                                <label className="workout_edit__label workout_edit__label--required">
                                    {content.form.category.label}
                                    <span 
                                        className="workout_edit__tooltip" 
                                        data-tooltip={content.tooltips.category}
                                    >
                                        ?
                                    </span>
                                </label>
                                <select
                                    className={`workout_edit__select ${errors.category ? 'workout_edit__select--error' : ''}`}
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                >
                                    <option value="">{content.form.category.placeholder}</option>
                                    {Object.entries(content.form.category.options).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <span className="workout_edit__error">{errors.category}</span>
                                )}
                            </div>
                        </div>

                        {/* Difficulty and Equipment */}
                        <div className="workout_edit__row workout_edit__row--two-columns">
                            <div className="workout_edit__field">
                                <label className="workout_edit__label">
                                    {content.form.difficulty.label}
                                    <span 
                                        className="workout_edit__tooltip" 
                                        data-tooltip={content.tooltips.difficulty}
                                    >
                                        ?
                                    </span>
                                </label>
                                <select
                                    className="workout_edit__select"
                                    value={formData.difficulty}
                                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                >
                                    {Object.entries(content.form.difficulty.options).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="workout_edit__field">
                                <label className="workout_edit__label">
                                    {content.form.equipment.label}
                                </label>
                                <input
                                    type="text"
                                    className="workout_edit__input"
                                    placeholder={content.form.equipment.placeholder}
                                    value={formData.equipment}
                                    onChange={(e) => handleInputChange('equipment', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="workout_edit__field">
                            <label className="workout_edit__label">
                                {content.form.description.label}
                            </label>
                            <textarea
                                className={`workout_edit__textarea ${errors.description ? 'workout_edit__textarea--error' : ''}`}
                                placeholder={content.form.description.placeholder}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                maxLength={200}
                                rows={3}
                            />
                            {errors.description && (
                                <span className="workout_edit__error">{errors.description}</span>
                            )}
                            <small className={`workout_edit__char-count ${getCharCountClass(formData.description.length, 200)}`}>
                                {formData.description.length}/200 caracteres
                            </small>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="workout_edit__section">
                        <h2 className="workout_edit__section-title">Instrucciones</h2>
                        
                        <div className="workout_edit__field">
                            <label className="workout_edit__label">
                                {content.form.instructions.label}
                            </label>
                            <div className="workout_edit__instructions">
                                {formData.instructions.map((instruction, index) => (
                                    <div key={index} className="workout_edit__instruction-item">
                                        <div className="workout_edit__instruction-number">
                                            {index + 1}
                                        </div>
                                        <input
                                            type="text"
                                            className="workout_edit__instruction-input"
                                            placeholder={content.form.instructions.placeholder}
                                            value={instruction}
                                            onChange={(e) => handleInstructionChange(index, e.target.value)}
                                        />
                                        {formData.instructions.length > 1 && (
                                            <button
                                                type="button"
                                                className="workout_edit__remove-instruction"
                                                onClick={() => removeInstruction(index)}
                                                title={content.form.instructions.removeButton}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="workout_edit__add-instruction"
                                    onClick={addInstruction}
                                    disabled={formData.instructions.length >= MAX_INSTRUCTIONS}
                                >
                                    + {content.form.instructions.addButton}
                                </button>
                                {formData.instructions.length >= MAX_INSTRUCTIONS && (
                                    <p className="workout_edit__instructions-limit">
                                        {content.form.instructions.limitMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="workout_edit__section">
                        <h2 className="workout_edit__section-title">Configuración</h2>
                        
                        {/* Public Exercise Checkbox */}
                        <div className="workout_edit__checkbox-field">
                            <input
                                type="checkbox"
                                id="isPublic"
                                className="workout_edit__checkbox"
                                checked={formData.isPublic}
                                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                            />
                            <div className="workout_edit__checkbox-content">
                                <label htmlFor="isPublic" className="workout_edit__checkbox-label">
                                    {content.form.isPublic.label}
                                    <span 
                                        className="workout_edit__tooltip" 
                                        data-tooltip={content.tooltips.isPublic}
                                    >
                                        ?
                                    </span>
                                </label>
                                <div className="workout_edit__checkbox-description">
                                    {content.form.isPublic.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="workout_edit__actions">
                        <button
                            type="button"
                            className="workout_edit__button workout_edit__button--danger"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            <FiTrash2 />
                            {content.buttons.delete}
                        </button>
                        
                        <button
                            type="button"
                            className="workout_edit__button workout_edit__button--secondary"
                            onClick={handleReset}
                            disabled={isSubmitting || !hasUnsavedChanges}
                        >
                            {content.buttons.reset}
                        </button>
                        
                        <button
                            type="button"
                            className="workout_edit__button workout_edit__button--secondary"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            <FiArrowLeft />
                            {content.buttons.cancel}
                        </button>
                        
                        <button
                            type="submit"
                            className="workout_edit__button workout_edit__button--primary"
                            disabled={isSubmitting || !hasUnsavedChanges}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="workout_edit__loading-spinner"></span>
                                    {content.buttons.saving}
                                </>
                            ) : (
                                content.buttons.save
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Modal */}
            <DeleteWorkoutModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                exercise={exercise}
                onConfirmDelete={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default WorkoutEdit;