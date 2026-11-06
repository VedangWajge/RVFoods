import { BRAND } from "@/utils/constants";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Sets the size, for example "h-14 w-14" */
  className?: string;
}

export default function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      src="/logo.png"
      alt={BRAND.name}
      width={320}
      height={320}
      className={cn("rounded-lg object-contain", className)}
    />
  );
}
