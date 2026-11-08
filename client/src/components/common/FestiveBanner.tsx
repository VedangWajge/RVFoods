import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { offerService } from "@/services/offerService";
import type { FestiveOffer } from "@/types/offer.types";

/**
 * A festive offer banner that auto-fetches the current offer status.
 * Only renders when the admin has enabled the banner and the offer is still active.
 * Users can dismiss it locally (per session).
 */
export default function FestiveBanner() {
  const [offer, setOffer] = useState<FestiveOffer | null>(null);
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("rvf_banner_dismissed") === "1"
  );

  useEffect(() => {
    if (dismissed) return;

    offerService
      .getOffer()
      .then(setOffer)
      .catch(() => {
        /* silently ignore — just don't show the banner */
      });
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("rvf_banner_dismissed", "1");
  };

  // Don't render if dismissed, no offer data, or banner disabled by admin
  if (dismissed || !offer?.bannerEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden bg-gradient-to-r from-[#FF6B35] via-[#C84B31] to-[#FF6B35] text-white"
      >
        {/* Decorative diya / sparkle dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-yellow-400/10 blur-2xl" />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-yellow-400/10 blur-2xl" />
        </div>

        <div className="container-main relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-2.5 sm:py-3 px-4 text-center sm:text-left">
          {/* Sparkle icon */}
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="shrink-0"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </motion.div>

          {/* Message */}
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-xs sm:text-sm font-semibold leading-snug">
            <span className="inline-flex items-center gap-1">
              🪔 <span className="font-bold">{offer.title}!</span>
            </span>
            <span>
              Get <span className="font-extrabold text-yellow-200">{offer.discountPercent}% OFF</span>
            </span>
            {offer.active ? (
              <span>
                — only{" "}
                <span className="font-extrabold text-yellow-200">
                  {offer.remaining}
                </span>{" "}
                {offer.remaining === 1 ? "order" : "orders"} left!
              </span>
            ) : (
              <span className="opacity-80">— all {offer.maxOrders} discounted orders are claimed!</span>
            )}
          </div>

          {/* CTA */}
          {offer.active && (
            <Link
              to="/products"
              className="shrink-0 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full transition-colors"
            >
              Shop Now <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          {/* Dismiss */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

