import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, User, LogOut, Package, Shield, Trash2, ShoppingBag } from "lucide-react";
import { BRAND, NAV_LINKS } from "@/utils/constants";
import { motion } from "framer-motion";

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20RV%20Foods!%20%F0%9F%99%8F%20I%27d%20like%20to%20know%20more%20about%20your%20homemade%20products.`;

function WhatsAppNavButton() {
  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg p-2 text-[#25D366] hover:bg-[#25D366]/10 transition-colors flex items-center justify-center shrink-0"
      aria-label="Contact us on WhatsApp"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </motion.a>
  );
}
import { useCart } from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function CartButton() {
  const { items, itemCount, summary, isEmpty, removeItem } = useCart();
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={openCartDrawer}
        className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
        aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white transition-transform duration-300 group-hover:scale-110">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      {/* Mini Cart Popup on Hover */}
      <div className="invisible absolute right-0 top-full z-50 mt-2 w-80 origin-top-right rounded-xl border border-border bg-surface p-4 opacity-0 shadow-xl transition-all duration-300 scale-95 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:translate-y-0">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <span className="font-heading text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-primary" /> Cart Preview
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-background border border-border text-text-secondary rounded-full">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Content */}
        <div className="my-3 max-h-60 overflow-y-auto divide-y divide-border/60">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-xl mb-2" role="img" aria-label="cart">🛒</span>
              <p className="text-xs font-semibold text-text-primary">Your cart is empty</p>
              <p className="text-[10px] text-text-secondary mt-0.5 max-w-[180px]">
                Add some tasty RV Foods products to get started!
              </p>
            </div>
          ) : (
            <>
              {items.slice(0, 3).map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-2.5 group/item">
                  <img
                    src={item.image || "/placeholder-product.jpg"}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg border border-border/80 bg-background"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate group-hover/item:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.productId);
                    }}
                    className="text-text-muted hover:text-error p-1 hover:bg-error/5 rounded transition-colors"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {items.length > 3 && (
                <div className="text-center py-1.5 border-t border-border/40">
                  <p className="text-[10px] font-medium text-text-secondary">
                    + {items.length - 3} more {items.length - 3 === 1 ? "item" : "items"} in cart
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-text-secondary">Subtotal</span>
              <span className="font-bold text-primary">{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-[11px] font-semibold h-8 border-border bg-white"
                onClick={() => handleNavigate("/cart")}
              >
                View Cart
              </Button>
              <Button
                size="sm"
                className="w-full text-[11px] font-semibold h-8 text-white bg-primary hover:bg-primary-dark"
                onClick={() => handleNavigate("/how-to-order")}
              >
                How to Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn("nav-link text-sm font-medium", isActive && "nav-link-active")
          }
        >
          {link.label}
        </NavLink>
      ))}
    </>
  );
}

function AccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);

  const handleLogout = async () => {
    await logout();
    showToast("Signed out successfully", "success");
    onNavigate?.();
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return (
      <Link
        to="/login"
        onClick={onNavigate}
        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
        aria-label="Sign in"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
        aria-label="Account menu"
        aria-haspopup="true"
      >
        <User className="h-5 w-5" />
        <span className="hidden max-w-[100px] truncate lg:inline">
          {user.name.split(" ")[0]}
        </span>
      </button>

      <div className="invisible absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-surface py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <p className="border-b border-border px-4 py-2 text-xs text-text-muted">
          {user.email}
        </p>
        <Link
          to="/orders"
          onClick={onNavigate}
          className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-background hover:text-primary"
        >
          <Package className="h-4 w-4" aria-hidden />
          My Orders
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-background hover:text-primary"
          >
            <Shield className="h-4 w-4" aria-hidden />
            Admin Panel
          </Link>
        )}
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-background"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function MobileMenu() {
  const isOpen = useUIStore((s) => s.isMobileMenuOpen);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
  const openMobileMenu = useUIStore((s) => s.openMobileMenu);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);

  const handleLogout = async () => {
    await logout();
    showToast("Signed out successfully", "success");
    navigate("/");
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (open ? openMobileMenu() : closeMobileMenu())}
    >
      <SheetContent side="right" className="flex w-[min(100%,20rem)] flex-col border-l-4 border-primary">
        <SheetHeader>
          <SheetTitle className="font-heading text-primary">
            {BRAND.name}
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-8 flex flex-col gap-4" aria-label="Mobile navigation">
          <NavLinks onNavigate={closeMobileMenu} />
          {isAuthenticated && (
            <NavLink
              to="/orders"
              onClick={closeMobileMenu}
              className="nav-link text-sm font-medium"
            >
              My Orders
            </NavLink>
          )}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
          {!isAuthenticated ? (
            <>
              <Button variant="secondary" asChild onClick={closeMobileMenu}>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild onClick={closeMobileMenu}>
                <Link to="/register">Create Account</Link>
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="px-3 py-2 text-xs border border-border rounded-xl bg-background/50">
                <p className="font-semibold text-text-primary">{user?.name}</p>
                <p className="text-text-muted truncate">{user?.email}</p>
              </div>
              {isAdmin && (
                <Button variant="secondary" asChild onClick={closeMobileMenu}>
                  <Link to="/admin" className="gap-2">
                    <Shield className="h-4 w-4" /> Admin Panel
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  closeMobileMenu();
                  void handleLogout();
                }}
                className="gap-2 text-error hover:text-error hover:bg-error/5 justify-start px-3"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          )}
          <Button variant="outline" asChild onClick={closeMobileMenu}>
            <Link to="/products">Shop Now</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Navbar() {
  const openMobileMenu = useUIStore((s) => s.openMobileMenu);
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);

  return (
    <header className="navbar">
      <div className="container-main flex h-full items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 transition-opacity hover:opacity-90 select-none group py-1"
        >
          <span className="text-2xl" role="img" aria-label="diya">🪔</span>
          <div className="flex flex-col -space-y-0.5">
            <span className="font-heading text-lg font-bold text-primary sm:text-xl tracking-tight leading-tight">RV Foods</span>
            <span className="text-[9px] font-semibold tracking-widest text-accent uppercase font-marathi leading-none">& Snacks</span>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          <NavLinks />
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1.5">
          <div className="hidden sm:block">
            <AccountMenu />
          </div>
          <WhatsAppNavButton />
          <CartButton />
          <button
            type="button"
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary md:hidden"
            onClick={openMobileMenu}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileMenu />
    </header>
  );
}
