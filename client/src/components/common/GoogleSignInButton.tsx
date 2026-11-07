import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { getErrorMessage } from "@/services/api";

const SCRIPT_URL = "https://accounts.google.com/gsi/client";
const MAX_BUTTON_WIDTH = 400;

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: { theme: string; size: string; text: string; shape: string; width: number }
  ) => void;
}

const getGoogleId = () =>
  (window as unknown as { google?: { accounts?: { id?: GoogleAccountsId } } }).google?.accounts?.id;

let scriptLoading: Promise<void> | null = null;

const loadGoogleScript = (): Promise<void> => {
  if (getGoogleId()) return Promise.resolve();

  if (!scriptLoading) {
    scriptLoading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptLoading = null;
        script.remove();
        reject(new Error("Google sign-in failed to load"));
      };
      document.head.append(script);
    });
  }
  return scriptLoading;
};

// Google allows one initialize per page, so the latest button receives the result.
let isInitialized = false;
let handleCredential: (credential: string) => void = () => {};

interface GoogleSignInButtonProps {
  text: "continue_with" | "signup_with";
}

/** Google's sign-in button and the divider above the email form. */
export default function GoogleSignInButton({ text }: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const { loginWithGoogle } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    handleCredential = async (credential) => {
      try {
        await loginWithGoogle(credential);
        showToast("Welcome to RV Foods!", "success");
      } catch (error) {
        showToast(getErrorMessage(error), "error");
      }
    };

    loadGoogleScript()
      .then(() => {
        const googleId = getGoogleId();
        const container = containerRef.current;
        if (cancelled || !googleId || !container) return;

        if (!isInitialized) {
          googleId.initialize({
            client_id: clientId,
            callback: ({ credential }) => handleCredential(credential),
          });
          isInitialized = true;
        }

        googleId.renderButton(container, {
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          width: Math.min(container.offsetWidth, MAX_BUTTON_WIDTH),
        });
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setIsUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, text, loginWithGoogle, showToast]);

  // Not set up yet, or blocked: the email form below still works.
  if (!clientId || isUnavailable) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div ref={containerRef} className="flex min-h-[44px] w-full justify-center" />
        <p className="text-center text-[11px] text-text-muted">
          We receive your name and email from Google to create your account. See our{" "}
          <a href="/privacy-policy.html" className="underline hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-text-muted">Or with email</span>
        </div>
      </div>
    </div>
  );
}
