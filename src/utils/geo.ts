export type Coords = {
  lat: number;
  lon: number;
};

export type MapBounds = {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
};

const EARTH_RADIUS_KM = 6371;

// Keep in sync with public.distance_bucket in
// supabase/migrations/20261113053258_add_geolocation.sql
const BUCKET_LIMITS_KM = [2, 10, 30, 100];
export const UNKNOWN_DISTANCE_BUCKET = BUCKET_LIMITS_KM.length + 1;

/** Radius (meters) the map draws around a public, snapped location. */
export const APPROXIMATE_RADIUS_M = 500;

// Same grid as public.snap_coord (~550 m).
const SNAP_STEP_DEG = 0.005;

/** Mirrors public.snap_coord so offline copies never hold exact points. */
export function snapCoords(coords: Coords): Coords {
  const snap = (value: number) =>
    Number((Math.round(value / SNAP_STEP_DEG) * SNAP_STEP_DEG).toFixed(3));
  return { lat: snap(coords.lat), lon: snap(coords.lon) };
}

export function isValidCoords(value: unknown): value is Coords {
  if (!value || typeof value !== "object") return false;
  const { lat, lon } = value as Partial<Coords>;
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  );
}

/** Builds coords from nullable lat/lon columns. */
export function toCoords(
  lat: number | null | undefined,
  lon: number | null | undefined
): Coords | null {
  const coords = { lat, lon };
  return isValidCoords(coords) ? coords : null;
}

export function haversineKm(a: Coords, b: Coords) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function distanceKm(
  origin: Coords | null | undefined,
  target: Coords | null | undefined
) {
  if (!origin || !target) return null;
  return haversineKm(origin, target);
}

export function distanceBucket(km: number | null) {
  if (km === null || !Number.isFinite(km)) return UNKNOWN_DISTANCE_BUCKET;
  const index = BUCKET_LIMITS_KM.findIndex((limit) => km < limit);
  return index === -1 ? BUCKET_LIMITS_KM.length : index;
}

/**
 * Orders by distance bucket first and recency second, mirroring the
 * list_*_nearby RPCs. Without an origin every item shares a bucket, so the
 * result is plain newest-first. Array.prototype.sort is stable, so items
 * with equal keys keep their incoming order.
 */
export function sortByProximity<T>(
  items: T[],
  origin: Coords | null | undefined,
  getCoords: (item: T) => Coords | null,
  getCreatedAt: (item: T) => string
) {
  const keyed = items.map((item) => ({
    item,
    bucket: origin
      ? distanceBucket(distanceKm(origin, getCoords(item)))
      : 0,
    time: Date.parse(getCreatedAt(item)) || 0,
  }));

  keyed.sort((a, b) => a.bucket - b.bucket || b.time - a.time);

  return keyed.map(({ item }) => item);
}

export function formatDistance(km: number | null) {
  if (km === null || !Number.isFinite(km)) return null;
  if (km < 1) {
    return `a ${Math.max(100, Math.round((km * 1000) / 100) * 100)} m`;
  }
  if (km < 10) return `a ${km.toFixed(1)} km`;
  return `a ${Math.round(km)} km`;
}

/** Rounds coords for query keys so tiny GPS jitter does not refetch. */
export function roundForKey(coords: Coords | null | undefined) {
  if (!coords) return null;
  return `${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}`;
}

/**
 * Visible bounds for a map region (center + deltas in degrees), padded by
 * `margin` on each side so small pans do not trigger a refetch.
 */
export function boundsFromRegion(
  center: Coords,
  latitudeDelta: number,
  longitudeDelta: number,
  margin = 0.25
): MapBounds {
  const latHalf = (Math.abs(latitudeDelta) * (1 + margin * 2)) / 2;
  const lonHalf = (Math.abs(longitudeDelta) * (1 + margin * 2)) / 2;

  return {
    minLat: Math.max(-90, center.lat - latHalf),
    maxLat: Math.min(90, center.lat + latHalf),
    minLon: Math.max(-180, center.lon - lonHalf),
    maxLon: Math.min(180, center.lon + lonHalf),
  };
}

export function roundBoundsForKey(bounds: MapBounds) {
  return [bounds.minLat, bounds.minLon, bounds.maxLat, bounds.maxLon]
    .map((value) => value.toFixed(2))
    .join(",");
}
