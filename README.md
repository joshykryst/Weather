# Weather Monitor Application

A full-stack weather monitoring application with rain alerts and notifications.

## Features

### Backend (Express)
- User authentication (register/login)
- Protected weather configuration endpoint
- In-memory user storage

### Frontend (React + Tailwind)
- Real-time weather monitoring via OpenWeather API
- Hourly polling of 5-day forecast
- Browser notification alerts for rain
- Interactive map with wind/rain overlays (earth.nullschool.net)
- Glassmorphism UI design
- Upcoming rain alerts dashboard

## Setup

### Backend
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## Environment Variables

Create `.env` file in the frontend directory:
```
VITE_OPENWEATHER_API_KEY=your_api_key_here
VITE_API_BASE_URL=http://localhost:5000
```

Get your free OpenWeather API key at: https://openweathermap.org/api

## Usage

1. Register a new account
2. Login with your credentials
3. Allow browser notifications when prompted
4. Set your city for weather monitoring
5. Receive alerts when rain is detected in the forecast
6. Toggle between wind and rain map overlays
