import React from 'react';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">Contact Us</span>
            <h1 className="text-4xl font-extrabold text-[#111827]">We're Here to Support Your Journey</h1>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Have questions about curricula, test series, or technical support? Reach out directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-lg text-slate-900">Student & Parent Desk</h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#4F46E5]" />
                  <span>support@smartway-edtech.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#4F46E5]" />
                  <span>+91 1800-SMARTWAY (Toll Free)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span>Smartway Learning Hub, Knowledge City, Bengaluru, Karnataka, India</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Send a Message</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <div>
                  <textarea
                    rows={3}
                    placeholder="How can we help your NEET or JEE preparation?"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <button
                  type="button"
                  className="w-full bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

