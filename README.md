<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Vesta Virtual Assistant Services Platform

A comprehensive platform for connecting clients with specialized virtual assistants, featuring AI-powered matching using Google Gemini.

View your app in AI Studio: https://ai.studio/apps/4ead314c-cd7e-4a92-8994-a0c05a45b0f5

## Features

- **AI-Powered Matching**: Uses Google Gemini API to intelligently match clients with the most suitable virtual assistant based on their needs
- **Service Catalog**: 6 specialized service categories including administrative support, customer experience, technical operations, digital marketing, lead generation, and content creation
- **Agent Directory**: Browse and view detailed profiles of all available virtual assistants
- **Booking System**: Schedule appointments directly with agents
- **Live Chat**: Communicate with matched agents in real-time
- **Admin Dashboard**: Monitor platform statistics and manage match logs

## Run Locally

### Prerequisites:
- Node.js (v14 or later)

### Setup Instructions:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Set `GEMINI_API_KEY` to your Google Gemini API key in `.env`
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the app: Open `http://localhost:3000` in your browser

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── src/
│   ├── components/       # React components (views, UI elements)
│   ├── App.tsx           # Main app component
│   └── types.ts          # TypeScript type definitions
├── server.ts             # Express server with API endpoints
├── package.json          # Project dependencies and scripts
└── .env.example          # Example environment variables
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/services` | GET | Get all available service categories |
| `/api/agents` | GET | Get all virtual agents |
| `/api/agents/:id` | GET | Get agent by ID |
| `/api/bookings` | GET/POST | List or create bookings |
| `/api/match` | POST | AI-powered agent matching |
| `/api/admin/stats` | GET | Get admin statistics |
| `/api/chats/:token` | GET/POST | Chat functionality |

## Technologies Used

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Express.js
- **AI**: Google Gemini (@google/genai)
- **UI**: Tailwind CSS, Motion
- **Build Tools**: esbuild, Vite

