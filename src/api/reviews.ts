import { supabase } from "@/lib/supabase";
import { Review } from "@/models/Review";
import { throwIfError } from "./common";
import { ReviewWithProfiles } from "./types";

const reviewSelect =
  "*, reviewer_profile:profiles!reviewer(*), reviewed_profile:profiles!reviewed(*)";

export const reviewsKeys = {
  all: ["reviews"] as const,
  byService: (serviceId: string) => ["reviews", "service", serviceId] as const,
  serviceSummary: (serviceId: string) =>
    ["reviews", "service", serviceId, "summary"] as const,
  byReviewerAndService: (reviewerId: string, serviceId: string) =>
    ["reviews", "reviewer", reviewerId, "service", serviceId] as const,
  byReviewerAndContracting: (reviewerId: string, contractingId: string) =>
    ["reviews", "reviewer", reviewerId, "contracting", contractingId] as const,
  byReviewedUser: (userId: string) => ["reviews", "reviewed", userId] as const,
};

export type CreateReviewInput = Pick<
  Review,
  "reviewer" | "reviewed" | "rating" | "comment" | "type"
> &
  Partial<Pick<Review, "service" | "contracting" | "request">>;

export async function listServiceReviews(serviceId: string) {
  const { data, error } = await supabase
    .from("review")
    .select(reviewSelect)
    .eq("service", serviceId);

  throwIfError(error);

  return (data ?? []) as ReviewWithProfiles[];
}

export async function getServiceReviewSummary(serviceId: string) {
  const { data, error } = await supabase
    .from("review")
    .select("rating")
    .eq("service", serviceId);

  throwIfError(error);

  const reviews = (data ?? []) as Pick<Review, "rating">[];

  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    average: totalRating / reviews.length,
    count: reviews.length,
  };
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

export async function listReviewsByReviewerAndContracting(
  reviewerId: string,
  contractingId: string
) {
  const { data, error } = await supabase
    .from("review")
    .select(reviewSelect)
    .eq("reviewer", reviewerId)
    .eq("contracting", contractingId);

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
