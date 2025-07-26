import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { 
    FiX, 
    FiAlertTriangle, 
    FiTrash2,
    FiActivity,
    FiClock,
    FiTarget,
    FiTrendingUp
} from 'react-icons/fi';
import deleteModalContent from './content/deleteWorkoutModal.json';
import './styles/deleteWorkoutModal.css';

const DeleteWorkoutModal = ({ 
    isOpen, 
    onClose, 
    exercise, 
    onConfirmDelete,
    isDeleting = false 
}) => {
    const { addNotification } = useAppContext();
    const [isVisible, setIsVisible] = useState(false);

    // Manejar la animación de entrada/salida del modal
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'unset';
        }

        // Cleanup al desmontar el componente
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Manejar tecla Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !isDeleting) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, isDeleting, onClose]);

    // Función para obtener el icono según el tipo de evaluación
    const getEvaluationIcon = (evaluationType) => {
        if (evaluationType?.includes('reps')) return <FiActivity />;
        if (evaluationType?.includes('time')) return <FiClock />;
        if (evaluationType?.includes('weight')) return <FiTarget />;
        if (evaluationType?.includes('distance')) return <FiTrendingUp />;
        return <FiActivity />;
    };

    // Función para formatear el mejor registro
    const formatBestRecord = (exercise) => {
        if (!exercise?.bestRecord) return 'N/A';
        
        const { evaluationType, bestRecord } = exercise;

        switch (evaluationType) {
            case 'reps':
                return `${bestRecord.value} repeticiones`;
            case 'time':
                return `${bestRecord.value} segundos`;
            case 'weight':
                return `${bestRecord.value} ${bestRecord.unit}`;
            case 'distance':
                return `${bestRecord.value} ${bestRecord.unit}`;
            case 'reps_weight':
                return `${bestRecord.reps} reps × ${bestRecord.weight} ${bestRecord.weightUnit}`;
            case 'reps_time':
                return `${bestRecord.reps} reps en ${bestRecord.time} ${bestRecord.timeUnit}`;
            case 'time_distance':
                return `${bestRecord.distance} ${bestRecord.distanceUnit} en ${bestRecord.time} ${bestRecord.timeUnit}`;
            default:
                return 'N/A';
        }
    };

    // Función para formatear la fecha
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Manejar clic en el backdrop
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onClose();
        }
    };

    // Manejar confirmación de eliminación
    const handleConfirmDelete = async () => {
        try {
            await onConfirmDelete(exercise.id);
            onClose();
        } catch (error) {
            addNotification({
                type: 'error',
                title: deleteModalContent.messages.deleteError,
                message: deleteModalContent.messages.deleteErrorDescription
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`delete_workout_modal ${isVisible ? 'delete_workout_modal--visible' : ''}`}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
        >
            <div className="delete_workout_modal__container">
                {/* Header */}
                <div className="delete_workout_modal__header">
                    <div className="delete_workout_modal__header-content">
                        <div className="delete_workout_modal__icon">
                            <FiAlertTriangle />
                        </div>
                        <div className="delete_workout_modal__title-section">
                            <h2 id="delete-modal-title" className="delete_workout_modal__title">
                                {deleteModalContent.title}
                            </h2>
                            <p className="delete_workout_modal__subtitle">
                                {deleteModalContent.subtitle}
                            </p>
                        </div>
                    </div>
                    <button 
                        className="delete_workout_modal__close"
                        onClick={onClose}
                        disabled={isDeleting}
                        aria-label="Cerrar modal"
                    >
                        <FiX />
                    </button>
                </div>

                {/* Content */}
                <div className="delete_workout_modal__content">
                    {/* Warning */}
                    <div className="delete_workout_modal__warning">
                        <h3 className="delete_workout_modal__warning-title">
                            {deleteModalContent.warning.title}
                        </h3>
                        <p id="delete-modal-description" className="delete_workout_modal__warning-description">
                            {deleteModalContent.warning.description}
                        </p>
                        <ul className="delete_workout_modal__consequences">
                            {deleteModalContent.warning.consequences.map((consequence, index) => (
                                <li key={index} className="delete_workout_modal__consequence">
                                    {consequence}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Exercise Info */}
                    {exercise && (
                        <div className="delete_workout_modal__exercise">
                            <div className="delete_workout_modal__exercise-header">
                                <div className="delete_workout_modal__exercise-icon">
                                    {getEvaluationIcon(exercise.evaluationType)}
                                </div>
                                <div className="delete_workout_modal__exercise-info">
                                    <h4 className="delete_workout_modal__exercise-name">
                                        {exercise.name}
                                    </h4>
                                    <span className="delete_workout_modal__exercise-category">
                                        {exercise.category}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="delete_workout_modal__exercise-details">
                                <div className="delete_workout_modal__exercise-detail">
                                    <span className="delete_workout_modal__exercise-label">
                                        {deleteModalContent.exerciseInfo.bestRecord}
                                    </span>
                                    <span className="delete_workout_modal__exercise-value">
                                        {formatBestRecord(exercise)}
                                    </span>
                                </div>
                                <div className="delete_workout_modal__exercise-detail">
                                    <span className="delete_workout_modal__exercise-label">
                                        {deleteModalContent.exerciseInfo.createdAt}
                                    </span>
                                    <span className="delete_workout_modal__exercise-value">
                                        {formatDate(exercise.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="delete_workout_modal__actions">
                    <button 
                        className="delete_workout_modal__btn delete_workout_modal__btn--cancel"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        {deleteModalContent.actions.cancel}
                    </button>
                    <button 
                        className="delete_workout_modal__btn delete_workout_modal__btn--delete"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                    >
                        <FiTrash2 />
                        {isDeleting 
                            ? deleteModalContent.actions.deleting 
                            : deleteModalContent.actions.delete
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteWorkoutModal;