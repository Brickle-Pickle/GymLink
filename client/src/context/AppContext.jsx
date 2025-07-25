import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

    const value = {
        // Loading state
        isLoading,
        setIsLoading,
        
        // Navigation
        navigate,
        navigateAndClose,
        activeRoute,
        setActiveRoute,
        
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
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}