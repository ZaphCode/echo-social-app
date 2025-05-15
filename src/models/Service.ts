import { Category } from "./Category";
import { User } from "./User";

export type Service = {
  id: string;
  provider: string; // fk: User ID
  category: string; // fk: Category ID
  name: string;
  description: string;
  base_price: number;
  photos: string[];
  created: string;
  updated: string;

  expand?: {
    provider: User;
    category: Category;
  };
};
