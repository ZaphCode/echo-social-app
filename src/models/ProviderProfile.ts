import { Category } from "./Category";
import { User } from "./User";

export type ProviderProfile = {
  id: string;
  user: string; // FK: profiles.id
  specialty: string; // FK: service_category.id
  phone: string;
  description: string;
  state: string;
  city: string;
  address: string;
  zip: string;
  jobs_done: number;
  experience_years: number;
  available_days: string[]; // ["LUN", "MAR", ...]
  updated_at: string;
  created_at: string;

  // Supabase joined data
  profiles?: User;
  service_category?: Category;
};
