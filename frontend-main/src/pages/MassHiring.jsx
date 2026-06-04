import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../lib/apiClient';
import { Building2, MapPin, Mail, Globe, Users, ChevronRight, X, Briefcase, ExternalLink } from 'lucide-react';
import { MassHiringSkeleton } from '../components/Skeleton';

export default function MassHiring() {
  const { user, loading } = useContext(AuthContext);
  const { showToast } = useToast();
  
  const [colleges, setColleges] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    // Only fetch if user is an employer
    if (user?.roles?.includes('EMPLOYER')) {
      const fetchColleges = async () => {
        try {
          const res = await apiClient.get('/public/colleges');
          const data = res.data?.data || res.data || [];
          setColleges(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load colleges", err);
          showToast('Failed to load colleges for mass hiring.', 'error');
        } finally {
          setIsFetching(false);
        }
      };
      fetchColleges();
    } else {
      setIsFetching(false);
    }
  }, [user, showToast]);

  if (loading || isFetching) {
    return <MassHiringSkeleton />;
  }

  // Restrict to EMPLOYER
  if (!user?.roles?.includes('EMPLOYER')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 border-b border-[#EAE2D5] pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#241E1A] flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-[#FDFBF7]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#241E1A]">Mass Hiring Directory</h1>
              <p className="text-sm font-medium text-stone-500 mt-1">Discover and partner with verified academic institutions for bulk recruitment.</p>
            </div>
          </div>
        </div>

        {/* Colleges Grid */}
        {colleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <div 
                key={college.id} 
                onClick={() => setSelectedCollege(college)}
                className="bg-white border border-[#EAE2D5] hover:border-[#241E1A] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F4ECE1] rounded-bl-full opacity-30 group-hover:scale-110 transition-transform -z-0" />
                
                <div className="flex items-start justify-between relative z-10 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center border border-[#EAE2D5]">
                    <Building2 className="w-5 h-5 text-[#241E1A]" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-[#EAE2D5] group-hover:bg-[#241E1A] flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-[#241E1A] mb-2 leading-tight relative z-10 line-clamp-2">
                  {college.name}
                </h3>
                
                <div className="flex items-center gap-2 text-stone-500 mt-auto relative z-10">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-medium truncate">{college.address || 'Address not available'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#EAE2D5] border-dashed rounded-3xl p-12 text-center">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#241E1A] mb-2">No Institutions Found</h3>
            <p className="text-sm text-stone-500">There are currently no colleges registered for mass hiring programs.</p>
          </div>
        )}
      </div>

      {/* College Details Modal */}
      {selectedCollege && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setSelectedCollege(null)}
          />
          <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-3xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header Banner */}
            <div className="h-32 bg-[#241E1A] relative flex items-end px-8 pb-6">
              <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
              <button 
                onClick={() => setSelectedCollege(null)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-white border-4 border-[#241E1A] flex items-center justify-center absolute -bottom-8 left-8 shadow-sm">
                <Building2 className="w-8 h-8 text-[#241E1A]" />
              </div>
            </div>

            <div className="px-8 pt-12 pb-8">
              <h2 className="text-2xl font-black text-[#241E1A] mb-6 tracking-tight leading-tight">
                {selectedCollege.name}
              </h2>

              <div className="space-y-5 bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-sm">
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 border border-[#EAE2D5]">
                    <MapPin className="w-4 h-4 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Location</p>
                    <p className="text-sm font-semibold text-[#241E1A]">{selectedCollege.address || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 border border-[#EAE2D5]">
                    <Mail className="w-4 h-4 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Contact Email</p>
                    {selectedCollege.email ? (
                      <a href={`mailto:${selectedCollege.email}`} className="text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors">
                        {selectedCollege.email}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-stone-500">Not provided</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 border border-[#EAE2D5]">
                    <Globe className="w-4 h-4 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Website</p>
                    {selectedCollege.website ? (
                      <a href={selectedCollege.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors inline-flex items-center gap-1">
                        {selectedCollege.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-stone-500">Not provided</p>
                    )}
                  </div>
                </div>

              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    showToast('Mass hiring request initiated! The institution will be notified.', 'success');
                    setSelectedCollege(null);
                  }}
                  className="flex-1 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Initiate Mass Hiring
                </button>
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="px-6 bg-white hover:bg-[#FAF6F0] border border-[#EAE2D5] text-[#241E1A] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
