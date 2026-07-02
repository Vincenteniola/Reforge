import { createClient } from "@supabase/supabase-js";

// Used from the browser / logged-in user pages — respects row-level security
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Used only in server code (cron jobs, API routes) — has full access,
// so it must NEVER be imported into anything that runs in the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
