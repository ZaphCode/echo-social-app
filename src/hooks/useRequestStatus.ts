import { useNegotiationCtx } from "@/context/Negotiation";
import { User } from "@/models/User";
import * as NS from "@/utils/negotiation";
import useJobsDone from "./useJobsDone";
import { updateServiceRequest } from "@/api/serviceRequests";

export default function useRequestStatus(authUser: User) {
  const { request, client, provider } = useNegotiationCtx();

  const { addJob } = useJobsDone(provider);

  async function setUserToAgreed() {
    if (authUser.id === client.id) {
      if (NS.providerAgreed(request)) {
        await updateServiceRequest(request.id, {
          client_offer_status: "ACCEPTED",
          agreement_state: "ACCEPTED",
        });
      } else {
        await updateServiceRequest(request.id, {
          client_offer_status: "ACCEPTED",
        });
      }
    } else {
      if (NS.clientAgreed(request)) {
        await updateServiceRequest(request.id, {
          provider_offer_status: "ACCEPTED",
          agreement_state: "ACCEPTED",
        });
      } else {
        await updateServiceRequest(request.id, {
          provider_offer_status: "ACCEPTED",
        });
      }
    }
  }

  async function setUserToRejected() {
    if (authUser.id === client.id) {
      if (NS.providerRejected(request)) {
        await updateServiceRequest(request.id, {
          client_offer_status: "REJECTED",
          agreement_state: "CANCELED",
          canceled: new Date().toISOString(),
        });
      } else {
        await updateServiceRequest(request.id, {
          client_offer_status: "REJECTED",
        });
      }
    } else {
      if (NS.clientRejected(request)) {
        await updateServiceRequest(request.id, {
          provider_offer_status: "REJECTED",
          agreement_state: "CANCELED",
          canceled: new Date().toISOString(),
        });
      } else {
        await updateServiceRequest(request.id, {
          provider_offer_status: "REJECTED",
        });
      }
    }
  }

  async function setUserToCompleted() {
    if (authUser.id === client.id) {
      if (NS.providerMarkedCompleted(request)) {
        await updateServiceRequest(request.id, {
          client_offer_status: "COMPLETED",
          agreement_state: "FINISHED",
          finished: new Date().toISOString(),
        });
        await addJob();
      } else {
        await updateServiceRequest(request.id, {
          client_offer_status: "COMPLETED",
        });
      }
    } else {
      if (NS.clientMarkedCompleted(request)) {
        await updateServiceRequest(request.id, {
          provider_offer_status: "COMPLETED",
          agreement_state: "FINISHED",
          finished: new Date().toISOString(),
        });
        await addJob();
      } else {
        await updateServiceRequest(request.id, {
          provider_offer_status: "COMPLETED",
        });
      }
    }
  }

  return { setUserToAgreed, setUserToRejected, setUserToCompleted };
}
