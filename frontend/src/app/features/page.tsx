import React from 'react';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';
import {
  BookOpen,
  FileCheck,
  Bookmark,
  Layers,
  Calendar,
  Video,
  BarChart2,
  Lock,
} from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: FileCheck,
      title: 'PYQ Practice Engine',
      desc: 'Filter 15+ years of NEET and JEE questions by exam, subject, chapter, year, and difficulty with instantaneous solutions and NCERT references.',
    },
    {
      icon: Bookmark,
      title: 'Tri-Category Bookmark Vault',
      desc: 'Organize saved problems into 3 distinct folders: "Mistake Questions", "Revise Later", and "Important Concepts" for high-impact targeted revision.',
    },
    {
      icon: Layers,
      title: '3D Spaced Repetition Flashcards',
      desc: 'Interactive 3D cards with SuperMemo-based review intervals, formula hints, and custom student folder categorization.',
    },
    {
      icon: BookOpen,
      title: 'High-Yield Formula & Concept Notes',
      desc: 'Concise summary notes, formula tables, diagrams, and integrated PDF viewing with offline access permissions.',
    },
    {
      icon: Calendar,
      title: 'Dual Study Planner',
      desc: 'Platform-curated 90-day sprints alongside personal task management with priorities, completion tracking, and daily timetables.',
    },
    {
      icon: Video,
      title: 'Micro-Learning Video Reels',
      desc: '30-40 second bite-sized video capsules explaining difficult concepts and calculation shortcuts with vertical mobile reels.',
    },
    {
      icon: BarChart2,
      title: 'Granular Progress Telemetry',
      desc: 'Real-time accuracy metrics, question volume logs, subject-wise balance meters, and streak counters.',
    },
    {
      icon: Lock,
      title: 'Bank-Grade Data Privacy',
      desc: 'Strict student data isolation, role-based access control, encrypted credentials, and secure cloud storage.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">Features & Capabilities</span>
            <h1 className="text-4xl font-extrabold text-[#111827]">Built for Serious NEET & JEE Aspirants</h1>
            <p className="text-slate-600 text-base">
              Every tool in Smartway is engineered with one objective: improving your exam score through
              deliberate, tracked practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

