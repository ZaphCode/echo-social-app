import { Category } from "@/models/Category";
import { ClientProfile } from "@/models/ClientProfile";
import { Message } from "@/models/Message";
import { Notification } from "@/models/Notification";
import { ProviderProfile } from "@/models/ProviderProfile";
import { Review } from "@/models/Review";
import { Service } from "@/models/Service";
import { ServiceRequest } from "@/models/ServiceRequest";
import { User } from "@/models/User";

export type PBCollectionsMap = {
  users: User;
  service_category: Category;
  service: Service;
  service_request: ServiceRequest;
  notification: Notification;
  message: Message;
  review: Review;
  client_profile: ClientProfile;
  provider_profile: ProviderProfile;
};
