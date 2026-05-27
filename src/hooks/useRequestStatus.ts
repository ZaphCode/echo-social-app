import { useNegotiationCtx } from "@/context/Negotiation";
import { User } from "@/models/User";
import * as NS from "@/utils/negotiation";
import useJobsDone from "./useJobsDone";
import { serviceRequestsKeys, updateServiceRequest } from "@/api/serviceRequests";
import { createNotification, notificationsKeys } from "@/api/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { contractingsKeys } from "@/api/contractings";

type Options = {
  shouldNotifyCounterparty?: boolean;
};

export default function useRequestStatus(
  authUser: User,
  options: Options = {},
) {
  const { request, client, provider, subject, setRequest } = useNegotiationCtx();
  const queryClient = useQueryClient();

  const { addJob } = useJobsDone(provider);
  const counterparty = authUser.id === client.id ? provider : client;
  const updateCurrentRequest = (patch: Parameters<typeof updateServiceRequest>[1]) =>
    updateServiceRequest(request.id, patch, authUser.id);

  async function notifyCounterparty(action: "accepted" | "rejected") {
    if (!options.shouldNotifyCounterparty) return;

    const actionText = action === "accepted" ? "aceptó" : "rechazó";

    try {
      await createNotification({
        user: counterparty.id,
        message: `*${authUser.name}* ${actionText} la propuesta para *${subject.name}*`,
        type: "SYSTEM:INFO",
        read: false,
        request: request.id,
        service: subject.type === "service" ? subject.id : undefined,
        contracting: subject.type === "contracting" ? subject.id : undefined,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.byUser(counterparty.id),
      });
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.unreadCount(counterparty.id),
      });
    } catch (err) {
      console.log(`Failed to create ${action} notification:`, err);
    }
  }

  async function setUserToAgreed() {
    if (authUser.id === client.id) {
      if (NS.providerAgreed(request)) {
        const updatedRequest = await updateCurrentRequest({
          client_offer_status: "ACCEPTED",
          agreement_state: "ACCEPTED",
        });
        setRequest(updatedRequest);
      } else {
        const updatedRequest = await updateCurrentRequest({
          client_offer_status: "ACCEPTED",
        });
        setRequest(updatedRequest);
      }
    } else {
      if (NS.clientAgreed(request)) {
        const updatedRequest = await updateCurrentRequest({
          provider_offer_status: "ACCEPTED",
          agreement_state: "ACCEPTED",
        });
        setRequest(updatedRequest);
      } else {
        const updatedRequest = await updateCurrentRequest({
          provider_offer_status: "ACCEPTED",
        });
        setRequest(updatedRequest);
      }
    }

    await notifyCounterparty("accepted");
  }

  async function setUserToRejected() {
    if (authUser.id === client.id) {
      if (NS.providerRejected(request)) {
        const updatedRequest = await updateCurrentRequest({
          client_offer_status: "REJECTED",
          agreement_state: "CANCELED",
          canceled: new Date().toISOString(),
        });
        setRequest(updatedRequest);
      } else {
        const updatedRequest = await updateCurrentRequest({
          client_offer_status: "REJECTED",
        });
        setRequest(updatedRequest);
      }
    } else {
      if (NS.clientRejected(request)) {
        const updatedRequest = await updateCurrentRequest({
          provider_offer_status: "REJECTED",
          agreement_state: "CANCELED",
          canceled: new Date().toISOString(),
        });
        setRequest(updatedRequest);
      } else {
        const updatedRequest = await updateCurrentRequest({
          provider_offer_status: "REJECTED",
        });
        setRequest(updatedRequest);
      }
    }

    await notifyCounterparty("rejected");
  }

  async function setUserToCompleted() {
    if (authUser.id === client.id) {
      if (NS.providerMarkedCompleted(request)) {
        const updatedRequest = await updateCurrentRequest({
          client_offer_status: "COMPLETED",
          agreement_state: "FINISHED",
          finished: new Date().toISOString(),
        });
        setRequest(updatedRequest);
        await addJob(request.id);
        await queryClient.invalidateQueries({
          queryKey: serviceRequestsKeys.allForUser(client.id),
        });
        await queryClient.invalidateQueries({
          queryKey: serviceRequestsKeys.allForUser(provider.id),
        });
        if (subject.type === "contracting") {
          await queryClient.invalidateQueries({
            queryKey: contractingsKeys.all,
          });
        }
      } else {
        const updatedRequest = await updateCurrentRequest({
          client_offer_status: "COMPLETED",
        });
        setRequest(updatedRequest);
      }
    } else {
      if (NS.clientMarkedCompleted(request)) {
        const updatedRequest = await updateCurrentRequest({
          provider_offer_status: "COMPLETED",
          agreement_state: "FINISHED",
          finished: new Date().toISOString(),
        });
        setRequest(updatedRequest);
        await addJob(request.id);
        await queryClient.invalidateQueries({
          queryKey: serviceRequestsKeys.allForUser(client.id),
        });
        await queryClient.invalidateQueries({
          queryKey: serviceRequestsKeys.allForUser(provider.id),
        });
        if (subject.type === "contracting") {
          await queryClient.invalidateQueries({
            queryKey: contractingsKeys.all,
          });
        }
      } else {
        const updatedRequest = await updateCurrentRequest({
          provider_offer_status: "COMPLETED",
        });
        setRequest(updatedRequest);
      }
    }
  }

  return { setUserToAgreed, setUserToRejected, setUserToCompleted };
}
