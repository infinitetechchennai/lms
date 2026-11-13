'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { User, Award, CheckCircle2, Sparkles, Save } from 'lucide-react';
import { ExamType, ClassLevel } from '@/types';

export default function ProfilePage() {
  const { user, updateUserPreferences } = useAuth();

  const profile = user?.profile && 'targetExam' in user.profile ? user.profile : null;

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [targetExam, setTargetExam] = useState<ExamType>(profile?.targetExam || 'NEET');
  const [targetClass, setTargetClass] = useState<ClassLevel>(profile?.targetClass || 'CLASS_12');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateUserPreferences({
        fullName,
        targetExam,
        targetClass,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Academic Profile & Target</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update your competitive examination track, target class, and personal details.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">Linked to your student records</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Competitive Examination Track
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'NEET', title: 'NEET (Medical)' },
                { id: 'JEE_MAIN', title: 'JEE Main' },
                { id: 'JEE_ADVANCED', title: 'JEE Advanced' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTargetExam(item.id as ExamType)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    targetExam === item.id
                      ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-2 ring-indigo-200'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Academic Level</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'CLASS_11', title: 'Class 11' },
                { id: 'CLASS_12', title: 'Class 12' },
                { id: 'BOTH', title: 'Both (Dropper / Repeater)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTargetClass(item.id as ClassLevel)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    targetClass === item.id
                      ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-2 ring-indigo-200'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

