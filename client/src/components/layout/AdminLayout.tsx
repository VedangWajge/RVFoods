import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop static sidebar */}
      <AdminSidebar className="hidden lg:flex shrink-0" />

      {/* Mobile responsive slideout sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebar className="h-full border-r-0" onLinkClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-lg font-bold text-primary">
            Admin Panel
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
