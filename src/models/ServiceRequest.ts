import { Service } from "./Service";
import { User } from "./User";

export type ServiceRequest = {
  id: string;
  client: string; // FK: profiles.id
  service: string; // FK: service.id
  last_offer_user: string;

  agreed_price: number;
  agreed_date: string;
  notes: string;

  agreement_state: "NEGOTIATION" | "ACCEPTED" | "CANCELED" | "FINISHED";
  client_offer_status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  provider_offer_status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";

  finished?: string;
  canceled?: string;

  requested: string;
  updated_at: string;

  // Supabase joined data
  client_profile?: User;
  service_detail?: Service;
};
