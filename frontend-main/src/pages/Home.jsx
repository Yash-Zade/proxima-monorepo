import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, Globe, Shield, Sparkles, Building, Briefcase, Zap, Star, ArrowRight, Layers, Users, Cpu } from 'lucide-react';

export default function Home() {
  const highlights = [
    {
      icon: Globe,
      title: 'Architectural Synergy',
      subtitle: 'Global Operations',
      description: 'Establish high-fidelity remote pipelines. Connect with engineering groups building next-generation protocols and infrastructure.'
    },
    {
      icon: Shield,
      title: 'Micro-Verification',
      subtitle: 'Vetted Portfolios',
      description: 'Secure, cryptographically authenticated talent records that align technical metrics directly with decisions in modern companies.'
    },
    {
      icon: Sparkles,
      title: 'Direct Dispatch',
      subtitle: 'Zero Latency',
      description: 'Bypass conventional tracking boards. Open direct channels to technical executives through active dashboard environments.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32 corporate-gradient border-b border-[#EAE2D5]">
        {/* Aesthetic grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Controls */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Vetted Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#EAE2D5] bg-[#FCF9F3] shadow-xs">
                <Zap className="w-3.5 h-3.5 text-[#241E1A]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#241E1A]">Verified Technical Placements</span>
              </div>

              {/* Editorial Headline */}
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#241E1A] leading-[1.08]">
                Minimal System for <br />
                <span className="text-gradient">Elite Tech Synergy.</span>
              </h1>

              {/* Soft Subtext */}
              <p className="text-sm sm:text-base text-stone-500 font-normal leading-relaxed max-w-xl">
                Proxima is an architectural matchmaking interface. We pair remote software engineers and systems architects directly with vetted, high-paying startup pipelines. No fluff, just pure performance vectors.
              </p>

              {/* Dynamic Search Box */}
              <div className="max-w-md">
                <div className="relative flex items-center bg-white border border-[#EAE2D5] focus-within:border-[#241E1A] rounded-xl p-1.5 transition-all shadow-xs">
                  <Search className="w-4 h-4 text-stone-400 ml-3" />
                  <input
                    type="text"
                    placeholder="Search: Distributed Systems, Next.js..."
                    className="w-full bg-transparent border-0 outline-none text-xs pl-2 text-[#241E1A] placeholder:text-stone-300"
                  />
                  <Link
                    to="/jobs"
                    className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                  >
                    Explore
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Social Proof Tags */}
              <div className="pt-4 flex flex-wrap items-center gap-x-8 gap-y-4 text-stone-400">
                <span className="text-[9px] font-bold tracking-widest uppercase text-stone-400">CORE PIPELINES:</span>
                {['Linear', 'Vercel', 'Stripe', 'Supabase'].map((brand, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-[#241E1A] font-semibold text-xs tracking-tight">
                    <Building className="w-3.5 h-3.5 text-stone-400" />
                    {brand}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Premium Asymmetric Floating Cards */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                {/* Background graphic ring */}
                <div className="absolute w-72 h-72 rounded-full border border-dashed border-[#EAE2D5] animate-spin-slow pointer-events-none" />

                {/* Floating Card 1 */}
                <div className="absolute top-4 left-4 bg-white border border-[#EAE2D5] p-5 rounded-2xl shadow-lg w-64 transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-[#F4ECE1] text-[#241E1A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">Next.js Lead</span>
                    <span className="text-emerald-700 text-[10px] font-bold tracking-wider">$190k</span>
                  </div>
                  <h3 className="text-xs font-bold text-[#241E1A]">Vercel Ecosystem</h3>
                  <p className="text-[10px] text-stone-400 mt-1">Remote / Global. Technical architecture design & React performance optimization.</p>
                  <div className="border-t border-[#EAE2D5]/70 mt-3 pt-3 flex justify-between items-center text-[9px] text-[#241E1A] font-semibold uppercase tracking-wider">
                    <span>Vetted Score: 99.4%</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-500" />
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute bottom-6 right-4 bg-[#FCF9F3] border border-[#EAE2D5] p-5 rounded-2xl shadow-xl w-60 transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500">Real-time matching</span>
                  </div>
                  <h3 className="text-xs font-bold text-[#241E1A]">Kalyani Satpute</h3>
                  <p className="text-[10px] text-stone-400 mt-1">Systems Developer & Architect. Passed technical React performance benchmark.</p>
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {['React', 'Go', 'Rust'].map((t, i) => (
                      <span key={i} className="text-[9px] bg-white border border-[#EAE2D5] px-1.5 py-0.5 rounded text-stone-600 font-semibold">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="bg-[#FAF6F0] border-b border-[#EAE2D5] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#EAE2D5]">
            {[
              { val: '48 Hrs', label: 'Average Pipeline Placement' },
              { val: '$145K', label: 'Median Vetted Remote Base' },
              { val: '99.4%', label: 'Alignment Success Index' },
              { val: '14,000+', label: 'Verified Engineers' }
            ].map((stat, idx) => (
              <div key={idx} className="pt-4 md:pt-0 md:px-4 flex flex-col justify-center">
                <span className="text-xl sm:text-2xl font-extrabold text-[#241E1A] tracking-tight">{stat.val}</span>
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Features Section */}
      <section className="py-20 md:py-28 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#241E1A]">
              Matchmaking Engineered For Architecture
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-3 leading-relaxed">
              We removed the clutter. No endless feed social media, no spam recruiter channels. Just high-caliber matchmaking vectors built for technical architects.
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-[#EAE2D5] hover:border-stone-400 p-8 rounded-2xl transition-all duration-300 flex flex-col items-start hover:shadow-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] border border-[#EAE2D5] flex items-center justify-center mb-6">
                  <item.icon className="w-5 h-5 text-[#241E1A]" />
                </div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{item.subtitle}</span>
                <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-3">{item.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-End Architectural Spotlight Grid */}
      <section className="py-16 md:py-24 bg-[#FCF9F3] border-y border-[#EAE2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-[#EAE2D5] p-5 rounded-2xl flex flex-col justify-between h-40">
                  <Layers className="w-6 h-6 text-[#241E1A]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#241E1A]">Modular Outlines</h4>
                    <p className="text-[10px] text-stone-400 mt-1">Establish custom workspace structures and credentials.</p>
                  </div>
                </div>
                <div className="bg-[#FAF6F0] border border-[#EAE2D5] p-5 rounded-2xl flex flex-col justify-between h-40">
                  <Users className="w-6 h-6 text-[#241E1A]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#241E1A]">Elite Portfolios</h4>
                    <p className="text-[10px] text-stone-400 mt-1">Direct verification badges passed and active matching pipelines.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl flex items-center gap-4">
                <Cpu className="w-8 h-8 text-[#241E1A] flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#241E1A]">Latency-Free Dispatch</h4>
                  <p className="text-[10px] text-stone-400 mt-1">Socket channels mapping real-time credentials directly to dashboard monitors.</p>
                </div>
              </div>
            </div>

            {/* Narrative Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Architectural Registry</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#241E1A] leading-tight">
                Vetted benchmark profiles designed for elite placements.
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Platform placement targets average less than 48 hours because engineers are authenticated prior to listing. Establish credentials, clear the assessments benchmarks, and launch direct matching channels seamlessly.
              </p>
              <div className="pt-2">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider px-5 py-3 rounded-lg transition-colors shadow-sm"
                >
                  Configure Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Editorial High-Contrast Quote Banner */}
      <section className="bg-[#241E1A] py-16 md:py-24 text-[#FDFBF7] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <Star className="w-8 h-8 text-amber-100 mx-auto opacity-80" />
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-[1.2] max-w-3xl mx-auto">
            "Proxima bypassed the conventional recruiting layers entirely. I had direct matching channels open with founders within 24 hours of technical verification."
          </h3>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FAF6F0] block">Devon Miller</span>
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-1 block">Staff UI Architect &bull; Silicon Valley</span>
          </div>
        </div>
      </section>

      {/* Clean Call To Action Section */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FAF6F0] border border-[#EAE2D5] rounded-3xl p-8 sm:p-16 text-center space-y-8 shadow-xs">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Connect Vetted Nodes</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#241E1A] tracking-tight">
              Ready to deploy your remote matching vector?
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto leading-relaxed">
              Skip intermediate recruit filtering. Establish your credential node, list core skill tags, and toggle open for startup inquiries.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/profile"
                className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-lg shadow-sm"
              >
                Configure Profile
              </Link>
              <Link
                to="/jobs"
                className="bg-white border border-[#EAE2D5] hover:border-stone-400 text-[#241E1A] text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-lg flex items-center justify-center gap-1.5"
              >
                Browse Job Registry
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
