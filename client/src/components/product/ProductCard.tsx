import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatCurrency";
import { findSize, getProductSizes } from "@/utils/productSizes";
import type { Product } from "@/types/product.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addProduct } = useCart();
  const sizes = getProductSizes(product);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const size = findSize(sizes, selectedWeight);
  const hasDiscount = size.discountPrice !== undefined && size.discountPrice < size.price;
  const displayPrice = hasDiscount ? size.discountPrice! : size.price;
  const isOutOfStock = size.stock <= 0;
  const isSoldOut = sizes.every((s) => s.stock <= 0);

  // Human-readable categories
  const categoryLabels: Record<string, string> = {
    spices: "Masale",
    ghee: "Ghee",
    sweets: "Sweets",
    snacks: "Snacks",
    combo: "Combo Packs",
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addProduct(product, 1, size.weight);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
    >
      <Link to={`/products/${product.slug}`} className="flex-grow flex flex-col">
        {/* Image Area */}
        <div className="relative aspect-square w-full overflow-hidden bg-background">
          <img
            src={product.images?.[0]?.url || "/placeholder-product.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">
              {Math.round(((size.price - size.discountPrice!) / size.price) * 100)}% OFF
            </div>
          )}
          {/* Out of Stock overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-lg">
              Out of Stock
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-grow p-5">
          {/* Category Pill */}
          <div className="mb-2">
            <Badge variant="secondary" className="bg-accent-light/30 text-primary hover:bg-accent-light/30 border-none">
              {categoryLabels[product.category] || product.category}
            </Badge>
          </div>

          {/* Name & Stars */}
          <h3 className="font-semibold text-text-primary text-base line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 mb-2">
            <div className="flex items-center text-accent">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 fill-current ${
                    i < Math.round(product.ratings?.average || 0)
                      ? "text-accent"
                      : "text-text-muted/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-text-secondary mt-0.5">
              {product.ratings?.average ? product.ratings.average.toFixed(1) : "0.0"} ({product.ratings?.count || 0})
            </span>
          </div>

          {/* Description */}
          <p className="text-text-secondary text-xs line-clamp-2 flex-grow">
            {product.shortDescription || product.description}
          </p>
        </div>
      </Link>

      {/* Price & Cart Actions: outside the link, so picking a size stays on this page */}
      <div className="px-5 pb-5">
        <div className="flex flex-col gap-3">
            <div className="flex items-baseline">
              <span className="text-primary font-bold text-lg">
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-text-muted text-sm line-through ml-2">
                  {formatCurrency(size.price)}
                </span>
              )}
              {sizes.length === 1 && size.weight && (
                <span className="text-text-secondary text-xs ml-auto self-center bg-background px-2 py-0.5 rounded border border-border">
                  {size.weight}
                </span>
              )}
            </div>

            {sizes.length > 1 && (
              <select
                aria-label={`Choose a size for ${product.name}`}
                value={size.weight}
                onChange={(e) => setSelectedWeight(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-white px-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sizes.map((s) => (
                  <option key={s.weight} value={s.weight}>
                    {s.weight} - {formatCurrency(s.discountPrice ?? s.price)}
                    {s.stock <= 0 ? " (out of stock)" : ""}
                  </option>
                ))}
              </select>
            )}

            {isOutOfStock ? (
              <div className="flex flex-col gap-2">
                <Button
                  disabled
                  className="w-full bg-primary hover:bg-primary-dark text-white rounded-lg font-medium py-2 shadow-sm transition-all duration-200"
                  size="sm"
                >
                  Out of Stock
                </Button>
                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210";
                    const productInfo = size.weight
                      ? `${product.name} (${size.weight})`
                      : product.name;
                    const message = `Hi! I'm interested in ${productInfo}. It is currently out of stock. Is it possible to arrange it for me?`;
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
                    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-lg font-medium py-2 shadow-sm transition-all duration-200"
                  size="sm"
                >
                  Request on WhatsApp
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAddToCart}
                className="w-full bg-primary hover:bg-primary-dark text-white rounded-lg font-medium py-2 shadow-sm transition-all duration-200"
                size="sm"
              >
                Add to Cart
              </Button>
            )}
        </div>
      </div>
    </motion.div>
  );
}
