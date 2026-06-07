import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BRAND, TRUST_ITEMS } from "@/utils/constants";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>{BRAND.name} | Pure. Traditional. Delivered.</title>
        <meta
          name="description"
          content="Buy 100% pure, natural, and traditional Indian homemade food products online. Hand-ground spices, pure cow ghee, authentic sweets, and snacks made without preservatives."
        />
      </Helmet>

      <section className="hero-section flex items-center">
        <div className="container-main grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <Badge className="badge-category">Premium Indian Foods</Badge>
            <h1 className="hero-headline text-balance">{BRAND.name}</h1>
            <p className="hero-subheadline">{BRAND.tagline}</p>
            <p className="text-text-secondary">{BRAND.description}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary">
                Shop Now
              </Link>
              <Link to="/about" className="btn-secondary">
                Our Story
              </Link>
            </div>
          </div>
          <div
            className="card-base flex aspect-square items-center justify-center rounded-2xl bg-accent/10"
            aria-hidden
          >
            <span className="font-heading text-6xl text-primary/30">🌶️</span>
          </div>
        </div>
      </section>

      <section className="container-main pb-16">
        <div className="trust-bar rounded-xl">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="trust-item">
              <span className="text-2xl text-primary" aria-hidden>
                ✓
              </span>
              <p className="trust-item-title">{item.title}</p>
              <p className="trust-item-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
