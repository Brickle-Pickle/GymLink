// API configuration and base setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    // Set tokens
    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    // Clear tokens
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    // Get headers with auth token
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth && this.accessToken) {
            headers.Authorization = `Bearer ${this.accessToken}`;
        }

        return headers;
    }

    // Base fetch method with error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.includeAuth !== false),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            // Handle token expiration
            if (response.status === 401 && data.message === 'Token expirado') {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry the original request with new token
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                    const retryResponse = await fetch(url, config);
                    return await retryResponse.json();
                } else {
                    // Refresh failed, redirect to login
                    this.clearTokens();
                    window.location.href = '/login';
                    throw new Error('Session expired');
                }
            }

            // Handle application errors (4xx, 5xx) by returning response data instead of throwing
            if (!response.ok) {
                // Return the error response data to allow proper error handling
                return {
                    success: false,
                    error: data.message || `HTTP error! status: ${response.status}`,
                    status: response.status,
                    ...data // Include any additional error data from server
                };
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
                return true;
            } else {
                this.clearTokens();
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            return false;
        }
    }

    // Authentication methods
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            includeAuth: false,
        });

        if (response.success) {
            this.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
        }

        return response;
    }

    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            includeAuth: false,
        });

        if (response.success) {
            this.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
        }

        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            this.clearTokens();
        }
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // Health check
    async healthCheck() {
        return await this.request('/health', {
            includeAuth: false,
        });
    }

    // Exercise methods (placeholder for future implementation)
    async getExercises() {
        return await this.request('/exercises');
    }

    async createExercise(exerciseData) {
        return await this.request('/exercises', {
            method: 'POST',
            body: JSON.stringify(exerciseData),
        });
    }

    // Workout methods (placeholder for future implementation)
    async getWorkouts() {
        return await this.request('/workouts');
    }

    async createWorkout(workoutData) {
        return await this.request('/workouts', {
            method: 'POST',
            body: JSON.stringify(workoutData),
        });
    }

    // Routine methods (placeholder for future implementation)
    async getRoutines() {
        return await this.request('/routines');
    }

    async createRoutine(routineData) {
        return await this.request('/routines', {
            method: 'POST',
            body: JSON.stringify(routineData),
        });
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;