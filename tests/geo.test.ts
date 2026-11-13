import { describe, expect, test } from "bun:test";

import {
  boundsFromRegion,
  distanceBucket,
  formatDistance,
  haversineKm,
  isValidCoords,
  roundForKey,
  sortByProximity,
  toCoords,
  UNKNOWN_DISTANCE_BUCKET,
} from "../src/utils/geo";

const CDMX = { lat: 19.4326, lon: -99.1332 };
const GUADALAJARA = { lat: 20.6597, lon: -103.3496 };

type Item = {
  id: string;
  lat: number | null;
  lon: number | null;
  created_at: string;
};

const coordsOf = (item: Item) => toCoords(item.lat, item.lon);
const createdAtOf = (item: Item) => item.created_at;

describe("geo: distancias", () => {
  test("haversine entre CDMX y Guadalajara ≈ 461 km", () => {
    expect(haversineKm(CDMX, GUADALAJARA)).toBeGreaterThan(455);
    expect(haversineKm(CDMX, GUADALAJARA)).toBeLessThan(467);
  });

  test("la distancia a sí mismo es cero", () => {
    expect(haversineKm(CDMX, CDMX)).toBe(0);
  });

  test("valida coordenadas", () => {
    expect(isValidCoords(CDMX)).toBe(true);
    expect(isValidCoords({ lat: 91, lon: 0 })).toBe(false);
    expect(isValidCoords({ lat: Number.NaN, lon: 0 })).toBe(false);
    expect(isValidCoords(null)).toBe(false);
    expect(toCoords(null, -99)).toBeNull();
  });
});

describe("geo: buckets", () => {
  test("respeta los límites de 2/10/30/100 km", () => {
    expect(distanceBucket(0)).toBe(0);
    expect(distanceBucket(1.99)).toBe(0);
    expect(distanceBucket(2)).toBe(1);
    expect(distanceBucket(9.99)).toBe(1);
    expect(distanceBucket(10)).toBe(2);
    expect(distanceBucket(30)).toBe(3);
    expect(distanceBucket(100)).toBe(4);
    expect(distanceBucket(5000)).toBe(4);
  });

  test("sin distancia va al final", () => {
    expect(distanceBucket(null)).toBe(UNKNOWN_DISTANCE_BUCKET);
    expect(UNKNOWN_DISTANCE_BUCKET).toBe(5);
  });
});

describe("geo: orden por cercanía y recencia", () => {
  const nearOld: Item = {
    id: "near-old",
    lat: 19.44,
    lon: -99.13,
    created_at: "2026-01-01T00:00:00Z",
  };
  const nearNew: Item = {
    id: "near-new",
    lat: 19.43,
    lon: -99.14,
    created_at: "2026-11-01T00:00:00Z",
  };
  const farNew: Item = {
    id: "far-new",
    lat: GUADALAJARA.lat,
    lon: GUADALAJARA.lon,
    created_at: "2026-11-10T00:00:00Z",
  };
  const unknown: Item = {
    id: "unknown",
    lat: null,
    lon: null,
    created_at: "2026-11-11T00:00:00Z",
  };

  test("cercano primero, y dentro de la misma zona el más reciente", () => {
    const sorted = sortByProximity(
      [unknown, farNew, nearOld, nearNew],
      CDMX,
      coordsOf,
      createdAtOf
    );
    expect(sorted.map((item) => item.id)).toEqual([
      "near-new",
      "near-old",
      "far-new",
      "unknown",
    ]);
  });

  test("sin ubicación del usuario ordena solo por fecha", () => {
    const sorted = sortByProximity(
      [nearOld, farNew, unknown, nearNew],
      null,
      coordsOf,
      createdAtOf
    );
    expect(sorted.map((item) => item.id)).toEqual([
      "unknown",
      "far-new",
      "near-new",
      "near-old",
    ]);
  });

  test("no muta el arreglo original", () => {
    const input = [nearOld, nearNew];
    sortByProximity(input, CDMX, coordsOf, createdAtOf);
    expect(input[0]).toBe(nearOld);
  });
});

describe("geo: formato y llaves", () => {
  test("formatea metros y kilómetros", () => {
    expect(formatDistance(0.01)).toBe("a 100 m");
    expect(formatDistance(0.84)).toBe("a 800 m");
    expect(formatDistance(3.24)).toBe("a 3.2 km");
    expect(formatDistance(42.6)).toBe("a 43 km");
    expect(formatDistance(null)).toBeNull();
  });

  test("redondea la llave a 2 decimales", () => {
    expect(roundForKey(CDMX)).toBe("19.43,-99.13");
    expect(roundForKey({ lat: 19.4349, lon: -99.1301 })).toBe("19.43,-99.13");
    expect(roundForKey(null)).toBeNull();
  });

  test("bounds de región con margen y límites del mundo", () => {
    const bounds = boundsFromRegion(CDMX, 0.2, 0.1, 0);
    expect(bounds.minLat).toBeCloseTo(19.3326, 4);
    expect(bounds.maxLon).toBeCloseTo(-99.0832, 4);

    const clamped = boundsFromRegion({ lat: 89, lon: 179 }, 10, 10);
    expect(clamped.maxLat).toBe(90);
    expect(clamped.maxLon).toBe(180);
  });
});
