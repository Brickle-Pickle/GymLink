import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
FiPlus, 
FiActivity, 
FiCalendar, 
FiTrendingUp,
FiTarget,
FiAward
} from 'react-icons/fi';
import dashboardContent from './content/dashboardHeader.json';
import { fetchDashboardStats } from '../../services/dashboard_functions';
import './styles/dashboardHeader.css';

const DashboardHeader = () => {
	const { user, isLoading, navigate, apiService, isAuthenticated } = useAppContext();
	const [currentTime, setCurrentTime] = useState(new Date());
	const [motivationalMessage, setMotivationalMessage] = useState('');
	const [stats, setStats] = useState([]);
	const [headerLoading, setHeaderLoading] = useState(false);

	// Update time every minute
	useEffect(() => {
		const timer = setInterval(() => {
		setCurrentTime(new Date());
		}, 60000);

		return () => clearInterval(timer);
	}, []);

	// Set random motivational message
	useEffect(() => {
		const messages = dashboardContent.motivational.messages;
		const randomMessage = messages[Math.floor(Math.random() * messages.length)];
		setMotivationalMessage(randomMessage);
	}, []);

	// Fetch header stats when component mounts and user is available #backend
	useEffect(() => {
		const fetchHeaderStats = async () => {
			console.log('DashboardHeader: Checking dependencies...');
			console.log('User:', user);
			console.log('ApiService:', apiService);
			console.log('IsAuthenticated:', isAuthenticated);
			
			if (!user || !apiService || !isAuthenticated) {
				console.log('DashboardHeader: User or apiService not available');
				return;
			}
			setHeaderLoading(true);
			try {
				console.log('DashboardHeader: Fetching stats...');
				const data = await fetchDashboardStats(user, apiService);
				console.log('DashboardHeader: Received stats data:', data);
				
				const statsArray = [
					{
					key: 'totalExercises',
					value: data.totalExercises || 0,
					icon: FiActivity,
					color: 'var(--color-primary)'
					},
					{
					key: 'totalWorkouts',
					value: data.totalWorkouts || 0,
					icon: FiCalendar,
					color: 'var(--color-secondary)'
					},
					{
					key: 'totalSets',
					value: data.totalSets || 0,
					icon: FiAward,
					color: 'var(--color-quaternary)'
					},
					{
					key: 'currentStreak',
					value: data.streak || 0,
					icon: FiTrendingUp,
					color: 'var(--color-tertiary)'
					}
				];
				
				console.log('DashboardHeader: Setting stats:', statsArray);
				setStats(statsArray);
			} catch (error) {
				console.error('DashboardHeader: Error fetching header stats:', error);
			} finally {
				setHeaderLoading(false);
			}
		};

		fetchHeaderStats();
	}, [user, apiService, isAuthenticated]);

	// Get greeting based on time of day
	const getGreeting = () => {
		const hour = currentTime.getHours();
		const { greeting } = dashboardContent;
		
		if (hour < 12) return greeting.morning;
		if (hour < 18) return greeting.afternoon;
		if (hour < 22) return greeting.evening;
		return greeting.default;
	};

	// Format date
	const formatDate = () => {
		return currentTime.toLocaleDateString('es-ES', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
		});
	};

	// Get user's first name safely
	const getUserFirstName = () => {
		if (!user) return '';
		
		// Check for name property first
		if (user.name && typeof user.name === 'string') {
		return user.name.split(' ')[0];
		}
		
		// Fallback to username if name is not available
		if (user.username && typeof user.username === 'string') {
		return user.username;
		}
		
		// Fallback to email prefix if neither name nor username is available
		if (user.email && typeof user.email === 'string') {
		return user.email.split('@')[0];
		}
		
		return 'Usuario';
	};

	// Quick actions
	const quickActions = [
		{
		key: 'newWorkout',
		icon: FiPlus,
		action: () => navigate('/workouts/create'),
		variant: 'primary'
		},
		{
		key: 'newRoutine',
		icon: FiCalendar,
		action: () => navigate('/routines/create'),
		variant: 'secondary'
		},
		{
		key: 'viewProgress',
		icon: FiTrendingUp,
		action: () => navigate('/progress'),
		variant: 'outline'
		}
	];

	const handleQuickAction = (action) => {
		if (action) {
		action();
		}
	};

	return (
		<header className={`dashboard-header ${isLoading ? 'dashboard-header--loading' : ''}`}>
		<div className="dashboard-header__container">
			{/* Greeting Section */}
			<div className="dashboard-header__greeting">
			<h1 className="dashboard-header__greeting-text">
				{getGreeting()}{user ? (
				<span className="dashboard-header__greeting-name">
					, {getUserFirstName()}!
				</span>
				) : '!'}
			</h1>
			<p className="dashboard-header__motivational">
				{motivationalMessage}
			</p>
			<p className="dashboard-header__date">
				{formatDate()}
			</p>
			</div>

			{/* Stats Section */}
			<div className="dashboard-header__stats">
			{stats.map((stat) => {
				const IconComponent = stat.icon;
				const statConfig = dashboardContent.stats[stat.key];
				
				// Check if statConfig exists to prevent undefined errors
				if (!statConfig) {
				console.warn(`Missing configuration for stat: ${stat.key}`);
				return null;
				}
				
				return (
				<div key={stat.key} className="dashboard-header__stat-card">
					<div 
					className={`dashboard-header__stat-value ${
						headerLoading || isLoading ? 'dashboard-header__stat-value--loading' : ''
					}`}
					style={{ color: stat.color }}
					>
					{headerLoading || isLoading ? '---' : stat.value}
					{statConfig.unit && (
						<span className="dashboard-header__stat-unit">
						{statConfig.unit}
						</span>
					)}
					</div>
					<div className="dashboard-header__stat-label">
					{statConfig.label}
					</div>
				</div>
				);
			})}
			</div>

			{/* Quick Actions */}
			<div className="dashboard-header__actions">
			<h3 className="dashboard-header__actions-title">
				{dashboardContent.quickActions.title}
			</h3>
			{quickActions.map((action) => {
				const IconComponent = action.icon;
				const actionText = dashboardContent.quickActions[action.key];
				
				return (
				<button
					key={action.key}
					className={`dashboard-header__action-btn dashboard-header__action-btn--${action.variant}`}
					onClick={() => handleQuickAction(action.action)}
					disabled={isLoading || headerLoading}
				>
					<IconComponent className="dashboard-header__action-icon" />
					{actionText}
				</button>
				);
			})}
			</div>
		</div>
		</header>
	);
};

export default DashboardHeader;