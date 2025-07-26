import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiPlus } from 'react-icons/fi';
import content from './content/workoutForm.json';
import './styles/workoutForm.css';

const WorkoutForm = ({ onSubmit, onCancel, initialData = null }) => {
    const { addNotification, isLoading, setIsLoading } = useAppContext();
    
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
        createdAt: new Date().toISOString()
    });

    // Validation errors
    const [errors, setErrors] = useState({});
    
    // Form submission state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Maximum instructions limit
    const MAX_INSTRUCTIONS = 10;

    // Initialize form with existing data if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                instructions: initialData.instructions?.length > 0 ? initialData.instructions : ['']
            });
        }
    }, [initialData]);

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
                createdAt: initialData ? formData.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Call the onSubmit callback
            if (onSubmit) {
                await onSubmit(exerciseData);
            }

            // Show success notification
            addNotification({
                type: 'success',
                message: content.messages.success,
                persistent: false
            });

            // Reset form if creating new exercise
            if (!initialData) {
                resetForm();
            }

        } catch (error) {
            console.error('Error saving exercise:', error);
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

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            type: '',
            category: '',
            description: '',
            instructions: [''],
            muscleGroups: [],
            difficulty: 'beginner',
            equipment: '',
            isPublic: false,
            createdAt: new Date().toISOString()
        });
        setErrors({});
    };

    // Handle cancel
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        resetForm();
    };

    // Get character count class for description
    const getCharCountClass = (count, max) => {
        if (count > max) return 'workout_form__char-count--error';
        if (count > max * 0.8) return 'workout_form__char-count--warning';
        return '';
    };

    return (
        <div className="workout_form">
            <div className="workout_form__container">
                <div className="workout_form__header">
                    <div className="workout_form__title-section">
                        <h1 className="workout_form__title">
                            <FiPlus className="workout_form__title-icon" />
                            {content.title}
                        </h1>
                        <p className="workout_form__subtitle">{content.subtitle}</p>
                    </div>
                </div>

                <form className="workout_form__form" onSubmit={handleSubmit}>
                    {/* Basic Information Section */}
                    <div className="workout_form__section">
                        <h2 className="workout_form__section-title">Información Básica</h2>
                        
                        {/* Exercise Name */}
                        <div className="workout_form__field">
                            <label className="workout_form__label workout_form__label--required">
                                {content.form.exerciseName.label}
                            </label>
                            <input
                                type="text"
                                className={`workout_form__input ${errors.name ? 'workout_form__input--error' : ''}`}
                                placeholder={content.form.exerciseName.placeholder}
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                maxLength={50}
                            />
                            {errors.name && (
                                <span className="workout_form__error">{errors.name}</span>
                            )}
                        </div>

                        {/* Exercise Type and Category */}
                        <div className="workout_form__row workout_form__row--two-columns">
                            <div className="workout_form__field">
                                <label className="workout_form__label workout_form__label--required">
                                    {content.form.exerciseType.label}
                                    <span 
                                        className="workout_form__tooltip" 
                                        data-tooltip={content.tooltips.exerciseType}
                                    >
                                        ?
                                    </span>
                                </label>
                                <select
                                    className={`workout_form__select ${errors.type ? 'workout_form__select--error' : ''}`}
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                >
                                    <option value="">Selecciona un tipo</option>
                                    {Object.entries(content.form.exerciseType.options).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.type && (
                                    <span className="workout_form__error">{errors.type}</span>
                                )}
                            </div>

                            <div className="workout_form__field">
                                <label className="workout_form__label workout_form__label--required">
                                    {content.form.category.label}
                                    <span 
                                        className="workout_form__tooltip" 
                                        data-tooltip={content.tooltips.category}
                                    >
                                        ?
                                    </span>
                                </label>
                                <select
                                    className={`workout_form__select ${errors.category ? 'workout_form__select--error' : ''}`}
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                >
                                    <option value="">{content.form.category.placeholder}</option>
                                    {Object.entries(content.form.category.options).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <span className="workout_form__error">{errors.category}</span>
                                )}
                            </div>
                        </div>

                        {/* Difficulty and Equipment */}
                        <div className="workout_form__row workout_form__row--two-columns">
                            <div className="workout_form__field">
                                <label className="workout_form__label">
                                    {content.form.difficulty.label}
                                    <span 
                                        className="workout_form__tooltip" 
                                        data-tooltip={content.tooltips.difficulty}
                                    >
                                        ?
                                    </span>
                                </label>
                                <select
                                    className="workout_form__select"
                                    value={formData.difficulty}
                                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                >
                                    {Object.entries(content.form.difficulty.options).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="workout_form__field">
                                <label className="workout_form__label">
                                    {content.form.equipment.label}
                                </label>
                                <input
                                    type="text"
                                    className="workout_form__input"
                                    placeholder={content.form.equipment.placeholder}
                                    value={formData.equipment}
                                    onChange={(e) => handleInputChange('equipment', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="workout_form__field">
                            <label className="workout_form__label">
                                {content.form.description.label}
                            </label>
                            <textarea
                                className={`workout_form__textarea ${errors.description ? 'workout_form__textarea--error' : ''}`}
                                placeholder={content.form.description.placeholder}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                maxLength={200}
                                rows={3}
                            />
                            {errors.description && (
                                <span className="workout_form__error">{errors.description}</span>
                            )}
                            <small className={`workout_form__char-count ${getCharCountClass(formData.description.length, 200)}`}>
                                {formData.description.length}/200 caracteres
                            </small>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="workout_form__section">
                        <h2 className="workout_form__section-title">Instrucciones</h2>
                        
                        <div className="workout_form__field">
                            <label className="workout_form__label">
                                {content.form.instructions.label}
                            </label>
                            <div className="workout_form__instructions">
                                {formData.instructions.map((instruction, index) => (
                                    <div key={index} className="workout_form__instruction-item">
                                        <div className="workout_form__instruction-number">
                                            {index + 1}
                                        </div>
                                        <input
                                            type="text"
                                            className="workout_form__instruction-input"
                                            placeholder={content.form.instructions.placeholder}
                                            value={instruction}
                                            onChange={(e) => handleInstructionChange(index, e.target.value)}
                                        />
                                        {formData.instructions.length > 1 && (
                                            <button
                                                type="button"
                                                className="workout_form__remove-instruction"
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
                                    className="workout_form__add-instruction"
                                    onClick={addInstruction}
                                    disabled={formData.instructions.length >= MAX_INSTRUCTIONS}
                                >
                                    + {content.form.instructions.addButton}
                                </button>
                                {formData.instructions.length >= MAX_INSTRUCTIONS && (
                                    <p className="workout_form__instructions-limit">
                                        {content.form.instructions.limitMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="workout_form__section">
                        <h2 className="workout_form__section-title">Configuración</h2>
                        
                        {/* Public Exercise Checkbox */}
                        <div className="workout_form__checkbox-field">
                            <input
                                type="checkbox"
                                id="isPublic"
                                className="workout_form__checkbox"
                                checked={formData.isPublic}
                                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                            />
                            <div className="workout_form__checkbox-content">
                                <label htmlFor="isPublic" className="workout_form__checkbox-label">
                                    {content.form.isPublic.label}
                                    <span 
                                        className="workout_form__tooltip" 
                                        data-tooltip={content.tooltips.isPublic}
                                    >
                                        ?
                                    </span>
                                </label>
                                <div className="workout_form__checkbox-description">
                                    {content.form.isPublic.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="workout_form__actions">
                        <button
                            type="button"
                            className="workout_form__button workout_form__button--secondary"
                            onClick={resetForm}
                            disabled={isSubmitting}
                        >
                            {content.buttons.reset}
                        </button>
                        
                        <button
                            type="button"
                            className="workout_form__button workout_form__button--danger"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            {content.buttons.cancel}
                        </button>
                        
                        <button
                            type="submit"
                            className="workout_form__button workout_form__button--primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="workout_form__loading-spinner"></span>
                                    {content.buttons.saving}
                                </>
                            ) : (
                                content.buttons.save
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkoutForm;