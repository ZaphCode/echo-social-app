import { createContext, useContext, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type AlertParams = {
  title: string;
  message: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onConfirm?: () => void;
  iconColor?: string;
};

type AlertContextType = AlertParams & {
  visible: boolean;
  show: (params: AlertParams) => void;
  hide: () => void;
};

const AlertContext = createContext<AlertContextType>({} as AlertContextType);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alertData, setAlertData] = useState<
    AlertParams & { visible: boolean }
  >({
    title: "",
    message: "",
    icon: "" as keyof typeof MaterialCommunityIcons.glyphMap,
    visible: false,
  });

  const show = (params: AlertParams) => {
    setAlertData({ ...params, visible: true });
  };

  const hide = () => {
    setAlertData({
      title: "",
      message: "",
      icon: "information",
      visible: false,
      onConfirm: undefined,
      iconColor: undefined,
    });
  };

  return (
    <AlertContext.Provider value={{ ...alertData, show, hide }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlertCtx = () => {
  return useContext(AlertContext);
};
