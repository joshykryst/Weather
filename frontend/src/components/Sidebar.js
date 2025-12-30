import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertContext } from '../contexts/AlertContext';
import { ThemeContext } from '../contexts/ThemeContext';

function Sidebar({ isOpen, toggleSidebar, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { alertLevel } = useContext(AlertContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/' },
    { name: 'Weather Map', icon: '🗺️', path: '/weather-map' },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', icon: '👨‍💼', path: '/admin' }] : []),
    { name: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'RED': return 'bg-red-500';
      case 'ORANGE': return 'bg-orange-500';
      case 'YELLOW': return 'bg-yellow-500';
      case 'GREEN': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">ACSci Alert</h2>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
          
          {/* Alert Status Badge */}
          <div className="flex items-center space-x-2 mt-3">
            <div className={`w-3 h-3 rounded-full ${getAlertColor()} animate-pulse`}></div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {alertLevel} ALERT
            </span>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {user.role === 'admin' ? '👨‍💼 Administrator' : '👤 Student'}
                </p>
                {user.grade && user.section && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Grade {user.grade} - {user.section}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-r-4 border-blue-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            ACSci Thunderstorm Alert System
          </p>
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-1">
            v2.0.0 • December 2025
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
