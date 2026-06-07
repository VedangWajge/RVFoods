import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product.types";

interface ProductGridProps {
  products: Product[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center w-full min-h-[300px]">
        <div className="text-4xl mb-4">🍂</div>
        <p className="text-text-secondary font-medium text-lg">No products found matching your criteria.</p>
        <p className="text-text-muted text-sm mt-1">Try relaxing some filters or checking back later.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </motion.div>
  );
}
