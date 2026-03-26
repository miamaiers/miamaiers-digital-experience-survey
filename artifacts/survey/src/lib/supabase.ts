import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured =
  !!supabaseUrl && supabaseUrl !== "your-supabase-url" &&
  !!supabaseAnonKey && supabaseAnonKey !== "your-supabase-anon-key";

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
);

export interface SurveyRow {
  id: string;
  created_at: string;
  major: string;
  year_in_college: string;
  study_spot: string;
  primary_building: string;
  note_device: string;
  apps: string[];
  other_app: string | null;
  curriculum_suggestion: string | null;
}

export interface SurveyInsert {
  major: string;
  year_in_college: string;
  study_spot: string;
  primary_building: string;
  note_device: string;
  apps: string[];
  other_app?: string | null;
  curriculum_suggestion: string;
}
