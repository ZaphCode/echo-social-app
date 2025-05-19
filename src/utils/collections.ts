import { Category } from "@/models/Category";
import { Notification } from "@/models/Notification";
import { Service } from "@/models/Service";
import { ServiceRequest } from "@/models/ServiceRequest";
import { User } from "@/models/User";

export type PBCollectionsMap = {
  users: User;
  service_category: Category;
  service: Service;
  service_request: ServiceRequest;
  notification: Notification;
};
