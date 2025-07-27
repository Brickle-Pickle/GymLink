import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
}

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // User authentication state
    const [user, setUser] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // UI state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeRoute, setActiveRoute] = useState('/');
    
    // App settings
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('es');
    
    // Notifications
    const [notifications, setNotifications] = useState([]);
    
    // Routine Builder state
    const [currentRoutine, setCurrentRoutine] = useState({
        name: '',
        level: '',
        description: '',
        estimatedDuration: '',
        exercises: []
    });
    const [availableExercises, setAvailableExercises] = useState([]);
    const [isDragActive, setIsDragActive] = useState(false);
    
    // Check authentication status on app load
    useEffect(() => {
        // TODO: Check for stored auth token and validate
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    // TODO: Validate token with backend
                    // For now, just set mock user
                    setUser({
                        id: '1',
                        name: 'Juan Pérez',
                        email: 'juan@example.com',
                        avatar: null
                    });
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('authToken');
            }
        };
        
        checkAuth();
    }, []);

    // Update active route when location changes
    useEffect(() => {
        const currentPath = window.location.pathname;
        setActiveRoute(currentPath);
    }, []);

    // Authentication functions
    const login = async (credentials) => {
        setIsLoading(true);
        try {
            // TODO: Implement actual login logic
            console.log('Logging in with:', credentials);
            
            // Mock successful login
            const mockUser = {
                id: '1',
                name: 'Juan Pérez',
                email: credentials.email,
                avatar: null
            };
            
            setUser(mockUser);
            setIsAuthenticated(true);
            localStorage.setItem('authToken', 'mock-token');
            
            return { success: true, user: mockUser };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            // TODO: Implement actual registration logic
            console.log('Registering user:', userData);
            
            // Mock successful registration
            const newUser = {
                id: Date.now().toString(),
                name: userData.name,
                email: userData.email,
                avatar: null
            };
            
            setUser(newUser);
            setIsAuthenticated(true);
            localStorage.setItem('authToken', 'mock-token');
            
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Notification functions
    const addNotification = (notification) => {
        const id = Date.now().toString();
        const newNotification = {
            id,
            timestamp: new Date(),
            ...notification
        };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // Auto remove after 5 seconds if not persistent
        if (!notification.persistent) {
            setTimeout(() => {
                removeNotification(id);
            }, 5000);
        }
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // UI helper functions
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Navigation helper
    const navigateAndClose = (path) => {
        navigate(path);
        setActiveRoute(path);
        closeMobileMenu();
    };

    // Routine Builder functions
    const addExerciseToRoutine = (exercise) => {
        const routineExercise = {
            id: Date.now().toString(),
            exerciseId: exercise.id,
            name: exercise.name,
            type: exercise.type,
            category: exercise.category,
            sets: 3,
            reps: exercise.type.includes('reps') ? 12 : null,
            weight: exercise.type.includes('weight') ? 0 : null,
            time: exercise.type.includes('time') ? 0 : null,
            distance: exercise.type.includes('distance') ? 0 : null,
            restTime: 60
        };
        
        setCurrentRoutine(prev => ({
            ...prev,
            exercises: [...prev.exercises, routineExercise]
        }));
    };

    const removeExerciseFromRoutine = (exerciseId) => {
        setCurrentRoutine(prev => ({
            ...prev,
            exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
        }));
    };

    const updateRoutineExercise = (exerciseId, updates) => {
        setCurrentRoutine(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex => 
                ex.id === exerciseId ? { ...ex, ...updates } : ex
            )
        }));
    };

    const reorderRoutineExercises = (startIndex, endIndex) => {
        setCurrentRoutine(prev => {
            const exercises = [...prev.exercises];
            const [removed] = exercises.splice(startIndex, 1);
            exercises.splice(endIndex, 0, removed);
            return { ...prev, exercises };
        });
    };

    const resetRoutineBuilder = () => {
        setCurrentRoutine({
            name: '',
            level: '',
            description: '',
            estimatedDuration: '',
            exercises: []
        });
    };

    const saveRoutine = async (routineData) => {
        setIsLoading(true);
        try {
            // TODO: Implement actual save logic
            console.log('Saving routine:', routineData);
            
            // Mock successful save
            addNotification({
                type: 'success',
                message: 'Rutina guardada correctamente'
            });
            
            resetRoutineBuilder();
            return { success: true };
        } catch (error) {
            console.error('Save routine failed:', error);
            addNotification({
                type: 'error',
                message: 'Error al guardar la rutina'
            });
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        // Loading state
        isLoading,
        setIsLoading,
        
        // Navigation
        navigate,
        navigateAndClose,
        activeRoute,
        setActiveRoute,
        location,
        
        // Authentication
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        register,
        
        // UI state
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        
        // App settings
        theme,
        setTheme,
        language,
        setLanguage,
        
        // Notifications
        notifications,
        addNotification,
        removeNotification,

        // Errors
        error,
        setError,
        
        // Routine Builder
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
        saveRoutine
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}