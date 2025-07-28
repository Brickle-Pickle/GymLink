import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import registerContent from './content/register.json';
import './styles/register.css';

const Register = () => {
    const { register, isLoading, addNotification, setUser, user } = useAppContext();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    // Password strength calculation
    useEffect(() => {
        if (formData.password) {
            const strength = calculatePasswordStrength(formData.password);
            setPasswordStrength(strength);
        } else {
            setPasswordStrength('');
        }
    }, [formData.password]);

    const calculatePasswordStrength = (password) => {
        if (password.length < 6) return 'weak';
        
        let score = 0;
        
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Character variety checks
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score < 3) return 'weak';
        if (score < 5) return 'medium';
        return 'strong';
    };

    const validateField = (name, value) => {
        const content = registerContent.form[name];
        
        switch (name) {
            case 'username':
                if (!value.trim()) {
                    return content.error.required;
                }
                if (value.length < 3) {
                    return content.error.minLength;
                }
                if (value.length > 20) {
                    return content.error.maxLength;
                }
                if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    return content.error.invalid;
                }
                break;
                
            case 'email':
                if (!value.trim()) {
                    return content.error.required;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return content.error.invalid;
                }
                break;
                
            case 'password':
                if (!value) {
                    return content.error.required;
                }
                if (value.length < 8) {
                    return content.error.minLength;
                }
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    return content.error.weak;
                }
                break;
                
            case 'confirmPassword':
                if (!value) {
                    return content.error.required;
                }
                if (value !== formData.password) {
                    return content.error.mismatch;
                }
                break;
                
            default:
                break;
        }
        
        return '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        // Validate confirm password when password changes
        if (name === 'password' && formData.confirmPassword) {
            const confirmError = validateField('confirmPassword', formData.confirmPassword);
            setErrors(prev => ({
                ...prev,
                confirmPassword: confirmError
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
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
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
            const result = await register({
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });
            
            if (result.success) {
                setRegistrationSuccess(true);
                addNotification({
                    type: 'success',
                    title: registerContent.success.title,
                    message: registerContent.success.message
                });
                
                setUser(true);

                // Redirect after a short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                // Handle registration errors
                if (result.error && (
                    result.error.includes('email') || 
                    result.error.includes('correo') || 
                    result.error.includes('registrado') ||
                    result.error.includes('ya está')
                )) {
                    setErrors(prev => ({
                        ...prev,
                        email: registerContent.form.email.error.exists
                    }));
                } else {
                    addNotification({
                        type: 'error',
                        title: 'Error de Registro',
                        message: result.error || 'Ocurrió un error durante el registro'
                    });
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            addNotification({
                type: 'error',
                title: 'Error de Registro',
                message: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInputClassName = (fieldName) => {
        let className = 'register__input';
        
        if (errors[fieldName]) {
            className += ' register__input--error';
        } else if (formData[fieldName] && !errors[fieldName]) {
            className += ' register__input--success';
        }
        
        return className;
    };

    if (registrationSuccess || user) {
        return (
            <div className="register">
                <div className="register__container">
                    <div className="register__success">
                        <div className="register__success-icon">
                            <FaCheckCircle />
                        </div>
                        <h2 className="register__success-title">
                            {registerContent.success.title}
                        </h2>
                        <p className="register__success-message">
                            {registerContent.success.message}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register">
            <div className="register__container">
                <div className="register__header">
                    <h1 className="register__title">
                        {registerContent.title}
                    </h1>
                    <p className="register__subtitle">
                        {registerContent.subtitle}
                    </p>
                </div>

                <form className="register__form" onSubmit={handleSubmit} noValidate>
                    {/* Username Field */}
                    <div className="register__field">
                        <label htmlFor="username" className="register__label">
                            {registerContent.form.username.label}
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder={registerContent.form.username.placeholder}
                            className={getInputClassName('username')}
                            autoComplete="username"
                            required
                        />
                        {errors.username && (
                            <div className="register__error">
                                <FaExclamationTriangle />
                                {errors.username}
                            </div>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="register__field">
                        <label htmlFor="email" className="register__label">
                            {registerContent.form.email.label}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder={registerContent.form.email.placeholder}
                            className={getInputClassName('email')}
                            autoComplete="email"
                            required
                        />
                        {errors.email && (
                            <div className="register__error">
                                <FaExclamationTriangle />
                                {errors.email}
                            </div>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="register__field">
                        <label htmlFor="password" className="register__label">
                            {registerContent.form.password.label}
                        </label>
                        <div className="register__password-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder={registerContent.form.password.placeholder}
                                className={getInputClassName('password')}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="register__password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="register__error">
                                <FaExclamationTriangle />
                                {errors.password}
                            </div>
                        )}
                        {formData.password && passwordStrength && (
                            <div className="register__password-strength">
                                <div className="register__strength-label">
                                    Fortaleza de la contraseña:
                                </div>
                                <div className="register__strength-bar">
                                    <div className={`register__strength-fill register__strength-fill--${passwordStrength}`}></div>
                                </div>
                                <div className={`register__strength-text register__strength-text--${passwordStrength}`}>
                                    {registerContent.validation.passwordStrength[passwordStrength]}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="register__field">
                        <label htmlFor="confirmPassword" className="register__label">
                            {registerContent.form.confirmPassword.label}
                        </label>
                        <div className="register__password-container">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder={registerContent.form.confirmPassword.placeholder}
                                className={getInputClassName('confirmPassword')}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="register__password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <div className="register__error">
                                <FaExclamationTriangle />
                                {errors.confirmPassword}
                            </div>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="register__terms">
                        {registerContent.terms.text}{' '}
                        <Link to="/terms" className="register__terms-link">
                            {registerContent.terms.termsLink}
                        </Link>{' '}
                        {registerContent.terms.and}{' '}
                        <Link to="/privacy" className="register__terms-link">
                            {registerContent.terms.privacyLink}
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="register__submit"
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting || isLoading ? (
                            <>
                                <div className="register__loading"></div>
                                {registerContent.buttons.registering}
                            </>
                        ) : (
                            registerContent.buttons.register
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="register__footer">
                    <Link to="/login" className="register__login-link">
                        {registerContent.buttons.loginLink}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;