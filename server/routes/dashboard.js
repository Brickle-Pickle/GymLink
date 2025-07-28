const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken);

// You can add more dashboard routes here
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No se pudo obtener el ID del usuario'
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('Dashboard stats - User ID:', user._id);
        console.log('Dashboard stats - Username:', user.username);
        
        // Access stats from user.stats object, not directly from user
        const stats = {
            totalWorkouts: user.stats?.totalWorkouts || 0,
            totalExercises: user.stats?.totalExercises || 0,
            totalSets: user.stats?.totalSets || 0,
            streak: user.stats?.streak || 0
        };// Note: client expects currentStreak
        
        console.log('Dashboard stats - Sending stats:', stats);
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;