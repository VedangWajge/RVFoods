import { Link } from "react-router-dom";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/common/SocialIcons";

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20RV%20Foods!%20%F0%9F%99%8F%20I%27d%20like%20to%20order%20some%20traditional%20snacks%20and%20masale.`;

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="container-main py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-1.5 select-none py-1">
              <span className="text-xl animate-pulse" role="img" aria-label="diya">🪔</span>
              <div className="flex flex-col -space-y-0.5">
                <span className="font-heading text-lg font-bold text-primary sm:text-xl tracking-tight leading-tight">RV Foods</span>
                <span className="text-[9px] font-semibold tracking-widest text-accent uppercase font-marathi leading-none">& Snacks</span>
              </div>
            </Link>
            
            <p className="text-sm font-semibold tracking-wide text-white/95">
              Pure. Traditional. Delivered.
            </p>
            <p className="text-xs leading-relaxed text-white/60">
              Homemade masale, ghee & sweets from a Mumbai kitchen. Taste the Crunch, Feel the Freshness.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-[#25D366] hover:text-white"
                aria-label="Order on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-[#E1306C] hover:text-white"
                aria-label="Follow us on Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 font-heading text-base font-bold text-accent tracking-wide uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
              </li>
              <li>
                <Link to="/how-to-order" className="hover:text-primary transition-colors">How to Order</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Products */}
          <div>
            <h3 className="mb-4 font-heading text-base font-bold text-accent tracking-wide uppercase">
              Our Products
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/products?category=spices" className="hover:text-primary transition-colors">Masale & Spices</Link>
              </li>
              <li>
                <Link to="/products?category=ghee" className="hover:text-primary transition-colors">Pure Cow Ghee</Link>
              </li>
              <li>
                <Link to="/products?category=sweets" className="hover:text-primary transition-colors">Anarase & Sweets</Link>
              </li>
              <li>
                <Link to="/products?category=combo" className="hover:text-primary transition-colors">Combo Packs</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">Seasonal Specials</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="mb-4 font-heading text-base font-bold text-accent tracking-wide uppercase">
              Contact
            </h3>
            <ul className="space-y-3.5 text-sm text-white/75">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>Mumbai, Maharashtra</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Order on WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary text-xs font-bold">🚚</span>
                <span>Delivers across Maharashtra</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary text-xs font-bold">✓</span>
                <span>Made fresh · No preservatives</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-xs text-white/40 sm:flex-row sm:text-left select-none">
          <p>
            © 2024 RV Foods & Snacks · Made with 🧡 in Mumbai
          </p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
