import { Category } from "@/models/Category";
import { Service } from "@/models/Service";
import { User } from "@/models/User";

export type PBCollectionsMap = {
  users: User;
  service_category: Category;
  service: Service;
};
