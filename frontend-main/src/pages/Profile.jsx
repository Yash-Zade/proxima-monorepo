import React from 'react';
import { User, Mail, Award, CheckCircle2, Save, Laptop, Sparkles, Building, Calendar, Lock } from 'lucide-react';

export default function Profile() {
  const dummyHistory = [
    {
      company: 'Linear Labs',
      role: 'Senior React Developer',
      period: '2024 - Present',
      desc: 'Architecting core workspace features and improving rendering efficiency.'
    },
    {
      company: 'Stripe Ecosystem',
      role: 'Staff UI Engineer',
      period: '2022 - 2024',
      desc: 'Pioneered custom atomic design libraries and web hook monitoring dashboards.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#EAE2D5] mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-[#241E1A]">Talent Console</h1>
        <p className="text-xs text-stone-500 mt-1">Manage your verified matching details and platform settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - dummy console details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#FCF9F3] border border-[#EAE2D5] p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#241E1A]" />

            <div className="w-16 h-16 rounded-xl bg-[#241E1A] text-[#FDFBF7] flex items-center justify-center text-xl font-bold mt-4 shadow-sm">
              YZ
            </div>

            <h2 className="text-sm font-bold text-[#241E1A] mt-4">Yash Zade</h2>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-1">Senior Architect &bull; Silicon Valley</p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4ECE1] border border-[#EAE2D5] mt-4 text-[9px] font-bold uppercase tracking-wider text-[#241E1A]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#241E1A]" />
              Verified Member
            </div>

            <div className="w-full grid grid-cols-2 gap-4 border-t border-[#EAE2D5] mt-6 pt-6 text-center">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Assessments</span>
                <span className="text-xs font-bold text-[#241E1A] mt-1 block">4 Passed</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Match Score</span>
                <span className="text-xs font-bold text-[#241E1A] mt-1 block">99.4% Match</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF6F0] border border-[#EAE2D5] p-5 rounded-2xl space-y-4">
            <span className="text-[9px] font-bold text-[#241E1A] uppercase tracking-widest block flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#241E1A]" />
              Certificates & Badges
            </span>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#EAE2D5]/70">
                <Laptop className="w-4 h-4 text-stone-400" />
                <div>
                  <span className="text-xs font-bold text-[#241E1A] block">Systems Assessment</span>
                  <span className="text-[9px] text-stone-400 font-medium">Verified Core Developer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - dummy editing fields */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs">
            <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-6">Profile Settings</h2>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Yash Zade"
                    disabled
                    className="w-full bg-[#FAF6F0] border border-[#EAE2D5] rounded-lg py-2.5 px-3.5 text-xs text-stone-500 cursor-not-allowed outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    defaultValue="Senior Frontend Developer"
                    disabled
                    className="w-full bg-[#FAF6F0] border border-[#EAE2D5] rounded-lg py-2.5 px-3.5 text-xs text-stone-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  defaultValue="yash@zade.io"
                  disabled
                  className="w-full bg-[#FAF6F0] border border-[#EAE2D5] rounded-lg py-2.5 px-3.5 text-xs text-stone-500 cursor-not-allowed outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Bio Summary</label>
                <textarea
                  rows={3}
                  defaultValue="High-performing developer specializing in highly visual, reactive web applications. Passionate about system architecture."
                  disabled
                  className="w-full bg-[#FAF6F0] border border-[#EAE2D5] rounded-lg py-2.5 px-3.5 text-xs text-stone-500 cursor-not-allowed outline-none resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#EAE2D5] flex-wrap gap-3">
                <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Secured Profile Node
                </span>
                <button
                  disabled
                  className="bg-[#241E1A] opacity-40 text-[#FDFBF7] text-xs font-semibold px-4.5 py-2.5 rounded-lg cursor-not-allowed flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs">
            <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-6">Work History Timeline</h2>

            <div className="relative border-l border-[#EAE2D5] ml-3 pl-6 space-y-6">
              {dummyHistory.map((job, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1 bg-[#FAF6F0] border border-[#241E1A] rounded-full w-3 h-3" />

                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#241E1A] flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-stone-400" />
                        {job.company}
                      </h3>
                      <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">{job.role}</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 bg-[#FAF6F0] border border-[#EAE2D5] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {job.period}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed mt-2">{job.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
