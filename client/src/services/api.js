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

        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        config.signal = controller.signal;

        try {
            console.log(`ApiService: Making request to ${url}`);
            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            console.log(`ApiService: Response status ${response.status} for ${endpoint}`);
            const data = await response.json();

            // Handle token expiration - any 401 error should trigger refresh
            if (response.status === 401) {
                console.log('ApiService: 401 Unauthorized, attempting refresh...');
                console.log('ApiService: Error message:', data.message);
                console.log('ApiService: Current refresh token:', !!this.refreshToken);
                
                const refreshed = await this.refreshAccessToken();
                console.log('ApiService: Refresh result:', refreshed);
                
                if (refreshed) {
                    console.log('ApiService: Token refreshed successfully, retrying request...');
                    // Retry the original request with new token
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                    const retryResponse = await fetch(url, config);
                    const retryData = await retryResponse.json();
                    console.log('ApiService: Retry response:', retryData);
                    return retryData;
                } else {
                    console.log('ApiService: Refresh failed, redirecting to login...');
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
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.error('API request timeout:', endpoint);
                throw new Error('Request timeout - server not responding');
            }
            
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        console.log('ApiService: refreshAccessToken called');
        console.log('ApiService: Refresh token available:', !!this.refreshToken);
        
        if (!this.refreshToken) {
            console.log('ApiService: No refresh token available');
            return false;
        }

        try {
            console.log('ApiService: Making refresh request...');
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
            console.log('ApiService: Refresh response status:', response.status);
            console.log('ApiService: Refresh response data:', data);

            if (response.ok && data.success) {
                console.log('ApiService: Setting new tokens...');
                this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
                console.log('ApiService: Tokens updated successfully');
                return true;
            } else {
                console.log('ApiService: Refresh failed, clearing tokens');
                this.clearTokens();
                return false;
            }
        } catch (error) {
            console.error('ApiService: Token refresh failed:', error);
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
        try {
            const response = await this.request('/auth/me');
            console.log('ApiService: getCurrentUser response:', response);
            
            // If token is expired or invalid, clear tokens
            if (!response.success && (response.message === 'Token expirado' || response.message === 'Token inválido')) {
                console.log('ApiService: Token expired/invalid, clearing tokens');
                this.clearTokens();
            }
            
            return response;
        } catch (error) {
            console.error('ApiService: getCurrentUser error:', error);
            // Clear tokens on any auth error
            this.clearTokens();
            throw error;
        }
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

    async getDashboardStatsData() {
        return await this.request('/dashboard/stats');
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;