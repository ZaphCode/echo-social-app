import { useMemo } from "react";
import useList from "./useList";

export default function useStats(userId: string) {
  const [reviews, reviewsFetch] = useList("review", {
    filter: `reviewed = "${userId}"`,
  });

  const [requests, requestsFetch] = useList("service_request", {
    expand: "service, service.provider",
    filter: `(client = "${userId}" || service.provider = "${userId}") && agreement_state = "FINISHED"`,
  });

  const requestsDone = useMemo(() => {
    if (requestsFetch.status !== "success") return 0;

    return requests.length;
  }, [requests, requestsFetch]);

  const reviewsCount = useMemo(() => {
    if (reviewsFetch.status !== "success") return 0;

    return reviews.length;
  }, [reviews, reviewsFetch]);

  const rating = useMemo(() => {
    if (reviewsFetch.status !== "success") return 0;

    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

    return totalRating / reviews.length;
  }, [reviews, reviewsFetch]);

  return { rating, reviewsCount, requestsDone };
}
