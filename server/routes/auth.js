const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

// Generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
        { userId },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
};

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }
        
        // Username validation
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario debe tener entre 3 y 20 caracteres'
            });
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario solo puede contener letras, números y guiones bajos'
            });
        }
        
        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }
        
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
            });
        }
        
        // Create user
        const user = await User.create({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password
        });
        
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);
        
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.message === 'Email or username already exists') {
            return res.status(409).json({
                success: false,
                message: 'El email o nombre de usuario ya está registrado',
                errorCode: 'DUPLICATE_USER' // Add specific error code
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body; // Changed from email to identifier
        
        // Validation
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario/email y contraseña son obligatorios'
            });
        }
        
        // Find user by email or username
        let user = await User.findByEmail(identifier.trim().toLowerCase());
        if (!user) {
            // If not found by email, try by username
            user = await User.findByUsername(identifier.trim());
        }
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        
        // Check password
        const isValidPassword = await User.comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        
        // Update last login
        await User.updateLastLogin(user._id);
        
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);
        
        res.json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                lastLogin: new Date()
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token requerido'
            });
        }
        
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        
        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
        
        res.json({
            success: true,
            tokens: {
                accessToken,
                refreshToken: newRefreshToken
            }
        });
        
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Refresh token inválido'
        });
    }
});

// Get current user endpoint
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                settings: user.settings,
                stats: user.stats,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Logout endpoint (optional - mainly for token blacklisting if implemented)
router.post('/logout', (req, res) => {
    // In a real implementation, you might want to blacklist the token
    res.json({
        success: true,
        message: 'Logout exitoso'
    });
});

module.exports = router;