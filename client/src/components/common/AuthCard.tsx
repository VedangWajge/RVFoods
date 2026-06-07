import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "@/utils/constants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="section-padding container-main flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md border-border shadow-card">
        <CardHeader className="space-y-2 text-center">
          <Link
            to="/"
            className="font-heading text-2xl font-bold text-primary"
          >
            {BRAND.name}
          </Link>
          <h1 className="font-heading text-xl font-semibold text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
        {footer && (
          <div className="border-t border-border px-6 py-4 text-center text-sm text-text-secondary">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}
