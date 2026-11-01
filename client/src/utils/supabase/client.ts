import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL ||
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  "https://lhcqulujckjvpddrpujj.supabase.co";

const supabaseKey =
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_o8fOHA06QgqN1gOZ6S-iFg_Vf0XSKGH";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );

export const supabase = createClient();
