import { User } from "./User";

export type Notification = {
  id: string;
  user: string; // fk: User ID
  message: string;
  //   type: "message" | "new_request" | "request_accepted" | "request_rejected";
  read: boolean;
  created: string;
  updated: string;

  expand?: {
    user: User;
  };
};
