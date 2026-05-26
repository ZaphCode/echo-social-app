import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listReviewsByReviewerAndContracting,
  listReviewsByReviewerAndService,
  reviewsKeys,
} from "@/api/reviews";
import { User } from "@/models/User";
import { ServiceRequest } from "@/models/ServiceRequest";
import { NegotiationSubject } from "@/utils/negotiationSubject";

export default function useCheckReviews(
  authUser: User,
  request: ServiceRequest,
  subject: NegotiationSubject
) {
  const [optimisticHasReviewed, setOptimisticHasReviewed] = useState(false);
  const reviewsQuery = useQuery({
    queryKey:
      subject.type === "service"
        ? reviewsKeys.byReviewerAndService(authUser.id, subject.id)
        : reviewsKeys.byReviewerAndContracting(authUser.id, subject.id),
    queryFn: () =>
      subject.type === "service"
        ? listReviewsByReviewerAndService(authUser.id, subject.id)
        : listReviewsByReviewerAndContracting(authUser.id, subject.id),
    enabled: !!authUser.id && !!subject.id,
  });

  const hasReviewed = optimisticHasReviewed || (reviewsQuery.data?.length ?? 0) > 0;

  const markAsReviewed = () => {
    setOptimisticHasReviewed(true);
    reviewsQuery.refetch();
  };

  return { hasReviewed, markAsReviewed };
}
