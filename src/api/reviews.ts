import { supabase } from "@/lib/supabase";
import { Review } from "@/models/Review";
import { throwIfError } from "./common";
import { ReviewWithProfiles } from "./types";

const reviewSelect =
  "*, reviewer_profile:profiles!reviewer(*), reviewed_profile:profiles!reviewed(*)";

export const reviewsKeys = {
  all: ["reviews"] as const,
  byService: (serviceId: string) => ["reviews", "service", serviceId] as const,
  byReviewerAndService: (reviewerId: string, serviceId: string) =>
    ["reviews", "reviewer", reviewerId, "service", serviceId] as const,
  byReviewedUser: (userId: string) => ["reviews", "reviewed", userId] as const,
};

export type CreateReviewInput = Pick<
  Review,
  "service" | "reviewer" | "reviewed" | "rating" | "comment" | "type"
>;

export async function listServiceReviews(serviceId: string) {
  const { data, error } = await supabase
    .from("review")
    .select(reviewSelect)
    .eq("service", serviceId);

  throwIfError(error);

  return (data ?? []) as ReviewWithProfiles[];
}

export async function listReviewsByReviewerAndService(
  reviewerId: string,
  serviceId: string
) {
  const { data, error } = await supabase
    .from("review")
    .select(reviewSelect)
    .eq("reviewer", reviewerId)
    .eq("service", serviceId);

  throwIfError(error);

  return (data ?? []) as ReviewWithProfiles[];
}

export async function listReviewsForUser(userId: string) {
  const { data, error } = await supabase
    .from("review")
    .select(reviewSelect)
    .eq("reviewed", userId);

  throwIfError(error);

  return (data ?? []) as ReviewWithProfiles[];
}

export async function createReview(input: CreateReviewInput) {
  const { data, error } = await supabase
    .from("review")
    .insert(input)
    .select(reviewSelect)
    .single();

  throwIfError(error);

  return data as ReviewWithProfiles;
}
