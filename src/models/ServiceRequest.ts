import { Service } from "./Service";
import { User } from "./User";

export type ServiceRequest = {
  id: string;
  client: string; // User ID of the client
  service: string; // Service ID of the requested service
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
  updated: string;

  expand?: {
    client: User;
    service: Service;
  };
};
