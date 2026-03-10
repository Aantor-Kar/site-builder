import React from "react";

const Footer = () => {
  return (
    <footer className="relative bg-black text-white py-12 md:py-16 px-4 sm:px-6 md:px-8 lg:px-20 overflow-hidden">
      {/* Background gradient */}
      <img
        src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/hero/bg-gradient-2.png"
        alt=""
        className="absolute inset-0 -z-10 w-full h-full object-cover opacity-40"
      />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-8 md:gap-16">
        {/* Left section */}
        <div className="lg:col-span-3 space-y-6">
          <a href="https://prebuiltui.com" className="block">
            <svg
              width="157"
              height="40"
              viewBox="0 0 157 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m8.75 11.3 6.75 3.884 6.75-3.885M8.75 34.58v-7.755L2 22.939m27 0-6.75 3.885v7.754M2.405 15.408 15.5 22.954l13.095-7.546M15.5 38V22.939M29 28.915V16.962a2.98 2.98 0 0 0-1.5-2.585L17 8.4a3.01 3.01 0 0 0-3 0L3.5 14.377A3 3 0 0 0 2 16.962v11.953A2.98 2.98 0 0 0 3.5 31.5L14 37.477a3.01 3.01 0 0 0 3 0L27.5 31.5a3 3 0 0 0 1.5-2.585"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <p className="text-sm md:text-base text-white/80">
            Join our newsletter for regular updates.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="email"
              placeholder="example@email.com"
              className="bg-[#14171A] text-white/70 border border-white/10 px-3 py-3 rounded-md w-full sm:flex-1 sm:max-w-xs placeholder:text-sm placeholder:font-light focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            <button className="bg-[#28044e] text-white px-5 py-3 rounded-md border border-white/10 text-sm hover:bg-[#4e059b] transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-28">
          <div>
            <h3 className="font-medium text-sm mb-4 md:mb-6">Products</h3>
            <ul className="space-y-3 md:space-y-4 text-sm text-white/70">
              <li><a href="#" className="hover:text-white">Components</a></li>
              <li><a href="#" className="hover:text-white">Templates</a></li>
              <li><a href="#" className="hover:text-white">Icons</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4 md:mb-6">Resources</h3>
            <ul className="space-y-3 md:space-y-4 text-sm text-white/70">
              <li><a href="#" className="hover:text-white">PrebuiltUI</a></li>
              <li><a href="#" className="hover:text-white">Templates</a></li>
              <li><a href="#" className="hover:text-white">Components</a></li>
              <li><a href="#" className="hover:text-white">Blogs</a></li>
              <li><a href="#" className="hover:text-white">Store</a></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="font-medium text-sm mb-4 md:mb-6">Company</h3>
            <ul className="space-y-3 md:space-y-4 text-sm text-white/70">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Vision</a></li>
              <li className="flex items-center gap-2">
                <a href="#" className="hover:text-white">Careers</a>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-950 border border-green-300 text-green-300">
                  HIRING
                </span>
              </li>
              <li><a href="#" className="hover:text-white">Privacy policy</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 max-w-7xl mx-auto mt-12 md:mt-16 pt-6 border-t border-neutral-700 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-white/70 text-xs sm:text-sm">
          © 2026 SiteBuilder Design
        </p>

        <div className="flex gap-5 md:gap-6">
          {["twitter", "github", "linkedin", "youtube", "instagram"].map(
            (platform) => (
              <a key={platform} href="#" className="text-white hover:text-gray-300">
                {/* Icons unchanged */}
              </a>
            )
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
