# 🌹 Date Planner

<div align="center">

**A bespoke, romantic date planner, timeline builder, and memory scrapbook journal for couples.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-11.20.0-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![CI / Build](https://github.com/jplacorte/date-planner/actions/workflows/ci.yml/badge.svg)](https://github.com/jplacorte/date-planner/actions/workflows/ci.yml)

</div>

---

## ✨ Features Overview

### 🌟 1. Date Discovery & Custom Date Creator
- **Curated Categorization**: Explore or create date experiences under **Fine Dining**, **Outdoor Scenic**, **Art & Creative**, **Nightlife**, **Cozy At Home**, and **Adrenaline Adventure**.
- **Comprehensive Filters**: Instant search by keyword, category, status (*Wishlist*, *Planned*, *Booked*, *Completed*), setting (*Indoor*, *Outdoor*, *At Home*), budget levels in Philippine Pesos (`₱`, `₱₱`, `₱₱₱`, `₱₱₱₱`), and favorites.
- **Custom Experience Builder**: Design custom date cards with tailored titles, taglines, cover photos, duration, dress codes, and vibe tags.

### ⏱️ 2. Hour-by-Hour Date Itinerary & Timeline Builder
- **Milestone Scheduling**: Plan out hour-by-hour schedules for your date (e.g., `17:30 Meetup`, `18:30 Dinner Reservation`, `21:00 Evening Walk & Dessert`).
- **Inline Editing**: Live edit any itinerary checkpoint's time, activity name, location venue, and special notes on the fly.
- **Progress Tracking**: Check off timeline steps during the date with celebratory sound cues and visual feedback.
- **Quick Starter Template**: Generate a balanced 4-stage evening schedule with 1 click.

### 📷 3. Google Drive Live Photo Integration
- **Direct Drive Folder Gallery**: Browse all high-resolution photos stored in your Google Drive folder directly inside the app.
- **One-Click Cover & Memory Picker**: Select any photo from your Google Drive gallery to set as a date cover or add to your scrapbook.
- **Universal Drive Link Normalizer**: Paste standard Google Drive share links (`https://drive.google.com/file/d/...`) and the app automatically normalizes them into high-res CDN embed URLs (`https://lh3.googleusercontent.com/d/FILE_ID`).
- **Local Fallback Storage**: Upload photos directly from phone/laptop with automatic client-side compression.

### 📖 4. Memory Scrapbook & Journal
- **Personal Reflections**: Record memories, sweet thoughts, funniest moments, favorite dishes, and romantic soundtrack songs.
- **Cost Investment Tracker**: Log actual date expenses in Philippine Pesos (`₱`) with comma-separated formatting.
- **Polaroid Photo Wall**: Flip through visual Polaroid memories with custom handwritten-style captions and quotes.

### 📍 5. Romantic Venue Map & Directions
- **Venue Pinpoint**: View date venues on an interactive map with custom category markers.
- **Google Maps Integration**: 1-click **"Directions"** button that opens turn-by-turn navigation in Google Maps.

### 🎲 6. Date Spark Roulette Wheel
- **Decision Maker**: Spin the interactive wheel to randomize your next date adventure.
- **Filtered Sparks**: Filter the roulette by category, setting, or budget before spinning.

### 🏆 7. Couple Analytics & Milestone Badges
- **Relationship Stats**: Live anniversary countdown and total days together counter.
- **Progress Metrics**: Real-time completed date counts, category breakdown bars, and total investment in Philippine Pesos.
- **Achievement Badges**: Unlockable milestones (*First Date Spark*, *Five Date Milestones*, *Foodie Connoisseurs*, *Outdoor Explorers*, *Cozy Masters*).

### 🎵 8. Ambient Soundscapes & Mood Lighting
- **Atmospheric Sound Engine**: Choose from **Rainy Cafe**, **Lofi Jazz Beats**, **Fireside Cabin**, or **Ocean Breeze** built with Web Audio API.
- **Sound Effects**: Tactile audio pops, celebratory completion chimes, and Canvas confetti animations.
- **Mood Themes**: Switch between **Rose Romance**, **Midnight Velvet**, **Golden Hour**, and **Emerald Forest** aesthetic colorways.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.3.3 (App Router & Turbopack) | Server-side rendering, dynamic API routes, and optimized builds |
| **UI Library** | React 19.2.8 | Latest React architecture with `useSyncExternalStore` |
| **Language** | TypeScript 5.x | Strict end-to-end static typing |
| **Styling** | Tailwind CSS v4 & Vanilla CSS | Modern glassmorphism, responsive grid layouts, and custom design tokens |
| **Animations** | Motion (Framer Motion v13) | Smooth micro-animations, layout transitions, and popovers |
| **Smooth Scroll** | Lenis v1.3 | Kinetic smooth scrolling with modal isolation (`data-lenis-prevent`) |
| **Cloud Storage** | Google Drive API (`googleapis`) | Cloud photo storage, gallery sync, and image normalization |
| **Package Manager** | pnpm 11.20.0 | Fast, deterministic dependency management |
| **CI/CD** | GitHub Actions | Automated type-checking, linting, security audits, and production builds |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x or higher recommended)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm` or `corepack enable`)

### 1. Clone & Install
```bash
# Clone the repository
git clone git@github.com:jplacorte/date-planner.git
cd date-planner

