import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../services/api";

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
    const [user, setUser] = useState(null);
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

    // Login 
    const [showUserLogin, setShowUserLogin] = useState(false);
    
    // Check authentication status on app load
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const response = await apiService.getCurrentUser();
                    if (response.success) {
                        setUser(response.user);
                        setIsAuthenticated(true);
                    } else {
                        // Token is invalid, clear it
                        apiService.clearTokens();
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                apiService.clearTokens();
            } finally {
                setIsLoading(false);
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
            const response = await apiService.login(credentials);
            
            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                
                addNotification({
                    type: 'success',
                    title: 'Login exitoso',
                    message: `Bienvenido de vuelta, ${response.user.username}!`
                });
                
                return { success: true, user: response.user };
            } else {
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            navigate('/');
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            const response = await apiService.register(userData);
            
            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                
                addNotification({
                    type: 'success',
                    title: 'Registro exitoso',
                    message: `¡Bienvenido a GymLink, ${response.user.username}!`
                });
                
                return { success: true, user: response.user };
            } else {
                return { success: false, error: response.message };
            }
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
            // TODO: Implement actual save logic with API
            console.log('Saving routine:', routineData);
            
            // Mock successful save for now
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
        showUserLogin,
        setShowUserLogin,
        
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
        saveRoutine,
        
        // Error handling
        error,
        setError
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};