'use client'
import Hero from "./components/Hero";
import Newsletter from "./components/Newsletter";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./components/ProductCard";
import { useAuth } from "../../context/AuthProvider";
import BannerSlider from "./components/BannerSlider";
import Banner1 from "./components/Banner1";
import Banner2 from "./components/Banner2";

export default function Home() {
  const [data, setData] = useState({ latest: [], bestDeals: [], categoryWise: {} });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth()
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch("/api/products/home");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-600 min-h-[70vh]">Loading products...</p>;

  const Section = ({ title, products }) => (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <Link href={`/category/${title.toLowerCase()}`} className="text-blue-600 text-sm">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="">
      <Hero />

      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 text-center py-4 mb-4 mt-5">
          <p className="text-lg font-medium">Welcome back, <span className="font-semibold">{user.name}</span> 👋</p>
          <p className="text-sm text-gray-600">Find your next great deal below!</p>
        </div>
      )}

      <div className="flex flex-col gap-12 p-2 md:px-18 md:py-4">
        <Section title="Latest Products" products={data.latest} />
        <Banner1/>
        <Section title="Best Deals" products={data.bestDeals} />
        
        <BannerSlider/>

        {Object.entries(data.categoryWise).map(([cat, products]) => (
          <Section key={cat} title={cat} products={products} />
        ))}
      </div>

      <div className="p-1 md:px-14">
        <Banner2/>
      </div>

      <Newsletter />
    </div>
  );
}


