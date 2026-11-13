'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { BookOpen, GraduationCap, Menu, X, ArrowRight, UserCircle } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#111827]">
                Smart<span className="text-[#4F46E5]">way</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider -mt-1 uppercase">
                NEET & JEE Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link href="/neet" className="hover:text-[#4F46E5] transition-colors">
              NEET
            </Link>
            <Link href="/jee" className="hover:text-[#4F46E5] transition-colors">
              JEE Main & Adv
            </Link>
            <Link href="/features" className="hover:text-[#4F46E5] transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-[#4F46E5] transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-[#4F46E5] transition-colors">
              About
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="inline-flex items-center space-x-2 bg-[#4F46E5] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-indigo-200"
              >
                <UserCircle className="w-4 h-4" />
                <span>Go to {user.role === 'ADMIN' ? 'Admin' : 'Dashboard'}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-[#4F46E5] px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-indigo-200"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/neet"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            NEET Learning
          </Link>
          <Link
            href="/jee"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            JEE Main & Advanced
          </Link>
          <Link
            href="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Platform Features
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Pricing
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
            {user ? (
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-[#4F46E5] text-white py-2.5 rounded-lg font-semibold text-sm"
              >
                Go to {user.role === 'ADMIN' ? 'Admin Portal' : 'Dashboard'}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border border-slate-300 text-slate-700 py-2 rounded-lg font-semibold text-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#4F46E5] text-white py-2.5 rounded-lg font-semibold text-sm"
                >
                  Register Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

