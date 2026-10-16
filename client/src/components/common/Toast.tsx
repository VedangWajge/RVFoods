import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export default function Toast() {
  const navigate = useNavigate();
  const toast = useUIStore((s) => s.toast);
  const hideToast = useUIStore((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hideToast, 5000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  const Icon = toast ? icons[toast.type] : Info;
  const isAuthPrompt = toast?.message === "Please log in to continue.";
  const showActionButton = Boolean(toast?.action || isAuthPrompt);

  const handleActionClick = () => {
    if (toast?.action) {
      toast.action.onClick();
    } else if (isAuthPrompt) {
      navigate("/login");
    }
    hideToast();
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -16, x: 16 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -16, x: 16 }}
          className="fixed right-4 top-20 z-[100] max-w-sm"
          role="alert"
        >
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-surface p-4 shadow-lg",
              toast.type === "success" && "border-success/30",
              toast.type === "error" && "border-error/30",
              toast.type === "info" && "border-border"
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                toast.type === "success" && "text-success",
                toast.type === "error" && "text-error",
                toast.type === "info" && "text-primary"
              )}
              aria-hidden
            />
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <p className="text-sm text-text-primary leading-snug">{toast.message}</p>
              {showActionButton && (
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="self-start text-xs font-bold text-primary hover:text-primary-dark underline py-0.5"
                >
                  {toast.action?.label || "Log In"} →
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={hideToast}
              className="text-text-muted hover:text-text-primary"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
