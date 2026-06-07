import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Product } from "@/types/product.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addProduct } = useCart();
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const isOutOfStock = product.stock <= 0;

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
      addProduct(product, 1);
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
            src={product.images?.[0]?.url || "/placeholder-product.jpg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">
              {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% OFF
            </div>
          )}
          {/* Out of Stock overlay */}
          {isOutOfStock && (
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
          <p className="text-text-secondary text-xs line-clamp-2 mb-4 flex-grow">
            {product.shortDescription || product.description}
          </p>

          {/* Price & Cart Actions */}
          <div className="flex flex-col gap-3 mt-auto">
            <div className="flex items-baseline">
              <span className="text-primary font-bold text-lg">
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-text-muted text-sm line-through ml-2">
                  {formatCurrency(product.price)}
                </span>
              )}
              {product.weight && (
                <span className="text-text-secondary text-xs ml-auto self-center bg-background px-2 py-0.5 rounded border border-border">
                  {product.weight}
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-primary hover:bg-primary-dark text-white rounded-lg font-medium py-2 shadow-sm transition-all duration-200"
              size="sm"
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
