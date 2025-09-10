import { useEffect, useState } from "react";
import useList from "./useList";
import { User } from "@/models/User";
import { ServiceRequest } from "@/models/ServiceRequest";

export default function useCheckReviews(
  authUser: User,
  request: ServiceRequest
) {
  const [hasReviewed, setHasReviewed] = useState(false);

  const [reviews, { status }] = useList("review", {
    filter: `reviewer = "${authUser.id}" && service = "${request.service}"`,
  });

  useEffect(() => {
    console.log("Checking reviews:", status, reviews);

    if (status === "success" && reviews.length > 0) {
      setHasReviewed(true);
    }
  }, [status, reviews]);

  const markAsReviewed = () => {
    setHasReviewed(true);
  };

  return { hasReviewed, markAsReviewed };
}
