<div align="center">

# 🎬 **SKCine – Sivakarthikeyan Movie Database**  

_An unofficial fan‑built portal to explore Sivakarthikeyan’s filmography, reviews, and watchlists._

![TypeScript](https://img.shields.io/badge/path-TS-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![npm](https://img.shields.io/badge/npm-ED6C20?style=for-the-badge&logo=npm&logoColor=white)
![License: Unlicensed](https://img.shields.io/badge/License-Unlicensed-red?style=for-the-badge)

</div>

---

## 📄 Description  

SKCine is a **React + TypeScript** single‑page application that serves as an unofficial movie database for the Tamil superstar Sivakarthikeyan. Built with **Vite** and styled with **Tailwind CSS**, the app leverages **Firebase Authentication** and **Firestore** to store user data such as likes, reviews, and watchlists. It offers an engaging UI powered by **Radix UI** primitives and includes offline support via a service worker. Ideal for fans, developers, or anyone looking to explore a curated filmography in a modern web stack.

---

## 📚 Table of Contents  

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
  - [Preview Locally](#preview-locally)
- [Usage](#-usage)
- [Folder Structure](#-folder-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🚀 Features  

| 🚀 | Feature |
|---|---------|
| 🔐 | **User Authentication** – Sign in with Firebase Auth. |
| 📁 | **Watchlist** – Add movies to a personalized list. |
| 👍 | **Like System** – Like movies and see global popularity. |
| 📝 | **Reviews** – Write and read fan reviews. |
| 🎬 | **Dynamic Movie Details** – Modal view with filmography and similar actors. |
| 📊 | **Virtualized Filmography** – Smooth scrolling through thousands of titles. |
| 🌳 | **Offline Support** – Service worker caches assets and data. |
| 🎨 | **Modern UI** – Radix UI components + Tailwind CSS. |
| ⚡ | **Fast Development** – Powered by Vite’s hot‑module replacement. |

---

## 🛠️ Tech Stack  

- **Framework**: React 18 + TypeScript  
- **Build Tool**: Vite  
- **Styling**: Tailwind CSS + Radix UI components  
- **State Management**: React Context + Custom hooks  
- **Data Layer**: Firebase Auth & Firestore  
- **Utilities**: `react-hook-form`, `zod` (via `@hookform/resolvers`)  
- **Testing**: (none yet)  
- **Deployment**: Vercel (recommended)  
- **Linting**: ESLint + Prettier (via `@eslint/js`)  

---

## 🔧 Getting Started  

### Prerequisites  
- Node.js **≥20** (recommended 22+)  
- npm **≥10** (or `yarn`, `pnpm`)

### Installation  

```bash
# Clone the repo
git clone https://github.com/dharunkumar-sh/cine-hub.git
cd cine-hub

# Install dependencies
npm install
```

### Development Server  

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view explorer. The app reloads on file changes.

### Production Build  

```bash
npm run build
```

The output is in `dist/`.  

### Preview Locally  

```bash
npm run preview
```

Open the preview URL to test the production build.

---

## 📦 Usage  

Below are common commands and snippets to interact with the app.

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview

# Lint the codebase
npm run lint
```

**Firebase Configuration**  
Create a `src/lib/firebase.ts` with your Firebase project credentials (the current repo includes a placeholder).  

```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

const app = initializeApp(firebaseConfig свеч);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 📁 Folder Structure  

```text
src/
├─ App.css
├─ App.tsx
├─ main.tsx
├─ index.css
├─ vite-env.d.ts
├─ components/
│  ├─ AuthModal.tsx
│  ├─ ErrorBoundary.tsx
│  ├─ LikeButton.tsx
│  ├─ MovieDetailsModal.tsx
│  ├─ NavLink.tsx
│  ├─ ReviewSection.tsx
│  ├─ SimilarActorsPanel.tsx
│  ├─ SyncStatusIndicator.tsx
│  ├─ VirtualizedFilmography.tsx
│  ├─ WatchlistButton.tsx
│  └─ ui/   ← Radix UI component wrappers
├─ contexts/
│  └─ ThemeContext.tsx
├─ data/
│  ├─ mockData.ts
│  └─ reviewData.ts
├─ hooks/
│  ├─ use-mobile.tsx
│  ├─ use-toast.ts
│  ├─ useMovieLikes.ts
│  ├─ useReviews.ts
│  ├─ useServiceWorker.ts
│  └─ useWatchlist.ts
├─ lib/
│  ├─ apiClient.ts
│  ├─ firebase.ts
│  ├─ firebaseDb.ts
│  ├─ utils.ts
│  └─ watchlistDb.ts
├─ pages/
│  ├─ Index.tsx
│  ├─ NotFound.tsx
│  └─ Watchlist.tsx
└─ pages/
```

---

## 🤝 Contributing  

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feature/awesome-feature`).  
3. Commit diagnosis (`git commit -m "Add awesome feature"`).  
4. Push to your fork (`git push origin feature/awesome-feature`).  
5. Open a Pull Request and describe your changes.

**Coding Style** – Follow the existing ESLint rules. Use TypeScript strictly.

---

## 📄 License  

This project is **unlicensed**. Feel free to use, modify, and distribute.  

---

## 🙏 Acknowledgements  

- **React** – The UI library that makes building components painless.  
- **Vite** – Lightning‑fast dev server and build tool.  
- **Tailwind CSS** – Utility‑first styling.  
- **Radix UI** – Accessible component primitives.  
- **Firebase** – Authentication and real‑time database.  
- **TypeScript** – Static typing for safer code.  
- **Framer Motion** – (Optional) Animations for a smoother experience.  

---
