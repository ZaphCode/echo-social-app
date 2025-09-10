import { Service } from "@/models/Service";
import { ServiceRequest } from "@/models/ServiceRequest";
import { User } from "@/models/User";
import { createContext, useContext, useState } from "react";

type NegotiationContextType = {
  request: ServiceRequest;
  client: User;
  provider: User;
  service: Service;
  setRequest: (request: ServiceRequest) => void;
};

const NegotiationContext = createContext<NegotiationContextType>(
  {} as NegotiationContextType
);

type Props = {
  initialRequest: ServiceRequest;
  service: Service;
  client: User;
  provider: User;
  children: React.ReactNode;
};

export const NegotiationProvider = ({
  initialRequest,
  service,
  client,
  provider,
  children,
}: Props) => {
  const [request, setRequest] = useState<ServiceRequest>(initialRequest);

  return (
    <NegotiationContext.Provider
      value={{ request, client, provider, service, setRequest }}
    >
      {children}
    </NegotiationContext.Provider>
  );
};

export const useNegotiationCtx = () => {
  return useContext(NegotiationContext);
};
