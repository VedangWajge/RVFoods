import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
} from "@/components/common/SocialIcons";
import { BRAND, NAV_LINKS, PRODUCT_CATEGORIES } from "@/utils/constants";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: InstagramIcon,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: TwitterIcon,
  },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container-main section-padding-sm">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              to="/"
              className="font-heading text-2xl font-bold text-primary"
            >
              {BRAND.name}
            </Link>
            <p className="text-sm leading-relaxed text-white/70">
              {BRAND.tagline}
            </p>
            <p className="text-sm text-white/50">{BRAND.description}</p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-primary hover:text-white"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="footer-link text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/orders" className="footer-link text-sm">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="footer-link text-sm">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold text-white">
              Categories
            </h3>
            <ul className="space-y-2">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="footer-link text-sm"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold text-white">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>Pune, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${BRAND.phone}`} className="footer-link">
                  {BRAND.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <a href={`mailto:${BRAND.email}`} className="footer-link">
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-sm text-white/50 sm:flex-row sm:text-left">
          <p>
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/about" className="footer-link">
              Privacy Policy
            </Link>
            <Link to="/contact" className="footer-link">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
