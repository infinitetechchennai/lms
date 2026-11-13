import React from 'react';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h1 className="text-3xl font-extrabold text-[#111827]">Terms & Conditions</h1>
          <p className="text-xs text-slate-500">Effective Date: November 2026</p>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">1. Educational Purpose</h2>
            <p>
              Smartway is an educational platform designed for study assistance and competitive examination
              preparation. All previous year questions, solutions, and educational summaries are curated for
              academic learning.
            </p>

            <h2 className="text-lg font-bold text-slate-900">2. Student Accounts & Fair Use</h2>
            <p>
              Each registered account is for individual student use. Users must maintain account
              confidentiality and refrain from unauthorized scraping or distribution of copyrighted notes.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

