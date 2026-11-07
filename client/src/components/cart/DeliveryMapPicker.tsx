import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { loadGoogleMaps } from "@/utils/googleMaps";
import type { DeliveryLocation } from "@/types/order.types";

interface DeliveryMapPickerProps {
  center: DeliveryLocation;
  onLocationChange: (location: DeliveryLocation) => void;
}

/**
 * The pin stays in the middle and the customer moves the map under it. The charge updates
 * when they let go, so it uses one route lookup per move rather than one while dragging.
 */
export default function DeliveryMapPicker({ center, onLocationChange }: DeliveryMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dragListener: google.maps.MapsEventListener | undefined;

    const showMap = async () => {
      await loadGoogleMaps();
      const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
      if (cancelled || !containerRef.current) return;

      const map = new Map(containerRef.current, {
        center,
        zoom: 17,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        gestureHandling: "greedy",
      });
      dragListener = map.addListener("dragend", () => {
        const position = map.getCenter();
        if (position) onLocationChange({ lat: position.lat(), lng: position.lng() });
      });
    };

    showMap().catch((err) => {
      console.error("Failed to show Google Map:", err);
      if (!cancelled) setMapFailed(true);
    });

    return () => {
      cancelled = true;
      dragListener?.remove();
    };
    // Only a new search result recentres the map, not re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, onLocationChange]);

  if (mapFailed) {
    return (
      <p className="text-xs text-text-secondary">
        The map couldn't load, but your address is saved. You can order as normal.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-secondary">Move the map so the pin is on your gate.</p>
      <div className="relative h-56 rounded-xl overflow-hidden border border-border">
        <div ref={containerRef} className="absolute inset-0" />
        <MapPin
          className="absolute left-1/2 top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-full text-primary fill-white pointer-events-none"
          aria-hidden
        />
      </div>
    </div>
  );
}
