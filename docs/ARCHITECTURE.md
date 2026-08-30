# 🏗️ Date Planner — Technical Architecture

This document provides an overview of the frontend architecture, state management patterns, and cloud integrations in the **Date Planner** application.

---

## 🏛️ System Overview

```mermaid
graph TD
  User[User Browser]
  
  subgraph "Next.js 16 App Router (Client & Server)"
    Page[app/page.tsx]
    StateStore[dateStore.ts (useSyncExternalStore)]
    Context[DateContext.tsx]
    Components[UI Components / Modals]
    AudioEngine[Audio & Soundscape Engine]
    
    subgraph "API Routes"
      UploadAPI[/api/upload]
      DrivePhotosAPI[/api/drive/photos]
    end
  end
  
  subgraph "External Cloud"
    GoogleDrive[Google Drive Folder API]
    GoogleCDN[Googleusercontent Image CDN]
  end

  User --> Page
  Page --> Context
  Context --> StateStore
  StateStore -->|localStorage v3| User
  Context --> AudioEngine
  Components --> Context
  
  Components -->|Browse Photos| DrivePhotosAPI
  Components -->|Upload File| UploadAPI
  DrivePhotosAPI --> GoogleDrive
  UploadAPI --> GoogleDrive
  GoogleDrive --> GoogleCDN
  GoogleCDN -->|Render Img| Components
```

---

## 💾 State Management & Persistence (`dateStore.ts`)

The application uses React 19's **`useSyncExternalStore`** pattern to synchronize browser `localStorage` state with React's component tree:

1. **Hydration Mismatch Prevention**: State is decoupled from the initial SSR render pass, guaranteeing zero hydration mismatches.
2. **Multi-Tab & Component Sync**: Any change to dates, profile, or themes instantly broadcasts to all active subscribers without cascading re-renders.
3. **Storage Schema Versioning**: Automatic purging of legacy storage versions (`v1`, `v2`) to ensure clean state migrations.

---

## 🖼️ Google Drive Photo Pipeline

1. **Photo Normalization (`src/utils/image.ts`)**:
   - `normalizeGoogleDriveImageUrl(url)` detects Google Drive sharing URLs (`/file/d/FILE_ID/view`) and translates them to Google's official public image CDN endpoint:
     $$\text{https://lh3.googleusercontent.com/d/FILE\_ID}$$
2. **Drive Folder Indexing (`src/app/api/drive/photos/route.ts`)**:
   - Authenticates via Service Account JWT or OAuth2 Refresh Token.
   - Queries `drive.files.list` filtering for `mimeType contains 'image/'` inside the configured `GOOGLE_DRIVE_FOLDER_ID`.
3. **Client Picker Component (`src/components/GoogleDrivePicker.tsx`)**:
   - Displays live thumbnail grid of Drive photos.
   - Provides refresh button and direct folder link.

---

## 🎵 Interactive Audio Engine (`src/utils/audio.ts`)

Built using the Web Audio API without external audio file dependencies:
- **Synthesized UI Feedback**: Pop sounds, checkmark chimes, celebration arpeggios, and roulette tick clicks generated in real-time with Web Audio oscillators and gain envelopes.
- **Synthesized Ambient Soundscapes**: Generative brownian noise for rainfall, periodic low-frequency crackles for firesides, and bandpass filtered cafe hums.

---

## 🛡️ CI/CD & Quality Control

- **Static Type Checking**: `tsc --noEmit` ensures strict TypeScript typing.
- **ESLint & Next.js Rules**: Follows Next.js 16 core web vitals and React 19 hooks safety guidelines.
- **Automated GitHub Actions**: Runs on all pushes and PRs to maintain code health.
