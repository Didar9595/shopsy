"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const banners = [
  {
    title: "Mega Sale",
    subtitle: "Up to 50% Off on Top Brands",
    img: "sale.jpg",
    link: "/category/electronics",
  },
  {
    title: "Latest Electronics",
    subtitle: "Mobiles, Laptops & Gadgets",
    img: "/electronics.jpg",
    link: "/category/electronics",
  },
  {
    title: "Fashion Store",
    subtitle: "Trending Styles for You",
    img: "/fashion.jpg",
    link: "/category/clothes",
  },
  {
    title: "Home & Living",
    subtitle: "Decor, Kitchen & More",
    img: "/home.jpg",
    link: "/category/home",
  },
  {
    title: "Sports Accessories",
    subtitle: "Cricket, Football, Badminton, etc.",
    img: "sports.jpg",
    link: "/category/electronics",
  },
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-md">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            className="min-w-full h-[220px] sm:h-[300px] md:h-[400px] relative"
          >
            <img
              src={banner.img}
              alt={banner.title}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center">
              <div className="px-6 sm:px-12 text-white max-w-xl">
                <h2 className="text-2xl sm:text-4xl font-bold mb-2">
                  {banner.title}
                </h2>
                <p className="text-sm sm:text-lg mb-4">
                  {banner.subtitle}
                </p>
                <Link
                  href={banner.link}
                  className="inline-block bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full ${
              current === idx ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
