import PocketBase, { AsyncAuthStore } from "pocketbase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const POCKETBASE_URL = "http://localhost:8090/";

const store = new AsyncAuthStore({
  save: async (serialized) => AsyncStorage.setItem("pb_auth", serialized),
  initial: AsyncStorage.getItem("pb_auth").then((serialized) => serialized),
  clear: async () => AsyncStorage.removeItem("pb_auth"),
});

export const pb = new PocketBase(POCKETBASE_URL, store);
