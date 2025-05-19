import { User } from "./User";

export type Notification = {
  id: string;
  user: string; // fk: User ID
  message: string;
  type: string; // TODO: define specific notification types (e.g., "offer", "message", "status", "review")
  read: boolean;
  created: string;
  updated: string;

  expand?: {
    user: User;
  };
};
