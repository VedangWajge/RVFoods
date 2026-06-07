import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

interface ToastState {
  message: string;
  type: ToastType;
}

interface UIState {
  isMobileMenuOpen: boolean;
  isCartDrawerOpen: boolean;
  isUPIModalOpen: boolean;
  toast: ToastState | null;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  openUPIModal: () => void;
  closeUPIModal: () => void;
  toggleUPIModal: () => void;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,
  isUPIModalOpen: false,
  toast: null,

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleCartDrawer: () =>
    set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

  openUPIModal: () => set({ isUPIModalOpen: true }),
  closeUPIModal: () => set({ isUPIModalOpen: false }),
  toggleUPIModal: () =>
    set((state) => ({ isUPIModalOpen: !state.isUPIModalOpen })),

  showToast: (message, type = "info") => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));
