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
    { name: 'Heat Index', icon: '🌡️', path: '/heat-index' },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', icon: '⚙️', path: '/admin' }] : []),
    { name: 'Settings', icon: '🔧', path: '/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'RED': return '#ef4444';
      case 'ORANGE': return '#f97316';
      case 'YELLOW': return '#eab308';
      case 'GREEN': return '#22c55e';
      default: return '#9ca3af';
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-50 to-slate-100 shadow-lg z-50 transform transition-transform duration-300 ease-in-out dark:from-slate-900 dark:to-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative flex flex-col border-r border-slate-200 dark:border-slate-700`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 dark:from-blue-400 dark:to-slate-400 bg-clip-text text-transparent">
              Weather Alert
            </h2>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xl"
            >
              ✕
            </button>
          </div>
          
          {/* Alert Status Badge */}
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: getAlertColor() }}
            ></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {alertLevel}
            </span>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {user.firstName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.role === 'admin' ? '👨‍💼 Admin' : '👤 User'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all mb-1 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'
                }`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3 bg-white dark:bg-slate-800">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {theme === 'dark' ? '🌙' : '☀️'} Mode
            </span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-600 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-all font-medium text-sm shadow-sm"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weather Monitor v2.0
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
