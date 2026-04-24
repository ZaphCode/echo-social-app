import { ServiceRequest } from "./ServiceRequest";
import { User } from "./User";

export type Message = {
  id: string;
  request: string; // FK: service_request.id
  sender: string; // FK: profiles.id
  content: string;
  created_at: string;
  updated_at: string;

  // Supabase joined data
  service_request?: ServiceRequest;
  profiles?: User; // sender profile
};
