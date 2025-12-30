import React from 'react';

function RainAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-dark rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">☀️ Upcoming Rain Alerts</h2>
        <div className="text-center py-8">
          <p className="text-gray-300 text-lg">No rain forecasted in the next 5 days! 🎉</p>
          <p className="text-gray-400 mt-2">Enjoy the clear weather!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-2xl p-6 mb-6 rain-alert">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        ⛈️ Upcoming Rain Alerts
        <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
          {alerts.length}
        </span>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="pb-3 text-gray-300 font-semibold">Date</th>
              <th className="pb-3 text-gray-300 font-semibold">Time</th>
              <th className="pb-3 text-gray-300 font-semibold">Description</th>
              <th className="pb-3 text-gray-300 font-semibold">Temperature</th>
              <th className="pb-3 text-gray-300 font-semibold">Probability</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <tr 
                key={index} 
                className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
              >
                <td className="py-4 text-white">
                  {alert.time.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="py-4 text-white">
                  {alert.time.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </td>
                <td className="py-4 text-gray-300 capitalize">
                  <span className="flex items-center gap-2">
                    ☔ {alert.description}
                  </span>
                </td>
                <td className="py-4 text-white font-semibold">
                  {Math.round(alert.temp)}°C
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-600 rounded-full h-2 max-w-[100px]">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${alert.pop}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-semibold">
                      {Math.round(alert.pop)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tip:</strong> Enable browser notifications to receive real-time alerts when rain is detected!
        </p>
      </div>
    </div>
  );
}

export default RainAlerts;
