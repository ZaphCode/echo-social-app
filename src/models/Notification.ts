import { User } from "./User";

export type Notification = {
  id: string;
  user: string; // fk: User ID
  message: string;
  type:
    | "PROVIDER:NEW_REQUEST"
    | "CLIENT:NEW_OFFER"
    | "PROVIDER:NEW_OFFER"
    | "SYSTEM:INFO";
  read: boolean;
  created: string;
  updated: string;

  expand?: {
    user: User;
  };
};