# Install dependencies
pnpm install
```

### 2. Configure Environment Variables
Copy the `.env.example` template:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Google Drive configuration:
```env
# Google Drive Folder ID (from https://drive.google.com/drive/folders/YOUR_FOLDER_ID)
GOOGLE_DRIVE_FOLDER_ID="1x_0YasZi3VXMBd3baL74LA6dhyDbiC78"

# Google Service Account Credentials
GOOGLE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Optional: OAuth 2.0 Credentials (for direct personal uploads)
GOOGLE_OAUTH_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret"
GOOGLE_OAUTH_REFRESH_TOKEN="your-refresh-token"
```

### 3. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Google Drive Photo Setup Guide

### Option A: Browse Photos from Your Google Drive Folder (Active)
1. In Google Drive, create a folder (e.g., `Date Planner`).
2. Share the folder with your Google Service Account email with **Editor** permissions.
3. Add the folder ID to `GOOGLE_DRIVE_FOLDER_ID` in `.env.local`.
4. Any photo uploaded to this folder will immediately appear in the in-app **"My Google Drive Photos"** gallery!

### Option B: 1-Click Direct In-App Upload via OAuth 2.0
To upload photos directly from within the web application to your Google Drive folder:
1. In [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Type: *Web Application*, Redirect URI: `http://localhost:8085`).
2. Run the automated linker script:
   ```bash
   pnpm run auth:drive <CLIENT_ID> <CLIENT_SECRET>
   ```
3. Authenticate in the browser window. The script will automatically save your refresh token to `.env.local`.

---

## 🧪 Available Scripts

| Command | Action |
|---|---|
| `pnpm dev` | Start the local Next.js development server on port 3000 |
| `pnpm build` | Run TypeScript verification and build optimized production bundle |
| `pnpm start` | Start the production Next.js server |
| `pnpm lint` | Run ESLint across all TypeScript and React files |
| `pnpm run auth:drive` | Link Google Drive OAuth 2.0 credentials interactively |

---

## 🔄 CI/CD & Code Quality Pipeline

The repository includes automated GitHub Actions workflows:

- **Continuous Integration (`.github/workflows/ci.yml`)**:
  - Automatically triggers on every `push` to `main` and all `pull_request` branches.
  - Verifies dependencies with `pnpm install --frozen-lockfile`.
  - Runs full TypeScript type check (`tsc --noEmit`).
  - Runs ESLint validation.
  - Builds the production bundle (`next build`).
- **Security & Code Review (`.github/workflows/code-review.yml`)**:
  - Scans for dependency vulnerabilities on pull requests and weekly schedules.

---

## 🔒 Data Portability & Privacy

- **Private & Client-First**: All checklist progress, memories, and couple profile settings are stored client-side in `localStorage` using React 19's `useSyncExternalStore`.
- **Full JSON Backup & Restore**: Click **Profile & Settings $\rightarrow$ Export Backup (JSON)** to download a complete backup of all dates and memories, or restore it on any device.
