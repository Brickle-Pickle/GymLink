import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import routinesHeaderContent from './content/routinesHeader.json';
import './styles/routinesHeader.css';

const RoutinesHeader = () => {
    const { navigateAndClose } = useAppContext();
    const [currentQuote, setCurrentQuote] = useState('');

    // Función para obtener una frase motivacional aleatoria
    const getRandomQuote = () => {
        const quotes = routinesHeaderContent.motivationalQuotes;
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

    // Navegación a crear rutina
    const handleCreateRoutine = () => {
        navigateAndClose('/routines/create');
    };

    // Navegación a ver rutinas
    const handleViewRoutines = () => {
        navigateAndClose('/routines/list');
    };

    return (
        <div className="routines_header">
            <div className="routines_header__container">
                {/* Título y subtítulo */}
                <div className="routines_header__title-section">
                    <h1 className="routines_header__title">
                        {routinesHeaderContent.title}
                    </h1>
                    <p className="routines_header__subtitle">
                        {routinesHeaderContent.subtitle}
                    </p>
                </div>

                {/* Frase motivacional */}
                <div className="routines_header__motivation">
                    <div className="routines_header__quote-container">
                        <p className="routines_header__quote" onClick={changeQuote}>
                            "{currentQuote}"
                        </p>
                        <span className="routines_header__quote-hint">
                            Toca para cambiar
                        </span>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="routines_header__actions">
                    <button 
                        className="routines_header__button routines_header__button--primary"
                        onClick={handleCreateRoutine}
                    >
                        <span className="routines_header__button-icon">+</span>
                        {routinesHeaderContent.buttons.createRoutine}
                    </button>
                    
                    <button 
                        className="routines_header__button routines_header__button--secondary"
                        onClick={handleViewRoutines}
                    >
                        <span className="routines_header__button-icon">📋</span>
                        {routinesHeaderContent.buttons.viewRoutines}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoutinesHeader;