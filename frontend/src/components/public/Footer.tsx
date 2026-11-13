import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Smart<span className="text-[#4F46E5]">way</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India's premium EdTech platform tailored for NEET and JEE aspirants. Combining high-yield
              notes, PYQ practice engines, tri-category bookmarks, and 3D flashcards for maximum score
              mastery.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>NCERT Aligned & High-Yield Certified</span>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Curriculum Tracks
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/neet" className="hover:text-white transition-colors">
                  NEET Biology & Medical
                </Link>
              </li>
              <li>
                <Link href="/jee" className="hover:text-white transition-colors">
                  JEE Main Physics & Chem
                </Link>
              </li>
              <li>
                <Link href="/jee" className="hover:text-white transition-colors">
                  JEE Advanced Mathematics
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Class 11 Foundation
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Class 12 Target Prep
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  PYQ Practice Engine
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  3-Folder Mistake Vault
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Spaced Repetition Flashcards
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Dual Study Timetable
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Micro-Video Concept Capsules
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Team
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Smartway Learning Systems Pvt. Ltd. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Crafted for rankers preparing for AIIMS, IITs, and top medical & engineering colleges.
          </p>
        </div>
      </div>
    </footer>
  );
}

