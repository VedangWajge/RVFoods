import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/common/Loader";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.419 5.422.002 12.079.002c3.225.001 6.258 1.257 8.537 3.539 2.279 2.28 3.532 5.317 3.53 8.544-.005 6.661-5.424 12.079-12.081 12.079-2.002-.001-3.972-.5-5.713-1.448L0 24zm6.59-4.846c1.6.95 3.397 1.453 5.24 1.454 5.377 0 9.75-4.372 9.754-9.752.002-2.607-1.013-5.059-2.859-6.904C16.883 2.1 14.436 1.087 11.83 1.087 6.455 1.087 2.084 5.46 2.08 10.835c-.001 1.839.486 3.64 1.411 5.234l-.973 3.548 3.638-.954zm10.933-7.877c-.29-.146-1.72-.85-1.987-.947-.267-.097-.461-.146-.656.146-.195.29-.757.947-.927 1.14-.17.195-.34.218-.63.073-.29-.147-1.228-.452-2.338-1.444-.864-.77-1.448-1.721-1.618-2.013-.17-.29-.018-.447.127-.592.13-.13.29-.34.436-.509.145-.17.195-.29.29-.485.097-.195.05-.364-.025-.509-.073-.146-.656-1.579-.9-2.172-.236-.57-.478-.493-.656-.502-.17-.008-.364-.01-.559-.01-.195 0-.514.073-.78.364-.268.29-1.022.996-1.022 2.43 0 1.433 1.043 2.816 1.189 3.01.145.193 2.052 3.134 4.972 4.39.694.299 1.236.478 1.659.613.698.222 1.332.19 1.833.115.558-.083 1.72-.702 1.963-1.38.243-.678.243-1.258.17-1.38-.074-.121-.268-.194-.559-.34z" />
  </svg>
);

