import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Send, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = useForm();

  const onSubscribe = (data) => {
    console.log('Subscribed email:', data.email);
    reset();
  };

  return (
    <footer className="bg-[#FAF6F0] border-t border-[#EAE2D5] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#241E1A] flex items-center justify-center">
                <span className="text-[#FDFBF7] font-black text-xs tracking-tighter">P</span>
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#241E1A]">
                proxima
              </span>
            </Link>
            <p className="text-xs text-stone-500 leading-relaxed">
              Connecting elite talent with next-generation startups. A corporate-minimal standard for modern professional matching.
            </p>
            <div className="flex items-center gap-3 text-stone-400 mt-2">
              <Mail className="w-4 h-4 text-stone-500" />
              <span className="text-xs text-stone-600">contact@proxima.io</span>
            </div>
            <div className="flex items-center gap-3 text-stone-400">
              <MapPin className="w-4 h-4 text-stone-500" />
              <span className="text-xs text-stone-600">Silicon Valley, CA</span>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/jobs" className="text-xs text-stone-500 hover:text-[#241E1A] transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-xs text-stone-500 hover:text-[#241E1A] transition-colors">
                  Talent Profile
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-xs text-stone-500 hover:text-[#241E1A] transition-colors">
                  Direct Messages
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-xs text-stone-500 hover:text-[#241E1A] transition-colors">
                  Help Center & FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-stone-500 hover:text-[#241E1A] transition-colors">
                  API Integrations
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-stone-500 hover:text-[#241E1A] transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">Stay Informed</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Subscribe to get curated high-paying remote startup roles.
            </p>
            <form onSubmit={handleSubmit(onSubscribe)} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full bg-[#FDFBF7] text-[#241E1A] border border-[#EAE2D5] focus:border-[#241E1A] focus:ring-1 focus:ring-[#241E1A] rounded-lg py-2 pl-3.5 pr-10 text-xs transition-all placeholder:text-stone-400 outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] rounded-md flex items-center justify-center transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-500 font-medium">{errors.email.message}</span>
              )}
              {isSubmitSuccessful && !errors.email && (
                <span className="text-[10px] text-emerald-700 font-semibold">Subscribed successfully!</span>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-[#EAE2D5] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-stone-400">
            &copy; {new Date().getFullYear()} Proxima Inc. All rights reserved. Vetted Technical Placements.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-[11px] text-stone-400 hover:text-stone-600">Twitter</a>
            <a href="#" className="text-[11px] text-stone-400 hover:text-stone-600">LinkedIn</a>
            <a href="#" className="text-[11px] text-stone-400 hover:text-stone-600">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
