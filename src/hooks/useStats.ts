import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listReviewsForUser, reviewsKeys } from "@/api/reviews";
import {
  listFinishedRequestsForUser,
  serviceRequestsKeys,
} from "@/api/serviceRequests";

export default function useStats(userId: string) {
  const reviewsQuery = useQuery({
    queryKey: reviewsKeys.byReviewedUser(userId),
    queryFn: () => listReviewsForUser(userId),
    enabled: !!userId,
  });

  const requestsQuery = useQuery({
    queryKey: serviceRequestsKeys.finishedForUser(userId),
    queryFn: () => listFinishedRequestsForUser(userId),
    enabled: !!userId,
  });

  const requestsDone = useMemo(() => {
    if (!requestsQuery.isSuccess) return 0;

    return requestsQuery.data.length;
  }, [requestsQuery.data, requestsQuery.isSuccess]);

  const reviewsCount = useMemo(() => {
    if (!reviewsQuery.isSuccess) return 0;

    return reviewsQuery.data.length;
  }, [reviewsQuery.data, reviewsQuery.isSuccess]);

  const rating = useMemo(() => {
    if (!reviewsQuery.isSuccess) return 0;

    if (reviewsQuery.data.length === 0) return 0;

    const totalRating = reviewsQuery.data.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return totalRating / reviewsQuery.data.length;
  }, [reviewsQuery.data, reviewsQuery.isSuccess]);

  return { rating, reviewsCount, requestsDone };
}
