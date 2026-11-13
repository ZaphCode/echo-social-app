import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Platform, StyleProp, ViewStyle } from "react-native";
import { AppleMaps, CameraMoveEvent, GoogleMaps } from "expo-maps";

import { Coords } from "@/utils/geo";

export type MapMarker = {
  id: string;
  coords: Coords;
  title?: string;
};

export type MapCircle = {
  id: string;
  center: Coords;
  radiusMeters: number;
};

export type MapRegion = {
  center: Coords;
  zoom: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapViewHandle = {
  moveTo: (coords: Coords, zoom?: number) => void;
};

type Props = {
  style?: StyleProp<ViewStyle>;
  initialCenter: Coords;
  initialZoom?: number;
  markers?: MapMarker[];
  circles?: MapCircle[];
  showUserLocation?: boolean;
  darkMode?: boolean;
  accentColor: string;
  onRegionChange?: (region: MapRegion) => void;
  onMarkerPress?: (markerId: string) => void;
  onMapPress?: () => void;
};

const toNative = (coords: Coords) => ({
  latitude: coords.lat,
  longitude: coords.lon,
});

const fromCameraEvent = (event: CameraMoveEvent): MapRegion | null => {
  const { latitude, longitude } = event.coordinates;
  if (latitude === undefined || longitude === undefined) return null;
  return {
    center: { lat: latitude, lon: longitude },
    zoom: event.zoom,
    latitudeDelta: event.latitudeDelta,
    longitudeDelta: event.longitudeDelta,
  };
};

/** Thin cross-platform wrapper: Apple Maps on iOS, Google Maps on Android. */
const MapView = forwardRef<MapViewHandle, Props>(function MapView(
  {
    style,
    initialCenter,
    initialZoom = 12,
    markers = [],
    circles = [],
    showUserLocation = false,
    darkMode = false,
    accentColor,
    onRegionChange,
    onMarkerPress,
    onMapPress,
  },
  ref
) {
  const appleRef = useRef<AppleMaps.MapView>(null);
  const googleRef = useRef<GoogleMaps.MapView>(null);

  useImperativeHandle(ref, () => ({
    moveTo: (coords, zoom) => {
      const camera = { coordinates: toNative(coords), zoom };
      appleRef.current?.setCameraPosition(camera);
      googleRef.current?.setCameraPosition(camera);
    },
  }));

  // Captured once: a new cameraPosition prop would snap the camera back on
  // every re-render. Use the ref's moveTo() to move it afterwards.
  const [cameraPosition] = useState(() => ({
    coordinates: toNative(initialCenter),
    zoom: initialZoom,
  }));
  const handleCameraMove = (event: CameraMoveEvent) => {
    const region = fromCameraEvent(event);
    if (region) onRegionChange?.(region);
  };
  const circleFill = `${accentColor}33`;

  if (Platform.OS === "ios") {
    return (
      <AppleMaps.View
        ref={appleRef}
        style={style}
        cameraPosition={cameraPosition}
        colorScheme={
          darkMode
            ? AppleMaps.MapColorScheme.DARK
            : AppleMaps.MapColorScheme.LIGHT
        }
        properties={{ isMyLocationEnabled: showUserLocation }}
        uiSettings={{ myLocationButtonEnabled: showUserLocation }}
        markers={markers.map((marker) => ({
          id: marker.id,
          coordinates: toNative(marker.coords),
          title: marker.title,
          tintColor: accentColor,
          systemImage: "briefcase.fill",
        }))}
        circles={circles.map((circle) => ({
          id: circle.id,
          center: toNative(circle.center),
          radius: circle.radiusMeters,
          color: circleFill,
          lineColor: accentColor,
          lineWidth: 1,
        }))}
        onCameraMove={handleCameraMove}
        onMarkerClick={(marker) => marker.id && onMarkerPress?.(marker.id)}
        onMapClick={() => onMapPress?.()}
      />
    );
  }

  return (
    <GoogleMaps.View
      ref={googleRef}
      style={style}
      cameraPosition={cameraPosition}
      colorScheme={
        darkMode
          ? GoogleMaps.MapColorScheme.DARK
          : GoogleMaps.MapColorScheme.LIGHT
      }
      properties={{ isMyLocationEnabled: showUserLocation }}
      uiSettings={{
        myLocationButtonEnabled: showUserLocation,
        mapToolbarEnabled: false,
        zoomControlsEnabled: false,
      }}
      markers={markers.map((marker) => ({
        id: marker.id,
        coordinates: toNative(marker.coords),
        title: marker.title,
        showCallout: false,
      }))}
      circles={circles.map((circle) => ({
        id: circle.id,
        center: toNative(circle.center),
        radius: circle.radiusMeters,
        color: circleFill,
        lineColor: accentColor,
        lineWidth: 2,
      }))}
      onCameraMove={handleCameraMove}
      onMarkerClick={(marker) => marker.id && onMarkerPress?.(marker.id)}
      onMapClick={() => onMapPress?.()}
    />
  );
});

export default MapView;
