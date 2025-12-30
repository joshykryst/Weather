import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Settings({ user, token }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    phoneNumber: user?.phoneNumber || '',
    verificationCode: ''
  });
  const [showVerification, setShowVerification] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/settings/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage(response.data.message);
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number update
  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate phone number format (Philippine format)
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Invalid phone number. Use format: 09XXXXXXXXX or +639XXXXXXXXX');
      return;
    }

    try {
      setLoading(true);
      // Mock SMS verification (in production, this would send real SMS)
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('📱 Mock SMS Verification Code:', mockCode);
      
      setShowVerification(true);
      setMessage(`Verification code sent to ${formData.phoneNumber} (Check console for mock code)`);
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Verify phone number
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Mock verification (in production, verify against sent code)
    if (formData.verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/settings/update-phone`,
        {
          phoneNumber: formData.phoneNumber,
          verificationCode: formData.verificationCode
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage(response.data.message);
      setShowVerification(false);
      setFormData({ ...formData, verificationCode: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            ⚙️ Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account security and contact information
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 rounded-lg">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            👤 Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
              <p className="font-semibold text-gray-800 dark:text-white">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {user?.firstName} {user?.middleInitial}. {user?.lastName}
              </p>
            </div>
            {user?.grade && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Grade & Section</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  Grade {user?.grade} - {user?.section}
                </p>
              </div>
            )}
            {user?.lrn && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">LRN</p>
                <p className="font-semibold text-gray-800 dark:text-white">{user?.lrn}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {user?.role === 'admin' ? '👨‍💼 Administrator' : '👤 Student'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {user?.phoneNumber || '📵 Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Password Reset Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            🔒 Reset Password
          </h2>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Phone Number Update Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            📱 Update Phone Number
          </h2>
          
          {!showVerification ? (
            <form onSubmit={handlePhoneUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number (Philippine Format)
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  💡 A verification code will be sent to this number
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPhone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
                  required
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  📨 Check your phone for the verification code (or console for mock code)
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setFormData({ ...formData, verificationCode: '' });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Update'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔐 Security Tips</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use a strong password with at least 6 characters</li>
            <li>• Keep your phone number up to date for emergency alerts</li>
            <li>• Never share your password with anyone</li>
            <li>• Enable push notifications for real-time weather alerts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Settings;
