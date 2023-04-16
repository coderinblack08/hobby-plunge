import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

export const supabaseClient = createBrowserSupabaseClient({
  options: {
    realtime: { params: { eventsPerSecond: 10 } },
  },
});
