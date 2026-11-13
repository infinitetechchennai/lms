import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';
import { GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function NeetPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Medical Entrance Preparation
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827]">
              Master NEET with 720/720 Precision
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              Line-by-line NCERT Biology mastery, organic reaction roadmaps, and medical-grade Physics
              problem simulations.
            </p>
            <div className="pt-2">
              <Link
                href="/register?exam=NEET"
                className="inline-flex items-center space-x-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                <span>Start NEET Practice Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-emerald-600">360 / 360 TARGET</span>
              <h3 className="font-bold text-lg text-slate-900 mt-2 mb-2">Botany & Zoology</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete coverage of Genetics, Cell Cycle, Biotechnology, Ecology, Human Physiology, and Plant Morphology.
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-amber-600">180 / 180 TARGET</span>
              <h3 className="font-bold text-lg text-slate-900 mt-2 mb-2">NEET Chemistry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-yield inorganic exceptions, organic reaction mechanisms, physical chemistry equilibrium, and stoichiometry.
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-indigo-600">180 / 180 TARGET</span>
              <h3 className="font-bold text-lg text-slate-900 mt-2 mb-2">NEET Physics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Circuit theory, mechanics, electrostatics, ray optics, and modern physics with standard NTA numerical shortcuts.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

