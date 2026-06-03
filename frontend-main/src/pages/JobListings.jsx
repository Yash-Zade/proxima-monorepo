import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Calendar, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiClient.get('/public/jobs?pageSize=100'); // Fetch more to allow client-side filtering to be effective
        const responseData = response.data?.data || response.data;
        console.log(response.data?.data);
        if (responseData && responseData.content) {
          setJobs(responseData.content);
        } else if (Array.isArray(responseData)) {
          setJobs(responseData);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error('[Dev Alert] Failed to fetch job listings:', err);
        setError('Unable to load job listings at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleLocationChange = (loc) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search keyword matches title, company, description, or skills
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        job.title?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.postedBy?.companyName?.toLowerCase().includes(searchLower) ||
        job.skillsRequired?.some(skill => skill.toLowerCase().includes(searchLower));

      // Location filter
      const matchesLocation = selectedLocations.length === 0 || 
        selectedLocations.some(loc => job.location?.toLowerCase().includes(loc.toLowerCase()));

      return matchesSearch && matchesLocation;
    });
  }, [jobs, searchTerm, selectedLocations]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Page Header */}
      <div className="relative overflow-hidden mb-12 pb-8 border-b border-[#EAE2D5]">
        {/* Aesthetic grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        
        <div className="relative space-y-4">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#241E1A] uppercase tracking-tight font-medium">
            Job <span className="text-gradient">Registry</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">Discover dynamic, Generative AI matched placements and examination pathways.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#FCF9F3] border border-[#EAE2D5] p-6 rounded-2xl space-y-6 transition-all duration-300 hover:shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#241E1A] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </span>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedLocations([]); }}
                className="text-[10px] text-stone-400 hover:text-[#241E1A] font-semibold uppercase tracking-wider transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Search Keywords</label>
              <div className="relative border-b border-stone-400 focus-within:border-[#241E1A] transition-colors pb-1">
                <Search className="absolute left-0 top-2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Role, company, skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none py-1.5 pl-6 pr-4 text-xs outline-none focus:ring-0 placeholder:text-stone-300 text-[#241E1A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Listings List */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center text-xs text-stone-400 font-bold uppercase tracking-widest mb-8 border-b border-[#EAE2D5] pb-3">
            <span>Active Roles</span>
            {filteredJobs.length > 0 && <span>{filteredJobs.length} Positions</span>}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[#241E1A] animate-spin mx-auto flex items-center justify-center shadow-md">
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest animate-pulse text-stone-500">Loading Registry...</span>
            </div>
          ) : error ? (
            <div className="bg-[#FAF6F0] border border-red-200 p-8 rounded-xl text-center space-y-2">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-[#241E1A] underline transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-[#FAF6F0] border border-[#EAE2D5] p-12 rounded-xl text-center space-y-3">
              <p className="text-sm font-semibold text-[#241E1A]">No active placements found.</p>
              <p className="text-xs text-stone-500">Please check back later or modify your filters.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredJobs.map((job) => (
                <div
                  key={job.jobId}
                  onClick={() => navigate(`/jobs/${job.jobId}`)}
                  className="group cursor-pointer border-b border-[#EAE2D5] pb-8 pt-4 px-4 hover:px-6 hover:bg-[#FCF9F3] hover:rounded-2xl transition-all duration-300 mb-4 last:border-b-0"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-3 flex-grow">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-serif text-[#241E1A] group-hover:text-amber-800 transition-all uppercase tracking-tight font-medium">
                          {job.title}
                        </h2>
                        {job?.postedBy?.companyName && (
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                            &bull; {job?.postedBy?.companyName}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-500 uppercase tracking-widest font-semibold">
                        {job.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {job.location}
                          </span>
                        )}
                        {job.postedDate && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            {job.postedDate}
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-xs text-stone-500 leading-relaxed font-normal max-w-3xl pt-1">
                          {job.description.length > 200 ? `${job.description.slice(0, 200)}...` : job.description}
                        </p>
                      )}

                      {/* Tech tags */}
                      {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skillsRequired.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-[#EAE2D5] text-[#241E1A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-3xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center self-stretch justify-end pt-2 md:pt-0">
                      <div className="w-8 h-8 rounded-full border border-stone-400 group-hover:border-[#241E1A] group-hover:bg-[#241E1A] group-hover:text-[#FAF6F0] flex items-center justify-center transition-all">
                        <ArrowUpRight className="w-4 h-4 text-stone-500 group-hover:text-[#FAF6F0] transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
