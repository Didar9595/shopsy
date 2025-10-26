"use client";

import { useState } from "react";
import { Users, ShoppingCart, Rocket, Heart,UserRound } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [teamMembers] = useState([
    { name: "Didar Abbas", role: "Founder & CEO", img: "/team/didar.jpg" },
    // { name: "Aisha Khan", role: "Lead Designer", img: "/team/aisha.jpg" },
    // { name: "Rahul Verma", role: "Fullstack Developer", img: "/team/rahul.jpg" },
    // { name: "Neha Singh", role: "Marketing Lead", img: "/team/neha.jpg" },
  ]);

  const [stats] = useState([
    { icon: <Users size={28} className="text-green-600" />, value: "10K+", label: "Happy Customers" },
    { icon: <ShoppingCart size={28} className="text-green-600" />, value: "25K+", label: "Orders Delivered" },
    { icon: <Rocket size={28} className="text-green-600" />, value: "500+", label: "Products Listed" },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-green-600">
          About Shopsy
        </h1>
        <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto">
          Shopsy is your one-stop online marketplace for electronics, fashion, home essentials, and much more. We connect quality products with happy customers across the globe.
        </p>
      </section>

      {/* Mission Section */}
      <section className="bg-green-50 p-8 rounded-xl flex flex-col md:flex-row items-center gap-8">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <h2 className="text-3xl font-semibold text-green-700 mb-4">Our Mission</h2>
          <p className="text-gray-700 text-justify">
            To provide a seamless shopping experience where quality meets convenience. At Shopsy, we prioritize our customers by offering reliable products, fast delivery, and exceptional support.
          </p>
        </motion.div>
        <motion.img
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          src="mission.svg"
          alt="Our Mission"
          className="w-40 lg:w-60 rounded-lg bg-green-50"
        />
      </section>

      {/* Team Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-green-700 text-center">Meet Our Team</h2>
        <div className="flex flex-row flex-wrap justify-center gap-6 ">
          {teamMembers.map((member, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center w-[fit-content]"
            >
              {/* <img src={member.img} alt={member.name} className="w-32 h-32 rounded-full object-cover mb-3" /> */}
              <UserRound size={80} />
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-gray-500">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-100 rounded-xl p-8">
        <h2 className="text-3xl font-semibold text-green-800 text-center mb-8">Our Achievements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.1 }}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              <div className="mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="text-3xl font-semibold text-green-700 mb-4">Join Shopsy Today!</h2>
        <p className="text-gray-700 mb-6">Explore thousands of products and experience the best online shopping.</p>
        <a href="/search" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
          Start Shopping
        </a>
      </section>
    </div>
  );
}
