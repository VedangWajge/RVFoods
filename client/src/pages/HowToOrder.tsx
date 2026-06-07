import { BRAND } from "@/utils/constants";
import { Helmet } from "react-helmet-async";
import { ShoppingCart, QrCode } from "lucide-react";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className}
    width="100%"
    height="100%"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.419 5.422.002 12.079.002c3.225.001 6.258 1.257 8.537 3.539 2.279 2.28 3.532 5.317 3.53 8.544-.005 6.661-5.424 12.079-12.081 12.079-2.002-.001-3.972-.5-5.713-1.448L0 24zm6.59-4.846c1.6.95 3.397 1.453 5.24 1.454 5.377 0 9.75-4.372 9.754-9.752.002-2.607-1.013-5.059-2.859-6.904C16.883 2.1 14.436 1.087 11.83 1.087 6.455 1.087 2.084 5.46 2.08 10.835c-.001 1.839.486 3.64 1.411 5.234l-.973 3.548 3.638-.954zm10.933-7.877c-.29-.146-1.72-.85-1.987-.947-.267-.097-.461-.146-.656.146-.195.29-.757.947-.927 1.14-.17.195-.34.218-.63.073-.29-.147-1.228-.452-2.338-1.444-.864-.77-1.448-1.721-1.618-2.013-.17-.29-.018-.447.127-.592.13-.13.29-.34.436-.509.145-.17.195-.29.29-.485.097-.195.05-.364-.025-.509-.073-.146-.656-1.579-.9-2.172-.236-.57-.478-.493-.656-.502-.17-.008-.364-.01-.559-.01-.195 0-.514.073-.78.364-.268.29-1.022.996-1.022 2.43 0 1.433 1.043 2.816 1.189 3.01.145.193 2.052 3.134 4.972 4.39.694.299 1.236.478 1.659.613.698.222 1.332.19 1.833.115.558-.083 1.72-.702 1.963-1.38.243-.678.243-1.258.17-1.38-.074-.121-.268-.194-.559-.34z" />
  </svg>
);

export default function HowToOrder() {
  const steps = [
    {
      step: 1,
      title: "Add items to cart",
      description: "Browse our premium spices, ghee, and sweets, and add your favorite items and quantities to your shopping cart.",
      icon: ShoppingCart,
      iconColor: "text-primary bg-primary/10 border-primary/20",
    },
    {
      step: 2,
      title: "Click 'Order via WhatsApp'",
      description: "Click the 'Order via WhatsApp' button in your cart. A pre-filled message detailing your selected items and total amount will be ready to send.",
      icon: WhatsAppIcon,
      iconColor: "text-[#25D366] bg-[#25D366]/10 border-[#25D366]/20",
    },
    {
      step: 3,
      title: "Pay via UPI QR & confirm",
      description: "Scan the UPI QR code to complete your payment. Send the transaction screenshot in the WhatsApp chat to confirm your order details and delivery address.",
      icon: QrCode,
      iconColor: "text-accent bg-accent/10 border-accent/20",
    },
  ];

  return (
    <>
      <Helmet>
        <title>How to Order | {BRAND.name}</title>
        <meta
          name="description"
          content="Learn how to order premium spices, ghee, and sweets from RV Foods via our simple 3-step WhatsApp and UPI payment process."
        />
      </Helmet>
      <div className="section-padding container-main max-w-5xl">
        <div className="section-header text-center mb-12">
          <span className="section-label">Order Process</span>
          <h1 className="section-title">How to Order from {BRAND.name}</h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            We have simplified our ordering process to a direct-to-owner WhatsApp system.
            Follow these three simple steps to get authentic, homemade flavors delivered to your home.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl border border-border p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
              >
                {/* Step Number Badge */}
                <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border font-heading text-xs font-bold text-text-secondary">
                  0{item.step}
                </div>

                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 transition-transform group-hover:scale-105 ${item.iconColor}`}>
                  <Icon className="w-8 h-8" />
                </div>

                {/* Title */}
                <h3 className="font-playfair text-xl font-bold text-text-primary mb-3">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-text-secondary leading-relaxed flex-grow">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Note Box */}
        <div className="mt-12 p-6 bg-[#FDFAF6] border border-border rounded-2xl text-center max-w-2xl mx-auto">
          <p className="text-sm text-text-secondary leading-relaxed">
            💡 <strong>Need assistance?</strong> If you face any issues during ordering, you can directly message us on WhatsApp or call our support line at <a href={`tel:${BRAND.phone}`} className="text-primary hover:underline font-semibold">{BRAND.phone}</a>. We are happy to help!
          </p>
        </div>
      </div>
    </>
  );
}
