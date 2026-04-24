import { User } from "./User";

export type ClientProfile = {
  id: string;
  user: string; // FK: profiles.id
  phone: string;
  state: string;
  city: string;
  address: string;
  zip: string;
  updated_at: string;
  created_at: string;

  // Supabase joined data (via select with joins)
  profiles?: User;
};
