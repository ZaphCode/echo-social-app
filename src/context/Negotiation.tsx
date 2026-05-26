import { ServiceRequestWithRelations, ServiceWithProvider } from "@/api/types";
import { NegotiationSubject } from "@/utils/negotiationSubject";
import { User } from "@/models/User";
import { createContext, useContext, useState } from "react";

type NegotiationContextType = {
  request: ServiceRequestWithRelations;
  client: User;
  provider: User;
  service?: ServiceWithProvider | null;
  subject: NegotiationSubject;
  setRequest: (request: ServiceRequestWithRelations) => void;
};

const NegotiationContext = createContext<NegotiationContextType>(
  {} as NegotiationContextType
);

type Props = {
  initialRequest: ServiceRequestWithRelations;
  service?: ServiceWithProvider | null;
  subject: NegotiationSubject;
  client: User;
  provider: User;
  children: React.ReactNode;
};

export const NegotiationProvider = ({
  initialRequest,
  service,
  subject,
  client,
  provider,
  children,
}: Props) => {
  const [request, setRequest] =
    useState<ServiceRequestWithRelations>(initialRequest);

  return (
    <NegotiationContext.Provider
      value={{ request, client, provider, service, subject, setRequest }}
    >
      {children}
    </NegotiationContext.Provider>
  );
};

export const useNegotiationCtx = () => {
  return useContext(NegotiationContext);
};
