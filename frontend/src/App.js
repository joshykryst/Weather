import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import WeatherDashboard from './components/WeatherDashboard';
import LoginRegister from './components/LoginRegister';
import AdminPanel from './components/AdminPanel';
import Settings from './components/Settings';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { AlertProvider } from './contexts/AlertContext';
import { ThemeProvider } from './contexts/ThemeContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username,
        password
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      setIsLoggedIn(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const handleRegister = async (username, password, studentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        username,
        password,
        ...studentData
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      setIsLoggedIn(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setIsLoggedIn(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider>
      <AlertProvider>
        <Router>
          {!isLoggedIn ? (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <LoginRegister onLogin={handleLogin} onRegister={handleRegister} />
            </div>
          ) : (
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
              {/* Sidebar */}
              <Sidebar 
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                user={user}
                onLogout={handleLogout}
              />

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
                  <button
                    onClick={toggleSidebar}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-lg font-bold text-gray-800 dark:text-white">ACSci Alert</h1>
                  <div className="w-6"></div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={
                      <WeatherDashboard 
                        user={user} 
                        token={token} 
                        onLogout={handleLogout}
                      />
                    } />
                    <Route path="/weather-map" element={<MapComponent />} />
                    <Route path="/settings" element={<Settings user={user} token={token} />} />
                    {user?.role === 'admin' && (
                      <Route path="/admin" element={
                        <AdminPanel token={token} />
                      } />
                    )}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          )}
        </Router>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
