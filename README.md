# ATS Resume Benchmarker

A production-ready web application that benchmarks your resume against job descriptions using 3 distinct ATS simulation engines.

## The 3 Engines

| Engine | Technology | Weight |
|--------|-----------|--------|
| **Legacy Keyword ATS** | Pure TypeScript keyword extraction | 30% |
| **Semantic ATS** | Cohere embed-english-v3.0 + cosine similarity | 30% |
| **AI Recruiter** | Google Gemini 1.5 Flash structured evaluation | 40% |

**Composite Score** = (Legacy × 0.30) + (Semantic × 0.30) + (AI × 0.40)

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL + RLS + Auth)
- **PDF Parsing:** pdfjs-dist
- **Deployment:** Vercel

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the SQL in `supabase-schema.sql` in the Supabase SQL Editor
3. Enable email/password auth in Authentication → Providers
4. (Optional) Enable Google and/or GitHub OAuth

### 3. Get API keys

- **Cohere:** [dashboard.cohere.com](https://dashboard.cohere.com) → API Keys (free tier)
- **Gemini:** [aistudio.google.com](https://aistudio.google.com) → API Key (free tier)

### 4. Configure environment

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `COHERE_API_KEY`
- `GEMINI_API_KEY`

### 5. Run locally

```bash
npm run dev
```

### 6. Deploy to Vercel

```bash
npx vercel --prod
```

Add all 5 environment variables in the Vercel dashboard under Settings → Environment Variables.

## Features

- PDF resume upload with drag-and-drop
- 3 parallel ATS engine scoring
- Animated composite score gauge
- Searchable keyword match/miss grid
- AI-powered pros/cons feedback
- Auth-optional evaluation (works without login)
- Supabase-backed evaluation history
- Full dashboard with saved results
- Dark premium SaaS design

## Project Structure

```
src/
├── app/           # Next.js App Router pages and API routes
├── components/    # React components (layout, ui, upload, results)
├── lib/           # Supabase clients, engine logic
└── types/         # Shared TypeScript interfaces
```
