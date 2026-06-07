import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "@/components/product/ProductGrid";
import { BRAND } from "@/utils/constants";
import { Home as HomeIcon, Leaf, Truck, MessageCircle, ArrowRight, Sparkles, Star } from "lucide-react";
import Loader from "@/components/common/Loader";

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20RV%20Foods!%20%F0%9F%99%8F%20I%27d%20like%20to%20order%20some%20traditional%20snacks%20and%20masale.`;

export default function Home() {
  const { products, loading, fetchProducts } = useProducts();

  useEffect(() => {
    // Fetch only featured products or first few bestseller products
    void fetchProducts({ limit: 6 });
  }, [fetchProducts]);

  return (
    <>
      <Helmet>
        <title>{BRAND.name} | Pure. Traditional. Delivered.</title>
        <meta
          name="description"
          content="Taste the crunch, feel the freshness. Buy authentic Maharashtrian homemade masale, pure cow ghee, and traditional sweets crafted by a Mumbai homemaker."
        />
      </Helmet>

      {/* Thin Festive Announcement Banner */}
      <div className="bg-primary text-white text-center text-xs py-1.5 px-4 font-medium tracking-wide select-none">
        🚚 Free delivery on orders above ₹999 across Maharashtra
      </div>

      {/* A) HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FDF1E0] via-[#FDFAF6] to-[#FDF6EC] pattern-bg py-12 lg:py-24">
        <div className="container-main grid items-center gap-12 lg:grid-cols-12">
          
          {/* Left Column: Copy & Actions */}
          <motion.div 
            className="space-y-6 lg:col-span-7 flex flex-col justify-center text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              className="font-marathi text-accent-deep text-lg font-bold tracking-wide"
            >
              घरचं जेवण, घरचं प्रेम
            </motion.p>
            
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight"
            >
              Mumbai's Favourite <br />
              <span className="text-primary underline decoration-accent decoration-2 underline-offset-4">Homemade</span> Sweets & Masale
            </motion.h1>
            
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-body"
            >
              Crafted by a Mumbai homemaker with generations-old recipes. 
              No preservatives. No shortcuts. Just pure, traditional flavour.
            </motion.p>
            
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link 
                to="/products" 
                className="btn-primary px-8 py-3 rounded-full text-base font-semibold shadow-md hover:bg-primary-dark transition-all duration-300"
              >
                Shop Now
              </Link>
              
              <motion.a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-8 py-3 text-base font-semibold text-white transition-all shadow-md hover:bg-[#1ebe57]"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                Order on WhatsApp 💬
              </motion.a>
            </motion.div>
            
            {/* Trust Pills Bar */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4 text-xs font-semibold text-text-secondary"
            >
              <span className="bg-white/80 border border-border px-3 py-1 rounded-full shadow-sm">✓ No Preservatives</span>
              <span className="bg-white/80 border border-border px-3 py-1 rounded-full shadow-sm">✓ Fresh to Order</span>
              <span className="bg-white/80 border border-border px-3 py-1 rounded-full shadow-sm">✓ Ships across Mumbai</span>
            </motion.div>
          </motion.div>
          
          {/* Right Column: Tilted Card Collage */}
          <div className="lg:col-span-5 relative h-[360px] sm:h-[420px] w-full max-w-[420px] mx-auto flex items-center justify-center mt-6 lg:mt-0 select-none">
            {/* Card 3 (Bottom/Right) */}
            <motion.div
              className="absolute w-56 sm:w-64 bg-surface rounded-2xl shadow-md p-3 border border-border rotate-6 translate-x-12 translate-y-8 z-10 hover:z-30 transition-all duration-300 hover:rotate-3"
              initial={{ opacity: 0, scale: 0.9, x: 60, y: 40 }}
              animate={{ opacity: 1, scale: 1, x: 48, y: 32 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80"
                alt="Traditional Sweets"
                className="w-full h-32 sm:h-40 object-cover rounded-xl"
              />
              <p className="mt-2 text-xs font-bold text-text-primary text-center">Protein Ladoos & Sweets</p>
            </motion.div>

            {/* Card 2 (Middle/Left) */}
            <motion.div
              className="absolute w-56 sm:w-64 bg-surface rounded-2xl shadow-md p-3 border border-border -rotate-3 -translate-x-12 translate-y-4 z-20 hover:z-30 transition-all duration-300 hover:rotate-0"
              initial={{ opacity: 0, scale: 0.9, x: -60, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: -48, y: 16 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=80"
                alt="Pure Cow Ghee"
                className="w-full h-32 sm:h-40 object-cover rounded-xl"
              />
              <p className="mt-2 text-xs font-bold text-text-primary text-center">Pure Desi Ghee Anarase</p>
            </motion.div>

            {/* Card 1 (Top/Center) */}
            <motion.div
              className="absolute w-56 sm:w-64 bg-surface rounded-2xl shadow-xl p-3 border border-border/80 rotate-1 -translate-y-10 z-25 hover:z-30 transition-all duration-300 hover:scale-105"
              initial={{ opacity: 0, scale: 0.9, y: -60 }}
              animate={{ opacity: 1, scale: 1, y: -36 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div className="absolute -top-3 -right-3 z-30 bg-accent text-text-primary text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" /> Loved by 500+ families
              </div>
              <img
                src="https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=80"
                alt="Homemade Spices"
                className="w-full h-32 sm:h-40 object-cover rounded-xl"
              />
              <p className="mt-2 text-xs font-bold text-text-primary text-center">Authentic Masale</p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* B) TRUST BAR */}
      <section className="bg-primary text-white py-8 shadow-inner overflow-hidden">
        <div className="container-main">
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.div 
              variants={{ hidden: { scale: 0.8, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
              className="flex flex-col items-center text-center p-2 space-y-2 border-r border-white/10 last:border-0"
            >
              <div className="p-3 bg-white/10 rounded-full">
                <HomeIcon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-base">Homemade</h3>
              <p className="text-xs text-white/80">Traditional family recipes</p>
            </motion.div>

            <motion.div 
              variants={{ hidden: { scale: 0.8, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
              className="flex flex-col items-center text-center p-2 space-y-2 border-r border-white/10 last:border-0"
            >
              <div className="p-3 bg-white/10 rounded-full">
                <Leaf className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-base">No Preservatives</h3>
              <p className="text-xs text-white/80">100% natural ingredients</p>
            </motion.div>

            <motion.div 
              variants={{ hidden: { scale: 0.8, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
              className="flex flex-col items-center text-center p-2 space-y-2 border-r border-white/10 last:border-0"
            >
              <div className="p-3 bg-white/10 rounded-full">
                <Truck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-base">Ships in Mumbai</h3>
              <p className="text-xs text-white/80">Delivered fresh and fast</p>
            </motion.div>

            <motion.div 
              variants={{ hidden: { scale: 0.8, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
              className="flex flex-col items-center text-center p-2 space-y-2 last:border-0"
            >
              <div className="p-3 bg-white/10 rounded-full">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-base">Order via WhatsApp</h3>
              <p className="text-xs text-white/80">Easy checkout in one click</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* C) FEATURED PRODUCTS SECTION */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="container-main">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-accent-deep text-sm font-bold tracking-widest uppercase">
              OUR BESTSELLERS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
              Made Fresh, Delivered with Love
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Small batches. Big flavour. Every order made to order.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          <div className="text-center mt-12">
            <Link 
              to="/products"
              className="btn-secondary px-6 py-2.5 inline-flex items-center gap-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* D) CATEGORY SECTION — 3 CARDS */}
      <section className="bg-festive-cream pattern-bg py-16 sm:py-24 border-y border-border">
        <div className="container-main">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-accent-deep text-sm font-bold tracking-widest uppercase">
              EXPLORE CATEGORIES
            </span>
            <h2 className="font-heading text-3xl font-bold text-text-primary">
              Authentic Maharashtrian Delights
            </h2>
            <p className="text-text-secondary text-sm">
              Handcrafted in small batches using traditional methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Card 1: Spices */}
            <motion.div 
              className="flex flex-col bg-gradient-to-br from-[#FDF1E0] to-[#FFF8F0] border-l-4 border-accent rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 space-y-4 justify-between"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-3">
                <span className="text-4xl" role="img" aria-label="spices">🌶️</span>
                <h3 className="font-heading text-xl font-bold text-text-primary">Masale & Spices</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Hand-ground spice blends made from whole spices - no fillers, no artificial colour.
                </p>
                <div className="inline-block bg-white/70 border border-accent/20 text-accent-deep text-xs font-semibold px-3 py-1 rounded-full">
                  Kanda Lasun · Goda Masala · Garam Masala
                </div>
              </div>
              <Link 
                to="/products?category=spices"
                className="text-accent-deep font-bold text-sm hover:text-accent-deep/80 flex items-center gap-1.5 pt-2 group"
              >
                Browse Masale <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Card 2: Ghee */}
            <motion.div 
              className="flex flex-col bg-gradient-to-br from-[#FFFBF0] to-[#FFF9E6] border-l-4 border-[#F5A623] rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 space-y-4 justify-between"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="space-y-3">
                <span className="text-4xl" role="img" aria-label="ghee">🍪</span>
                <h3 className="font-heading text-xl font-bold text-text-primary">Pure Ghee Anarase</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Slow-churned desi ghee, golden and aromatic — the way your aaji used to make it.
                </p>
                <div className="inline-block bg-white/70 border border-[#F5A623]/20 text-accent-deep text-xs font-semibold px-3 py-1 rounded-full">
                  Anarase - Telache | Tupache
                </div>
              </div>
              <Link 
                to="/products?category=ghee"
                className="text-accent-deep font-bold text-sm hover:text-accent-deep/80 flex items-center gap-1.5 pt-2 group"
              >
                Browse Anarase <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Card 3: Sweets */}
            <motion.div 
              className="flex flex-col bg-gradient-to-br from-[#FDF6F0] to-[#FFF0EE] border-l-4 border-primary rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 space-y-4 justify-between"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="space-y-3">
                <span className="text-4xl" role="img" aria-label="sweets">🌕</span>
                <h3 className="font-heading text-xl font-bold text-text-primary">Protein Ladoos & Sweets</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Traditional Maharashtrian sweets made for festivals and everyday indulgence.
                </p>
                <div className="inline-block bg-white/70 border border-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  Ladoos · Chakli · Karanji
                </div>
              </div>
              <Link 
                to="/products?category=sweets"
                className="text-primary font-bold text-sm hover:text-primary-dark flex items-center gap-1.5 pt-2 group"
              >
                Browse Sweets <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* E) OUR STORY SECTION */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Story Copy */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-accent-deep text-sm font-bold tracking-widest uppercase">
                OUR STORY
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
                From a Mumbai Kitchen <br />to Your Doorstep
              </h2>
              <div className="space-y-4 text-text-secondary text-sm sm:text-base leading-relaxed font-body">
                <p>
                  RV Foods & Snacks was born out of a simple belief that the 
                  best food comes from a home kitchen, made with patience and love.
                </p>
                <p>
                  Started by a Mumbai homemaker, every masala is ground by hand, 
                  every batch of ghee is slow-churned, and every anarase is shaped 
                  the same way it was decades ago in a Maharashtrian home.
                </p>
                <p>
                  We don't use preservatives. We don't do large factory batches. 
                  We make fresh, we deliver fast and we ship across Mumbai 
                  so more families can taste the difference.
                </p>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="bg-festive-cream border border-border px-4 py-2 rounded-xl text-text-primary font-semibold text-xs sm:text-sm flex items-center gap-2">
                  🌿 100% Natural Ingredients
                </div>
                <div className="bg-festive-cream border border-border px-4 py-2 rounded-xl text-text-primary font-semibold text-xs sm:text-sm flex items-center gap-2">
                  🚚 Ships across Mumbai
                </div>
              </div>
            </div>

            {/* Right Story Graphic */}
            <div className="lg:col-span-5">
              <div className="bg-festive-cream border border-border rounded-2xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden select-none">
                <div className="absolute top-0 right-0 p-4 opacity-10 font-marathi text-8xl">प्रेम</div>
                <div className="space-y-4">
                  <p className="font-marathi text-primary text-3xl sm:text-4xl font-bold leading-relaxed">
                    "घरचं जेवण, <br />घरचं प्रेम"
                  </p>
                  <p className="text-text-secondary italic text-sm font-body">
                    Home food, Home love
                  </p>
                  <div className="w-12 h-[2px] bg-accent/40 mx-auto my-4" />
                  <p className="font-heading italic text-text-primary text-base">
                    — Made with love, shipped with care 🙏
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* F) HOW TO ORDER (3 steps) */}
      <section className="bg-primary text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pattern-bg pointer-events-none" />
        <div className="container-main relative z-10">
          
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Ordering is Simple
            </h2>
            <p className="text-white/80 text-sm sm:text-base">
              No app needed. No account required. Just WhatsApp.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-white/20 z-0" />

            {/* Step 1 */}
            <div className="space-y-4 flex flex-col items-center relative z-10">
              <div className="w-16 h-16 bg-accent text-text-primary font-bold text-xl flex items-center justify-center rounded-full shadow-lg border-4 border-primary-dark select-none">
                1
              </div>
              <h3 className="font-bold text-lg">Browse & Add to Cart</h3>
              <p className="text-sm text-white/80 max-w-xs leading-relaxed">
                Explore our products and add what you love to your cart.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 flex flex-col items-center relative z-10">
              <div className="w-16 h-16 bg-accent text-text-primary font-bold text-xl flex items-center justify-center rounded-full shadow-lg border-4 border-primary-dark select-none">
                2
              </div>
              <h3 className="font-bold text-lg">Click 'Order on WhatsApp'</h3>
              <p className="text-sm text-white/80 max-w-xs leading-relaxed">
                We'll automatically generate your order details and send them instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 flex flex-col items-center relative z-10">
              <div className="w-16 h-16 bg-accent text-text-primary font-bold text-xl flex items-center justify-center rounded-full shadow-lg border-4 border-primary-dark select-none">
                3
              </div>
              <h3 className="font-bold text-lg">Pay via UPI & Confirm</h3>
              <p className="text-sm text-white/80 max-w-xs leading-relaxed">
                Scan our QR code, send a screenshot of the payment, and your order is confirmed!
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* G) TESTIMONIALS */}
      <section className="bg-festive-cream pattern-bg py-16 sm:py-24 border-y border-border">
        <div className="container-main">
          
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-accent-deep text-sm font-bold tracking-widest uppercase">
              REVIEWS
            </span>
            <h2 className="font-heading text-3xl font-bold text-text-primary">
              What Our Customers Say
            </h2>
            <p className="text-text-secondary text-sm">
              Loved by families all over Mumbai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Card 1 */}
            <motion.div 
              className="bg-surface rounded-xl shadow-sm p-6 space-y-4 border border-border flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="space-y-3">
                <div className="text-accent flex items-center gap-0.5">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed italic">
                  "The kanda lasun masala is exactly like what my mother makes. 
                  I've been ordering every month since I found RV Foods!"
                </p>
              </div>
              <p className="text-xs font-bold text-text-primary text-right">
                — Priya S., Thane
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              className="bg-surface rounded-xl shadow-sm p-6 space-y-4 border border-border flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="space-y-3">
                <div className="text-accent flex items-center gap-0.5">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed italic">
                  "Pure ghee with that authentic aroma — you can tell it's 
                  homemade. My whole family loves it."
                </p>
              </div>
              <p className="text-xs font-bold text-text-primary text-right">
                — Rahul M., Pune
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              className="bg-surface rounded-xl shadow-sm p-6 space-y-4 border border-border flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="space-y-3">
                <div className="text-accent flex items-center gap-0.5">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed italic">
                  "Ordered anarase for Diwali and everyone asked where I got them. 
                  Crispy, perfectly sweet — just like aaji's recipe."
                </p>
              </div>
              <p className="text-xs font-bold text-text-primary text-right">
                — Sneha D., Mumbai
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* H) NEWSLETTER / WHATSAPP CTA SECTION */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white text-center py-16 px-4 relative overflow-hidden select-none">
        <div className="absolute inset-0 opacity-[0.03] pattern-bg pointer-events-none" />
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Never Miss a Fresh Batch
          </h2>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-body">
            Join our WhatsApp list for new arrivals, seasonal 
            specials, and festival hampers — delivered fresh to your door.
          </p>
          <div className="pt-2">
            <motion.a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-8 py-3.5 text-base font-bold text-white transition-all shadow-lg hover:bg-[#1ebe57]"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              Join on WhatsApp 💬
            </motion.a>
          </div>
          <p className="text-white/60 text-xs font-medium">
            Mumbai delivery · No spam · Unsubscribe anytime
          </p>
        </div>
      </section>
    </>
  );
}
