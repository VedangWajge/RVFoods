import { useEffect, useRef, useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadGoogleMaps } from "@/utils/googleMaps";
import type { DeliveryLocation } from "@/types/order.types";

interface DeliveryMapPickerProps {
  center: DeliveryLocation;
  isConfirmed: boolean;
  onConfirm: (location: DeliveryLocation | null) => void;
}

/**
 * The pin stays in the middle and the customer moves the map under it. Quoting only
 * happens on "Confirm", so moving the map around doesn't use up route lookups.
 */
export default function DeliveryMapPicker({
  center,
  isConfirmed,
  onConfirm,
}: DeliveryMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
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
      mapRef.current = map;
      dragListener = map.addListener("dragstart", () => onConfirm(null));
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
  }, [center.lat, center.lng, onConfirm]);

  const handleConfirm = () => {
    const position = mapRef.current?.getCenter();
    // Without the map, the search result is the best location we have.
    onConfirm(position ? { lat: position.lat(), lng: position.lng() } : center);
  };

  return (
    <div className="space-y-2">
      {mapFailed ? (
        <p className="text-xs text-error">
          The map couldn't load. You can confirm the location you searched for.
        </p>
      ) : (
        <>
          <p className="text-xs text-text-secondary">
            Move the map so the pin is on your gate.
          </p>
          <div className="relative h-56 rounded-xl overflow-hidden border border-border">
            <div ref={containerRef} className="absolute inset-0" />
            <MapPin
              className="absolute left-1/2 top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-full text-primary fill-white pointer-events-none"
              aria-hidden
            />
          </div>
        </>
      )}

      {isConfirmed ? (
        <p className="text-xs font-semibold text-success flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Location confirmed
        </p>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleConfirm}
          className="w-full h-10 text-sm font-semibold border-border bg-white"
        >
          Confirm this location
        </Button>
      )}
    </div>
  );
}
