import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  FiHome, 
  FiActivity, 
  FiCalendar, 
  FiTarget, 
  FiUsers, 
  FiTrendingUp,
  FiUser,
  FiSettings,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiMenu,
  FiX,
  FiClock,
  FiChevronDown
} from 'react-icons/fi';
import { 
    FaCalculator,
    FaDumbbell
} from 'react-icons/fa';
import Login from './Login';
import navbarContent from './content/navbar.json';
import './styles/Navbar.css';

const Navbar = () => {
  const { navigate, isLoading, user, isAuthenticated } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Navigation items with their corresponding icons
  const navigationItems = [
    { 
      key: 'dashboard', 
      path: '/', 
      icon: FiHome, 
      label: navbarContent.navigation.dashboard 
    },
    { 
      key: 'workouts', 
      path: '/workouts', 
      icon: FiActivity, 
      label: navbarContent.navigation.workouts 
    },
    { 
      key: 'routines', 
      path: '/routines', 
      icon: FiCalendar, 
      label: navbarContent.navigation.routines 
    },
    /*{ 
      key: 'exercises', 
      path: '/exercises', 
      icon: FiTarget, 
      label: navbarContent.navigation.exercises 
    },
    { 
      key: 'social', 
      path: '/social', 
      icon: FiUsers, 
      label: navbarContent.navigation.social 
    },
    { 
      key: 'leaderboard', 
      path: '/leaderboard', 
      icon: FiTrendingUp, 
      label: navbarContent.navigation.leaderboard 
    }*/
  ];

  // Tool items
  const toolItems = [
    {
      key: 'calculator',
      icon: FaCalculator,
      label: navbarContent.tools.calculator,
      action: () => navigate('/tools/calculator')
    },
    {
      key: 'timer',
      icon: FiClock,
      label: navbarContent.tools.timer,
      action: () => navigate('/tools/timer')
    }
  ];

  // User dropdown items
  const userDropdownItems = [
    {
      key: 'profile',
      icon: FiUser,
      label: navbarContent.user.profile,
      action: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: FiSettings,
      label: navbarContent.user.settings,
      action: () => navigate('/settings')
    },
    {
      key: 'logout',
      icon: FiLogOut,
      label: navbarContent.user.logout,
      action: handleLogout,
      danger: true
    }
  ];

  // Handle route changes to update active state
  useEffect(() => {
    const currentPath = window.location.pathname;
    setActiveRoute(currentPath);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeRoute]);

  // Handle navigation
  const handleNavigation = (path) => {
    setActiveRoute(path);
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Handle logout
  function handleLogout() {
    // TODO: Implement logout logic with auth context
    console.log('Logging out...');
    setIsDropdownOpen(false);
    navigate('/login');
  }

  // Handle login modal
  const handleLogin = () => {
    setIsLoginModalOpen(true);
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  // Handle register
  const handleRegister = () => {
    navigate('/register');
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  // Handle login modal close
  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
  };

  // Handle switch to register from login modal
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    navigate('/register');
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    // Handle undefined, null, or empty string
    if (!name || typeof name !== 'string') {
      return 'U'; // Default fallback initial
    }
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if route is active
  const isRouteActive = (path) => {
    if (path === '/') {
      return activeRoute === '/';
    }
    return activeRoute.startsWith(path);
  };

  return (
    <>
      <nav className={`navbar ${isLoading ? 'navbar__loading' : ''}`}>
        <div className="navbar__container">
          {/* Brand/Logo */}
          <a 
            href="/" 
            className="navbar__brand"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/');
            }}
          >
            <img 
              src="/logo.svg" 
              alt="GymLink Logo" 
              className="navbar__logo" 
            />
            <div className="navbar__brand-text">
              <span>{navbarContent.brand.name}</span>
              <span className="navbar__tagline">{navbarContent.brand.tagline}</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <ul className="navbar__nav">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.key} className="navbar__nav-item">
                  <a
                    href={item.path}
                    className={`navbar__nav-link ${
                      isRouteActive(item.path) ? 'navbar__nav-link--active' : ''
                    }`}
                    id='navbar__link'
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.path);
                    }}
                  >
                    <IconComponent className="navbar__nav-icon" />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* User Section */}
          <div className="navbar__user">
            {/* Tools */}
            <div className="navbar__tools">
              {toolItems.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <button
                    key={tool.key}
                    className="navbar__tool-btn"
                    onClick={tool.action}
                    title={tool.label}
                  >
                    <IconComponent className="navbar__tool-icon" />
                  </button>
                );
              })}
            </div>

            {/* User Authentication */}
            {isAuthenticated && user ? (
              <div className="navbar__user-dropdown" ref={dropdownRef}>
                <button
                  className={`navbar__user-btn ${
                    isDropdownOpen ? 'navbar__user-btn--open' : ''
                  }`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="navbar__user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username || user.name} />
                    ) : (
                      getUserInitials(user.username || user.name || user.email)
                    )}
                  </div>
                  <div className="navbar__user-info">
                    <span className="navbar__user-name">{user.username || user.name}</span>
                    <span className="navbar__user-email">{user.email}</span>
                  </div>
                  <FiChevronDown className="navbar__dropdown-icon" />
                </button>

                {/* Dropdown Menu */}
                <div className={`navbar__dropdown-menu ${
                  isDropdownOpen ? 'navbar__dropdown-menu--open' : ''
                }`}>
                  {userDropdownItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.key}
                        className={`navbar__dropdown-item ${
                          item.danger ? 'navbar__dropdown-item--danger' : ''
                        }`}
                        onClick={item.action}
                      >
                        <IconComponent className="navbar__dropdown-icon-item" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="navbar__auth-buttons">
                <button
                  className="navbar__auth-btn"
                  onClick={handleLogin}
                >
                  {navbarContent.user.login}
                </button>
                <button
                  className="navbar__auth-btn navbar__auth-btn--primary"
                  onClick={handleRegister}
                >
                  {navbarContent.user.register}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="navbar__mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? navbarContent.mobile.close : navbarContent.mobile.menu}
            >
              {isMobileMenuOpen ? (
                <FiX className="navbar__mobile-icon" />
              ) : (
                <FiMenu className="navbar__mobile-icon" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`navbar__mobile-menu ${
          isMobileMenuOpen ? 'navbar__mobile-menu--open' : ''
        }`}>
          {/* Mobile Navigation */}
          <div className="navbar__mobile-nav">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.key}
                  href={item.path}
                  className={`navbar__mobile-nav-link ${
                    isRouteActive(item.path) ? 'navbar__mobile-nav-link--active' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.path);
                  }}
                >
                  <IconComponent className="navbar__nav-icon" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Mobile Tools */}
          <div className="navbar__mobile-tools">
            {toolItems.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.key}
                  className="navbar__mobile-tool-btn"
                  onClick={tool.action}
                >
                  <IconComponent className="navbar__tool-icon" />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile User Section */}
          {isAuthenticated && user ? (
            <div className="navbar__mobile-user">
              <div className="navbar__mobile-user-info">
                <div className="navbar__user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username || user.name} />
                  ) : (
                    getUserInitials(user.username || user.name || user.email)
                  )}
                </div>
                <div className="navbar__user-info">
                  <span className="navbar__user-name">{user.username || user.name}</span>
                  <span className="navbar__user-email">{user.email}</span>
                </div>
              </div>
              <div className="navbar__mobile-user-actions">
                {userDropdownItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.key}
                      className={`navbar__dropdown-item ${
                        item.danger ? 'navbar__dropdown-item--danger' : ''
                      }`}
                      onClick={item.action}
                    >
                      <IconComponent className="navbar__dropdown-icon-item" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="navbar__mobile-user">
              <div className="navbar__mobile-user-actions">
                <button
                  className="navbar__dropdown-item"
                  onClick={handleLogin}
                >
                  <FiLogIn className="navbar__dropdown-icon-item" />
                  <span>{navbarContent.user.login}</span>
                </button>
                <button
                  className="navbar__dropdown-item"
                  onClick={handleRegister}
                >
                  <FiUserPlus className="navbar__dropdown-icon-item" />
                  <span>{navbarContent.user.register}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <Login 
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </>
  );
};

export default Navbar;