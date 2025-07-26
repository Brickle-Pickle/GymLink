import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import content from './content/workoutCalendar.json';
import './styles/workoutCalendar.css';

const WorkoutCalendar = () => {
    const { user, isAuthenticated } = useAppContext();
    
    // State management
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedFilter, setSelectedFilter] = useState('lastMonth');
    const [workoutData, setWorkoutData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'

    // Mock workout data - En producción esto vendría de la API
    const mockWorkouts = useMemo(() => {
        const workouts = [];
        const today = new Date();
        
        // Generar datos de ejemplo para los últimos 3 meses
        for (let i = 0; i < 90; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Probabilidad del 40% de tener entrenamiento cada día
            if (Math.random() > 0.6) {
                workouts.push({
                    date: date.toISOString().split('T')[0],
                    workoutCount: Math.floor(Math.random() * 3) + 1,
                    exercises: Math.floor(Math.random() * 8) + 3
                });
            }
        }
        
        return workouts;
    }, []);

    // Filter data based on selected period
    const filteredWorkouts = useMemo(() => {
        const now = new Date();
        let startDate;

        switch (selectedFilter) {
            case 'lastWeek':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'lastMonth':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'lastQuarter':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 3);
                break;
            default:
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
        }

        return mockWorkouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= startDate && workoutDate <= now;
        });
    }, [mockWorkouts, selectedFilter]);

    // Calculate calendar stats
    const calendarStats = useMemo(() => {
        const totalWorkouts = filteredWorkouts.reduce((sum, workout) => sum + workout.workoutCount, 0);
        const workoutDays = filteredWorkouts.length;
        
        let totalDays;
        switch (selectedFilter) {
            case 'lastWeek':
                totalDays = 7;
                break;
            case 'lastMonth':
                totalDays = 30;
                break;
            case 'lastQuarter':
                totalDays = 90;
                break;
            default:
                totalDays = 30;
        }
        
        const restDays = totalDays - workoutDays;
        const averagePerWeek = (totalWorkouts / (totalDays / 7)).toFixed(1);

        return {
            totalWorkouts,
            workoutDays,
            restDays,
            averagePerWeek
        };
    }, [filteredWorkouts, selectedFilter]);

    // Get calendar days for current month
    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDay = new Date(startDate);
        
        // Generate 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            const dayString = currentDay.toISOString().split('T')[0];
            const workout = filteredWorkouts.find(w => w.date === dayString);
            
            days.push({
                date: new Date(currentDay),
                dateString: dayString,
                isCurrentMonth: currentDay.getMonth() === month,
                isToday: currentDay.toDateString() === new Date().toDateString(),
                workout: workout || null
            });
            
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        return days;
    };

    // Get week days for current week
    const getWeekDays = () => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            const dayString = currentDay.toISOString().split('T')[0];
            const workout = filteredWorkouts.find(w => w.date === dayString);
            
            days.push({
                date: new Date(currentDay),
                dateString: dayString,
                isCurrentMonth: true,
                isToday: currentDay.toDateString() === new Date().toDateString(),
                workout: workout || null
            });
        }
        
        return days;
    };

    const calendarDays = viewMode === 'month' ? getCalendarDays() : getWeekDays();

    // Navigation functions
    const navigatePrevious = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setDate(newDate.getDate() - 7);
        }
        setCurrentDate(newDate);
    };

    const navigateNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        setCurrentDate(newDate);
    };

    // Format current period display
    const getCurrentPeriodText = () => {
        if (viewMode === 'month') {
            return `${content.calendar.months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else {
            const endOfWeek = new Date(currentDate);
            endOfWeek.setDate(currentDate.getDate() + 6);
            return `${currentDate.getDate()} - ${endOfWeek.getDate()} ${content.calendar.months[currentDate.getMonth()]}`;
        }
    };

    // Handle day click
    const handleDayClick = (day) => {
        if (day.workout) {
            // TODO: Mostrar detalles del entrenamiento o navegar a la vista de entrenamiento
            console.log('Workout details for:', day.dateString, day.workout);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="workout_calendar">
                <div className="empty-state">
                    <div className="empty-state-icon">🔒</div>
                    <div className="empty-state-text">Inicia sesión para ver tu calendario</div>
                    <div className="empty-state-subtext">
                        Necesitas estar autenticado para acceder a tu calendario de entrenamientos
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`workout_calendar ${viewMode}-view`}>
            {/* Header Section */}
            <div className="calendar-header">
                <div className="header-top">
                    <h2 className="calendar-title">{content.title}</h2>
                    
                    {/* Filter Buttons */}
                    <div className="filter-buttons">
                        {Object.entries(content.filters).map(([key, label]) => (
                            <button
                                key={key}
                                className={`filter-btn ${selectedFilter === key ? 'active' : ''}`}
                                onClick={() => setSelectedFilter(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="calendar-navigation">
                <button 
                    className="nav-button" 
                    onClick={navigatePrevious}
                    aria-label={viewMode === 'month' ? content.navigation.previousMonth : content.navigation.previousWeek}
                >
                    ←
                </button>
                
                <div className="current-period">
                    {getCurrentPeriodText()}
                </div>
                
                <button 
                    className="nav-button" 
                    onClick={navigateNext}
                    aria-label={viewMode === 'month' ? content.navigation.nextMonth : content.navigation.nextWeek}
                >
                    →
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
                {/* Day Headers */}
                {content.calendar.daysShort.map((day, index) => (
                    <div key={index} className="calendar-header-day">
                        {day}
                    </div>
                ))}
                
                {/* Calendar Days */}
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-day ${
                            !day.isCurrentMonth ? 'other-month' : ''
                        } ${day.isToday ? 'today' : ''} ${
                            day.workout ? 'workout-day' : ''
                        }`}
                        onClick={() => handleDayClick(day)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleDayClick(day);
                            }
                        }}
                        aria-label={`${day.date.getDate()} ${
                            day.workout 
                                ? `- ${day.workout.workoutCount} ${content.calendar.workoutsCount}` 
                                : `- ${content.calendar.noWorkouts}`
                        }`}
                    >
                        <span className="day-number">{day.date.getDate()}</span>
                        
                        {day.workout && (
                            <>
                                <div className="workout-indicator"></div>
                                {day.workout.workoutCount > 1 && (
                                    <span className="workout-count">
                                        {day.workout.workoutCount}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Statistics Section */}
            <div className="calendar-stats">
                <div className="stat-item">
                    <div className="stat-value">{calendarStats.totalWorkouts}</div>
                    <div className="stat-label">{content.stats.totalWorkouts}</div>
                </div>
                
                <div className="stat-item">
                    <div className="stat-value">{calendarStats.workoutDays}</div>
                    <div className="stat-label">{content.stats.workoutDays}</div>
                </div>
                
                <div className="stat-item">
                    <div className="stat-value">{calendarStats.restDays}</div>
                    <div className="stat-label">{content.stats.restDays}</div>
                </div>
                
                <div className="stat-item">
                    <div className="stat-value">{calendarStats.averagePerWeek}</div>
                    <div className="stat-label">{content.stats.averagePerWeek}</div>
                </div>
            </div>

            {isLoading && (
                <div className="loading-state">
                    Cargando calendario...
                </div>
            )}
        </div>
    );
};

export default WorkoutCalendar;