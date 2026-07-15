import { createClient } from "@supabase/supabase-js";

// IMPORTANT: This client uses the service role key and bypasses ALL RLS policies.
// Only import and use this in Server Actions ('use server') or Route Handlers!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
