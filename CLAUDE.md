# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Weather React & Node.js application with a client-server architecture:
- **Frontend**: React app (Create React App) that fetches weather data from OpenWeatherMap API
- **Backend**: Express.js server that serves the built React app as static files

## Architecture

```
weather-react-node-app/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── App.js         # Main weather component with API integration
│   │   └── index.js       # React app entry point
│   └── package.json       # Client dependencies and scripts
├── index.js               # Express server entry point
└── package.json           # Server dependencies
```

The server serves the built React app and handles all routes by returning `index.html`, letting React Router handle client-side routing.

## Development Commands

### Client (React app)
Navigate to `client/` directory first:
```bash
cd client
yarn install          # Install client dependencies
yarn start            # Start development server (port 3000)
yarn build            # Build for production
yarn test             # Run tests with Jest/React Testing Library
```

### Server (Express)
From root directory:
```bash
yarn install          # Install server dependencies  
node index.js          # Start production server (port 5000)
```

For development, use nodemon (available as dev dependency):
```bash
npx nodemon index.js   # Start server with auto-restart
```

### Full Application Setup
1. Install server dependencies: `yarn install`
2. Install client dependencies: `cd client && yarn install`
3. Build client: `yarn build` (in client directory)
4. Start server: `node index.js` (from root)
5. Access app at `http://localhost:5000`

## Key Implementation Details

- **Weather API**: Uses OpenWeatherMap API with hardcoded API key in App.js:8
- **API Integration**: Direct axios calls from frontend to external API (no backend proxy)
- **State Management**: React useState hooks for location input and weather data
- **Styling**: CSS classes defined in index.css (not CSS modules or styled-components)
- **Build Process**: Standard Create React App build outputs to `client/build/`
- **Server Configuration**: Express serves static files from `client/build` and handles SPA routing

## Development Notes

- The project uses yarn as package manager for both client and server
- No test framework is configured for the server side
- Client uses standard React Testing Library setup
- API key is exposed in client code (consider moving to environment variables)
- Server has no API routes - it only serves the React app