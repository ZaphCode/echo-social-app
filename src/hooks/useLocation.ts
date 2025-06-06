import { useCallback, useEffect, useState } from "react";
import * as Loc from "expo-location";
import { Alert } from "react-native";

export default function useLocation(autoFetch: boolean = false) {
  const [coords, setCoords] = useState<Loc.LocationObjectCoords | null>(null);
  const [address, setAddress] = useState<Loc.LocationGeocodedAddress | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Loc.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permiso denegado para acceder a la ubicación.");
        Alert.alert("Permiso denegado", "Se requiere acceso a la ubicación.");
        setLoading(false);
        return;
      }
      const location = await Loc.getCurrentPositionAsync({});
      setCoords(location.coords);

      const { latitude, longitude } = location.coords;
      const geocoded = await Loc.reverseGeocodeAsync({ latitude, longitude });
      setAddress(geocoded[0] || null);
    } catch (err) {
      setError("No se pudo obtener la ubicación.");
      setCoords(null);
      setAddress(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoFetch) fetchLocation();
  }, [autoFetch, fetchLocation]);

  return {
    coords,
    address,
    loading,
    error,
    fetchLocation,
  };
}
