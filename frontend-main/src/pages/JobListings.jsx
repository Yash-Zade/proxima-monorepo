import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Calendar, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
      // Search keyword matches title, company, or skills
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        job.title?.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower) ||
        job.skillsRequired?.some(skill => skill.toLowerCase().includes(searchLower));

      // Location filter
      const matchesLocation = selectedLocations.length === 0 || 
        selectedLocations.some(loc => job.location?.toLowerCase().includes(loc.toLowerCase()));

      return matchesSearch && matchesLocation;
    });
  }, [jobs, searchTerm, selectedLocations]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-[#EAE2D5]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#241E1A]">Job Listings</h1>
          <p className="text-xs text-stone-500 mt-1">Discover thoroughly vetted, high-performing technical positions in tech.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#FAF6F0] border border-[#EAE2D5] p-5 rounded-xl space-y-5">
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
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Role, company, skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#EAE2D5] focus:border-[#241E1A] rounded-lg py-2 pl-9 pr-4 text-xs outline-none transition-colors placeholder:text-stone-300"
                />
              </div>
            </div>

            {/* Location list */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Location Format</label>
              <div className="space-y-2">
                {['Remote', 'Hybrid', 'On-site'].map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-stone-600">
                    <input 
                      type="checkbox" 
                      checked={selectedLocations.includes(opt)}
                      onChange={() => handleLocationChange(opt)}
                      className="accent-[#241E1A] cursor-pointer" 
                    />
                    <span className="cursor-pointer" onClick={() => handleLocationChange(opt)}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Listings List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <span>Active Placements</span>
            {filteredJobs.length > 0 && <span>{filteredJobs.length} Results</span>}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-[#241E1A] animate-spin"></div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Loading Placements...</span>
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
            filteredJobs.map((job) => (
              <div
                key={job.jobId}
                onClick={() => navigate(`/jobs/${job.jobId}`)}
                className="bg-white border border-[#EAE2D5] hover:border-[#241E1A] p-5 rounded-xl transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md group cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold text-[#241E1A] group-hover:text-amber-800 transition-colors">
                      {job.title}
                    </h2>
                    {job.company && (
                      <span className="bg-[#F4ECE1] text-[#241E1A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {job.company}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-500 font-medium">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {job.location}
                      </span>
                    )}
                    {job.postedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {job.postedDate}
                      </span>
                    )}
                  </div>

                  {/* Tech tags */}
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skillsRequired.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#FDFBF7] border border-[#EAE2D5] text-stone-600 text-[9px] font-semibold px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Link 
                  to={`/jobs/${job.jobId}`}
                  className="w-full sm:w-auto bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 flex-shrink-0 shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Job
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
