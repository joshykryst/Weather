import React, { useState } from 'react';

function LoginRegister({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Student profile fields
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');
  const [lrn, setLrn] = useState('');
  const [sex, setSex] = useState('Male');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Section options based on grade level
  const sectionsByGrade = {
    'Grade 7': ['gluon', 'neutrino', 'positron', 'meson', 'lepton', 'quark'],
    'Grade 8': ['tritium', 'protium', 'lithium', 'deuterium', 'hydrogen', 'helium'],
    'Grade 9': ['watson', 'adenine', 'thymine', 'guanine', 'cytosine', 'uracil'],
    'Grade 10': ['hawking', 'hubble', 'halley', 'hamilton', 'huygens', 'herschel'],
    'Grade 11': ['mendel', 'maxwell', 'euler', 'chadwick', 'hertz', 'volta', 'nobel', 'dalton'],
    'Grade 12': ['alcala', 'banzon', 'yogore', 'orosa', 'escuro', 'fronda', 'zara', 'nebres', 'trono', 'comiso']
  };

  // Get available sections for selected grade
  const availableSections = gradeLevel ? sectionsByGrade[gradeLevel] || [] : [];

  // Reset section when grade level changes
  const handleGradeLevelChange = (grade) => {
    setGradeLevel(grade);
    setSection(''); // Reset section when grade changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Validate signup fields
    if (!isLogin) {
      if (!firstName || !lastName || !gradeLevel || !section || !lrn) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate phone number if provided
      if (phoneNumber) {
        const phoneRegex = /^(09|\+639)\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
          setError('Invalid phone number. Use format: 09XXXXXXXXX or +639XXXXXXXXX');
          setLoading(false);
          return;
        }
      }
    }

    let result;
    if (isLogin) {
      result = await onLogin(username, password);
    } else {
      const studentData = {
        firstName,
        middleInitial,
        lastName,
        gradeLevel,
        section,
        lrn,
        sex,
        phoneNumber
      };
      result = await onRegister(username, password, studentData);
    }

    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="glass-dark rounded-2xl p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🌦️ Weather Monitor
          </h1>
          <p className="text-gray-300">
            {isLogin ? 'Login to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white font-semibold mb-2">
              {isLogin ? 'Username or LRN' : 'Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isLogin ? "Enter username or LRN" : "Enter your username"}
            />
            {isLogin && (
              <p className="text-xs text-gray-400 mt-1">
                💡 Forgot your username? Use your LRN instead
              </p>
            )}
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              {/* Full Name Section */}
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-3">
                  <label className="block text-white font-semibold mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-white font-semibold mb-2">
                    M.I.
                  </label>
                  <input
                    type="text"
                    value={middleInitial}
                    onChange={(e) => setMiddleInitial(e.target.value.substring(0, 1))}
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="M"
                    maxLength="1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-white font-semibold mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              {/* Education Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Grade Level *
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => handleGradeLevelChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Section *
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    required
                    disabled={!gradeLevel}
                  >
                    <option value="">Select Section</option>
                    {availableSections.map((sec) => (
                      <option key={sec} value={sec} className="capitalize">
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LRN */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  LRN (Learner Reference Number) *
                </label>
                <input
                  type="text"
                  value={lrn}
                  onChange={(e) => setLrn(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12-digit LRN"
                  maxLength="12"
                  required
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Sex *
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                />
                <p className="text-xs text-gray-400 mt-1">
                  📱 For emergency weather alerts via SMS (can be added later in Settings)
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
