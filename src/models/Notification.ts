import { User } from "./User";

export type Notification = {
  id: string;
  user: string; // FK: profiles.id
  message: string;
  type:
    | "PROVIDER:NEW_REQUEST"
    | "CLIENT:NEW_OFFER"
    | "PROVIDER:NEW_OFFER"
    | "SYSTEM:INFO";
  read: boolean;
  created_at: string;
  updated_at: string;

  // Optional FK fields
  request?: string; // FK: service_request.id
  service?: string; // FK: service.id

  // Supabase joined data
  profiles?: User;
};
