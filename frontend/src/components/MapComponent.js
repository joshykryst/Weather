import React, { useState } from 'react';

function MapComponent() {
  const ANGELES_CITY_LAT = 15.15;
  const ANGELES_CITY_LON = 120.59;
  
  // Iframe state management
  const [mapUrl, setMapUrl] = useState(`https://earth.nullschool.net/#current/wind/surface/level/orthographic=${ANGELES_CITY_LON},${ANGELES_CITY_LAT},3000`);
  const [mapKey, setMapKey] = useState(0);
  const [activeMode, setActiveMode] = useState('wind');

  // Wind button handler
  const handleWindMode = () => {
    setMapUrl(`https://earth.nullschool.net/#current/wind/surface/level/orthographic=${ANGELES_CITY_LON},${ANGELES_CITY_LAT},3000`);
    setMapKey(prev => prev + 1);
    setActiveMode('wind');
  };

  // Rain button handler
  const handleRainMode = () => {
    setMapUrl(`https://earth.nullschool.net/#current/wind/surface/level/overlay=precip_2hr/orthographic=${ANGELES_CITY_LON},${ANGELES_CITY_LAT},3000`);
    setMapKey(prev => prev + 1);
    setActiveMode('rain');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            🗺️ Weather Map - Angeles City
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive visualization powered by Earth Nullschool
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Real-Time Weather Layers</h2>
            
            {/* Button Switcher with Active States */}
            <div className="flex gap-3">
              <button
                onClick={handleWindMode}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeMode === 'wind' 
                    ? 'bg-blue-500 text-white shadow-lg scale-105' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                💨 Wind Mode
              </button>
              <button
                onClick={handleRainMode}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeMode === 'rain' 
                    ? 'bg-blue-500 text-white shadow-lg scale-105' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🌧️ Rain Mode
              </button>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-inner" style={{ height: '600px' }}>
            <iframe
              key={mapKey}
              src={mapUrl}
              className="w-full h-full border-0"
              title="Weather Map"
              loading="lazy"
            />
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-semibold">
                  Currently showing: {activeMode === 'wind' ? '💨 Wind Patterns' : '🌧️ Precipitation Data (2hr)'}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  📍 Centered on Angeles City, Pampanga ({ANGELES_CITY_LAT}°N, {ANGELES_CITY_LON}°E)
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-500">Powered by</p>
                <p className="text-sm text-blue-500 dark:text-blue-400 font-semibold">earth.nullschool.net</p>
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">💨 Wind Mode</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• View real-time wind patterns and directions</li>
                <li>• Arrow density indicates wind speed</li>
                <li>• Colors represent wind intensity</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">🌧️ Rain Mode</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Shows precipitation overlay (2-hour data)</li>
                <li>• Blue/green areas indicate rainfall intensity</li>
                <li>• Combined with wind patterns for complete view</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapComponent;
