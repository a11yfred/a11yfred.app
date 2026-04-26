/**
 * supabaseClient.js — Phase 2 stub
 *
 * To activate:
 *   npm install @supabase/supabase-js
 *   Create a .env.local file with:
 *     VITE_SUPABASE_URL=https://your-project.supabase.co
 *     VITE_SUPABASE_ANON_KEY=your-anon-key
 *   Then replace the export below with:
 *     import { createClient } from '@supabase/supabase-js'
 *     export const supabase = createClient(
 *       import.meta.env.VITE_SUPABASE_URL,
 *       import.meta.env.VITE_SUPABASE_ANON_KEY
 *     )
 *
 * Supabase project setup (one-time):
 *   1. Enable Google and GitHub OAuth providers in Authentication → Providers
 *   2. Add your OAuth app credentials from Google Cloud Console / GitHub OAuth Apps
 *   3. Set the redirect URL to your Netlify domain (and localhost for dev)
 *   4. Create tables (see schema below)
 *
 * Database schema:
 *
 *   -- User-owned custom finding entries (same shape as corpus.json)
 *   create table user_findings (
 *     id          text primary key,              -- e.g. "USR-001", client-assigned
 *     user_id     uuid references auth.users not null,
 *     title       text not null,
 *     sc          text,
 *     sc_label    text,
 *     related     text[],
 *     priority    text,
 *     platform    text default 'both',
 *     keywords    text[],
 *     desc        text,
 *     rem         text,
 *     created_at  timestamptz default now(),
 *     updated_at  timestamptz default now()
 *   );
 *   alter table user_findings enable row level security;
 *   create policy "Users can manage their own findings"
 *     on user_findings for all using (auth.uid() = user_id);
 *
 *   -- Synced app settings (avoids storing sensitive keys — API keys stay in localStorage only)
 *   create table user_settings (
 *     user_id   uuid primary key references auth.users,
 *     theme     text,
 *     language  text,
 *     platform  text,
 *     live_search boolean,
 *     ai_provider text,
 *     updated_at timestamptz default now()
 *   );
 *   alter table user_settings enable row level security;
 *   create policy "Users can manage their own settings"
 *     on user_settings for all using (auth.uid() = user_id);
 */

export const supabase = null
