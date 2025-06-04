import { Service } from "./Service";
import { User } from "./User";

export type ServiceRequest = {
  id: string;
  client: string;
  service: string;
  notes: string;
  request_state: "PENDING" | "ACCEPTED" | "CANCELED" | "FINISHED";

  client_offer_status: "PENDING" | "ACCEPTED" | "REJECTED";
  provider_offer_status: "PENDING" | "ACCEPTED" | "REJECTED";

  agreed_price: number;
  agreed_date: string;

  finished?: string;

  requested: string;
  updated: string;

  expand?: {
    client: User;
    service: Service;
  };
};
