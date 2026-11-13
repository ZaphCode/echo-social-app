import { useEffect } from "react";
import { AppState } from "react-native";
import * as Loc from "expo-location";
import { create } from "zustand";

import { useAuthCtx } from "@/context/Auth";
import { supabase } from "@/lib/supabase";
import { getOfflineNetworkState } from "@/offline/network";
import { Coords, distanceKm, isValidCoords } from "@/utils/geo";
import { logError } from "@/utils/testing";

type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

type UserLocationState = {
  deviceCoords: Coords | null;
  status: LocationStatus;
  canAskAgain: boolean;
  /**
   * Reads the device position. Only shows the OS permission prompt when
   * `request` is true; never shows an in-app alert.
   */
  refresh: (options?: { request?: boolean }) => Promise<Coords | null>;
};

const toCoords = (position: Loc.LocationObject | null): Coords | null =>
  position
    ? { lat: position.coords.latitude, lon: position.coords.longitude }
    : null;

let inFlight: Promise<Coords | null> | null = null;

const useUserLocationStore = create<UserLocationState>()((set, get) => ({
  deviceCoords: null,
  status: "idle",
  canAskAgain: true,
  refresh: (options) => {
    if (inFlight) return inFlight;

    inFlight = (async () => {
      if (get().status === "idle") set({ status: "loading" });

      try {
        let permission = await Loc.getForegroundPermissionsAsync();

        if (
          permission.status !== "granted" &&
          options?.request &&
          permission.canAskAgain
        ) {
          permission = await Loc.requestForegroundPermissionsAsync();
        }

        if (permission.status !== "granted") {
          set({ status: "denied", canAskAgain: permission.canAskAgain });
          return null;
        }

        const lastKnown = toCoords(
          await Loc.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000 })
        );
        if (lastKnown) {
          set({ deviceCoords: lastKnown, status: "granted", canAskAgain: true });
        }

        const current = toCoords(
          await Loc.getCurrentPositionAsync({ accuracy: Loc.Accuracy.Balanced })
        );
        const coords = current ?? lastKnown;

        set({
          deviceCoords: coords ?? get().deviceCoords,
          status: coords ? "granted" : "unavailable",
          canAskAgain: true,
        });

        return coords;
      } catch (error) {
        logError(error);
        set({ status: get().deviceCoords ? "granted" : "unavailable" });
        return get().deviceCoords;
      } finally {
        inFlight = null;
      }
    })();

    return inFlight;
  },
}));

/**
 * The best known position of the signed-in user: the device position when
 * permission was granted, otherwise the (approximate) location saved on the
 * profile at sign-up, otherwise null.
 */
export default function useUserLocation() {
  const { user } = useAuthCtx();
  const deviceCoords = useUserLocationStore((state) => state.deviceCoords);
  const status = useUserLocationStore((state) => state.status);
  const canAskAgain = useUserLocationStore((state) => state.canAskAgain);
  const refresh = useUserLocationStore((state) => state.refresh);

  const profileCoords = isValidCoords(user.location) ? user.location : null;

  return {
    coords: deviceCoords ?? profileCoords,
    source: deviceCoords ? "device" : profileCoords ? "profile" : null,
    status,
    canAskAgain,
    refresh,
  } as const;
}

const PROVIDER_LOCATION_UPDATE_KM = 1;

/**
 * Mount once inside the authenticated area. Asks for the position on mount,
 * re-reads it when the app returns to the foreground and keeps providers'
 * profile location fresh so their services sort correctly for clients.
 */
export function useSyncUserLocation() {
  const { user } = useAuthCtx();
  const refresh = useUserLocationStore((state) => state.refresh);

  useEffect(() => {
    if (!user.id) return;

    const syncProviderLocation = async (coords: Coords | null) => {
      if (!coords || user.role !== "provider" || !getOfflineNetworkState()) {
        return;
      }

      const saved = isValidCoords(user.location) ? user.location : null;
      const moved = distanceKm(saved, coords);
      if (saved && moved !== null && moved < PROVIDER_LOCATION_UPDATE_KM) {
        return;
      }

      // The database snaps this to a ~500 m grid (snap_profile_location).
      const { error } = await supabase
        .from("profiles")
        .update({ location: coords })
        .eq("id", user.id);
      if (error) logError(error);
    };

    refresh({ request: true }).then(syncProviderLocation);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh().then(syncProviderLocation);
    });

    return () => subscription.remove();
  }, [user.id, user.role]);
}
