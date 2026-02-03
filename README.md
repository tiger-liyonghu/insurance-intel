# Insurance Innovation Intelligence System

全球保险创新情报系统 | Global Insurance Innovation Intelligence System

## Overview

An AI-powered system that collects, screens, analyzes, and publishes global insurance innovation cases daily. The system covers a 3×3 innovation matrix:

|  | Product Innovation | Marketing Innovation | CX Innovation |
|---|---|---|---|
| **Property Insurance** | New coverage, parametric, IoT pricing | Embedded insurance, partnerships | Claims automation, self-service |
| **Health Insurance** | Wearable-linked, mental health | Health ecosystems, gamification | Telemedicine, real-time tracking |
| **Life Insurance** | Micro-insurance, on-demand | Social media, KOL, community | Simplified underwriting, AI advisors |

## Features

- **9 cases per day** covering the full innovation matrix
- **Bilingual content** (English and Chinese)
- **Five-layer deep analysis** for each case
- **Both positive (innovation) and negative (warning) cases**
- **Global coverage** across 30+ countries and 14+ languages
- **AI-powered** using Google Gemini 2.5

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI Engine**: Google Gemini 2.5
- **Scheduler**: GitHub Actions
- **Hosting**: Vercel
- **Auth**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase account
- Google AI Studio account (for Gemini API)
- Vercel account (for deployment)

### Setup

1. **Install dependencies**
   ```bash
   cd insurance-intel
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Run the seed data in `supabase/seed.sql`

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your credentials.

4. **Run locally**
   ```bash
   npm run dev
   ```

### GitHub Actions Secrets Required

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `VERCEL_REVALIDATE_TOKEN`

## Pipeline Commands

```bash
npm run pipeline:collect   # Collect from sources
npm run pipeline:screen    # Screen collected items
npm run pipeline:analyze   # Analyze screened items
npm run pipeline:publish   # Publish ready cases
```

## License

Copyright © 2026 ActuaryHelp. All rights reserved.
