import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import loginContent from './content/login.json';
import './styles/login.css';

const Login = ({ isOpen, onClose, onSwitchToRegister }) => {
    const { login, isLoading, addNotification } = useAppContext();
    
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        rememberMe: false
    });
    
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                identifier: '',
                password: '',
                rememberMe: false
            });
            setErrors({});
            setShowPassword(false);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const validateField = (name, value) => {
        const content = loginContent.form[name];
        
        switch (name) {
            case 'identifier':
                if (!value.trim()) {
                    return content.error.required;
                }
                // Basic validation for email or username
                if (value.length < 3) {
                    return content.error.invalid;
                }
                break;
                
            case 'password':
                if (!value) {
                    return content.error.required;
                }
                if (value.length < 6) {
                    return content.error.invalid;
                }
                break;
                
            default:
                break;
        }
        
        return '';
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        Object.keys(formData).forEach(field => {
            if (field !== 'rememberMe') {
                const error = validateField(field, formData[field]);
                if (error) {
                    newErrors[field] = error;
                }
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const result = await login({
                identifier: formData.identifier.trim(),
                password: formData.password,
                rememberMe: formData.rememberMe
            });
            
            if (result.success) {
                addNotification({
                    type: 'success',
                    title: loginContent.success.title,
                    message: loginContent.success.message
                });
                
                onClose();
            } else {
                // Handle login errors
                let errorMessage = loginContent.errors.general;
                
                if (result.error) {
                    if (result.error.includes('usuario') || result.error.includes('user')) {
                        errorMessage = loginContent.errors.userNotFound;
                    } else if (result.error.includes('contraseña') || result.error.includes('password')) {
                        errorMessage = loginContent.errors.invalidCredentials;
                    } else if (result.error.includes('red') || result.error.includes('network')) {
                        errorMessage = loginContent.errors.network;
                    }
                }
                
                setErrors(prev => ({
                    ...prev,
                    general: errorMessage
                }));
                
                addNotification({
                    type: 'error',
                    title: 'Error de inicio de sesión',
                    message: errorMessage
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors(prev => ({
                ...prev,
                general: loginContent.errors.network
            }));
            
            addNotification({
                type: 'error',
                title: 'Error de conexión',
                message: loginContent.errors.network
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSocialLogin = (provider) => {
        // TODO: Implement social login
        addNotification({
            type: 'info',
            title: 'Próximamente',
            message: `El inicio de sesión con ${provider} estará disponible pronto.`
        });
    };

    if (!isOpen) return null;

    return (
        <div className="login" onClick={handleBackdropClick}>
            <div className="login__backdrop" />
            <div className="login__container">
                <div className="login__header">
                    <button 
                        className="login__close"
                        onClick={onClose}
                        type="button"
                        aria-label={loginContent.buttons.close}
                    >
                        <FaTimes />
                    </button>
                    <h1 className="login__title">{loginContent.title}</h1>
                    <p className="login__subtitle">{loginContent.subtitle}</p>
                </div>

                <form className="login__form" onSubmit={handleSubmit}>
                    {errors.general && (
                        <div className="login__error">
                            <FaExclamationTriangle />
                            {errors.general}
                        </div>
                    )}

                    <div className="login__field">
                        <label htmlFor="identifier" className="login__label">
                            {loginContent.form.identifier.label}
                        </label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder={loginContent.form.identifier.placeholder}
                            className={`login__input ${errors.identifier ? 'login__input--error' : ''}`}
                            disabled={isSubmitting}
                            autoComplete="username"
                        />
                        {errors.identifier && (
                            <div className="login__error">
                                <FaExclamationTriangle />
                                {errors.identifier}
                            </div>
                        )}
                    </div>

                    <div className="login__field">
                        <label htmlFor="password" className="login__label">
                            {loginContent.form.password.label}
                        </label>
                        <div className="login__password-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder={loginContent.form.password.placeholder}
                                className={`login__input ${errors.password ? 'login__input--error' : ''}`}
                                disabled={isSubmitting}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="login__password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isSubmitting}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="login__error">
                                <FaExclamationTriangle />
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <div className="login__options">
                        <label className="login__remember">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                            {loginContent.options.rememberMe}
                        </label>
                        <Link to="/forgot-password" className="login__forgot-link">
                            {loginContent.buttons.forgotPassword}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="login__submit"
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="login__loading-spinner" />
                                {loginContent.buttons.logging}
                            </>
                        ) : (
                            loginContent.buttons.login
                        )}
                    </button>
                </form>

                <div className="login__divider">
                    {loginContent.options.or}
                </div>

                <div className="login__social">
                    <button
                        type="button"
                        className="login__social-button login__social-button--google"
                        onClick={() => handleSocialLogin('Google')}
                        disabled={isSubmitting}
                    >
                        <FcGoogle size={20} />
                        {loginContent.social.google}
                    </button>
                    <button
                        type="button"
                        className="login__social-button login__social-button--facebook"
                        onClick={() => handleSocialLogin('Facebook')}
                        disabled={isSubmitting}
                    >
                        <FaFacebook size={20} />
                        {loginContent.social.facebook}
                    </button>
                </div>

                <div className="login__footer">
                    <button
                        type="button"
                        className="login__register-link"
                        onClick={onSwitchToRegister}
                        disabled={isSubmitting}
                    >
                        {loginContent.buttons.registerLink}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;