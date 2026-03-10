import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { UserButton } from "@daveyplate/better-auth-ui";
import api from '@/configs/axios';
import {toast} from 'sonner';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [credits, setCredits] = useState(0)

  const getCredits = async () => {
    try {
      const {data} = await api.get('/api/user/credits');
      setCredits(data.credits)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error);
    }
  }

  useEffect(() => {
    if(session?.user){
      getCredits();
    }
  }, [session?.user]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  return (
    <header className="relative">
      {/* Background image */}
      <img
        src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/hero/bg-gradient-2.png"
        alt=""
        className="absolute inset-0 -z-10 w-full h-full object-cover opacity-40"
      />

      <nav className="relative z-50 flex items-center justify-between w-full py-4 px-4 md:px-16 lg:px-24 xl:px-32 backdrop-blur border-b border-slate-800 text-white">
        <Link to="/">
          <img src={assets.logo} alt="logo" className="h-5 sm:h-7" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          <NavLink to="/" className="hover:text-slate-300">
            Home
          </NavLink>
          <NavLink to="/projects" className="hover:text-slate-300">
            My Projects
          </NavLink>
          <NavLink to="/community" className="hover:text-slate-300">
            Community
          </NavLink>
          <NavLink to="/pricing" className="hover:text-slate-300">
            Pricing
          </NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!session?.user ? (
            <button
              onClick={() => navigate("/auth/signin")}
              className="px-6 py-1.5 max-sm:text-sm bg-indigo-600 active:scale-95 hover:bg-indigo-700 transition rounded"
            >
              Get started
            </button>
          ) : (
            <>
              <button className='bg-white/10 px-5 py-1.5 text-xs sm:text-sm border text-gray-200 rounded-full'>Credits : <span className='text-indigo-300'>{credits}</span></button>
              <UserButton size='icon' />
            </>
          )}

          <button
            className="md:hidden active:scale-90 transition"
            onClick={() => setMenuOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5h16" />
              <path d="M4 12h16" />
              <path d="M4 19h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur text-white flex flex-col items-center justify-center gap-8 text-lg md:hidden">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/projects" onClick={() => setMenuOpen(false)}>
            My Projects
          </Link>
          <Link to="/community" onClick={() => setMenuOpen(false)}>
            Community
          </Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)}>
            Pricing
          </Link>

          <button
            onClick={() => setMenuOpen(false)}
            className="mt-6 flex items-center justify-center size-10 bg-white text-black rounded-md hover:bg-slate-200 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
