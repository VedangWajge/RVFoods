import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatCurrency";
import type { CartLineItem } from "@/types/product.types";

interface CartItemProps {
  item: CartLineItem;
}

export default function CartItem({ item }: CartItemProps) {
  const { incrementItem, decrementItem, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0 items-center">
      {/* Item Image */}
      <div className="h-16 w-16 rounded-lg overflow-hidden border border-border bg-background shrink-0">
        <img
          src={item.image || "/placeholder-product.jpg"}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Item Info */}
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-medium text-text-primary truncate">{item.name}</h4>
        <div className="flex items-baseline mt-1 gap-2">
          <span className="text-sm font-semibold text-primary">
            {formatCurrency(item.price)}
          </span>
          <span className="text-xs text-text-muted">
            x {item.quantity}
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-border rounded bg-background h-7">
            <button
              onClick={() => decrementItem(item.productId)}
              className="px-2 h-full hover:bg-border transition-colors text-text-secondary disabled:opacity-50"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-text-primary">{item.quantity}</span>
            <button
              onClick={() => incrementItem(item.productId)}
              className="px-2 h-full hover:bg-border transition-colors text-text-secondary disabled:opacity-50"
              disabled={item.quantity >= item.stock}
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="text-xs text-text-muted ml-2">
            Stock: {item.stock}
          </span>
        </div>
      </div>

      {/* Item Total & Remove */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-sm font-bold text-text-primary">
          {formatCurrency(item.price * item.quantity)}
        </span>
        <button
          onClick={() => removeItem(item.productId)}
          className="p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
