export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
        
        <div>
          <h2 className="text-2xl font-black text-red-500 tracking-widest">
            ORAWIM MOTOR
          </h2>

          <p className="text-gray-400 mt-2 text-sm">
            Modern Automotive Platform
          </p>
        </div>

        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-red-500 transition">
            Instagram
          </a>

          <a href="#" className="hover:text-red-500 transition">
            WhatsApp
          </a>

          <a href="#" className="hover:text-red-500 transition">
            TikTok
          </a>
        </div>

      </div>
    </footer>
  );
}