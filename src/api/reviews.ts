import { supabase } from "@/lib/supabase";
import { Review } from "@/models/Review";
import { throwIfError } from "./common";
import { ReviewWithProfiles } from "./types";
import { getOfflineNetworkState, isLikelyNetworkError } from "@/offline/network";
import {
  cacheReviews,
  listCachedReviewsByReviewerAndContracting,
  listCachedReviewsByReviewerAndService,
  listCachedServiceReviews,
} from "@/offline/store";

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
  if (!getOfflineNetworkState()) {
    return listCachedServiceReviews(serviceId);
  }

  try {
    const { data, error } = await supabase
      .from("review")
      .select(reviewSelect)
      .eq("service", serviceId);

    throwIfError(error);

    const reviews = (data ?? []) as ReviewWithProfiles[];
    await cacheReviews(reviews);

    return reviews;
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return listCachedServiceReviews(serviceId);
    }

    throw error;
  }
}

export async function getServiceReviewSummary(serviceId: string) {
  if (!getOfflineNetworkState()) {
    const cached = await listCachedServiceReviews(serviceId);
    return summarizeRatings(cached);
  }

  try {
    const { data, error } = await supabase
      .from("review")
      .select("rating")
      .eq("service", serviceId);

    throwIfError(error);

    return summarizeRatings((data ?? []) as Pick<Review, "rating">[]);
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      const cached = await listCachedServiceReviews(serviceId);
      return summarizeRatings(cached);
    }

    throw error;
  }
}

export async function listReviewsByReviewerAndService(
  reviewerId: string,
  serviceId: string
) {
  if (!getOfflineNetworkState()) {
    return listCachedReviewsByReviewerAndService(reviewerId, serviceId);
  }

  try {
    const { data, error } = await supabase
      .from("review")
      .select(reviewSelect)
      .eq("reviewer", reviewerId)
      .eq("service", serviceId);

    throwIfError(error);

    const reviews = (data ?? []) as ReviewWithProfiles[];
    await cacheReviews(reviews);

    return reviews;
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return listCachedReviewsByReviewerAndService(reviewerId, serviceId);
    }

    throw error;
  }
}

export async function listReviewsByReviewerAndContracting(
  reviewerId: string,
  contractingId: string
) {
  if (!getOfflineNetworkState()) {
    return listCachedReviewsByReviewerAndContracting(
      reviewerId,
      contractingId
    );
  }

  try {
    const { data, error } = await supabase
      .from("review")
      .select(reviewSelect)
      .eq("reviewer", reviewerId)
      .eq("contracting", contractingId);

    throwIfError(error);

    const reviews = (data ?? []) as ReviewWithProfiles[];
    await cacheReviews(reviews);

    return reviews;
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return listCachedReviewsByReviewerAndContracting(
        reviewerId,
        contractingId
      );
    }

    throw error;
  }
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

function summarizeRatings(reviews: Pick<Review, "rating">[]) {
  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    average: totalRating / reviews.length,
    count: reviews.length,
  };
}
