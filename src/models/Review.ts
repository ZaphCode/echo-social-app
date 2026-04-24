import { Service } from "./Service";
import { User } from "./User";

export type Review = {
  id: string;
  service: string; // FK: service.id
  reviewer: string; // FK: profiles.id
  reviewed: string; // FK: profiles.id
  comment: string;
  rating: number; // 1-5
  type: "AS_CLIENT" | "AS_PROVIDER";
  created_at: string;
  updated_at: string;

  // Supabase joined data
  service_detail?: Service;
  reviewer_profile?: User;
  reviewed_profile?: User;
};
