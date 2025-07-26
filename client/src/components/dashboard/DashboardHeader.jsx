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
import './styles/dashboardHeader.css';

const DashboardHeader = () => {
  const { user, isLoading, navigate } = useAppContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [motivationalMessage, setMotivationalMessage] = useState('');

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

  // Mock stats - these would come from API/context in real app
  const stats = [
    {
      key: 'workoutsThisWeek',
      value: 4,
      icon: FiActivity,
      color: 'var(--color-primary)'
    },
    {
      key: 'totalWorkouts',
      value: 127,
      icon: FiTarget,
      color: 'var(--color-secondary)'
    },
    {
      key: 'currentStreak',
      value: 12,
      icon: FiTrendingUp,
      color: 'var(--color-accent)'
    },
    {
      key: 'personalRecords',
      value: 8,
      icon: FiAward,
      color: 'var(--color-error)'
    }
  ];

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
                , {user.name.split(' ')[0]}!
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
            
            return (
              <div key={stat.key} className="dashboard-header__stat-card">
                <div 
                  className={`dashboard-header__stat-value ${
                    isLoading ? 'dashboard-header__stat-value--loading' : ''
                  }`}
                  style={{ color: stat.color }}
                >
                  {isLoading ? '---' : stat.value}
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
                disabled={isLoading}
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