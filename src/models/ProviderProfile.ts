import { User } from "./User";

export type ProviderProfile = {
  id: string;
  user: string; // fk: User ID
  phone: string;
  description: string;
  state: string;
  city: string;
  address: string;
  zip: string;
  jobs_done: number;
  experience_years: number;
  available_days: string[]; // ["MON", "TUE", ...]
  updated: string;
  created: string;
  location?: {
    lat: number;
    lon: number;
  };

  expand?: {
    user: User;
  };
};
