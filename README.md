# GSDAP — Ghana Student Digital Access Programme

> **National technical learning aggregator and academic credential registry unifying curricula from Google Cloud, Microsoft Learn, Coursera, NVIDIA Deep Learning Institute, and TVET vocational colleges.**

---

## 🏛️ About GSDAP

The **Ghana Student Digital Access Programme (GSDAP)** is a national educational platform engineered to bridge the gap between accredited international tech education and local technical learners. Rather than requiring students to navigate disjointed platforms and high-bandwidth portals, GSDAP consolidates curricula, tracks learning progression, issues cryptographically verifiable credentials, and supports low-bandwidth/offline caching across emerging regions.

---

## ✨ Key Features

- **Consolidated Course Catalogue**: Structured curricula aggregated across Coursera, Google Cloud Skills Boost, Microsoft Learn, NVIDIA DLI, and TVET colleges.
- **Verifiable Academic Dossier & Credentials**: Every completed module is cryptographically sealed with a unique verification identifier (e.g., `GSDAP-GCP-8841-A`) that employers and academic institutions can verify in real-time.
- **Low-Bandwidth & Data Saver Mode**: Engineered for 2G/3G connectivity with image minimization, font preloading, and offline text caching.
- **Study Cohorts & Peer Learning**: Structured learning cohorts with institutional mentors and seat allocations.
- **Interactive Roadmap**: Academic progression tracking across foundational, intermediate, and capstone milestones.
- **Multilingual Support**: English, French, and Swahili localization.
- **PWA Ready**: Offline capabilities and mobile-first responsive design.

---

## 🛠️ Architecture & Tech Stack

```
GSDAP (Ghana Student Digital Access Programme)
├── client/          # Frontend Single-Page App (React + Vite + TypeScript)
├── server/          # Backend REST API (Node.js + Express + TypeScript + Prisma)
├── shared/          # Shared types, validation schemas, and constants
├── netlify.toml     # Automated Netlify continuous deployment configuration
└── docker-compose.yml # PostgreSQL, Redis, and container orchestration
```

### Frontend (`/client`)
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS & CSS variables (Dark/Light mode support)
- **State Management**: Zustand with persistent storage
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PWA**: Vite Plugin PWA with Workbox

### Backend (`/server`)
- **Runtime**: Node.js & Express (TypeScript)
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Cache & Queue**: Redis & BullMQ
- **Authentication**: JWT tokens, HTTP-only refresh cookies, and Argon2 password hashing
- **API Docs**: Swagger / OpenAPI 3.0

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 20.0.0`
- **npm** `>= 10.0.0`
- *(Optional)* **Docker & Docker Compose** for database services

### 1. Installation
Clone the repository and install workspace dependencies:
```bash
git clone https://github.com/vusi-pixel/GSDAP.git
cd GSDAP
npm install
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Run Development Server
Run both client and backend concurrently:
```bash
npm run dev
```
Or run the frontend independently:
```bash
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploying to Netlify

This repository comes pre-configured with `netlify.toml` and `client/public/_redirects` for seamless deployment.

### Option 1: Automatic Continuous Deployment (Recommended)
1. Go to [Netlify App](https://app.netlify.com).
2. Click **Add new site** > **Import an existing project**.
3. Select **GitHub** and choose the repository `vusi-pixel/GSDAP`.
4. Netlify will automatically detect `netlify.toml`:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist` (or `dist`)
5. Click **Deploy GSDAP**.

### Option 2: Netlify CLI
```bash
npm install -g netlify-cli
ntl login
cd client
ntl deploy --prod
```

---

## 🛡️ Data Sovereignty & Security
- Public service educational framework adhering to strict data sovereignty and encryption standards.
- Zero tracking or sale of student personal data.

---

## 📄 License
Public Service Educational Framework · © 2026 GSDAP Consortium.
