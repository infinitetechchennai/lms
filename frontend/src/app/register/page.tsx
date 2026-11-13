'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';
import { GraduationCap, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { ExamType, ClassLevel } from '../../types';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetExam, setTargetExam] = useState<ExamType>('NEET');
  const [targetClass, setTargetClass] = useState<ClassLevel>('CLASS_12');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          password,
          targetExam,
          targetClass,
        }),
      });

      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check input fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#111827]">Join Smartway Learning</h2>
            <p className="text-xs text-slate-500">
              Personalized syllabus, PYQ practice engine & study planner
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@student.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>

            {/* Exam Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Competitive Examination
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'NEET', label: 'NEET' },
                  { id: 'JEE_MAIN', label: 'JEE Main' },
                  { id: 'JEE_ADVANCED', label: 'JEE Adv' },
                ].map((exam) => (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => setTargetExam(exam.id as ExamType)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      targetExam === exam.id
                        ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {exam.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CLASS_11', label: 'Class 11' },
                  { id: 'CLASS_12', label: 'Class 12' },
                  { id: 'BOTH', label: 'Repeater / Both' },
                ].map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setTargetClass(cls.id as ClassLevel)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      targetClass === cls.id
                        ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cls.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-sm shadow-indigo-200 flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#4F46E5] hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

