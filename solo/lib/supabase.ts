import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined") {
  console.log("[SOLO] Supabase config:", {
    url_present: !!url,
    key_present: !!key,
    domain: url ?? "MISSING",
    key_prefix: key ? key.slice(0, 12) + "..." : "MISSING",
  });
}

export const supabase = createClient(url ?? "", key ?? "");

export interface Profile {
  email: string;
  name: string;
  night_styles: string[];
  looking_for: string[];
  group_size: string;
  onboarding_completed: boolean;
}
