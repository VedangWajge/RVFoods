import { BRAND } from "@/utils/constants";
import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | RV Foods</title>
        <meta
          name="description"
          content="Learn about the heritage, values, and traditional recipe methods of RV Foods. Delivering hand-prepared spices, ghee, and sweets across India."
        />
      </Helmet>
      <div className="section-padding container-main">
        <div className="section-header">
          <span className="section-label">Our Story</span>
          <h1 className="section-title">About {BRAND.name}</h1>
          <p className="section-subtitle">{BRAND.description}</p>
        </div>
      </div>
    </>
  );
}
