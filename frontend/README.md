# ACSci Thunderstorm Alert System - Frontend 🌩️

Real-time weather monitoring and alert system frontend built with React.

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm start
\`\`\`

## Environment Variables

Edit \`.env\` file:

\`\`\`env
REACT_APP_API_URL=http://localhost:5001
\`\`\`

For production deployment, update with your backend URL.

## Build for Production

\`\`\`bash
npm run build
\`\`\`

The \`build\` folder will contain optimized production files.

## Features

- Progressive Web App (PWA) support
- Service Worker for push notifications
- iOS 16.4+ Web Push compatibility
- Audio siren alerts with Web Audio API
- Device vibration (Android)
- Responsive design with Tailwind CSS

## Technology Stack

- React.js
- React Router v6
- Tailwind CSS
- Axios
- Service Workers
- Web Audio API

For full documentation, see the main [README.md](../README.md) in the project root.
2. Login with your credentials
3. Allow browser notifications when prompted
4. Set your city for weather monitoring
5. Receive alerts when rain is detected in the forecast
6. Toggle between wind and rain map overlays
