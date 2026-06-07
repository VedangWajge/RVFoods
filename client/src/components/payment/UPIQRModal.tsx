import { useState, useEffect } from "react";
import { X, Copy, Check, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";

export default function UPIQRModal() {
  const isOpen = useUIStore((s) => (s as any).isUPIModalOpen);
  const onClose = useUIStore((s) => (s as any).closeUPIModal);
  
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const upiId = import.meta.env.VITE_UPI_ID || "yourname@upi";
  const upiQrUrl = import.meta.env.VITE_UPI_QR_URL || "";

  // Reset zoom when main modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy UPI ID: ", err);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-xl border border-border shadow-lg p-6 max-w-sm w-full relative z-10 flex flex-col items-center"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1.5 hover:bg-background rounded-lg transition-colors"
                aria-label="Close payment modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon and Title */}
              <div className="flex flex-col items-center text-center mt-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-text-primary">
                  Pay via UPI QR
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Complete your payment using any UPI app
                </p>
              </div>

              {/* UPI QR Image Trigger button */}
              <button
                onClick={() => upiQrUrl && setIsZoomed(true)}
                disabled={!upiQrUrl}
                className="w-48 h-48 border border-border rounded-xl p-2 bg-background flex items-center justify-center overflow-hidden mb-1 shadow-inner cursor-zoom-in hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                title={upiQrUrl ? "Click to zoom QR Code" : undefined}
                type="button"
              >
                {upiQrUrl ? (
                  <img
                    src={upiQrUrl}
                    alt="UPI QR Code for Payment"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <QrCode className="w-12 h-12 text-text-muted stroke-[1.5]" />
                    <p className="text-[10px] text-text-secondary mt-2">
                      QR code image not configured
                    </p>
                  </div>
                )}
              </button>

              {upiQrUrl && (
                <p className="text-[10px] text-text-muted mb-4 font-medium italic animate-pulse">
                  🔍 Click QR image to zoom
                </p>
              )}

              {/* UPI ID display & copy */}
              <div className="w-full bg-background border border-border/80 rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                    UPI ID
                  </p>
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {upiId}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-white hover:bg-background text-text-primary transition-colors shrink-0"
                  title="Copy UPI ID"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span className="text-success font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Payment Instructions */}
              <div className="w-full border-t border-border/60 pt-4">
                <h4 className="text-xs font-bold text-text-primary mb-2 text-center">
                  Instructions
                </h4>
                <div className="bg-[#FDFAF6] border border-border/60 rounded-xl p-3.5 text-xs text-text-secondary space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      1
                    </span>
                    <span>Scan the QR code above or copy the UPI ID.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      2
                    </span>
                    <span>Pay the total order amount via GPay, PhonePe, Paytm, or BHIM.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      3
                    </span>
                    <span>Send the payment screenshot on WhatsApp to confirm your order.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zoomed QR Overlay */}
      <AnimatePresence>
        {isOpen && isZoomed && upiQrUrl && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomed(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-zoom-out"
            />
            
            {/* Zoomed Image Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl border border-border p-6 shadow-2xl max-w-md w-full z-10 flex flex-col items-center"
            >
              {/* Close/Zoom out button */}
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1.5 hover:bg-background rounded-lg transition-colors"
                aria-label="Close zoom"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-playfair text-xl font-bold text-text-primary mb-4 mt-2">
                Scan to Pay
              </h4>

              <img
                src={upiQrUrl}
                alt="Zoomed UPI QR Code"
                className="w-72 h-72 sm:w-96 sm:h-96 object-contain mb-4 rounded-xl border border-border p-3 bg-background shadow-inner"
              />

              <p className="text-xs text-text-secondary text-center mb-2">
                Click anywhere outside or close to exit zoom
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function FloatingUPIButton() {
  const openUPIModal = useUIStore((s) => (s as any).openUPIModal);
  
  return (
    <button
      onClick={openUPIModal}
      className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary-dark text-white rounded-full p-3.5 shadow-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 hover:scale-105 active:scale-95 group border border-white/20"
      title="Pay via UPI"
    >
      <QrCode className="w-6 h-6 animate-pulse" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-xs group-hover:ml-1">
        Pay via UPI
      </span>
    </button>
  );
}
