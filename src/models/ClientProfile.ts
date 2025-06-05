import { User } from "./User";

export type ClientProfile = {
  id: string;
  user: string; // fk: User ID
  phone: string;
  state: string;
  city: string;
  address: string;
  zip: string;
  updated: string;
  created: string;
  location?: {
    lat: number;
    lon: number;
  };

  expand?: {
    user: User;
  };
};