type DetailTab = "description" | "ingredients" | "benefits" | "reviews";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error, fetchProductBySlug } = useProducts();
  const { products: relatedProducts, fetchProducts: fetchRelatedProducts } = useProducts();
  const { addProduct } = useCart();
  const showToast = useUIStore((s) => s.showToast);

  const { isAuthenticated, user: currentUser } = useAuth();
  const { reviews, loading: reviewsLoading, fetchReviews, addReview, removeReview } = useReviews();

  const [quantity, setQuantity] = useState(1);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>("description");

  // Form state for review
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load product details on mount or slug change
  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug);
      setQuantity(1);
      setSelectedImgIndex(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug, fetchProductBySlug]);

  // Load related products based on product category
  useEffect(() => {
    if (product) {
      fetchRelatedProducts({ category: product.category, limit: 5 });
    }
  }, [product, fetchRelatedProducts]);

  // Fetch reviews
  useEffect(() => {
    if (product?._id) {
      fetchReviews(product._id);
    }
  }, [product?._id, fetchReviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?._id) return;
    if (newComment.trim().length < 5) {
      showToast("Review comment must be at least 5 characters long.", "error");
      return;
    }
    setSubmittingReview(true);
    const res = await addReview(product._id, { rating: newRating, comment: newComment });
    setSubmittingReview(false);
    if (res) {
      showToast("Review submitted successfully!", "success");
      setNewComment("");
      setNewRating(5);
      fetchProductBySlug(product.slug); // Refresh product rating in header
    } else {
      showToast("Failed to submit review. Note: Only 1 review per product is permitted.", "error");
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const success = await removeReview(reviewId);
      if (success) {
        showToast("Review deleted.", "info");
        if (product?._id) fetchProductBySlug(product.slug); // Refresh product rating in header
      } else {
        showToast("Failed to delete review.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#FDFAF6]">
        <Loader size="lg" label="Preparing product information..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FDFAF6] text-center px-4">
        <div className="text-5xl mb-4">🍯</div>
        <h2 className="text-2xl font-playfair font-bold text-text-primary mb-2">Product Not Found</h2>
        <p className="text-text-secondary mb-6 max-w-sm">
          {error || "The product you are looking for does not exist or has been removed."}
        </p>
        <Link to="/products">
          <Button variant="default">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const isOutOfStock = product.stock <= 0;

  // Filter out the current product from related items
  const filteredRelated = relatedProducts
    .filter((p) => p._id !== product._id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addProduct(product, quantity);
    showToast(`Added ${quantity} x ${product.name} to cart!`, "success");
  };

  const handleBuyWhatsApp = () => {
    if (isOutOfStock) return;
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919XXXXXXXXX";
    const totalAmount = product.price * quantity;
    const message = `Hi RV Foods! 🙏 I'd like to order:\n- ${product.name} x${quantity} — ₹${totalAmount}\nTotal: ₹${totalAmount}\n\nPlease share payment details.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    
    // Open UPI QR modal immediately so they can scan
    useUIStore.getState().openUPIModal();
  };

  const categoryLabels: Record<string, string> = {
    spices: "Masale",
    ghee: "Ghee",
    sweets: "Sweets",
    snacks: "Snacks",
    combo: "Combo Packs",
  };

  return (
    <>
      <Helmet>
        <title>{`${product.name} | RV Foods`}</title>
        <meta name="description" content={product.shortDescription || product.description} />
      </Helmet>

      <div className="bg-[#FDFAF6] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-text-secondary mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-text-primary line-clamp-1">{product.name}</span>
          </nav>

          {/* Product Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 md:p-10 rounded-2xl border border-border shadow-sm mb-12">
            
            {/* Left Column: Image Gallery (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Main Image Frame */}
              <div className="relative aspect-square w-full overflow-hidden bg-background rounded-xl border border-border">
                <img
                  src={product.images?.[selectedImgIndex]?.url || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {hasDiscount && (
                  <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% OFF
                  </span>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-lg">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, index) => (
                    <button
                      key={img.publicId || index}
                      onClick={() => setSelectedImgIndex(index)}
                      className={`h-16 w-16 rounded-lg border-2 overflow-hidden bg-background shrink-0 transition-colors ${
                        selectedImgIndex === index ? "border-primary" : "border-border hover:border-text-secondary"
                      }`}
                    >
                      <img src={img.url} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Specs (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                {/* Category Pill */}
                <div className="mb-3">
                  <Badge variant="secondary" className="bg-accent-light/30 text-primary border-none hover:bg-accent-light/30">
                    {categoryLabels[product.category] || product.category}
                  </Badge>
                  {product.weight && (
                    <span className="text-xs text-text-secondary ml-3 bg-background border border-border px-2.5 py-1 rounded-full font-semibold">
                      {product.weight}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary leading-tight mb-2">
                  {product.name}
                </h1>

                {/* Ratings block */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 fill-current ${
                          i < Math.round(product.ratings?.average || 0)
                            ? "text-accent"
                            : "text-text-muted/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-text-secondary font-medium">
                    {product.ratings?.average ? product.ratings.average.toFixed(1) : "0.0"} ({product.ratings?.count || 0} customer reviews)
                  </span>
                </div>

                {/* Price block */}
                <div className="flex items-baseline gap-3 mb-6 p-4 bg-background rounded-xl border border-border">
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-text-muted line-through">
                        {formatCurrency(product.price)}
                      </span>
                      <Badge className="bg-success text-white border-none ml-2 text-xs font-semibold px-2 py-0.5">
                        Save {formatCurrency(product.price - product.discountPrice!)}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6">
                  {product.shortDescription || product.description}
                </p>

                {/* Stock status indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Availability:</span>
                  {isOutOfStock ? (
                    <Badge className="bg-error text-white font-semibold text-xs px-2.5 py-0.5 border-none">Out of stock</Badge>
                  ) : product.stock <= 5 ? (
                    <Badge className="bg-accent text-text-primary font-semibold text-xs px-2.5 py-0.5 border-none">Only {product.stock} left in stock!</Badge>
                  ) : (
                    <Badge className="bg-success/20 text-success border border-success/30 font-semibold text-xs px-2.5 py-0.5">In Stock ({product.stock} units)</Badge>
                  )}
                </div>
              </div>

              {/* Action area */}
              <div className="space-y-4 pt-6 border-t border-border">
                {!isOutOfStock && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary shrink-0">Quantity:</span>
                    <div className="flex items-center border border-border rounded-lg bg-background h-10">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 h-full hover:bg-border transition-colors text-text-secondary rounded-l-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-12 text-center text-sm font-semibold text-text-primary">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="px-3 h-full hover:bg-border transition-colors text-text-secondary rounded-r-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    variant="default"
                    className="flex-1 h-12 text-base font-semibold gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" /> Add to Cart
                  </Button>
                  <button
                    onClick={handleBuyWhatsApp}
                    disabled={isOutOfStock}
                    type="button"
                    className="flex-1 h-12 text-base font-semibold bg-[#25D366] text-white hover:bg-[#1ebe57] rounded-lg px-6 py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <WhatsAppIcon className="w-5 h-5" /> Buy via WhatsApp
                  </button>
                </div>

                {/* Reassurance block */}
                <div className="grid grid-cols-3 gap-2 pt-4 text-center border-t border-border/50 text-[10px] sm:text-xs text-text-secondary font-medium">
                  <div className="flex flex-col items-center gap-1.5 p-2 bg-background rounded-lg">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>100% Pure & Traditional</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2 bg-background rounded-lg">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Fast Pan-India Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2 bg-background rounded-lg">
                    <RotateCcw className="w-4 h-4 text-primary" />
                    <span>Easy Return Guarantee</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Details Tabs Section */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-16">
            {/* Tab Headers */}
            <div className="flex border-b border-border bg-background/50 overflow-x-auto">
              {(["description", "ingredients", "benefits", "reviews"] as DetailTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap transition-colors border-b-2 -mb-[2px] ${
                    activeTab === tab
                      ? "border-primary text-primary bg-white"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content Panels */}
            <div className="p-6 md:p-8">
              {activeTab === "description" && (
                <div className="prose max-w-none text-text-secondary text-sm md:text-base leading-relaxed">
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {activeTab === "ingredients" && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-text-primary">What goes inside:</h3>
                  {product.ingredients && product.ingredients.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 list-disc text-text-secondary text-sm md:text-base">
                      {product.ingredients.map((ing, idx) => (
                        <li key={idx} className="capitalize">{ing}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-text-secondary text-sm">
                      Made with 100% natural, traditionally-sourced ingredients. Free from chemicals, artificial preservatives, and food coloring.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "benefits" && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-text-primary">Health & Taste Benefits:</h3>
                  {product.benefits && product.benefits.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 list-disc text-text-secondary text-sm md:text-base">
                      {product.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-text-secondary text-sm">
                      Handcrafted using authentic grandmother recipes. Freshly packaged to preserve traditional aroma and nutritional value.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-8">
                  {/* Review Stats Summary */}
                  <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between pb-6 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary mb-1">Customer Reviews</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex text-accent">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 fill-current ${
                                i < Math.round(product.ratings?.average || 0)
                                  ? "text-accent"
                                  : "text-text-muted/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-text-secondary font-medium">
                          {product.ratings?.average ? product.ratings.average.toFixed(1) : "0.0"} ({product.ratings?.count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Write Review Form */}
                  <div className="bg-background rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <h4 className="font-playfair text-lg font-bold text-text-primary">
                      Write a Review
                    </h4>
                    
                    {isAuthenticated ? (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                            Your Rating
                          </label>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className="text-accent hover:scale-110 transition-transform focus:outline-none"
                              >
                                <Star
                                  className={`w-7 h-7 fill-current ${
                                    star <= newRating ? "text-accent" : "text-text-muted/20"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="comment" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                            Review Details
                          </label>
                          <textarea
                            id="comment"
                            rows={4}
                            maxLength={500}
                            placeholder="Share your experience with this traditional food product..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                          />
                          <div className="flex justify-between mt-1 text-[10px] text-text-muted font-medium">
                            <span>Minimum 5 characters.</span>
                            <span>{newComment.length}/500</span>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={submittingReview}
                          className="font-semibold text-xs h-9 px-5"
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                      </form>
                    ) : (
                      <div className="p-4 bg-white border border-border rounded-xl text-center">
                        <p className="text-sm text-text-secondary mb-3">
                          You must be logged in to share your rating and comments.
                        </p>
                        <Link to="/login" state={{ from: window.location.pathname }}>
                          <Button variant="outline" size="sm" className="font-semibold text-xs h-8 px-4 border-border">
                            Login to Write a Review
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviewsLoading ? (
                      <div className="text-center py-6 text-sm text-text-secondary">
                        Loading product reviews...
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8 bg-background rounded-xl border border-border">
                        <p className="text-sm text-text-secondary font-medium">No reviews yet.</p>
                        <p className="text-xs text-text-muted mt-1">Be the first to review this product!</p>
                      </div>
                    ) : (
                      reviews.map((r) => {
                        const isOwner = currentUser && (r.user._id === currentUser._id || currentUser.role === "admin");
                        return (
                          <div key={r._id} className="p-5 bg-white rounded-2xl border border-border shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-text-primary text-sm">
                                    {r.user?.name || "Anonymous User"}
                                  </span>
                                  {r.isVerified && (
                                    <span className="text-[10px] font-bold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                                      Verified Buyer
                                    </span>
                                  )}
                                </div>
                                <div className="flex text-accent mt-1.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3.5 h-3.5 fill-current ${
                                        i < r.rating ? "text-accent" : "text-text-muted/20"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2.5">
                                <span className="text-[10px] text-text-muted">
                                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </span>
                                {isOwner && (
                                  <button
                                    onClick={() => handleReviewDelete(r._id)}
                                    className="text-text-secondary hover:text-error transition-colors p-1"
                                    aria-label="Delete review"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                              {r.comment}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {filteredRelated.length > 0 && (
            <div>
              <div className="text-center md:text-left mb-8 pb-4 border-b border-border">
                <span className="text-xs font-semibold tracking-widest text-primary uppercase block mb-1">Recommended</span>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-text-primary">
                  You May Also Like
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredRelated.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
