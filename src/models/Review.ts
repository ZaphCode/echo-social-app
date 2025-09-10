import { Service } from "./Service";
import { User } from "./User";

export type Review = {
  id: string;
  service: string; // fk: Service ID
  reviewer: string; // fk: User ID
  reviewed: string; // fk: User ID
  comment: string;
  rating: number; // 1-5
  created: string;
  updated: string;

  expand?: {
    service: Service;
    reviewer: User;
    reviewed: User;
  };
};
