import { BRAND } from "@/utils/constants";
import { Helmet } from "react-helmet-async";

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us | RV Foods</title>
        <meta
          name="description"
          content="Have questions about our traditional products, bulk ordering, or delivery? Contact the RV Foods support team here."
        />
      </Helmet>
      <div className="section-padding container-main">
        <div className="section-header">
          <span className="section-label">Get in Touch</span>
          <h1 className="section-title">Contact Us</h1>
          <p className="section-subtitle">
            Reach us at{" "}
            <a href={`mailto:${BRAND.email}`} className="text-primary hover:underline">
              {BRAND.email}
            </a>{" "}
            or {BRAND.phone}
          </p>
        </div>
      </div>
    </>
  );
}
