import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProducts } from "@/hooks/useProducts";
import { useUIStore } from "@/store/uiStore";
import { createProductSchema } from "@/utils/validators";
import { formatCurrency } from "@/utils/formatCurrency";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductCategory } from "@/types/product.types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  Loader2,
  Star,
  Sparkles,
} from "lucide-react";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "spices", label: "Masale (Spices)" },
  { value: "ghee", label: "Ghee" },
  { value: "sweets", label: "Sweets" },
  { value: "snacks", label: "Snacks" },
  { value: "combo", label: "Combo Packs" },
];

export default function ManageProducts() {
  const {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    deleteProductImage,
    toggleFeatured,
  } = useProducts();

  const showToast = useUIStore((s) => s.showToast);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form setup using react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      name: "",
      category: "spices",
      description: "",
      shortDescription: "",
      price: 0,
      discountPrice: undefined,
      stock: 0,
      weight: "",
      ingredients: [],
      benefits: [],
      isFeatured: false,
      isActive: true,
    },
  });

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open modal for adding product
  const handleAddClick = () => {
    setEditingProduct(null);
    reset({
      name: "",
      category: "spices",
      description: "",
      shortDescription: "",
      price: 0,
      discountPrice: undefined,
      stock: 0,
      weight: "",
      ingredients: [],
      benefits: [],
      isFeatured: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing product
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      category: product.category,
      description: product.description,
      shortDescription: product.shortDescription || "",
      price: product.price,
      discountPrice: product.discountPrice || undefined,
      stock: product.stock,
      weight: product.weight,
      ingredients: product.ingredients || [],
      benefits: product.benefits || [],
      isFeatured: product.isFeatured || false,
      isActive: product.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  // Delete product action
  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = await deleteProduct(id);
      if (success) {
        showToast("Product deleted successfully", "success");
      } else {
        showToast("Failed to delete product", "error");
      }
    }
  };

  // Toggle Featured directly in list
  const handleToggleFeatured = async (id: string) => {
    const res = await toggleFeatured(id);
    if (res) {
      showToast(`Product ${res.isFeatured ? "featured" : "removed from featured"}`, "success");
    } else {
      showToast("Failed to update featured status", "error");
    }
  };

  // Form Submit Action
  const onSubmit = async (values: any) => {
    // Sanitize payload (empty values, lists conversion)
    const payload = {
      ...values,
      discountPrice: values.discountPrice ? Number(values.discountPrice) : undefined,
      price: Number(values.price),
      stock: Number(values.stock),
      ingredients: Array.isArray(values.ingredients)
        ? values.ingredients
        : typeof values.ingredients === "string"
            ? (values.ingredients as string).split(",").map((i) => i.trim()).filter(Boolean)
            : [],
      benefits: Array.isArray(values.benefits)
        ? values.benefits
        : typeof values.benefits === "string"
            ? (values.benefits as string).split(",").map((b) => b.trim()).filter(Boolean)
            : [],
    };

    if (editingProduct) {
      const updated = await updateProduct(editingProduct._id, payload);
      if (updated) {
        showToast("Product updated successfully", "success");
        setIsModalOpen(false);
      } else {
        showToast("Failed to update product", "error");
      }
    } else {
      const created = await createProduct(payload);
      if (created) {
        showToast("Product created successfully! You can now edit it to upload images.", "success");
        setIsModalOpen(false);
      } else {
        showToast("Failed to create product", "error");
      }
    }
  };

  // Multi-image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct || !e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const updated = await uploadProductImages(editingProduct._id, files);
    setUploadingImages(false);
    if (updated) {
      setEditingProduct(updated);
      showToast("Images uploaded successfully", "success");
    } else {
      showToast("Failed to upload images", "error");
    }
  };

  // Single-image deletion handler
  const handleImageDelete = async (imageId: string) => {
    if (!editingProduct) return;
    if (window.confirm("Are you sure you want to delete this image?")) {
      const updated = await deleteProductImage(editingProduct._id, imageId);
      if (updated) {
        setEditingProduct(updated);
        showToast("Image deleted successfully", "success");
      } else {
        showToast("Failed to delete image", "error");
      }
    }
  };

  // Filter products based on search & category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Manage Products | Admin | RV Foods</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
              Products Management
            </h2>
            <p className="text-sm text-text-secondary">
              Create, edit, and control the visibility of products in your shop.
            </p>
          </div>
          <Button onClick={handleAddClick} className="gap-1.5 shrink-0 self-start sm:self-center">
            <Plus className="h-4.5 w-4.5" />
            Add Product
          </Button>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search products..."
              className="pl-9 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading and empty states */}
        {loading && products.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader size="lg" label="Syncing inventory..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-xl">
            <div className="text-4xl mb-2">📦</div>
            <h3 className="font-heading text-lg font-bold text-text-primary">No products found</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
              Try adjusting your search terms, filtering by another category, or add a new product.
            </p>
          </div>
        ) : (
          /* Products Table Grid */
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price / Sale</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-background/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded-lg border border-border bg-background overflow-hidden shrink-0">
                          <img
                            src={prod.images?.[0]?.url || "/placeholder-product.jpg"}
                            alt={prod.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px] truncate">
                          <h4 className="font-semibold text-text-primary truncate">{prod.name}</h4>
                          <span className="text-[10px] text-text-muted">{prod.weight}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-text-secondary font-medium">
                        {prod.category}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary">
                            {formatCurrency(prod.discountPrice ?? prod.price)}
                          </span>
                          {prod.discountPrice && (
                            <span className="text-[10px] text-text-muted line-through">
                              {formatCurrency(prod.price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {prod.stock === 0 ? (
                          <Badge className="bg-error/10 text-error border border-error/20 hover:bg-error/10">Out</Badge>
                        ) : prod.stock <= 5 ? (
                          <Badge className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100">
                            Low ({prod.stock})
                          </Badge>
                        ) : (
                          <span className="text-text-secondary font-medium">{prod.stock} units</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${prod.isActive ? "bg-success" : "bg-text-muted"}`} />
                            <span className="text-xs font-semibold text-text-secondary">
                              {prod.isActive ? "Active" : "Hidden"}
                            </span>
                          </div>
                          {prod.isFeatured && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                              <Star className="h-3 w-3 fill-current" />
                              <span>Featured</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleFeatured(prod._id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              prod.isFeatured
                                ? "bg-accent-light/30 border-accent/20 text-primary hover:bg-accent-light/50"
                                : "bg-white border-border text-text-muted hover:text-text-secondary"
                            }`}
                            title="Toggle Featured Status"
                          >
                            <Star className={`h-4 w-4 ${prod.isFeatured ? "fill-current" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleEditClick(prod)}
                            className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(prod._id, prod.name)}
                            className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-error hover:border-error/30 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add / Edit product modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-border p-6 md:p-8 shadow-xl"
              >
                {/* Close button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 rounded-lg p-1 text-text-muted hover:bg-background hover:text-text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Modal Title */}
                <h3 className="font-heading text-xl md:text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {editingProduct ? `Edit: ${editingProduct.name}` : "Add New Product"}
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left block fields */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" {...register("name")} placeholder="e.g. Handmade Cow Ghee" />
                        {errors.name && <p className="text-xs text-error mt-1">{errors.name.message?.toString()}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <select
                            id="category"
                            {...register("category")}
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                          {errors.category && <p className="text-xs text-error mt-1">{errors.category.message?.toString()}</p>}
                        </div>

                        <div>
                          <Label htmlFor="weight">Weight / Volume</Label>
                          <Input id="weight" {...register("weight")} placeholder="e.g. 500g, 1 Liter" />
                          {errors.weight && <p className="text-xs text-error mt-1">{errors.weight.message?.toString()}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input id="price" type="number" {...register("price")} />
                          {errors.price && <p className="text-xs text-error mt-1">{errors.price.message?.toString()}</p>}
                        </div>

                        <div>
                          <Label htmlFor="discountPrice">Discount Price (₹)</Label>
                          <Input id="discountPrice" type="number" placeholder="Optional" {...register("discountPrice")} />
                          {errors.discountPrice && <p className="text-xs text-error mt-1">{errors.discountPrice.message?.toString()}</p>}
                        </div>

                        <div>
                          <Label htmlFor="stock">Stock Quantity</Label>
                          <Input id="stock" type="number" {...register("stock")} />
                          {errors.stock && <p className="text-xs text-error mt-1">{errors.stock.message?.toString()}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="shortDescription">Short Description</Label>
                        <Input
                          id="shortDescription"
                          {...register("shortDescription")}
                          placeholder="Brief 1-sentence hook (max 120 chars)"
                        />
                        {errors.shortDescription && <p className="text-xs text-error mt-1">{errors.shortDescription.message?.toString()}</p>}
                      </div>

                      <div>
                        <Label htmlFor="description">Full Description</Label>
                        <textarea
                          id="description"
                          rows={4}
                          {...register("description")}
                          placeholder="Detailed description of taste, heritage, recipe..."
                          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        {errors.description && <p className="text-xs text-error mt-1">{errors.description.message?.toString()}</p>}
                      </div>
                    </div>

                    {/* Right block fields */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ingredients">Ingredients (Comma separated)</Label>
                        <textarea
                          id="ingredients"
                          rows={2}
                          placeholder="e.g. Pure cow milk fat, cardamom seeds"
                          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          onChange={(e) => {
                            const val = e.target.value.split(",").map((i) => i.trim());
                            setValue("ingredients", val);
                          }}
                          defaultValue={editingProduct?.ingredients?.join(", ") || ""}
                        />
                      </div>

                      <div>
                        <Label htmlFor="benefits">Health Benefits (Comma separated)</Label>
                        <textarea
                          id="benefits"
                          rows={2}
                          placeholder="e.g. Aids digestion, boosts immunity"
                          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          onChange={(e) => {
                            const val = e.target.value.split(",").map((b) => b.trim());
                            setValue("benefits", val);
                          }}
                          defaultValue={editingProduct?.benefits?.join(", ") || ""}
                        />
                      </div>

                      {/* Toggles */}
                      <div className="flex gap-6 p-4 rounded-xl border border-border bg-background/30">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                            {...register("isFeatured")}
                          />
                          <div>
                            <span className="text-sm font-semibold text-text-primary">Featured Product</span>
                            <p className="text-[10px] text-text-secondary">Highlight on Homepage</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                            {...register("isActive")}
                          />
                          <div>
                            <span className="text-sm font-semibold text-text-primary">Active Storefront</span>
                            <p className="text-[10px] text-text-secondary">Visible to Customers</p>
                          </div>
                        </label>
                      </div>

                      {/* Photo management section — available only during edit */}
                      <div className="border-t border-border pt-4">
                        <Label className="block mb-2">Product Images</Label>
                        {editingProduct ? (
                          <div className="space-y-3">
                            {/* Listing of current photos */}
                            {editingProduct.images && editingProduct.images.length > 0 ? (
                              <div className="flex flex-wrap gap-2.5">
                                {editingProduct.images.map((img) => (
                                  <div
                                    key={img.publicId}
                                    className="relative h-16 w-16 border border-border rounded-lg overflow-hidden bg-background group"
                                  >
                                    <img src={img.url} className="h-full w-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => handleImageDelete(img.publicId)}
                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-text-muted">No images uploaded yet.</p>
                            )}

                            {/* Upload area */}
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-2 hover:bg-background cursor-pointer text-xs font-semibold text-text-secondary transition-colors">
                                <ImageIcon className="h-4 w-4 text-text-muted" />
                                <span>Upload Images (Max 5)</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  disabled={uploadingImages}
                                />
                              </label>
                              {uploadingImages && (
                                <div className="flex items-center gap-1 text-xs text-primary font-medium">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Cloudinary Upload...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-border bg-background/50 p-4 text-center">
                            <p className="text-xs text-text-secondary leading-relaxed">
                              ⚠️ You can upload product images <strong>after</strong> you create the product details.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProduct ? "Save Changes" : "Create Product"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
