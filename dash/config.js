// The Edit Society — dashboard settings.
// Paste your Supabase project values here (Supabase → Project Settings → API).
// The anon key is safe to publish; NEVER put the service_role key in this file.
export const SUPABASE_URL = 'https://wwxhihpxyehwbajxnmpc.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eGhpaHB4eWVod2JhanhubXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5OTkwNjQsImV4cCI6MjExMDU3NTA2NH0.CPcMuvfHpv2UYdMxt30MatyFEHVOQQdKcnlz44dAVAE';

// Largest single file customers can upload (Supabase free plan = 50 MB; raise it on a paid plan).
export const MAX_UPLOAD_MB = 50;

// While the keys above are empty the dashboards run in DEMO mode with sample data
// (nothing is saved). You can also force demo mode with ?demo in the URL.
export const DEMO = !SUPABASE_URL || !SUPABASE_ANON_KEY || new URLSearchParams(location.search).has('demo');
