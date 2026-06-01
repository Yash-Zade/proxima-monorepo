import React from 'react';
import { Search, MapPin, DollarSign, Calendar, SlidersHorizontal, PlusCircle, ArrowUpRight, Briefcase } from 'lucide-react';

export default function JobListings() {
  const dummyJobs = [
    {
      title: 'Lead Frontend Engineer (Next.js)',
      company: 'Linear Labs',
      location: 'Remote (US/EU)',
      salary: '$160,000 - $190,000',
      posted: '2 days ago',
      tags: ['React', 'Next.js', 'TypeScript']
    },
    {
      title: 'Senior Distributed Systems Architect',
      company: 'Proton Protocol',
      location: 'Remote (Global)',
      salary: '$180,000 - $220,000',
      posted: '1 day ago',
      tags: ['Rust', 'Go', 'Kubernetes']
    },
    {
      title: 'Full Stack Product Engineer',
      company: 'Stripe Ecosystem',
      location: 'San Francisco, CA (Hybrid)',
      salary: '$150,000 - $180,000',
      posted: '3 days ago',
      tags: ['React', 'Node.js', 'PostgreSQL']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-[#EAE2D5]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#241E1A]">Job Registry</h1>
          <p className="text-xs text-stone-500 mt-1">Discover thoroughly vetted, high-performing technical positions in tech.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <PlusCircle className="w-4 h-4" />
          Create Job Posting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Dummy Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#FAF6F0] border border-[#EAE2D5] p-5 rounded-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#241E1A] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </span>
              <button className="text-[10px] text-stone-400 hover:text-[#241E1A] font-semibold uppercase tracking-wider transition-colors">
                Reset
              </button>
            </div>

            {/* Mock Search Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Design, development..."
                  disabled
                  className="w-full bg-[#FDFBF7] border border-[#EAE2D5] rounded-lg py-2 pl-9 pr-4 text-xs outline-none cursor-not-allowed placeholder:text-stone-300"
                />
              </div>
            </div>

            {/* Mock checkbox list */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Employment Format</label>
              <div className="space-y-2">
                {['Full-time', 'Contract', 'Part-time'].map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-stone-600">
                    <input type="checkbox" defaultChecked={idx === 0} disabled className="accent-[#241E1A]" />
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock location list */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Location</label>
              <div className="space-y-2">
                {['Remote', 'Hybrid', 'On-site'].map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-stone-600">
                    <input type="checkbox" defaultChecked={idx < 2} disabled className="accent-[#241E1A]" />
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dummy Listings List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Active Placements (Mock Mode)
          </div>

          {dummyJobs.map((job, index) => (
            <div
              key={index}
              className="bg-white border border-[#EAE2D5] hover:border-stone-400 p-5 rounded-xl transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-[#241E1A]">{job.title}</h2>
                  <span className="bg-[#F4ECE1] text-[#241E1A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {job.company}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {job.posted}
                  </span>
                </div>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-[#FDFBF7] border border-[#EAE2D5] text-stone-600 text-[9px] font-semibold px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full sm:w-auto bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold px-4.5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 flex-shrink-0">
                Apply Now
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
