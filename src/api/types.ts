import { Category } from "@/models/Category";
import { ClientProfile } from "@/models/ClientProfile";
import { Contracting } from "@/models/Contracting";
import { Message } from "@/models/Message";
import { Notification } from "@/models/Notification";
import { ProviderProfile } from "@/models/ProviderProfile";
import { Review } from "@/models/Review";
import { Service } from "@/models/Service";
import { ServiceRequest } from "@/models/ServiceRequest";
import { User } from "@/models/User";

export type ServiceWithProvider = Service & {
  provider_profile: User;
};

export type ServiceWithProviderAndCategory = ServiceWithProvider & {
  category_detail: Category;
};

export type ContractingWithOwner = Contracting & {
  owner_profile: User;
};

export type ContractingWithOwnerAndCategory = ContractingWithOwner & {
  category_detail: Category;
};

export type ServiceRequestWithRelations = ServiceRequest & {
  service_detail?: ServiceWithProvider | null;
  contracting_detail?: ContractingWithOwner | null;
  client_profile: User;
  provider_profile: User;
};

export type ReviewWithProfiles = Review & {
  reviewer_profile: User;
  reviewed_profile: User;
};

export type MessageWithSender = Message & {
  sender_profile: User;
};

export type NotificationWithUser = Notification & {
  user_profile: User | null;
};

export type ClientProfileWithUser = ClientProfile & {
  user_profile: User;
};

export type ProviderProfileWithCategory = ProviderProfile & {
  user_profile: User;
  specialty_category: Category;
};

export type ProfileDetails = ClientProfileWithUser | ProviderProfileWithCategory;
