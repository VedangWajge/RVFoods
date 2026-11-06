const CALLBACK_NAME = "__rvfGoogleMapsReady";

let loading: Promise<void> | null = null;

/** Loads Google's Maps script once, the first time a customer needs it. */
export const loadGoogleMaps = (): Promise<void> => {
  if (typeof window.google?.maps?.importLibrary === "function") return Promise.resolve();

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
  if (!apiKey) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_BROWSER_KEY is not set"));
  }

  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      (window as unknown as Record<string, () => void>)[CALLBACK_NAME] = resolve;

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=${CALLBACK_NAME}`;
      script.async = true;
      script.onerror = () => {
        loading = null;
        script.remove();
        reject(new Error("Google Maps failed to load"));
      };
      document.head.append(script);
    });
  }
  return loading;
};
