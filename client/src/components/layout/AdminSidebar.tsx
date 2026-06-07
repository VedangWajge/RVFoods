import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BRAND } from "@/utils/constants";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true },
  { label: "Products", href: "/admin/products", icon: Package, end: false },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, end: false },
  { label: "Users", href: "/admin/users", icon: Users, end: false },
] as const;

interface AdminSidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export default function AdminSidebar({ className, onLinkClick }: AdminSidebarProps) {
  return (
    <aside className={cn("flex h-full w-64 flex-col border-r border-border bg-surface", className)}>
      <div className="border-b border-border p-6">
        <Link
          to="/admin"
          onClick={onLinkClick}
          className="font-heading text-xl font-bold text-primary"
        >
          {BRAND.name}
        </Link>
        <p className="mt-1 text-xs text-text-muted">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-1 p-4" aria-label="Admin navigation">
        {ADMIN_LINKS.map(({ label, href, icon: Icon, end }) => (
          <NavLink
            key={href}
            to={href}
            end={end}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-primary/10 hover:text-primary"
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <Link
          to="/"
          onClick={onLinkClick}
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
