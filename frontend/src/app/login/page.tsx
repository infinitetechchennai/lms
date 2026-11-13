'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';
import { GraduationCap, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        if (res.data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Login Helper
  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('smartway123');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#111827]">Welcome back to Smartway</h2>
            <p className="text-xs text-slate-500">Sign in to resume your NEET & JEE daily goals</p>
          </div>

          {/* Quick Demo Login Pills */}
          <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl space-y-2">
            <p className="text-[11px] font-semibold text-indigo-900">⚡ Instant Demo Login:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@smartway.com')}
                className="flex-1 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all"
              >
                Demo Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@smartway.com')}
                className="flex-1 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all"
              >
                Demo Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <a href="#reset" className="text-[11px] text-[#4F46E5] hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-sm shadow-indigo-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-[#4F46E5] hover:underline">
              Create student account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

