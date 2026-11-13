import React from 'react';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h1 className="text-3xl font-extrabold text-[#111827]">Privacy Policy</h1>
          <p className="text-xs text-slate-500">Effective Date: November 2026</p>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              Smartway collects student account details (name, email address, password hash), academic
              preferences (target exam: NEET/JEE, target class), question attempt logs, bookmark folders,
              and study schedules.
            </p>

            <h2 className="text-lg font-bold text-slate-900">2. Student Data Isolation</h2>
            <p>
              Every student's bookmarks, attempts, mistakes, and personal notes are strictly isolated and
              never visible or shared with any other learner.
            </p>

            <h2 className="text-lg font-bold text-slate-900">3. Security Standards</h2>
            <p>
              We implement industry-standard encryption, secure HTTP-only session tokens, and strict
              access controls on cloud databases and file storage.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

