import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Briefcase, Building2, ArrowLeft, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import apiClient from '../lib/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { JobDetailSkeleton } from '../components/Skeleton';

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
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#241E1A] hover:text-stone-500 transition-colors mb-8">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Registry
          </Link>
          <div className="bg-[#FAF6F0] border border-[#EAE2D5] p-10 rounded-2xl text-center space-y-3">
            <p className="text-sm font-semibold text-red-600">{error || 'Job not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-16 relative">
      {/* Aesthetic grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-8 border-b border-[#EAE2D5] pb-3">
          <Link to="/jobs" className="hover:text-[#241E1A] transition-colors">Registry</Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-[#241E1A] truncate max-w-[200px]">{job.title}</span>
        </div>

        {/* Job Header Area */}
        <div className="bg-[#FCF9F3] border border-[#EAE2D5] rounded-3xl p-8 sm:p-10 shadow-xs mb-8 relative overflow-hidden hover:shadow-sm transition-all duration-300">
          <div className="relative z-10 space-y-6">
            <div className="space-y-4">
              {job.company && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#EAE2D5] bg-white text-[#241E1A] text-[9px] font-bold uppercase tracking-widest shadow-3xs">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.company}
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-serif text-[#241E1A] uppercase tracking-tight font-medium">
                {job.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-stone-500 uppercase tracking-widest font-bold">
              {job.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  {job.location}
                </span>
              )}
              {job.jobStatus && (
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-stone-400" />
                  Status: <span className={job.jobStatus === 'OPEN' ? 'text-emerald-800' : 'text-red-700'}>{job.jobStatus}</span>
                </span>
              )}
              {job.postedDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  {job.postedDate}
                </span>
              )}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button 
                onClick={handleApply}
                disabled={applying || job.jobStatus !== 'OPEN'}
                className={`px-6 py-3 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer ${
                  (applying || job.jobStatus !== 'OPEN') ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {applying ? 'Submitting...' : 'Apply for this Position'}
                {!applying && <CheckCircle2 className="w-4 h-4" />}
              </button>
              <button className="p-3 bg-white border border-[#EAE2D5] text-[#241E1A] hover:bg-[#F4ECE1] rounded-xl transition-colors shadow-3xs cursor-pointer">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Job Details Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white border border-[#EAE2D5] rounded-3xl p-8 shadow-3xs">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#241E1A] mb-4 flex items-center gap-2 border-b border-[#EAE2D5] pb-2">
                <Briefcase className="w-4 h-4 text-stone-400" />
                Position Overview
              </h2>
              <div className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap font-normal">
                {job.description || 'No detailed description provided by the employer.'}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Skills Card */}
            <section className="bg-[#FCF9F3] border border-[#EAE2D5] rounded-3xl p-6 shadow-3xs">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4 border-b border-[#EAE2D5] pb-2">Required Capabilities</h3>
              {job.skillsRequired && job.skillsRequired.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {job.skillsRequired.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-[#EAE2D5] text-[#241E1A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-3xs"
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
