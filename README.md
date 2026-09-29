# 🎨 HR RAG Assistant — React Frontend Application

![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8.svg)
![Security Passed](https://img.shields.io/badge/security-Trivy%20%7C%20Snyk%20%7C%20Sonar-blue.svg)

A modern, responsive, DeepSeek-inspired enterprise web application for the **HR RAG Assistant Platform**. Built with React 18, Vite, TailwindCSS, and Server-Sent Events (SSE) for real-time conversational streaming, policy exploration, document management, and organizational administration.

---

## 🌟 UI/UX Highlights

- **💬 Real-Time SSE Token Streaming**: Ultra-fast, low-latency streaming responses with automatic markdown formatting, code highlights, and table rendering.
- **🎨 DeepSeek-Inspired Aesthetic**: Sleek dark and light mode themes, glassmorphism cards, collapsible sidebar, and responsive multi-column layouts.
- **🐊 Adaptive Mascot Logo**: Custom dynamic SVG mascot (`CrocodileLogo.jsx`) that smoothly adapts its color palette between dark and light modes.
- **🔍 Chat History & Quick Search**: Persistent conversation sessions with keyword-based instant history filtering.
- **🔐 Role-Based Access Views**: Dynamic navigation and dashboard views configured for Admin, HR Manager, and standard Employee privileges.
- **📁 Document Ingestion & Status Tracking**: Drag-and-drop document upload interface with live parsing status and branch allocation tags.

---

## 🏗️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework & Build** | React 18, Vite 5, ES Modules |
| **Styling & Icons** | TailwindCSS, PostCSS, Lucide React (`lucide-react`) |
| **Routing & Auth** | React Router DOM v6, JWT LocalStorage Persistence, Protected Routes |
| **Streaming & APIs** | Fetch API with `ReadableStream` (SSE), Axios |
| **State Management** | React Context API (`AuthContext`, `ChatContext`, `ThemeContext`) |
| **Markdown Rendering** | React Markdown, Remark GFM, Highlight.js |

---

## 📁 Project Structure

```
frontend/
├── .github/workflows/
│   ├── ci.yml                 # Build validation & linting
│   └── security.yml           # Snyk & Trivy vulnerability audits
├── public/                    # Static assets & favicon
├── src/
│   ├── api/                   # API client bindings & SSE chat stream handler
│   │   ├── authApi.js
│   │   ├── chatStream.js      # Server-Sent Events stream consumer
│   │   ├── ingestionApi.js
│   │   └── orgApi.js
│   ├── components/            # Reusable UI components
│   │   ├── chat/              # ChatView, ChatInput, ChatMessage, MessageList
│   │   ├── ingestion/         # Document upload & ingestion list
│   │   ├── organization/      # Branch & user management tables
│   │   ├── CrocodileLogo.jsx  # Dynamic SVG mascot brand logo
│   │   ├── Navbar.jsx         # Navigation bar & notification center
│   │   ├── Sidebar.jsx        # DeepSeek-style collapsible session drawer
│   │   ├── ThemeToggle.jsx    # Dark/Light mode switcher
│   │   └── ProtectedRoute.jsx # Role-based route guard
│   ├── context/               # Global state contexts (Auth, Theme, Chat)
│   ├── pages/                 # Full-page views
│   │   ├── DashboardPage.jsx  # Core workspace & split-pane interface
│   │   ├── LoginPage.jsx      # Enterprise authentication portal
│   │   └── ResetPasswordPage.jsx
│   ├── App.jsx                # Application root with router configuration
│   ├── index.css              # Global styles & Tailwind directives
│   └── main.jsx               # React entry point
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 1. Clone & Navigate
```bash
git clone https://github.com/Iamzain804/hr-rag-frontend.git
cd hr-rag-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `frontend` root directory:

```env
# Backend Service Endpoints
VITE_IDENTITY_API_URL=http://localhost:8001
VITE_NOTIFICATION_API_URL=http://localhost:8002
VITE_INGESTION_API_URL=http://localhost:8003
VITE_RAG_CHAT_API_URL=http://localhost:8004
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

---

## 🛠️ Build & Deployment

To compile and optimize the production bundle:

```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 🔒 Security & Quality Standards

- **Zero Inline Script Vulnerabilities**: Clean Content Security Policy (CSP) compatibility.
- **Sanitized Chat Rendering**: Markdown and SSE streams are sanitized against XSS attacks.
- **Automated CI/CD**: Monitored via GitHub Actions with Snyk dependency vulnerability checks and Trivy scans.

---

## 📄 License

Licensed under the [MIT License](LICENSE).
