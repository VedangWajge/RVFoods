import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "@/components/product/ProductGrid";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  SlidersHorizontal,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import type { ProductCategory, ProductSortOption } from "@/types/product.types";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "spices", label: "Masale (Spices)" },
  { value: "ghee", label: "Pure Ghee" },
  { value: "sweets", label: "Traditional Sweets" },
  { value: "snacks", label: "Savoury Snacks" },
  { value: "combo", label: "Combo Packs" },
];

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Customer Rating" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, pagination, loading, error, fetchProducts } = useProducts();

  // Local state for filters to be applied
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [localMinPrice, setLocalMinPrice] = useState(searchParams.get("minPrice") || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // URL Query values
  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";
  const activeMinRating = searchParams.get("minRating") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Sync search input with URL changes (e.g. when back/forward is clicked)
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
    setLocalMinPrice(searchParams.get("minPrice") || "");
    setLocalMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  // Fetch products when search parameters change
  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: 9,
      category: activeCategory ? (activeCategory as ProductCategory) : undefined,
      search: searchParams.get("search") || undefined,
      sort: activeSort as ProductSortOption,
      minPrice: activeMinPrice ? Number(activeMinPrice) : undefined,
      maxPrice: activeMaxPrice ? Number(activeMaxPrice) : undefined,
      minRating: activeMinRating ? Number(activeMinRating) : undefined,
    };

    fetchProducts(filters);
  }, [
    activeCategory,
    activeSort,
    activeMinPrice,
    activeMaxPrice,
    activeMinRating,
    currentPage,
    searchParams,
    fetchProducts,
  ]);

  // Helper to update search params
  const updateQueryParam = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    // Always reset page to 1 on filter changes unless explicit page update
    if (!params.page) {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateQueryParam({ search: searchInput });
  };

  const handleCategorySelect = (category: string) => {
    updateQueryParam({
      category: activeCategory === category ? null : category,
    });
  };

  const handleRatingSelect = (rating: string) => {
    updateQueryParam({
      minRating: activeMinRating === rating ? null : rating,
    });
  };

  const handlePriceApply = (e: FormEvent) => {
    e.preventDefault();
    updateQueryParam({
      minPrice: localMinPrice || null,
      maxPrice: localMaxPrice || null,
    });
  };

  const handleClearAll = () => {
    setSearchInput("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (page: number) => {
    updateQueryParam({ page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Determine if any filters are active
  const hasActiveFilters = Boolean(
    activeCategory ||
      searchParams.get("search") ||
      activeMinPrice ||
      activeMaxPrice ||
      activeMinRating
  );

  return (
    <>
      <Helmet>
        <title>Shop Traditional Spices, Ghee & Sweets | RV Foods</title>
        <meta
          name="description"
          content="Buy 100% pure, natural, and traditional Indian homemade food products online. Hand-ground spices, pure cow ghee, authentic anarase, and snacks delivered to your doorstep."
        />
      </Helmet>

      {/* Page hero banner */}
      <div className="bg-festive-cream pattern-bg py-12 text-center border-b border-border select-none">
        <h1 className="font-heading text-4xl font-bold text-text-primary">
          Our Products
        </h1>
        <p className="mt-2 text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
          Small batches. Made fresh. Shipped across Maharashtra.
        </p>
      </div>

      <div className="bg-[#FDFAF6] min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Layout */}
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Desktop Sidebar (Left Column) */}
            <aside className="hidden lg:block lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-border sticky top-20 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <h2 className="font-semibold text-text-primary flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
                  </h2>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear All
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-primary">Category</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleCategorySelect(cat.value)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors font-medium ${
                          activeCategory === cat.value
                            ? "bg-primary/10 text-primary"
                            : "text-text-secondary hover:bg-background hover:text-text-primary"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3 pb-2">
                  <h3 className="text-sm font-semibold text-text-primary">Price (₹)</h3>
                  <form onSubmit={handlePriceApply} className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={localMinPrice}
                        onChange={(e) => setLocalMinPrice(e.target.value)}
                        className="h-9 w-full text-xs"
                        min="0"
                      />
                      <span className="text-text-muted self-center text-xs">to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={localMaxPrice}
                        onChange={(e) => setLocalMaxPrice(e.target.value)}
                        className="h-9 w-full text-xs"
                        min="0"
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm" className="w-full h-8 text-xs font-semibold">
                      Apply Price
                    </Button>
                  </form>
                </div>

                {/* Customer Rating */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <h3 className="text-sm font-semibold text-text-primary">Ratings</h3>
                  <div className="space-y-2">
                    {[4, 3, 2].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingSelect(String(star))}
                        className={`flex items-center gap-2 w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                          activeMinRating === String(star)
                            ? "bg-primary/10 text-primary"
                            : "text-text-secondary hover:bg-background"
                        }`}
                      >
                        <div className="flex items-center text-accent">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 fill-current ${
                                i < star ? "text-accent" : "text-text-muted/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs">& Up</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Slide Over Drawer */}
            {isMobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
                <div className="relative ml-0 mr-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl animate-in slide-in-from-left duration-300">
                  <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-primary" /> Filters
                    </h2>
                    <button onClick={() => setIsMobileFilterOpen(false)} className="text-text-secondary hover:text-text-primary">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="px-4 py-6 space-y-6">
                    {/* Categories */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-text-primary">Category</h3>
                      <div className="space-y-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() => {
                              handleCategorySelect(cat.value);
                              setIsMobileFilterOpen(false);
                            }}
                            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors font-medium ${
                              activeCategory === cat.value
                                ? "bg-primary/10 text-primary"
                                : "text-text-secondary hover:bg-background"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-text-primary">Price (₹)</h3>
                      <form
                        onSubmit={(e) => {
                          handlePriceApply(e);
                          setIsMobileFilterOpen(false);
                        }}
                        className="space-y-3"
                      >
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={localMinPrice}
                            onChange={(e) => setLocalMinPrice(e.target.value)}
                            className="h-9 w-full text-xs"
                          />
                          <span className="text-text-muted self-center text-xs">to</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={localMaxPrice}
                            onChange={(e) => setLocalMaxPrice(e.target.value)}
                            className="h-9 w-full text-xs"
                          />
                        </div>
                        <Button type="submit" variant="outline" size="sm" className="w-full h-8 text-xs font-semibold">
                          Apply Price
                        </Button>
                      </form>
                    </div>

                    {/* Ratings */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-text-primary">Ratings</h3>
                      <div className="space-y-2">
                        {[4, 3, 2].map((star) => (
                          <button
                            key={star}
                            onClick={() => {
                              handleRatingSelect(String(star));
                              setIsMobileFilterOpen(false);
                            }}
                            className={`flex items-center gap-2 w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                              activeMinRating === String(star)
                                ? "bg-primary/10 text-primary"
                                : "text-text-secondary hover:bg-background"
                            }`}
                          >
                            <div className="flex items-center text-accent">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 fill-current ${
                                    i < star ? "text-accent" : "text-text-muted/30"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs">& Up</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Listing Area (Right Column) */}
            <main className="lg:col-span-3 space-y-6">
              {/* Top Control Bar */}
              <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search and Mobile Filter Toggle */}
                <div className="flex items-center gap-2 flex-grow max-w-md w-full">
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden shrink-0 border-border"
                    onClick={() => setIsMobileFilterOpen(true)}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-text-primary" />
                  </Button>

                  <form onSubmit={handleSearchSubmit} className="relative flex-grow">
                    <Input
                      type="text"
                      placeholder="Search spice blend, sweet, ghee..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-9 h-10 w-full"
                    />
                    <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  </form>
                </div>

                {/* Sorting options & Stats */}
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <span className="text-xs text-text-secondary font-medium shrink-0">
                    {pagination ? `${pagination.total} Products` : "Loading..."}
                  </span>

                  <select
                    value={activeSort}
                    onChange={(e) => updateQueryParam({ sort: e.target.value })}
                    className="h-10 text-xs px-3 py-2 bg-white rounded-lg border border-border text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => updateQueryParam({ category: null })}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                    !activeCategory
                      ? "bg-text-primary text-white border-text-primary shadow-sm"
                      : "bg-white text-text-secondary border-border hover:bg-background"
                  }`}
                >
                  All Products
                </button>
                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat.value;
                  let selectedClass = "";
                  if (isSelected) {
                    if (cat.value === "spices") selectedClass = "border-accent text-accent-deep bg-accent/5";
                    else if (cat.value === "ghee") selectedClass = "border-[#F5A623] text-[#F5A623] bg-[#F5A623]/5";
                    else if (cat.value === "sweets") selectedClass = "border-primary text-primary bg-primary/5";
                    else selectedClass = "border-primary text-primary bg-primary/5"; // default
                  }
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategorySelect(cat.value)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                        isSelected
                          ? `font-bold ${selectedClass}`
                          : "bg-white text-text-secondary border-border hover:bg-background"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Filters Bar */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 py-2">
                  <span className="text-xs font-semibold text-text-secondary mr-1">Active Filters:</span>
                  {activeCategory && (
                    <Badge variant="outline" className="bg-white border-border text-xs px-2.5 py-1 flex items-center gap-1.5 rounded-full font-medium">
                      Category: {CATEGORIES.find((c) => c.value === activeCategory)?.label || activeCategory}
                      <X className="w-3.5 h-3.5 text-text-secondary hover:text-primary cursor-pointer" onClick={() => handleCategorySelect(activeCategory)} />
                    </Badge>
                  )}
                  {searchParams.get("search") && (
                    <Badge variant="outline" className="bg-white border-border text-xs px-2.5 py-1 flex items-center gap-1.5 rounded-full font-medium">
                      Search: "{searchParams.get("search")}"
                      <X className="w-3.5 h-3.5 text-text-secondary hover:text-primary cursor-pointer" onClick={() => updateQueryParam({ search: null })} />
                    </Badge>
                  )}
                  {(activeMinPrice || activeMaxPrice) && (
                    <Badge variant="outline" className="bg-white border-border text-xs px-2.5 py-1 flex items-center gap-1.5 rounded-full font-medium">
                      Price: {activeMinPrice ? `₹${activeMinPrice}` : "₹0"} - {activeMaxPrice ? `₹${activeMaxPrice}` : "Max"}
                      <X className="w-3.5 h-3.5 text-text-secondary hover:text-primary cursor-pointer" onClick={() => {
                        setLocalMinPrice("");
                        setLocalMaxPrice("");
                        updateQueryParam({ minPrice: null, maxPrice: null });
                      }} />
                    </Badge>
                  )}
                  {activeMinRating && (
                    <Badge variant="outline" className="bg-white border-border text-xs px-2.5 py-1 flex items-center gap-1.5 rounded-full font-medium">
                      Rating: {activeMinRating}+ Stars
                      <X className="w-3.5 h-3.5 text-text-secondary hover:text-primary cursor-pointer" onClick={() => handleRatingSelect(activeMinRating)} />
                    </Badge>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-primary font-semibold hover:text-primary-dark underline underline-offset-2 ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="bg-error/10 border border-error/20 rounded-xl p-4 text-error text-center text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Grid content / Loader */}
              {loading ? (
                <div className="flex items-center justify-center py-24 min-h-[400px]">
                  <Loader size="lg" label="Sourcing fresh products..." />
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-border p-8 shadow-sm">
                  <span className="text-5xl mb-4" role="img" aria-label="sad face">😔</span>
                  <h3 className="font-heading text-xl font-bold text-text-primary">No products found 😔</h3>
                  <p className="text-text-secondary text-sm mt-1 mb-6">
                    Try a different filter or browse all products.
                  </p>
                  <Button
                    onClick={handleClearAll}
                    className="btn-primary rounded-full px-6 py-2"
                  >
                    Browse All
                  </Button>
                </div>
              ) : (
                <>
                  <ProductGrid products={products} />

                  {/* Pagination controls */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6 border-t border-border mt-8">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <ChevronLeft className="w-4 h-4 text-text-primary" />
                      </Button>
                      {[...Array(pagination.pages)].map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            className="h-9 w-9 rounded-lg font-semibold text-sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        disabled={currentPage === pagination.pages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <ChevronRight className="w-4 h-4 text-text-primary" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
