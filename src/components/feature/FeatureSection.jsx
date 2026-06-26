"use client";

import {
  Bot,
  CalendarCheck,
  CreditCard,
  PackageCheck,
} from "lucide-react";

const features = [
  {
    icon: <Bot size={34} />,
    title: "Chatbot AI Bengkel",
    desc: "Konsultasi kerusakan motor dan rekomendasi servis otomatis.",
  },
  {
    icon: <CalendarCheck size={34} />,
    title: "Booking Online",
    desc: "Booking servis motor langsung dari website tanpa antre.",
  },
  {
    icon: <PackageCheck size={34} />,
    title: "Realtime Stock",
    desc: "Monitoring stok sparepart dan produk secara realtime.",
  },
  {
    icon: <CreditCard size={34} />,
    title: "OCR Payment",
    desc: "Verifikasi pembayaran otomatis menggunakan OCR system.",
  },
];

export default function FeatureSection() {
  return (
    <section className="w-full bg-[#050505] py-24">

      <div className="w-full px-5 lg:px-12">

        {/* HEADER */}
        <div className="text-center mb-16">

          <p className="text-red-500 font-semibold tracking-[4px] text-sm uppercase">
            Modern Feature
          </p>

          <h2 className="text-4xl md:text-6xl font-black mt-4 leading-tight">
            Fitur Modern ORAWIM MOTOR
          </h2>

          <p className="text-gray-400 mt-5 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
            Platform bengkel digital modern dengan sistem booking,
            ecommerce sparepart, chatbot AI, dan pembayaran otomatis.
          </p>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 w-full">

          {features.map((feature, index) => (

            <div
              key={index}
              className="bg-[#111111] border border-white/5 rounded-[30px] p-8 hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300"
            >

              {/* ICON */}
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
                {feature.icon}
              </div>

              {/* TITLE */}
              <h3 className="text-2xl font-bold mt-7 leading-snug">
                {feature.title}
              </h3>

              {/* DESC */}
              <p className="text-gray-400 mt-4 leading-relaxed text-sm md:text-base">
                {feature.desc}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}