import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import workoutHeaderContent from './content/workoutHeader.json';
import './styles/workoutHeader.css';

const WorkoutHeader = () => {
    const { navigateAndClose } = useAppContext();
    const [currentQuote, setCurrentQuote] = useState('');

    // Función para obtener una frase motivacional aleatoria
    const getRandomQuote = () => {
        const quotes = workoutHeaderContent.motivationalQuotes;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    };

    // Establecer frase motivacional al cargar el componente
    useEffect(() => {
        setCurrentQuote(getRandomQuote());
    }, []);

    // Función para cambiar la frase motivacional
    const changeQuote = () => {
        setCurrentQuote(getRandomQuote());
    };

    // Navegación a crear entrenamiento
    const handleCreateWorkout = () => {
        navigateAndClose('/workouts/create');
    };

    // Navegación a ver entrenamientos
    const handleViewWorkouts = () => {
        navigateAndClose('/workouts/history');
    };

    return (
        <div className="workout_header">
            <div className="workout_header__container">
                {/* Título y subtítulo */}
                <div className="workout_header__title-section">
                    <h1 className="workout_header__title">
                        {workoutHeaderContent.title}
                    </h1>
                    <p className="workout_header__subtitle">
                        {workoutHeaderContent.subtitle}
                    </p>
                </div>

                {/* Frase motivacional */}
                <div className="workout_header__motivation">
                    <div className="workout_header__quote-container">
                        <p className="workout_header__quote" onClick={changeQuote}>
                            "{currentQuote}"
                        </p>
                        <span className="workout_header__quote-hint">
                            Toca para cambiar
                        </span>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="workout_header__actions">
                    <button 
                        className="workout_header__button workout_header__button--primary"
                        onClick={handleCreateWorkout}
                    >
                        <span className="workout_header__button-icon">+</span>
                        {workoutHeaderContent.buttons.createWorkout}
                    </button>
                    
                    <button 
                        className="workout_header__button workout_header__button--secondary"
                        onClick={handleViewWorkouts}
                    >
                        <span className="workout_header__button-icon">📋</span>
                        {workoutHeaderContent.buttons.viewWorkouts}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutHeader;