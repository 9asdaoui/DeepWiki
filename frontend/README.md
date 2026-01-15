# DeepWiki React Frontend

Modern SaaS-style dashboard for AI-powered Wikipedia and PDF processing.

## Features

- 🎨 **Shadcn/UI Components** - High-quality, accessible components built on Tailwind CSS
- 🔐 **JWT Authentication** - Secure login/register with token management
- 📊 **React Query** - Smart data fetching with automatic loading states
- 🎯 **React Router v6** - Protected routes and seamless navigation
- 📱 **Fully Responsive** - Mobile-first design with Tailwind Grid/Flexbox
- 🚀 **Optimized Build** - Multi-stage Docker with Nginx for production

## Pages

### Authentication
- **Login** (`/login`) - JWT-based authentication
- **Register** (`/register`) - New user registration

### Main Application
- **Dashboard** (`/dashboard`) - AI workspace with Wikipedia URL and PDF upload
  - Summarization with Groq AI
  - Translation with Gemini AI
  - Interactive quiz generation
  - Download results as PDF/TXT
  
- **History** (`/history`) - View all processed articles
- **Quiz Scores** (`/quiz-history`) - Performance tracking with scores
- **Admin Panel** (`/admin`) - Platform statistics dashboard

## Tech Stack

```json
{
  "framework": "React 18 + Vite",
  "styling": "Tailwind CSS",
  "components": "Shadcn/UI",
  "routing": "React Router v6",
  "state": "TanStack Query (React Query)",
  "forms": "React Hook Form + Zod",
  "icons": "Lucide React",
  "charts": "Recharts",
  "http": "Axios with interceptors"
}
```

## Development

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

The frontend is configured for multi-stage Docker builds:

1. **Build Stage**: Compiles React app with Node 20
2. **Production Stage**: Serves static files with Nginx

```bash
# Build and run with Docker Compose
docker-compose up --build frontend

# Access at http://localhost:3000
```

## Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn components (Button, Card, Input)
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx  # Authentication state
│   ├── lib/
│   │   ├── api.js          # Axios instance + API calls
│   │   └── utils.js        # Utility functions
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx   # Main AI workspace
│   │   ├── History.jsx
│   │   ├── QuizHistory.jsx
│   │   └── AdminPanel.jsx
│   ├── App.jsx             # Router configuration
│   ├── main.jsx            # React Query provider
│   └── index.css           # Tailwind + CSS variables
├── Dockerfile              # Multi-stage build
├── nginx.conf              # Nginx configuration
├── vite.config.js
└── tailwind.config.js
```

## API Integration

All API calls use Axios interceptors to automatically:
- Attach `Authorization: Bearer <token>` headers
- Redirect to login on 401 errors
- Handle token refresh

Example:
```javascript
import { aiAPI } from '@/lib/api'

const { data } = await aiAPI.summarizeWiki('https://...')
```

## Design System

### Colors
- **Primary**: Deep Indigo (`hsl(221.2 83.2% 53.3%)`)
- **Background**: Slate variants
- **Accent**: Emerald for success states

### Typography
- Tailwind's default font stack
- Responsive sizing with `text-sm` to `text-3xl`

### Components
Shadcn/UI components are customizable via `tailwind.config.js` CSS variables.

## Key Features Implementation

### Smart Loading States
React Query automatically shows loading spinners while waiting for LLM responses.

### Protected Routes
`ProtectedRoute` wrapper checks JWT and redirects unauthenticated users.

### File Upload
Drag-and-drop PDF uploads with FormData multipart/form-data handling.

### Export Downloads
Blob downloads for PDF/TXT exports using `responseType: 'blob'`.

## Production Considerations

- Static files served by Nginx (high performance)
- API requests proxied through Nginx to backend
- Environment variables injected at build time
- Optimized bundle size with tree-shaking

## License

Part of the DeepWiki project.
