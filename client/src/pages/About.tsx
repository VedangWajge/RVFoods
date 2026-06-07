import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Sparkles, Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20RV%20Foods!%20%F0%9F%99%8F%20I%27d%20like%20to%20know%20more%20about%20your%20story%20and%20products.`;

export default function About() {
  return (
    <>
      <Helmet>
        <title>Our Story & Heritage | RV Foods</title>
        <meta
          name="description"
          content="Learn about the heritage, values, and traditional recipe methods of RV Foods. Crafted by a Mumbai homemaker with generations of Maharashtrian kitchen secrets."
        />
      </Helmet>

      {/* 1. Hero Section */}
      <section className="bg-festive-cream pattern-bg py-16 sm:py-24 text-center border-b border-border select-none">
        <div className="container-main max-w-3xl space-y-4">
          <span className="text-accent-deep text-sm font-bold tracking-widest uppercase">
            OUR HERITAGE
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary leading-tight">
            The Story Behind RV Foods
          </h1>
          <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Bringing generations of Maharashtrian kitchen secrets directly to your doorstep.
          </p>
        </div>
      </section>

      {/* 2. Founder Story Section */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Story Text (Left) */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-primary text-xs font-bold tracking-widest uppercase">
                FROM A MUMBAI HOMEMAKER
              </span>
              <h2 className="font-heading text-3xl font-bold text-text-primary">
                A Journey of Flavour, Heritage, and Love
              </h2>
              <div className="space-y-4 text-text-secondary text-sm sm:text-base leading-relaxed font-body">
                <p>
                  RV Foods & Snacks was born out of a simple belief — that the best food comes 
                  from a home kitchen, made with patience, dedication, and love.
                </p>
                <p>
                  Our founder, a Mumbai homemaker, spent decades perfecting the recipes passed 
                  down through generations in her family. What started as small batches prepared for 
                  relatives and neighbours during festivals soon grew into a passion to share these 
                  traditional tastes with kitchens across the state.
                </p>
                <p>
                  Today, every masala is ground by hand, every batch of ghee is slow-churned, and 
                  every single anarase sweet is shaped the exact same way it has been for decades. 
                  We don't use machinery that strips spice oils, nor do we run large factory lines.
                </p>
                <p>
                  We don't use preservatives. We don't do short-cuts. We make fresh to order, pack 
                  lovingly, and deliver fast so that your family can experience the true, uncompromised 
                  taste of home.
                </p>
              </div>

              {/* Founder quote pill */}
              <div className="bg-festive-cream/60 border-l-4 border-primary p-4 rounded-r-xl">
                <p className="text-xs sm:text-sm italic text-text-primary font-medium">
                  "In every Maharashtrian home, food is not just sustenance; it is a blessing (prasad) 
                  cooked with love. We strive to bring that same sacred taste and purity to you."
                </p>
                <span className="block mt-2 text-xs font-bold text-primary">— Founder, RV Foods</span>
              </div>
            </div>

            {/* Visual Callout (Right) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border aspect-video sm:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&auto=format&fit=crop&q=80"
                  alt="Traditional Indian spice grinding"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="bg-accent text-text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Pure & Untouched
                    </span>
                    <h3 className="font-heading text-lg font-bold">100% Traditional Hand-ground Spices</h3>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Our Values Section */}
      <section className="bg-festive-cream pattern-bg py-16 sm:py-24 border-y border-border">
        <div className="container-main">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-accent-deep text-sm font-bold tracking-widest uppercase">
              OUR FOUNDATION
            </span>
            <h2 className="font-heading text-3xl font-bold text-text-primary">
              Values We Live By
            </h2>
            <p className="text-text-secondary text-sm">
              We never compromise on purity or tradition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Value 1: Homemade */}
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col space-y-3">
              <div className="p-3 bg-primary/10 rounded-full w-fit">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-text-primary">Homemade</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Prepared inside a family kitchen in small batches using time-honoured methods, not factories.
              </p>
            </div>

            {/* Value 2: Natural */}
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col space-y-3">
              <div className="p-3 bg-primary/10 rounded-full w-fit">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-text-primary">100% Natural</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                No chemical preservatives, artificial colours, MSG, or stabilizers. Just pure ingredients.
              </p>
            </div>

            {/* Value 3: Fresh */}
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col space-y-3">
              <div className="p-3 bg-primary/10 rounded-full w-fit">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-text-primary">Fresh to Order</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We grind spices and shape sweets only when we receive your order, ensuring maximum shelf-life.
              </p>
            </div>

            {/* Value 4: Traditional */}
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col space-y-3">
              <div className="p-3 bg-primary/10 rounded-full w-fit">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-text-primary">Traditional Recipes</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                True to authentic Maharashtrian preparation styles. No shortcuts, just generational secrets.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Products We Make */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="container-main">
          
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-accent-deep text-sm font-bold tracking-widest uppercase">
              OUR SPECIALITIES
            </span>
            <h2 className="font-heading text-3xl font-bold text-text-primary">
              Crafted in Our Kitchen
            </h2>
            <p className="text-text-secondary text-sm">
              We specialize in three signature categories of home products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Spice Speciality */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border bg-[#FDF1E0] flex items-center justify-center">
                <span className="text-6xl" role="img" aria-label="pepper">🌶️</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-text-primary text-center">Masale & Spices</h3>
              <p className="text-text-secondary text-sm text-center leading-relaxed">
                From our fiery Kanda Lasun Masala to the warm Goda Masala, our spices are ground fresh using selected whole chillies and spices.
              </p>
            </div>

            {/* Ghee Speciality */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border bg-[#FFFBF0] flex items-center justify-center">
                <span className="text-6xl" role="img" aria-label="ghee jar">🍪</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-text-primary text-center">Pure Ghee Anarase</h3>
              <p className="text-text-secondary text-sm text-center leading-relaxed">
                Aromatic, golden-grained, slow-churned pure cow ghee that adds that heavenly homemade touch to your bhakri, varan, and puran poli.
              </p>
            </div>

            {/* Sweets Speciality */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border bg-[#FDF6F0] flex items-center justify-center">
                <span className="text-6xl" role="img" aria-label="anarase sweet">🌕</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-text-primary text-center">Protein Ladoos & Sweets</h3>
              <p className="text-text-secondary text-sm text-center leading-relaxed">
                Perfect crispy rice-poppy seed Anarase, crunchy chakli, and sweet karanji prepared using pure ghee and jaggery, made for celebrations.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Delivery Info Section */}
      <section className="py-16 bg-festive-cream border-t border-border select-none">
        <div className="container-main max-w-3xl text-center space-y-4">
          <span className="text-primary text-2xl" role="img" aria-label="map pin">📍</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary">
            We Proudly Deliver Across Maharashtra
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            From Mumbai to Pune, Nagpur to Kolhapur — we ship fresh batches carefully packed to retain aroma and freshness, delivered right to your door.
          </p>
        </div>
      </section>

      {/* 6. WhatsApp CTA Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white text-center py-16 px-4 relative overflow-hidden select-none">
        <div className="absolute inset-0 opacity-[0.03] pattern-bg pointer-events-none" />
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Ready to Taste the Difference?
          </h2>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-body">
            Get in touch with us on WhatsApp to order custom hampers, query pricing, or request a fresh batch.
          </p>
          <div className="pt-2 flex justify-center gap-4 flex-wrap">
            <motion.a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-8 py-3.5 text-base font-bold text-white transition-all shadow-lg hover:bg-[#1ebe57]"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              Order on WhatsApp 💬
            </motion.a>
            <Link 
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-white text-primary border border-white hover:bg-transparent hover:text-white px-8 py-3.5 text-base font-bold transition-all shadow-md"
            >
              Browse Products <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
