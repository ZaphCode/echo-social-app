import PocketBase, { AsyncAuthStore } from "pocketbase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import eventsource from "react-native-sse";
import { Platform } from "react-native";

(global as any).EventSource = eventsource;

let POCKETBASE_URL;

if (__DEV__) {
  if (Platform.OS === "ios") POCKETBASE_URL = "http://localhost:8090";
  else POCKETBASE_URL = "http://10.0.2.2:8090";
} else {
  POCKETBASE_URL = "https://echo-zaph.pockethost.io/";
}

const store = new AsyncAuthStore({
  save: async (serialized) => AsyncStorage.setItem("pb_auth", serialized),
  initial: AsyncStorage.getItem("pb_auth").then((serialized) => serialized),
  clear: async () => AsyncStorage.removeItem("pb_auth"),
});

export const pb = new PocketBase(POCKETBASE_URL, store);
