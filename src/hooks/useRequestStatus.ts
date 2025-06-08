import { useNegotiationCtx } from "@/context/Negotiation";
import { User } from "@/models/User";
import * as NS from "@/utils/negotiation";
import useMutate from "./useMutate";
import useJobsDone from "./useJobsDone";

export default function useRequestStatus(authUser: User) {
  const { request, client, provider } = useNegotiationCtx();

  const { addJob } = useJobsDone(provider);

  const { update } = useMutate("service_request", {
    expand: "service.provider",
  });

  async function setUserToAgreed() {
    if (authUser.id === client.id) {
      if (NS.providerAgreed(request)) {
        await update(request.id, {
          client_offer_status: "ACCEPTED",
          agreement_state: "ACCEPTED",
        });
      } else {
        await update(request.id, { client_offer_status: "ACCEPTED" });
      }
    } else {
      if (NS.clientAgreed(request)) {
        await update(request.id, {
          provider_offer_status: "ACCEPTED",
          agreement_state: "ACCEPTED",
        });
      } else {
        await update(request.id, { provider_offer_status: "ACCEPTED" });
      }
    }
  }

  async function setUserToRejected() {
    if (authUser.id === client.id) {
      if (NS.providerRejected(request)) {
        await update(request.id, {
          client_offer_status: "REJECTED",
          agreement_state: "CANCELED",
          canceled: new Date().toISOString(),
        });
      } else {
        await update(request.id, { client_offer_status: "REJECTED" });
      }
    } else {
      if (NS.clientRejected(request)) {
        await update(request.id, {
          provider_offer_status: "REJECTED",
          agreement_state: "CANCELED",
          canceled: new Date().toISOString(),
        });
      } else {
        await update(request.id, { provider_offer_status: "REJECTED" });
      }
    }
  }

  async function setUserToCompleted() {
    if (authUser.id === client.id) {
      if (NS.providerMarkedCompleted(request)) {
        await update(request.id, {
          client_offer_status: "COMPLETED",
          agreement_state: "FINISHED",
          finished: new Date().toISOString(),
        });
        await addJob();
      } else {
        await update(request.id, { client_offer_status: "COMPLETED" });
      }
    } else {
      if (NS.clientMarkedCompleted(request)) {
        await update(request.id, {
          provider_offer_status: "COMPLETED",
          agreement_state: "FINISHED",
          finished: new Date().toISOString(),
        });
        await addJob();
      } else {
        await update(request.id, { provider_offer_status: "COMPLETED" });
      }
    }
  }

  return { setUserToAgreed, setUserToRejected, setUserToCompleted };
}
