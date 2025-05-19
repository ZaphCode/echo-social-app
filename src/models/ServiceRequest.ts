import { Service } from "./Service";
import { User } from "./User";

export type ServiceRequest = {
  id: string;
  client: string; // fk: User ID
  service: string; // fk: Service ID
  notes: string;
  status: "PENDING" | "accepted" | "rejected" | "completed";
  client_agrees: boolean;
  provider_agrees: boolean;
  agreed_price: number;
  agreed_date: string;
  requested: string;
  updated: string;

  expand?: {
    client: User;
    service: Service;
  };
};
