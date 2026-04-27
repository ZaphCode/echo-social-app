import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listReviewsByReviewerAndService, reviewsKeys } from "@/api/reviews";
import { User } from "@/models/User";
import { ServiceRequest } from "@/models/ServiceRequest";

export default function useCheckReviews(
  authUser: User,
  request: ServiceRequest
) {
  const [optimisticHasReviewed, setOptimisticHasReviewed] = useState(false);
  const reviewsQuery = useQuery({
    queryKey: reviewsKeys.byReviewerAndService(authUser.id, request.service),
    queryFn: () => listReviewsByReviewerAndService(authUser.id, request.service),
    enabled: !!authUser.id && !!request.service,
  });

  const hasReviewed = optimisticHasReviewed || (reviewsQuery.data?.length ?? 0) > 0;

  const markAsReviewed = () => {
    setOptimisticHasReviewed(true);
    reviewsQuery.refetch();
  };

  return { hasReviewed, markAsReviewed };
}
