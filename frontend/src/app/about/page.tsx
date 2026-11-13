import React from 'react';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';
import { Target, Users, Award, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">About Smartway</span>
            <h1 className="text-4xl font-extrabold text-[#111827]">Engineered for Academic Rankers</h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              Smartway was founded by former IIT & AIIMS alumni and top educators to solve the biggest flaw
              in traditional coaching: unstructured question practice and untracked mistake analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Our Mission</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Empower every aspiring doctor and engineer across India with premium, scientifically-backed
                tools to turn weak areas into peak strengths.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">NCERT-First Rigor</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every chapter summary, diagram, and concept capsule is thoroughly vetted against current
                NTA exam patterns and official syllabus updates.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

