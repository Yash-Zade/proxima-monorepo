import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Briefcase, Building2, ArrowLeft, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import apiClient from '../lib/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await apiClient.get(`/public/jobs/${id}`);
        const responseData = response.data?.data || response.data;
        if (responseData) {
          setJob(responseData);
        } else {
          setError('Job not found.');
        }
      } catch (err) {
        console.error('[Dev Alert] Failed to fetch job details:', err);
        setError('Unable to load job details at this time.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      showToast('Please sign in to apply for this position.', 'error');
      navigate('/signin');
      return;
    }

    setApplying(true);
    try {
      await apiClient.post(`/applicants/jobs/${id}/apply`, { jobId: id });
      showToast('Successfully applied for this position!', 'success');
      // Navigate to profile or applications page after a delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('[Dev Alert] Application failed:', err);
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to apply. You may have already applied.';
      showToast(errorMessage, 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-[#241E1A] animate-spin"></div>
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Loading Job Specifications...</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-16">
        <Link to="/jobs" className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-[#241E1A] transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Listings
        </Link>
        <div className="bg-[#FAF6F0] border border-red-200 p-8 rounded-xl text-center space-y-2">
          <p className="text-sm font-semibold text-red-600">{error || 'Job not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-8">
          <Link to="/jobs" className="hover:text-[#241E1A] transition-colors">Listings</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#241E1A] truncate max-w-[200px]">{job.title}</span>
        </div>

        {/* Job Header Card */}
        <div className="bg-white border border-[#EAE2D5] rounded-3xl p-8 sm:p-10 shadow-sm mb-8 relative overflow-hidden">
          {/* Decorative background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(#E5DAC9_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-30 -mr-16 -mt-16 pointer-events-none rounded-full" />
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-3">
              {job.company && (
                <div className="inline-flex items-center gap-1.5 bg-[#F4ECE1] text-[#241E1A] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.company}
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#241E1A] tracking-tight">{job.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  {job.location}
                </span>
              )}
              {job.jobStatus && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-stone-400" />
                  Status: <span className={job.jobStatus === 'OPEN' ? 'text-green-600' : 'text-red-600'}>{job.jobStatus}</span>
                </span>
              )}
              {job.postedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  Posted {job.postedDate}
                </span>
              )}
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button 
                onClick={handleApply}
                disabled={applying || job.jobStatus !== 'OPEN'}
                className={`px-6 py-3 bg-[#241E1A] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center gap-2 ${
                  (applying || job.jobStatus !== 'OPEN') ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#382F29]'
                }`}
              >
                {applying ? 'Submitting...' : 'Apply for this Position'}
                {!applying && <CheckCircle2 className="w-4 h-4" />}
              </button>
              <button className="p-3 border border-[#EAE2D5] text-stone-600 hover:text-[#241E1A] hover:bg-[#F4ECE1] rounded-xl transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Job Details Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white border border-[#EAE2D5] rounded-3xl p-8 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#241E1A] mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-stone-400" />
                Position Overview
              </h2>
              <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                {job.description || 'No detailed description provided by the employer.'}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Skills Card */}
            <section className="bg-[#FAF6F0] border border-[#EAE2D5] rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#241E1A] mb-4">Required Capabilities</h3>
              {job.skillsRequired && job.skillsRequired.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-[#EAE2D5] text-stone-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">No specific skills listed.</p>
              )}
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
