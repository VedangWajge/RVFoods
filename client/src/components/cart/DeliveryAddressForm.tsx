import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DeliveryMapPicker from "@/components/cart/DeliveryMapPicker";
import { DELIVERY_SEARCH_CENTER } from "@/utils/constants";
import { loadGoogleMaps } from "@/utils/googleMaps";
import type { DeliveryLocation, SelectedDeliveryPlace } from "@/types/order.types";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 350;
const SEARCH_BIAS_RADIUS_METERS = 30000;

interface DeliveryAddressFormProps {
  /** Signed-in customers don't see this: their name comes from their profile. */
  showNameField: boolean;
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  addressLine: string;
  onAddressLineChange: (value: string) => void;
  pincode: string;
  onPincodeChange: (value: string) => void;
  selectedPlace: SelectedDeliveryPlace | null;
  onSelectPlace: (place: SelectedDeliveryPlace | null) => void;
  onLocationChange: (location: DeliveryLocation | null) => void;
  showAddressHint: boolean;
  onMessageUs: () => void;
}

const getComponent = (place: google.maps.places.Place, type: string) =>
  place.addressComponents?.find((component) => component.types.includes(type))?.longText ??
  undefined;

export default function DeliveryAddressForm({
  showNameField,
  customerName,
  onCustomerNameChange,
  addressLine,
  onAddressLineChange,
  pincode,
  onPincodeChange,
  selectedPlace,
  onSelectPlace,
  onLocationChange,
  showAddressHint,
  onMessageUs,
}: DeliveryAddressFormProps) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Google bills one search-and-select as a session, tied together by this token.
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    const text = searchText.trim();
    setSearchError(null);
    setHasSearched(false);

    if (selectedPlace || text.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        await loadGoogleMaps();
        const { AutocompleteSuggestion, AutocompleteSessionToken } =
          (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
        sessionTokenRef.current ??= new AutocompleteSessionToken();

        const { suggestions: results } =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: text,
            sessionToken: sessionTokenRef.current,
            includedRegionCodes: ["in"],
            locationBias: {
              center: DELIVERY_SEARCH_CENTER,
              radius: SEARCH_BIAS_RADIUS_METERS,
            },
          });
        if (cancelled) return;

        setSuggestions(
          results.flatMap((result) => (result.placePrediction ? [result.placePrediction] : []))
        );
        setHasSearched(true);
      } catch (err) {
        if (cancelled) return;
        console.error("Address search failed:", err);
        setSuggestions([]);
        setSearchError("Address search isn't available right now.");
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchText, selectedPlace]);

  const handleSelect = async (prediction: google.maps.places.PlacePrediction) => {
    setIsSearching(true);
    try {
      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ["formattedAddress", "location", "addressComponents"],
      });
      if (!place.location || !place.formattedAddress) {
        throw new Error("Selected place has no location");
      }

      const lat = place.location.lat();
      const lng = place.location.lng();
      const postcode = getComponent(place, "postal_code");

      onSelectPlace({
        formatted: place.formattedAddress,
        city:
          getComponent(place, "locality") ??
          getComponent(place, "administrative_area_level_3"),
        state: getComponent(place, "administrative_area_level_1"),
        postcode,
        lat,
        lng,
      });
      // Picking an address is enough: the charge appears straight away.
      onLocationChange({ lat, lng });
      // Clear rather than keep the previous address's PIN when this one has none
      onPincodeChange(postcode ?? "");
      setIsMapOpen(false);
      setSearchText("");
      setSuggestions([]);
      sessionTokenRef.current = null;
    } catch (err) {
      console.error("Couldn't load the selected address:", err);
      setSearchError("We couldn't load that address. Please try another one.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearPlace = () => {
    onSelectPlace(null);
    onLocationChange(null);
    onPincodeChange("");
    setIsMapOpen(false);
  };

  return (
    <div
      id="delivery-details"
      className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-colors ${
        showAddressHint ? "border-error" : "border-border"
      }`}
    >
      <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" /> Delivery Details
      </h3>

      <div className="space-y-1.5">
        <Label htmlFor="delivery-search" className="text-xs">
          Delivery Address <span className="text-error" aria-hidden>*</span>
          <span className="sr-only"> (required)</span>
        </Label>
        {selectedPlace ? (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2 bg-[#FDFAF6] border border-border rounded-xl p-3 text-xs text-text-primary">
              <span>{selectedPlace.formatted}</span>
              <button
                type="button"
                onClick={handleClearPlace}
                className="text-text-secondary hover:text-error shrink-0"
                aria-label="Change address"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsMapOpen((open) => !open)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {isMapOpen ? "Hide map" : "Adjust pin on map (optional)"}
            </button>
          </div>
        ) : (
          <div className="relative">
            <Input
              id="delivery-search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search your building, road or area"
              autoComplete="off"
              maxLength={200}
              aria-required
              aria-invalid={showAddressHint}
              className="h-10 text-sm pr-9"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 animate-spin text-text-muted absolute right-3 top-3" />
            )}
            {suggestions.length > 0 && (
              <ul className="mt-1 border border-border rounded-xl divide-y divide-border bg-white overflow-hidden">
                {suggestions.map((prediction) => (
                  <li key={prediction.placeId}>
                    <button
                      type="button"
                      onClick={() => handleSelect(prediction)}
                      className="w-full text-left px-3 py-2.5 text-xs text-text-primary hover:bg-background transition-colors"
                    >
                      {prediction.text.text}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {showAddressHint && (
          <p className="text-xs font-medium text-error" role="alert">
            Please enter your delivery address to see the delivery charge.
          </p>
        )}

        {searchError && <p className="text-xs text-error">{searchError}</p>}

        {!selectedPlace && (searchError || (hasSearched && suggestions.length === 0)) && (
          <p className="text-xs text-text-secondary">
            {searchError ? "You can " : "No matches. Try just your road or area name, or "}
            <button
              type="button"
              onClick={onMessageUs}
              className="font-semibold text-primary hover:underline"
            >
              message us for a delivery quote
            </button>
            .
          </p>
        )}

        {!selectedPlace && <p className="text-[10px] text-text-muted">Powered by Google</p>}
      </div>

      {selectedPlace && isMapOpen && (
        <DeliveryMapPicker
          center={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
          onLocationChange={onLocationChange}
        />
      )}

      <div className="space-y-1.5">
        <Label htmlFor="delivery-line" className="text-xs">
          Flat and Building <span className="font-normal text-text-muted">(optional)</span>
        </Label>
        <Input
          id="delivery-line"
          value={addressLine}
          onChange={(e) => onAddressLineChange(e.target.value)}
          placeholder="e.g. Flat 402, Sai Niwas"
          autoComplete="address-line1"
          maxLength={200}
          className="h-10 text-sm"
        />
      </div>

      {selectedPlace && !selectedPlace.postcode && (
        <div className="space-y-1.5">
          <Label htmlFor="delivery-pincode" className="text-xs">
            PIN Code <span className="font-normal text-text-muted">(optional)</span>
          </Label>
          <Input
            id="delivery-pincode"
            value={pincode}
            onChange={(e) => onPincodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit PIN code"
            autoComplete="postal-code"
            inputMode="numeric"
            className="h-10 text-sm"
          />
        </div>
      )}

      {showNameField && (
        <div className="space-y-1.5">
          <Label htmlFor="delivery-name" className="text-xs">
            Your Name <span className="font-normal text-text-muted">(optional)</span>
          </Label>
          <Input
            id="delivery-name"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            maxLength={80}
            className="h-10 text-sm"
          />
        </div>
      )}
    </div>
  );
}
