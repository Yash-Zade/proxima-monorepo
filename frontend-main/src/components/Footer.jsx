import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowRight, Triangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Footer() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = useForm();
  const { user } = useContext(AuthContext);

  const onSubscribe = (data) => {
    console.log('Subscribed email:', data.email);
    reset();
  };

  const platformLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Jobs', path: '/jobs' },
  ];

  if (user) {
    platformLinks.push({ name: 'Direct Messages', path: '/messages' });
    
    if (user.roles?.includes('EMPLOYER')) {
      platformLinks.push({ name: 'Employer Dashboard', path: '/employer' });
      platformLinks.push({ name: 'Mass Hiring', path: '/mass-hiring' });
    }
    if (user.roles?.includes('COLLEGE')) {
      platformLinks.push({ name: 'College Dashboard', path: '/college' });
    }
    if (user.roles?.includes('ADMIN')) {
      platformLinks.push({ name: 'Admin Panel', path: '/admin' });
    }
    if (user.roles?.includes('APPLICANT') || user.roles?.includes('USER')) {
      platformLinks.push({ name: 'My Skills', path: '/skills' });
    }
    platformLinks.push({ name: 'Talent Profile', path: '/profile' });
  } else {
    platformLinks.push({ name: 'Sign In', path: '/signin' });
    platformLinks.push({ name: 'Sign Up', path: '/signup' });
  }

  return (
    <footer className="bg-[#FAF6F0] border-t border-[#EAE2D5] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-[#EAE2D5]">
          
          {/* Left Column: Headline and Email Box */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#241E1A] tracking-tight leading-[1.15] max-w-xl font-medium uppercase">
              Get updates on new assessments & roles you actually care about in your inbox.
            </h2>
            
            <form onSubmit={handleSubmit(onSubscribe)} className="max-w-md w-full relative pt-4">
              <div className="relative border-b border-stone-400 focus-within:border-[#241E1A] transition-colors pb-1">
                <input
                  type="email"
                  placeholder="Email address"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full bg-transparent text-[#241E1A] text-sm py-2 pr-10 placeholder:text-stone-400 outline-none border-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="absolute right-0 bottom-2 text-[#241E1A] hover:text-stone-600 transition-colors"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-500 font-medium absolute left-0 bottom-[-18px]">{errors.email.message}</span>
              )}
              {isSubmitSuccessful && !errors.email && (
                <span className="text-[10px] text-emerald-700 font-semibold absolute left-0 bottom-[-18px]">Subscribed successfully!</span>
              )}
            </form>
          </div>

          {/* Right Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8 lg:pl-12">
            {/* Column 1: Menu */}
            <div>
              <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-6">Menu</h3>
              <ul className="space-y-3.5">
                {platformLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-xs text-[#241E1A] hover:text-stone-500 transition-colors font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <span className="text-xs text-stone-400 italic font-serif">(Vibes)</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Support */}
            <div>
              <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-6">Support</h3>
              <ul className="space-y-3.5">
                <li>
                  <a href="#" className="text-xs text-[#241E1A] hover:text-stone-500 transition-colors font-medium">
                    Help Center & FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-[#241E1A] hover:text-stone-500 transition-colors font-medium">
                    API Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-[#241E1A] hover:text-stone-500 transition-colors font-medium">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-[#241E1A] hover:text-stone-500 transition-colors font-medium">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-[#241E1A] hover:text-stone-500 transition-colors font-medium">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Metadata & Social */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Tech Stack / Payment Equivalent badges */}
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
            <span>Spring Boot</span>
            <span>React</span>
            <span>PostgreSQL</span>
            <span>RabbitMQ</span>
          </div>

          {/* Social circular icons */}
          <div className="flex items-center gap-3">
            <a href="https://github.com/yash-zade/proxima-monorepo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#241E1A] text-[#FAF6F0] flex items-center justify-center hover:bg-stone-800 transition-colors" aria-label="GitHub">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>

          {/* Clean upward logo/triangle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400">
              &copy; {new Date().getFullYear()} Proxima.
            </span>
            <Triangle className="w-4 h-4 fill-current text-[#241E1A]" />
          </div>
        </div>

      </div>
    </footer>
  );
}
