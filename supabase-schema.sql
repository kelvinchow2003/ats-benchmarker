-- ============================================
-- ATS Resume Benchmarker — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Users profile (mirrors auth.users)
create table if not exists public.users (
  id uuid references auth.users primary key,
  email text not null,
  full_name text,
  created_at timestamptz default now()
);

-- Uploaded resumes
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  file_name text not null,
  parsed_text text not null,
  created_at timestamptz default now()
);

-- Evaluation results
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id),
  job_description text not null,
  legacy_score numeric,
  legacy_matched text[],
  legacy_missing text[],
  legacy_details jsonb,
  semantic_score numeric,
  semantic_details jsonb,
  ai_score numeric,
  ai_verdict text,
  ai_feedback text,
  ai_pros text[],
  ai_cons text[],
  ai_details jsonb,
  composite_score numeric generated always as (
    (legacy_score * 0.30) + (semantic_score * 0.30) + (ai_score * 0.40)
  ) stored,
  created_at timestamptz default now()
);

-- Row Level Security: users can only see their own data
alter table public.users enable row level security;
alter table public.resumes enable row level security;
alter table public.evaluations enable row level security;

create policy "own data" on public.users for all using (auth.uid() = id);
create policy "own data" on public.resumes for all using (auth.uid() = user_id);
create policy "own data" on public.evaluations for all using (auth.uid() = user_id);
