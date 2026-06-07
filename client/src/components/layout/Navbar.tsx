import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, User, LogOut, Package, Shield, Trash2, ShoppingBag } from "lucide-react";
import { BRAND, NAV_LINKS } from "@/utils/constants";
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
                onClick={() => handleNavigate("/checkout")}
              >
                Checkout
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
      <SheetContent side="right" className="flex w-[min(100%,20rem)] flex-col">
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
          className="font-heading text-xl font-bold text-primary transition-opacity hover:opacity-90 sm:text-2xl"
        >
          {BRAND.name}
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          <NavLinks />
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <AccountMenu />
          </div>
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
