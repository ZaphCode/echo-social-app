import { Category } from "./Category";
import { User } from "./User";

export type Service = {
  id: string;
  provider: string; // FK: profiles.id
  category: string; // FK: service_category.id
  name: string;
  description: string;
  base_price: number;
  photos: string[];
  created_at: string;
  updated_at: string;

  // Supabase joined data
  profiles?: User; // provider profile joined via "provider" FK
  service_category?: Category; // category joined via "category" FK
};
