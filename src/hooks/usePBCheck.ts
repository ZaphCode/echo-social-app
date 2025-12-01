import { Alert } from "react-native";
import { useEffect } from "react";
import { pb } from "@/lib/pocketbase";

export default function usePBCheck() {
  useEffect(() => {
    pb.health.check().catch((err) => {
      console.log("PocketBase is down!");
      Alert.alert(
        "El servidor está caído",
        "Probablemente el enlace a la api esté roto en tu dispositivo o el servidor esté inactivo. Intenta nuevamente más tarde.\nSi quiere realizar pruebas, solicite a un desarrollador y le brindaremos una api alternativa.",
        [
          { text: "Cerrar" },
          {
            text: "Solicitar",
            isPreferred: true,
            onPress: () => {
              Alert.prompt(
                "Nueva API",
                "Ingrese la nueva URL de la API de PocketBase:",
                [
                  {
                    text: "Cancelar",
                    style: "cancel",
                  },
                  {
                    text: "Aceptar",
                    isPreferred: true,
                    onPress: (url) => {
                      if (url) {
                        pb.settings.client.baseURL = url;
                        Alert.alert(
                          "URL actualizada",
                          `La nueva URL de la API es: ${pb.settings.client.baseURL}`
                        );
                      }
                    },
                  },
                ],
                "plain-text",
                "https://"
              );
            },
          },
        ]
      );
    });
  }, []);
}
