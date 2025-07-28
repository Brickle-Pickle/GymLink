const fetchDashboardStats = async function (user, apiService) {
    if (!user || !apiService) {
        console.log('DashboardStats: User or apiService not available');
        return;
    }
    try {
        console.log('DashboardFunctions: Fetching stats for user:', user.id);
        const response = await apiService.request('/dashboard/stats', {
            method: 'GET',
            includeAuth: true,
        });
        console.log('DashboardFunctions: Raw response:', response);
        console.log('DashboardFunctions: Response data:', response.data);
        console.log('DashboardFunctions: Returning:', response.data);
        
        // Extract data from server response format { success: true, data: stats }
        return response.data;
    } catch (error) {
        console.error('DashboardFunctions: Error fetching dashboard stats:', error);
        throw error;
    }
};

export { fetchDashboardStats };
