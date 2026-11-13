import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';
import { Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export default function JeePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-[#4F46E5] bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Engineering Entrance Preparation
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827]">
              Conquer JEE Main & Advanced
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              Multi-concept numerical problem sets, advanced calculus, coordinate geometry, and IIT JEE
              question patterns.
            </p>
            <div className="pt-2">
              <Link
                href="/register?exam=JEE_MAIN"
                className="inline-flex items-center space-x-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                <span>Start JEE Practice Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-rose-600">ADVANCED TARGET</span>
              <h3 className="font-bold text-lg text-slate-900 mt-2 mb-2">Mathematics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Definite integration, matrices, 3D geometry, probability, complex numbers, and conic sections.
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-indigo-600">ADVANCED TARGET</span>
              <h3 className="font-bold text-lg text-slate-900 mt-2 mb-2">Physics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rotational dynamics, electromagnetic induction, wave optics, thermodynamics, and error analysis.
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-amber-600">ADVANCED TARGET</span>
              <h3 className="font-bold text-lg text-slate-900 mt-2 mb-2">Chemistry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Physical chemistry calculations, coordination isomerism, named organic reactions, and metallurgy.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

