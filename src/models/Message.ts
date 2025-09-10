import { ServiceRequest } from "./ServiceRequest";
import { User } from "./User";

export type Message = {
  id: string;
  request: string; // fk: ServiceRequest ID
  sender: string; // fk: User ID
  content: string;
  created: string;
  updated: string;

  expand?: {
    request: ServiceRequest;
    sender: User;
    receiver: User;
  };
};
