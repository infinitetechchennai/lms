import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';
import { Check, Sparkles } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              Transparent & Future-Ready
            </span>
            <h1 className="text-4xl font-extrabold text-[#111827]">Affordable Excellence for Every Student</h1>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Start learning immediately with our free tier, or unlock unlimited PYQ practice and AI mock
              analyses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Aspirant Starter</h3>
                <p className="text-xs text-slate-500 mt-1">Foundational access for self-study</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                  <span className="text-slate-500 text-sm"> / forever free</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Access to Class 11 & 12 High-Yield Notes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>50 PYQs per subject with solutions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Basic 3-Category Bookmark Vault</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Personal Study Planner</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <Link
                  href="/register"
                  className="w-full block text-center border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold py-2.5 rounded-xl text-sm transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-white border-2 border-[#4F46E5] rounded-2xl p-8 shadow-lg shadow-indigo-100 flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 bg-[#4F46E5] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Smartway Pro Ranker</h3>
                <p className="text-xs text-slate-500 mt-1">Full power for NEET & JEE top percentiles</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">₹499</span>
                  <span className="text-slate-500 text-sm"> / month (or ₹2,999/yr)</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#4F46E5]" />
                    <span>Unlimited 15+ Year PYQ Practice Engine</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#4F46E5]" />
                    <span>Unlimited 3D Flashcards with Spaced Repetition</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#4F46E5]" />
                    <span>Platform Curated 90-Day Master Timetables</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#4F46E5]" />
                    <span>Offline PDF Note Downloads</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#4F46E5]" />
                    <span>Priority AI Doubt Solver (Future Ready)</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <Link
                  href="/register"
                  className="w-full block text-center bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                >
                  Join Smartway Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

