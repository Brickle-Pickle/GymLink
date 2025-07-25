import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  FiUsers, 
  FiUserPlus, 
  FiCamera,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiActivity,
  FiLoader
} from 'react-icons/fi';
import friendActivityContent from './content/friendActivity.json';
import './styles/friendActivity.css';

const FriendActivity = () => {
  const { user, isLoading, navigate } = useAppContext();
  const [friends, setFriends] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  // Mock data - in real app this would come from API
  useEffect(() => {
    // Simulate loading friends
    const mockFriends = [
      { id: '1', name: 'María García', avatar: null },
      { id: '2', name: 'Carlos López', avatar: null },
      { id: '3', name: 'Ana Martínez', avatar: null }
    ];

    // Simulate loading recent activity
    const mockActivity = [
      {
        id: '1',
        userId: '1',
        userName: 'María García',
        type: 'workout',
        description: 'Entrenamiento de Piernas',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        likes: 3,
        comments: 1
      },
      {
        id: '2',
        userId: '2',
        userName: 'Carlos López',
        type: 'pr',
        description: 'Press Banca - 85kg',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 5,
        comments: 2
      },
      {
        id: '3',
        userId: '3',
        userName: 'Ana Martínez',
        type: 'routine',
        description: 'Rutina de Cardio Matutino',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        likes: 2,
        comments: 0
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setFriends(mockFriends);
      setRecentActivity(mockActivity);
      setIsLoadingActivity(false);
    }, 1000);

    // Generate mock QR code
    setQrCode(`gymlink://user/${user?.id || 'demo'}`);
  }, [user]);

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

    const { timeAgo } = friendActivityContent.withFriends;

    if (minutes < 1) return timeAgo.justNow;
    if (minutes < 60) return timeAgo.minutesAgo.replace('{minutes}', minutes);
    if (hours < 24) return timeAgo.hoursAgo.replace('{hours}', hours);
    if (days < 7) return timeAgo.daysAgo.replace('{days}', days);
    return timeAgo.weeksAgo.replace('{weeks}', weeks);
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle actions
  const handleAddFriends = () => {
    navigate('/friends/search');
  };

  const handleScanQR = () => {
    navigate('/friends/scan');
  };

  const handleViewAll = () => {
    navigate('/friends/activity');
  };

  const handleLike = (activityId) => {
    // TODO: Implement like functionality
    console.log('Like activity:', activityId);
  };

  const handleComment = (activityId) => {
    // TODO: Implement comment functionality
    console.log('Comment on activity:', activityId);
  };

  const handleShare = (activityId) => {
    // TODO: Implement share functionality
    console.log('Share activity:', activityId);
  };

  // Render no friends state
  const renderNoFriendsState = () => (
    <div className="home_friend_activity__no-friends">
      <h3 className="home_friend_activity__no-friends-title">
        {friendActivityContent.noFriends.title}
      </h3>
      <p className="home_friend_activity__no-friends-subtitle">
        {friendActivityContent.noFriends.subtitle}
      </p>
      
      <div className="home_friend_activity__qr-container">
        <p className="home_friend_activity__qr-title">
          {friendActivityContent.noFriends.qrTitle}
        </p>
        <div className="home_friend_activity__qr-code">
          {qrCode ? (
            // In a real app, you'd use a QR code library here
            <div className="home_friend_activity__qr-placeholder" />
          ) : (
            <FiLoader className="home_friend_activity__loading-spinner" />
          )}
        </div>
      </div>

      <div className="home_friend_activity__qr-actions">
        <button 
          className="home_friend_activity__action-btn"
          onClick={handleAddFriends}
        >
          <FiUserPlus className="home_friend_activity__action-icon" />
          {friendActivityContent.noFriends.addFriendsButton}
        </button>
        <button 
          className="home_friend_activity__action-btn home_friend_activity__action-btn--secondary"
          onClick={handleScanQR}
        >
          <FiCamera className="home_friend_activity__action-icon" />
          {friendActivityContent.noFriends.scanQrButton}
        </button>
      </div>
    </div>
  );

  // Render activity item
  const renderActivityItem = (activity) => {
    const { activityTypes } = friendActivityContent.withFriends;
    const activityText = activityTypes[activity.type] || activityTypes.workout;

    return (
      <div key={activity.id} className="home_friend_activity__item">
        <div className="home_friend_activity__avatar">
          {getUserInitials(activity.userName)}
        </div>
        
        <div className="home_friend_activity__content">
          <div className="home_friend_activity__activity-text">
            <span className="home_friend_activity__user-name">
              {activity.userName}
            </span>
            {activityText}
            {activity.description && (
              <span className="home_friend_activity__activity-highlight">
                {' '}{activity.description}
              </span>
            )}
          </div>
          
          <div className="home_friend_activity__time">
            {formatTimeAgo(activity.timestamp)}
          </div>
          
          <div className="home_friend_activity__actions">
            <button 
              className="home_friend_activity__action"
              onClick={() => handleLike(activity.id)}
            >
              <FiHeart className="home_friend_activity__action-icon" />
              {activity.likes > 0 && activity.likes}
            </button>
            
            <button 
              className="home_friend_activity__action"
              onClick={() => handleComment(activity.id)}
            >
              <FiMessageCircle className="home_friend_activity__action-icon" />
              {activity.comments > 0 && activity.comments}
            </button>
            
            <button 
              className="home_friend_activity__action"
              onClick={() => handleShare(activity.id)}
            >
              <FiShare2 className="home_friend_activity__action-icon" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render activity list
  const renderActivityList = () => {
    if (isLoadingActivity) {
      return (
        <div className="home_friend_activity__loading">
          <div className="home_friend_activity__loading-spinner" />
          {friendActivityContent.loading.loadingActivity}
        </div>
      );
    }

    if (recentActivity.length === 0) {
      return (
        <div className="home_friend_activity__empty">
          <FiActivity className="home_friend_activity__empty-icon" />
          <p className="home_friend_activity__empty-text">
            {friendActivityContent.withFriends.noRecentActivity}
          </p>
        </div>
      );
    }

    return (
      <div className="home_friend_activity__list">
        {recentActivity.map(renderActivityItem)}
      </div>
    );
  };

  const hasFriends = friends.length > 0;
  const title = hasFriends 
    ? friendActivityContent.withFriends.title 
    : friendActivityContent.title;

  return (
    <section className={`home_friend_activity ${isLoading ? 'home_friend_activity--loading' : ''}`}>
      <div className="home_friend_activity__header">
        <h2 className="home_friend_activity__title">
          {title}
        </h2>
        {hasFriends && recentActivity.length > 0 && (
          <button 
            className="home_friend_activity__view-all"
            onClick={handleViewAll}
          >
            {friendActivityContent.withFriends.viewAllButton}
          </button>
        )}
      </div>

      {hasFriends ? renderActivityList() : renderNoFriendsState()}
    </section>
  );
};

export default FriendActivity;