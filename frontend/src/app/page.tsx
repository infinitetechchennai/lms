'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Calendar,
  Layers,
  PlayCircle,
  BarChart3,
  ArrowRight,
  HelpCircle,
  Star,
  Zap,
  RotateCw,
} from 'lucide-react';

export default function HomePage() {
  // Interactive PYQ demonstration state
  const [selectedDemoAnswer, setSelectedDemoAnswer] = useState<string | null>(null);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // Interactive Flashcard demonstration state
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-gradient-to-b from-indigo-50/50 via-white to-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200/60 text-[#4F46E5] text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Intelligent Learning OS for NEET & JEE 2025/2026</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-tight leading-[1.12]">
                  Crack NEET & JEE with <span className="text-[#4F46E5]">Smartway</span> Precision.
                </h1>

                <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  High-yield NCERT notes, 15+ years of verified Previous Year Questions with step-by-step
                  mechanisms, 3-category mistake bookmarking, and 30-second concept video reels.
                </p>

                {/* Primary CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-base px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:translate-y-[-1px]"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#pyq-demo"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-base px-6 py-3.5 rounded-xl transition-all"
                  >
                    <span>Try PYQ Engine Demo</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% NCERT & NTA Aligned</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real Examination Timers</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No Ad Distractions</span>
                  </div>
                </div>
              </div>

              {/* Hero Graphic Card */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#4F46E5] flex items-center justify-center font-bold">
                        NEET
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Dr. Aspirant Daily Target</h4>
                        <p className="text-xs text-slate-500">Day 42 of 90-Day Sprint</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                      84% Accuracy
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Today's Target Progress</span>
                      <span className="text-[#4F46E5]">18 / 20 Completed</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#4F46E5] h-full rounded-full w-[90%] transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-500 font-medium">Mistake Vault</p>
                      <p className="text-lg font-bold text-rose-600">3 Saved</p>
                      <p className="text-[10px] text-slate-400">Ready for revision</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-500 font-medium">Flashcard SRS</p>
                      <p className="text-lg font-bold text-indigo-600">14 Due</p>
                      <p className="text-[10px] text-slate-400">Genetics & KVL</p>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#4F46E5]" />
                      <span className="font-semibold text-slate-800">Current Study Streak</span>
                    </div>
                    <span className="font-extrabold text-[#4F46E5]">7 Days 🔥</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXAMINATION TRACK SELECTION */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-bold text-[#4F46E5] tracking-widest uppercase mb-2">
                Tailored Examination Tracks
              </h2>
              <h3 className="text-3xl font-extrabold text-[#111827]">
                Choose Your Path to Academic Excellence
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* NEET Track Card */}
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-8 hover:border-indigo-400 transition-all hover:shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex p-3 rounded-xl bg-emerald-100 text-emerald-700">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">NEET (Medical Stream)</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Laser-focused NCERT line-by-line coverage for Biology (Botany & Zoology), comprehensive
                    Chemical Bonding & Organic Mechanisms, and high-yield Physics problem solving.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 pt-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>720 Marks Benchmark Engine</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Botany & Zoology High-Yield Diagrams</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>NCERT Highlighting & Exemplar PYQs</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    href="/neet"
                    className="inline-flex items-center space-x-2 text-sm font-semibold text-[#4F46E5] hover:text-indigo-800"
                  >
                    <span>Explore NEET Curriculum</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* JEE Track Card */}
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-8 hover:border-indigo-400 transition-all hover:shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex p-3 rounded-xl bg-indigo-100 text-[#4F46E5]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">JEE Main & Advanced</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Rigorous numerical and multi-concept problem solving across Advanced Calculus, Vector 3D,
                    Thermodynamics, and Physical Chemistry with detailed derivations.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 pt-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Multi-correct & Numerical type practice</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>In-depth step-by-step calculus solutions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>IIT JEE 2008–2024 Archive</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    href="/jee"
                    className="inline-flex items-center space-x-2 text-sm font-semibold text-[#4F46E5] hover:text-indigo-800"
                  >
                    <span>Explore JEE Curriculum</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE SUBJECTS */}
        <section className="py-16 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-bold text-[#4F46E5] tracking-widest uppercase mb-2">
                4 Core Disciplines
              </h2>
              <h3 className="text-3xl font-extrabold text-[#111827]">
                Master Class 11 and Class 12 Syllabi
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Biology */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                  BIO
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Biology</h4>
                <p className="text-xs text-slate-500 mb-4">Class 11 & 12 • 38 Chapters</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Genetics, Cell Cycle, Biotechnology, Ecology, and Human Physiology with high-yield memory
                  mnemonics.
                </p>
              </div>

              {/* Chemistry */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
                  CHEM
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Chemistry</h4>
                <p className="text-xs text-slate-500 mb-4">Class 11 & 12 • 30 Chapters</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Organic mechanisms, Chemical Bonding, Coordination Chemistry, and Electrochemistry.
                </p>
              </div>

              {/* Physics */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold mb-4">
                  PHY
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Physics</h4>
                <p className="text-xs text-slate-500 mb-4">Class 11 & 12 • 28 Chapters</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mechanics, Current Electricity, Magnetism, Optics, and Modern Physics with numerical
                  derivations.
                </p>
              </div>

              {/* Mathematics */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-4">
                  MATH
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Mathematics</h4>
                <p className="text-xs text-slate-500 mb-4">Class 11 & 12 • 26 Chapters</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calculus, Coordinate Geometry, Matrices, Probability, and Vector Algebra for JEE Advanced.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE PYQ ENGINE DEMONSTRATION */}
        <section id="pyq-demo" className="py-20 bg-white border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#4F46E5] tracking-widest uppercase">
                Interactive Live Demonstration
              </span>
              <h3 className="text-3xl font-extrabold text-[#111827] mt-1">
                Experience the PYQ Practice Engine
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Simulating NEET 2023 Genetics Question with instant verification and NCERT reference.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 mb-5">
                <div className="flex items-center space-x-2">
                  <span className="bg-indigo-100 text-[#4F46E5] text-xs font-bold px-2.5 py-1 rounded-md">
                    NEET 2023
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                    Biology • Genetics
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  Marks: <span className="text-emerald-600 font-bold">+4</span> |{' '}
                  <span className="text-rose-600 font-bold">-1</span>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed mb-6">
                In a classic Mendelian dihybrid cross between round yellow seeded pea plants (RRYY) and
                wrinkled green seeded pea plants (rryy), what is the proportion of plants in F2 generation
                that exhibit recombinant (new non-parental) phenotypes?
              </p>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {[
                  { id: 'A', text: '9/16' },
                  { id: 'B', text: '6/16 (or 3/8)' },
                  { id: 'C', text: '10/16' },
                  { id: 'D', text: '1/16' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    disabled={demoSubmitted}
                    onClick={() => setSelectedDemoAnswer(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                      selectedDemoAnswer === opt.id
                        ? 'border-[#4F46E5] bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    } ${
                      demoSubmitted && opt.id === 'B'
                        ? '!border-emerald-500 !bg-emerald-50 !text-emerald-950 font-bold'
                        : ''
                    } ${
                      demoSubmitted && selectedDemoAnswer === opt.id && opt.id !== 'B'
                        ? '!border-rose-500 !bg-rose-50 !text-rose-950'
                        : ''
                    }`}
                  >
                    <span>
                      <strong className="mr-3 font-bold">{opt.id}.</strong> {opt.text}
                    </span>
                    {demoSubmitted && opt.id === 'B' && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                        Correct Answer
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Submission Action */}
              <div className="flex items-center justify-between pt-2">
                {!demoSubmitted ? (
                  <button
                    disabled={!selectedDemoAnswer}
                    onClick={() => setDemoSubmitted(true)}
                    className="bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setDemoSubmitted(false);
                      setSelectedDemoAnswer(null);
                    }}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Try Another Attempt
                  </button>
                )}
              </div>

              {/* Solution Box */}
              {demoSubmitted && (
                <div className="mt-6 p-5 rounded-xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Detailed Step-by-Step Solution & NCERT Reference</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    In the F2 phenotypic ratio of 9:3:3:1:
                    <br />• Parental phenotypes: Round Yellow (9/16) and Wrinkled Green (1/16) = 10/16.
                    <br />• Recombinant phenotypes: Round Green (3/16) + Wrinkled Yellow (3/16) ={' '}
                    <strong>6/16</strong>.
                  </p>
                  <div className="text-[11px] font-semibold text-[#4F46E5] bg-indigo-50 p-2 rounded">
                    Formula: Recombinant Fraction = (3 + 3) / 16 = 6/16 (37.5%)
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3D FLASHCARD DEMO */}
        <section className="py-16 bg-[#F8FAFC] border-b border-slate-200">
          <div className="max-w-xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Interactive 3D Flashcard Engine</h3>
            <p className="text-xs text-slate-500 mb-8">
              Click the card below to flip between concept question and high-yield formula.
            </p>

            <div
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              className="cursor-pointer h-60 w-full rounded-2xl bg-white border border-slate-200 p-8 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all text-left"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-[#4F46E5]">Physics • Current Electricity</span>
                <span className="flex items-center space-x-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click to Flip</span>
                </span>
              </div>

              <div className="py-4">
                {!flashcardFlipped ? (
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Question / Concept
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-1">
                      What is the relationship between Drift Velocity (v_d) and Electric Field (E)?
                    </h4>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Answer & Formula
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-1">
                      v_d = (e • E • τ) / m
                    </h4>
                    <p className="text-xs text-slate-500 mt-2">
                      Where e is electron charge, τ is relaxation time, and m is electron mass. Electron
                      mobility μ = v_d / E.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                <span>Spaced Repetition Mastery: Level 3</span>
                <span className="font-semibold text-emerald-600">Review Interval: 4 Days</span>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-xs font-bold text-[#4F46E5] tracking-widest uppercase mb-2">
                Proven Results
              </h2>
              <h3 className="text-3xl font-extrabold text-[#111827]">
                Trusted by 50,000+ NEET & JEE Rankers
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    'The 3-category bookmark system transformed my revision. Isolating my mistake questions from general revise-later cards helped me boost my NEET score from 580 to 675.',
                  name: 'Priya Nambiar',
                  rank: 'NEET 2024 • Score 685 (AIIMS Delhi)',
                },
                {
                  quote:
                    'Solving previous year questions with instant formula references and King property breakdowns gave me speed in JEE Advanced Calculus.',
                  name: 'Rohit Agrawal',
                  rank: 'JEE Advanced • AIR 312 (IIT Bombay CSE)',
                },
                {
                  quote:
                    'The 30-second vertical concept reels are incredible when taking short study breaks. High-yield NCERT points in bite-sized videos.',
                  name: 'Ananya Mukherjee',
                  rank: 'NEET Aspirant • 99.4 Percentile',
                },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex text-amber-400 space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">"{t.quote}"</p>
                  </div>
                  <div className="pt-6 border-t border-slate-200/60 mt-4">
                    <p className="font-bold text-sm text-slate-900">{t.name}</p>
                    <p className="text-xs text-[#4F46E5] font-semibold">{t.rank}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="py-20 bg-[#F8FAFC] border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-xs font-bold text-[#4F46E5] tracking-widest uppercase mb-2">
                Frequently Asked Questions
              </h2>
              <h3 className="text-3xl font-extrabold text-[#111827]">Got Questions? We Have Answers.</h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Are the questions strictly from official NEET and JEE past years?',
                  a: 'Yes. Every single question in our repository is tagged with its official examination name, year, subject, and chapter, verified by expert faculty.',
                },
                {
                  q: 'How does the 3-category bookmark system work?',
                  a: 'Unlike traditional one-click bookmarks, Smartway gives you 3 distinct folders: "Mistake Questions" (for problems you got wrong), "Revise Later" (for tricky questions), and "Important Questions" (for recurring high-weightage concepts).',
                },
                {
                  q: 'Can I use Smartway on mobile and tablets?',
                  a: 'Absolutely. Smartway is fully responsive and optimized for mobile devices, including portrait short videos, swipe gestures, and responsive PDF reading.',
                },
                {
                  q: 'Is there a free trial or free tier?',
                  a: 'Yes! You can register for free to access high-yield summary notes, sample PYQs, and flashcard tools immediately with no credit card required.',
                },
              ].map((faq, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-base text-slate-900 mb-2 flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-[#4F46E5] shrink-0" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-20 bg-[#111827] text-white">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Secure Your Medical or Engineering Seat?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Join thousands of NEET and JEE aspirants practicing smarter with verified questions,
              mistake analysis, and structured daily targets.
            </p>
            <div className="pt-4">
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 bg-[#4F46E5] hover:bg-indigo-600 text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-lg transition-all"
              >
                <span>Create Your Free Account Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

