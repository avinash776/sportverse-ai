# 🏟️ SportVerse AI

> **AI-Powered Sports Training & Community Platform**

A full-stack application that combines AI video analysis, personalised training plans, real-time community features, and a coach management portal — all designed to help athletes improve their game.

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Running with Docker](#running-with-docker)
- [API Reference](#api-reference)
- [Demo Credentials](#demo-credentials)
- [Screenshots](#screenshots)

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌────────────────────┐      ┌──────────────────────┐
│  React Frontend │ ───▶ │  Node.js Backend   │ ───▶ │  Python AI Service   │
│  (Vite + TW)    │      │  (Express + SQLite) │      │  (Flask + MediaPipe) │
│  Port 5173      │      │  Port 5000          │      │  Port 8000           │
└─────────────────┘      └────────────────────┘      └──────────────────────┘
        │                         │                           │
   Framer Motion           Socket.io Chat           Pose Estimation
   Lucide Icons            JWT Auth + OAuth          Video Analysis
   Tailwind CSS            File Uploads              AI Coach Agent
```

---

## ✨ Features

### 1. 🎥 Personalised Trainer (Video Analysis)
- Upload training videos (MP4, AVI, WebM, MOV)
- AI-powered pose estimation using MediaPipe
- Performance scoring: posture, technique, timing, consistency
- Sport-specific feedback for cricket, football, badminton
- Auto-generated training suggestions

### 2. 🧠 AI Trainer
- Generate personalised training plans via AI coaching agent
- Sport-specific drills and resources (YouTube links)
- Weekly timetable with warmup/cooldown routines
- Nutrition advice and motivational messages
- Supports beginner, intermediate, and advanced levels

### 3. 🏟️ Community
- Social feed with posts (general, looking-for-players, events, announcements)
- Like and comment on posts
- Create and join sport-specific groups
- Real-time group chat via Socket.io

### 4. 🏆 Coach Portal
- Coach dashboard with stats overview
- Create and manage tournaments & events
- Search and recruit players
- Post announcements (auto-shared to community)
- Coach verification system

### 5. 👤 Player Profile
- Editable profile with sport, skills, bio, avatar
- Training history and performance stats
- Public profile pages for other users

---

## 🛠️ Tech Stack

| Layer       | Technology                                              |
|-------------|--------------------------------------------------------|
| Frontend    | React 18, Vite 5, Tailwind CSS 3.4, Framer Motion 11  |
| Backend     | Node.js, Express 4.18, Socket.io 4.7                   |
| Database    | SQLite (better-sqlite3) with WAL mode                  |
| Auth        | Passport.js (Google OAuth 2.0), JWT, bcryptjs          |
| AI Service  | Python Flask 3.0, MediaPipe, OpenCV, scikit-learn      |
| Icons       | Lucide React                                           |
| Uploads     | Multer (videos up to 100 MB)                           |

---

## 📁 Project Structure

```
Sport Verse AI/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Navbar, Sidebar
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/           # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/             # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AuthCallback.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PersonalizedTrainer.jsx
│   │   │   ├── AITrainer.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── CoachPortal.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── PublicProfile.jsx
│   │   ├── services/          # API client
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                   # Node.js + Express server
│   ├── src/
│   │   ├── config/            # Database, Passport, Socket.io
│   │   ├── middleware/        # Auth, Upload
│   │   ├── routes/            # API route modules
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── video.js
│   │   │   ├── trainer.js
│   │   │   ├── community.js
│   │   │   ├── coach.js
│   │   │   └── chat.js
│   │   ├── seed.js            # Demo data seeder
│   │   └── server.js          # Entry point
│   ├── .env
│   └── package.json
│
├── ai/                        # Python AI microservice
│   ├── pose_estimation/       # MediaPipe pose detector
│   ├── video_analysis/        # Performance scoring engine
│   ├── ai_agent/              # AI coaching agent
│   ├── routes/                # Flask blueprints
│   ├── models/                # ML model weights
│   ├── app.py                 # Flask entry point
│   └── requirements.txt
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "Sport Verse AI"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (one is already provided with defaults):

```env
PORT=5000
JWT_SECRET=sportverse-super-secret-key-2024
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
SESSION_SECRET=sportverse-session-secret
```

Seed the database with demo data and start:

```bash
node src/seed.js      # Creates demo users & data
npm run dev           # Starts on port 5000
```

### 3. AI Microservice Setup

```bash
cd ai
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py         # Starts on port 8000
```

> **Note:** The backend has built-in fallback logic. If the AI service is unavailable, it generates realistic mock analysis data, so the app works without the AI service running.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev           # Starts on port 5173
```

### 5. Open the App

Visit **http://localhost:5173** in your browser.

---

## 🐳 Running with Docker

```bash
docker-compose up --build
```

This starts all three services:
- Frontend → http://localhost:5173
- Backend  → http://localhost:5000
- AI       → http://localhost:8000

---

## 🔑 Demo Credentials

| Role    | Email              | Password      |
|---------|--------------------|---------------|
| Player  | player@demo.com    | password123   |
| Coach   | coach@demo.com     | password123   |

Use the **"Demo Login"** buttons on the Login page for quick access.

---

## 📡 API Reference

### Auth
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | `/api/auth/register`        | Register new user     |
| POST   | `/api/auth/login`           | Login with email/pass |
| GET    | `/api/auth/google`          | Google OAuth start    |
| GET    | `/api/auth/me`              | Get current user      |

### Video Analysis
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | `/api/video/upload`         | Upload video          |
| POST   | `/api/video/analyze/:id`    | Trigger AI analysis   |
| GET    | `/api/video/my-videos`      | List user videos      |
| DELETE | `/api/video/:id`            | Delete video          |

### AI Trainer
| Method | Endpoint                       | Description           |
|--------|--------------------------------|-----------------------|
| POST   | `/api/trainer/generate-plan`   | Generate training plan|
| GET    | `/api/trainer/my-plans`        | List user plans       |
| DELETE | `/api/trainer/plan/:id`        | Delete plan           |

### Community
| Method | Endpoint                              | Description           |
|--------|---------------------------------------|-----------------------|
| GET    | `/api/community/posts`                | List posts            |
| POST   | `/api/community/posts`                | Create post           |
| POST   | `/api/community/posts/:id/like`       | Like/unlike post      |
| POST   | `/api/community/posts/:id/comments`   | Add comment           |
| GET    | `/api/community/groups`               | List groups           |
| POST   | `/api/community/groups`               | Create group          |
| POST   | `/api/community/groups/:id/join`      | Join group            |

### Coach Portal
| Method | Endpoint                         | Description           |
|--------|----------------------------------|-----------------------|
| GET    | `/api/coach/dashboard`           | Coach stats           |
| POST   | `/api/coach/tournaments`         | Create tournament     |
| POST   | `/api/coach/events`              | Create event          |
| GET    | `/api/coach/players`             | Search players        |
| POST   | `/api/coach/announcements`       | Post announcement     |
| POST   | `/api/coach/self-verify`         | Demo coach verify     |

### AI Microservice (Python)
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | `/api/analyze-video`          | Full video analysis      |
| POST   | `/api/detect-pose`            | Single-frame pose detect |
| POST   | `/api/generate-training-plan` | AI training plan         |
| POST   | `/api/get-coaching-tips`      | Coaching tips            |
| GET    | `/health`                     | Health check             |

---

## 🔐 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → APIs & Services → Credentials
3. Create **OAuth 2.0 Client ID** (Web Application)
4. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Client Secret into `backend/.env`

The app works fully without Google OAuth — use email/password or demo logins.

---

## 📝 License

MIT © SportVerse AI

---

Built with ❤️ by the SportVerse team
