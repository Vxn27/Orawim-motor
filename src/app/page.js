import Navbar from "@/components/navbar/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import ProductSection from "@/components/product/ProductSection";
import FeatureSection from "@/components/feature/FeatureSection";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <main className="bg-[#050505] text-white">
      <Navbar />
      <HeroSection />
      <ProductSection />
      <FeatureSection />
      <Footer />
    </main>
  );
}