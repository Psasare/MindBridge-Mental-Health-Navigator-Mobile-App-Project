# MindBridge - Mental Health Navigator Mobile App

[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM%20v6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **A AI-Powered, Culturally Intelligent Mental Health Navigator for Tertiary Students**  
> *Final Year Undergraduate Capstone / Thesis Project*  
> **Author & Lead Engineer:** Prosper Shaibu Asare *(Student ID: 11117173)*

---

## Table of Contents

- [Overview & Vision](#-overview--vision)
- [The Problem Statement](#-the-problem-statement)
- [Key Features](#-key-features)
  - [The Oracle AI Companion](#1-the-oracle-ai-companion)
  - [Multimodal Longitudinal Mood Tracking](#2-multimodal-longitudinal-mood-tracking)
  - [The Mood Garden (Gamification)](#3-the-mood-garden-gamification)
  - [Evidence-Based Clinical & Self-Help Modules](#4-evidence-based-clinical--self-help-modules)
  - [Anonymous Peer Community & Crisis Intervention](#5-anonymous-peer-community--crisis-intervention)
- [System Architecture](#-system-architecture)
  - [Clean Architecture & Layer Separation](#clean-architecture--layer-separation)
  - [Technology Stack](#technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema (Prisma)](#-database-schema-prisma)
- [Installation & Local Setup](#-installation--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Mobile App Setup](#3-mobile-app-setup)
  - [4. Running Concurrently](#4-running-concurrently)
- [Environment Configuration](#-environment-configuration)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Design Language: Luxury Midnight](#-design-language-luxury-midnight)
- [Ethical Considerations & Clinical Disclaimer](#-ethical-considerations--clinical-disclaimer)
- [Future Roadmap](#-future-roadmap)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## Overview & Vision

**MindBridge** is a native mobile application and companion backend engineered to bridge the critical gap in mental health support for university students in Ghana and across the African continent. Combining **context-aware conversational AI**, **multimodal mood and biometric check-ins**, **evidence-based psychotherapeutic exercises (CBT, MI, MBSR)**, and **resilience gamification**, MindBridge provides an empathetic, psychologically safe, and non-stigmatizing first line of emotional support.

Rooted in a **"Luxury Midnight"** aesthetic—featuring deep indigo tones, organic glassmorphic surfaces, fluid 60fps micro-animations, and Apple Health-inspired activity rings—MindBridge transforms daily mental fitness from a clinical chore into a serene, engaging ritual.

---

## The Problem Statement

1. **The Mental Health Crisis in Higher Education:** Up to 40% of Ghanaian tertiary students experience significant psychological distress, anxiety, depressive symptoms, or burnout due to intense academic competition, socio-economic burdens, and transition pressures *(Mental Health Authority of Ghana, 2023)*.
2. **Extreme Resource Deficits:** Ghana has fewer than 60 licensed psychiatrists and clinical psychologists serving a population of over 33 million, creating an insurmountable treatment barrier in university counseling centers.
3. **Pervasive Social Stigma:** Deep-seated social and cultural taboos discourage students from seeking in-person clinical help, fearing judgment, ostracism, or spiritual misattribution.
4. **The Cultural Incompatibility of Existing Apps:** Commercial wellness tools (e.g., Headspace, Calm, Woebot) are tailored predominantly for Western demographics, neglecting indigenous languages (Twi, Ga, Ewe, Hausa), collectivistic family dynamics, spiritual resilience, and localized academic stressors.
5. **The Attrition Barrier:** Most mental health applications suffer from drastic user drop-off within 10 to 14 days due to dry, repetitive questionnaires and a lack of motivational scaffolding *(Baumel et al., 2019)*.

---

## Key Features

### 1. The Oracle AI Companion
- **Engineered on Google Gemini 2.5 Flash:** Ultra-fast, empathetic conversational AI specifically prompted with cultural intelligence, Ghanaian context, and clinical boundary awareness.
- **Multilingual Support:** Converses fluently in **English, Twi, Ga, Ewe, and Hausa**, adapting naturally to user preferences without robotic translation artifacts.
- **Evidence-Based Support Frameworks:**
  - *Motivational Interviewing (MI):* OARS reflections, emotional validation, and ambivalence exploration.
  - *Cognitive Behavioural Therapy (CBT):* Gentle Socratic questioning to reframe cognitive distortions without lecturing.
  - *Mindfulness-Based Stress Reduction (MBSR):* Grounding exercises during acute distress.
  - *Positive Psychology:* Identifying daily "glimmers" and celebrating minor milestones.
- **Function Calling & Contextual Memory:** Autonomous database retrieval of mood trends (`get_mood_history`), journal narratives (`get_journal_history`), and daily ritual milestones (`get_ritual_status`).
- **Predictive Crisis Detection:** Monitors declining mood trends (< 3 over multiple logs) and linguistic despair signals, proactively offering gentle safety checks and one-touch crisis escalation.

### 2. Multimodal Longitudinal Mood Tracking
- **Daily Mood Seeds:** Log emotional scores (1–10) paired with granular emotion descriptors, energy levels, sleep hours/quality, social contexts, and physical symptoms.
- **Vision-Based Facial Check-in:** Camera integration powered by `react-native-vision-camera` and on-device face detection analyzing real-time smile frequency and eye contact metrics.
- **Voice Journaling & Vocal Metrics:** Record audio journal entries with optional acoustic metrics tracking vocal energy and tone.
- **Dynamic Analytics:** Apple-style three-ring progress indicators, weekly emotional pulse charts, and rolling history powered by `@tanstack/react-query` and `react-native-gifted-charts`.

### 3. The Mood Garden (Gamification)
- **Virtual Growth Ecosystem:** An interactive garden that mirrors the user's emotional consistency.
- **Living Flora:** Plant states develop through distinct growth phases (Seed 🌱 → Sprout 🌿 → Bud 🌸 → Bloom 🌺) based on completed check-ins, journals, and exercises.
- **Resilience Streaks & Harvests:** Rewards consistent self-reflection and unlocks badges to combat attrition and sustain long-term engagement.

### 4. Evidence-Based Clinical & Self-Help Modules
- **Interactive Breathing Engine:**
  - *Box Breathing (4-4-4-4):* Focus and tension release.
  - *4-7-8 Relaxing Breath:* Deep parasympathetic calm and sleep preparation.
  - *Deep Calm (4-2-6):* Acute stress dampening.
  - Haptic feedback cycles (`expo-haptics`) paired with fluid reanimated expansion/contraction spheres.
- **5-4-3-2-1 Sensory Grounding:** Guided multi-sensory step-by-step module for de-escalating panic attacks.
- **CBT Cognitive Distortion Reframe:** Structured tool to identify and dispute common cognitive traps (Catastrophizing, All-or-Nothing thinking, Emotional Reasoning, Overgeneralization).
- **Standardized Clinical Assessments:**
  - **PHQ-9** (Patient Health Questionnaire-9) for depression screening.
  - **GAD-7** (Generalized Anxiety Disorder-7) for anxiety screening.
  - Academic Pressure & Burnout inventories with instant scoring, severity classification, and tailored recommendations.
- **MindBridge Knowledge Hub:** Categorized psychoeducational articles, audio practices, and campus survival guides.

### 5. Anonymous Peer Community & Crisis Intervention
- **Psychologically Safe Forum:** Moderated peer community groups (Academic Pressure, Financial Anxiety, Relationships, General Wellness) without public identifiers.
- **"Send a Hug" Micro-Validation:** Low-friction, affirmative peer interactions.
- **Immediate Crisis Hotlines:** Direct dial integration with verified Ghanaian emergency resources:
  - Ghana Mental Health Authority Helpline (`0800 678 678`)
  - National Lifeline (`050 991 4442` / `020 681 4666`)
  - University Counseling and Guidance Centers.

---

## System Architecture

MindBridge follows a decoupled, client-server architecture strictly adhering to **Clean Architecture** and **Domain-Driven Design (DDD)** principles.

```
┌─────────────────────────────────────────────────────────────┐
│                 MindBridge Mobile Client                    │
│            (React Native 0.86 / Expo SDK 57)                │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Presentation Layer (Expo Router, Custom UI, Reanim) │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │ Application Layer (Custom React Hooks, TanStack)    │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │ Infrastructure Layer (Axios, AsyncStorage, Vision)  │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │ HTTPS / REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 MindBridge Backend Server                   │
│               (Node.js 20+ / Express 5 ESM)                 │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Web Layer (Express Controllers, Middleware, Helmet) │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │ Domain Services (Oracle AI, Mental State Analyzer)  │   │
│   └───────────────────┬──────────────┬──────────────────┘   │
│                       │              │                      │
│   ┌───────────────────▼──────┐ ┌─────▼──────────────────┐   │
│   │ Prisma ORM & Repositories│ │ BullMQ / Redis Workers │   │
│   └───────────────────┬──────┘ └────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
┌──────────────────┐         ┌────────────────────┐
│ Neon PostgreSQL  │         │ Google Gemini 2.5  │
│  (Database Engine│         │   (Generative AI)  │
└──────────────────┘         └────────────────────┘
```

### Clean Architecture & Layer Separation

1. **Presentation Layer (`mindbridge-mobile/src/components`, `app/`):** Stateless UI components responsible strictly for layout, typography, animations, and user gesture handling.
2. **Application Layer (`mindbridge-mobile/src/hooks/`):** Encapsulates business logic, orchestrating state between UI and network (e.g., `useDashboardData`, `useStepCounter`).
3. **Infrastructure Layer (`mindbridge-mobile/src/services/`):** Manages external APIs, sensor bridges, audio recorders, camera modules, and local persistence caching via `@react-native-async-storage/async-storage`.

### Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Mobile Runtime** | React Native 0.86.3 / Expo SDK 57 | Cross-platform native mobile execution |
| **Routing** | Expo Router v57 | File-based type-safe native navigation |
| **Language** | TypeScript Strict Mode | End-to-end static type safety |
| **Animations** | `react-native-reanimated` 4.5.1 | Hardware-accelerated 60fps animations |
| **State & Cache** | TanStack React Query v5 | Server state caching, optimistic updates, offline sync |
| **Computer Vision** | `react-native-vision-camera` + Face Detector | On-device camera frame face metric extraction |
| **Icons & Typography**| Lucide Icons & Google Fonts | Inter, Lora, DM Sans, Outfit typography |
| **Backend Runtime** | Node.js v20+ / Express.js 5 | Lightweight, non-blocking asynchronous REST API |
| **Database** | PostgreSQL on Neon.tech | Serverless cloud relational database |
| **ORM** | Prisma Client v6.19 | Type-safe schema definition and query generation |
| **Task Queue** | BullMQ + Redis (ioredis) | Asynchronous background AI task processing |
| **AI / LLM** | Google Gemini 2.5 Flash | Conversational AI companion & sentiment analysis |
| **Security** | Helmet, JWT, Bcrypt, Express Rate Limit | Comprehensive API security and DDoS mitigation |

---

## 📁 Project Directory Structure

```text
MindBridge-Mental-Health-Navigator-Mobile-App-Project/
├── MindBridge_Blueprint.md          # Architectural specifications
├── package.json                     # Monorepo root scripts (dev:all)
│
├── mindbridge-backend/              # Express + TypeScript Server
│   ├── prisma/
│   │   └── schema.prisma            # PostgreSQL relational schema
│   ├── src/
│   │   ├── controllers/             # Request handlers (auth, ai, mood, etc.)
│   │   ├── data/                    # Seed data & self-help content libraries
│   │   ├── middleware/              # JWT auth guards, error handlers
│   │   ├── repositories/            # Database abstraction layer
│   │   ├── routes/                  # Express API route declarations
│   │   ├── services/
│   │   │   ├── gemini.service.ts    # Google Gemini Oracle AI & tool definitions
│   │   │   ├── ai/                  # Mental state and sentiment analyzers
│   │   │   └── ...                  # Domain business logic
│   │   ├── utils/                   # Winston logger, Redis cache connectors
│   │   ├── workers/                 # BullMQ background task workers
│   │   └── index.ts                 # Express entry point
│   ├── tsconfig.json
│   └── package.json
│
└── mindbridge-mobile/               # React Native / Expo Application
    ├── app/                         # Expo Router screens & layouts
    │   ├── (auth)/                  # Welcome, Login, Register, 12-Step Onboarding
    │   ├── (tabs)/                  # Main Navigation Tabs:
    │   │   ├── dashboard.tsx        # Dynamic home with activity rings & greeting
    │   │   ├── garden.tsx           # Interactive Mood Garden ecosystem
    │   │   ├── ai-guide.tsx         # The Oracle AI conversation screen
    │   │   ├── community.tsx        # Anonymous peer support channels
    │   │   ├── assessments.tsx      # PHQ-9, GAD-7, stress evaluations
    │   │   ├── knowledge-hub.tsx    # Psychoeducation library & audio practices
    │   │   ├── crisis.tsx           # Emergency hotlines and safety plan
    │   │   ├── journal.tsx          # Multimedia emotional journal
    │   │   └── profile.tsx          # Student profile, streaks, customization
    │   ├── breathing.tsx            # Guided breathing modal (Box, 4-7-8)
    │   ├── cbt-reframe.tsx          # Cognitive restructuring exercise
    │   ├── grounding.tsx            # 5-4-3-2-1 Sensory Grounding module
    │   └── _layout.tsx              # Root navigation stack
    ├── src/
    │   ├── components/              # Modular UI components (AppleWidget, etc.)
    │   ├── hooks/                   # Custom business hooks (useDashboardData, etc.)
    │   ├── services/                # Axios API client & endpoints
    │   └── theme/                   # Luxury Midnight color tokens & styles
    ├── app.json                     # Expo configuration
    └── package.json
```

---

## 🗄️ Database Schema (Prisma)

The application schema enforces strict relations with cascade deletes to maintain user privacy:

- **`User`**: Account identity, hashed credentials, optional student ID, phone number, and preferences.
- **`Onboarding`**: 12-step profile covering university, program, level, preferred language, spiritual background, stress sources, and support types.
- **`MoodLog`**: Longitudinal emotional scores, energy levels, sleep hours, weather, social setting, physical symptoms, and facial/vocal biometrics.
- **`Journal`**: Free-form and prompt-based diary entries with sentiment analysis, vocal metrics, and AI feedback.
- **`CommunityPost` & `CommunityHug`**: Group-tagged anonymous peer posts with supportive hug reactions.
- **`AssessmentResult`**: Clinical test runs (PHQ-9, GAD-7, Academic Stress) with numerical scores, severity classifications, and recommendations.
- **`DailyGoalSet` & `GoalCompletion`**: Habit tracking and daily wellness milestones.
- **`UserGamification`**: Garden state, flower growth stage, harvest count, current streak, and badges earned.
- **`ChatSession` & `ChatMessage`**: Historical dialogues with The Oracle AI.

---

## Installation & Local Setup

### Prerequisites
- **Node.js**: v20.x or higher installed ([Download Node.js](https://nodejs.org/))
- **npm** or **bun**
- **Git**
- **Expo Go App** (available on iOS App Store & Google Play) or an Android/iOS Simulator
- A free **PostgreSQL Database** (e.g. from [Neon.tech](https://neon.tech))
- A free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone Repository

```bash
git clone https://github.com/ProsperAsare99/MindBridge-Mental-Health-Navigator-Mobile-App-Project.git
cd MindBridge-Mental-Health-Navigator-Mobile-App-Project
```

Install root dependencies:
```bash
npm install
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd mindbridge-backend
   npm install
   ```

2. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/mindbridge?sslmode=require"
   JWT_SECRET="generate-a-secure-random-jwt-secret-key"
   GOOGLE_AI_KEY="your-gemini-api-key-here"
   NODE_ENV="development"
   ```

3. Generate Prisma client & apply database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. *(Optional)* Seed initial resources:
   ```bash
   npm run build
   ```

---

### 3. Mobile App Setup

1. Navigate to the mobile app directory:
   ```bash
   cd ../mindbridge-mobile
   npm install
   ```

2. Configure the mobile `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your computer's local network IP address (do not use `localhost` if running on a physical phone via Expo Go):
   ```env
   # Physical Device Testing (replace with your local machine IP):
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api

   # iOS Simulator:
   # EXPO_PUBLIC_API_URL=http://localhost:5000/api

   # Android Emulator:
   # EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
   ```

---

### 4. Running Concurrently

From the root workspace directory, you can start both the backend server and the mobile Expo development server with one command:

```bash
npm run dev:all
```

Or start them individually:

* **Backend Server:**
  ```bash
  npm run dev:backend
  # Runs on http://localhost:5000 (bound to 0.0.0.0 for LAN access)
  ```

* **Mobile App:**
  ```bash
  npm run dev:mobile
  # Launches Expo CLI; scan QR code with Expo Go on Android or iOS Camera
  ```

---

## Environment Configuration

### Backend (`mindbridge-backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | HTTP server listening port | `5000` |
| `DATABASE_URL` | PostgreSQL connection URI | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret key for signing authorization tokens | `a_super_strong_crypto_string` |
| `GOOGLE_AI_KEY` | Google Gemini Generative AI API Key | `AIzaSy...` |
| `REDIS_URL` | *(Optional)* Redis server connection string | `redis://localhost:6379` |
| `USE_REDIS` | Enable BullMQ background queues | `false` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |

### Mobile (`mindbridge-mobile/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Base API URL pointing to the MindBridge backend | `http://192.168.1.X:5000/api` |

---

## 📡 API Endpoints Reference

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/register` | Register new student user account | No |
| **Auth** | `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| **Auth** | `GET` | `/api/auth/me` | Fetch active authenticated profile | Yes |
| **Onboarding**| `POST` | `/api/onboarding` | Submit 12-step student context data | Yes |
| **Dashboard** | `GET` | `/api/dashboard/stats` | Fetch holistic dashboard overview & streak | Yes |
| **Mood** | `POST` | `/api/mood` | Log a mood seed with biometric metrics | Yes |
| **Mood** | `GET` | `/api/mood/history` | Retrieve longitudinal mood logs | Yes |
| **Oracle AI** | `POST` | `/api/ai/oracle` | Chat with The Oracle companion | Yes |
| **Oracle AI** | `GET` | `/api/ai/sessions` | Fetch conversation history | Yes |
| **Journal** | `POST` | `/api/journal` | Create journal entry (with audio/sentiment) | Yes |
| **Journal** | `GET` | `/api/journal` | List user journal history | Yes |
| **Goals** | `GET` | `/api/goals/today` | Fetch today's assigned wellness goals | Yes |
| **Goals** | `POST` | `/api/goals/:id/toggle`| Toggle goal completion | Yes |
| **Community** | `GET` | `/api/community/posts` | Fetch anonymous group posts | Yes |
| **Community** | `POST` | `/api/community/posts` | Create anonymous forum thread | Yes |
| **Community** | `POST` | `/api/community/posts/:id/hug` | Send an empathetic hug to a peer | Yes |
| **Self-Help** | `GET` | `/api/self-help/exercises`| List breathing, grounding, CBT modules | Yes |
| **Resources** | `GET` | `/api/resources` | Query Knowledge Hub library | Yes |

---

## Design Language: Luxury Midnight

MindBridge's visual identity was architected to avoid the sterile, clinical feel of hospital apps and the cartoonish nature of basic gamification:

- **Palette:** Deep Obsidian (`#0B0E14`), Midnight Navy (`#111827`), Velvet Indigo (`#1E1B4B`), Emerald Glow (`#10B981`), Radiant Rose (`#F43F5E`), and Astral Cyan (`#06B6D4`).
- **Glassmorphism:** Multi-layered background blur (`expo-blur`), translucent borders (`rgba(255, 255, 255, 0.08)`), and soft radial gradients.
- **Physicality & Tactility:** 32pt continuous corner radii matching modern iOS / Android design standards, paired with haptic feedback vibrations on touch.
- **Activity Rings:** Dynamic three-tier rings tracking Mood Logging, Mindfulness Minutes, and Journal Reflections.

---

## Ethical Considerations & Clinical Disclaimer

> [!IMPORTANT]
> **Academic & Clinical Disclaimer:**  
> MindBridge is developed as an undergraduate academic thesis artifact. It is designed as a **preventative, self-management, and peer-navigation tool**, **NOT** a certified medical device, diagnostic system, or substitute for professional psychiatric intervention.
>
> 1. **No Automated Clinical Diagnosis:** MindBridge does not diagnose mental health disorders or prescribe pharmacotherapy.
> 2. **Crisis Escalation:** The platform continuously screens for acute distress and self-harm keywords, explicitly routing users to certified human professionals and local emergency hotlines.
> 3. **Data Privacy & Anonymity:** All peer community interactions are decoupled from student identifiers. Personal reflections, journals, and logs are secured with encrypted transmission and storage.

---

## 🗺️ Future Roadmap

- [ ] **On-Device Offline LLM Inference:** Quantized small language models (SLMs) for basic offline conversational support.
- [ ] **Wearable Integration:** Direct sync with Apple HealthKit and Google Health Connect for passive HRV (Heart Rate Variability) and sleep telemetry.
- [ ] **Counselor Dashboard:** Tele-counseling portal enabling university therapists to review opted-in student mood trajectories during clinical sessions.
- [ ] **Speech-to-Text in Local Languages:** Native voice acoustic transcription for Twi and Ga audio journal entries.

---

## Author & Acknowledgments

* **Lead Researcher & Developer:** **Prosper Shaibu Asare**  
  * *Student ID:* `11117173`  
  * *Department:* Computer Science 
* **Academic Supervisor:** Prof. Isaac Wiafe.
* **School:** University of Ghana. 
* **Special Thanks:** Mental Health Authority of Ghana, campus peer counselors, and all university students who participated in usability evaluations and feedback interviews.

---

<p align="center">
  <b>MindBridge</b> — <i>Bridging the silence, empowering the student mind.</i>
</p>
