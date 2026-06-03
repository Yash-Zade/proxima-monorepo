import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, CheckCircle2, Shield, Mail, FileText, Plus, Save, Briefcase, Trash2, ArrowRight, ChevronDown, Brain, Lock, MapPin, Sparkles, Code2, Download, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../lib/apiClient';

function RoleApplicationModal({ isOpen, onClose, userId }) {
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeAddress, setCollegeAddress] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [collegeWebsite, setCollegeWebsite] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Available colleges select state
  const [availableColleges, setAvailableColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);

  const roles = [
    { value: 'EMPLOYER', label: 'Employer' },
    { value: 'COLLEGE', label: 'College / University' },
    { value: 'STUDENT', label: 'Student' }
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedRole('');
      setCompanyName('');
      setCompanyWebsite('');
      setCollegeName('');
      setCollegeAddress('');
      setCollegeEmail('');
      setCollegeWebsite('');
      setCollegeId('');
      setCollegesLoading(true);
      apiClient.get('/public/colleges')
        .then(res => {
          const list = res.data?.data ?? res.data ?? [];
          setAvailableColleges(list);
        })
        .catch(err => {
          console.error('[Dev Alert] Failed to load colleges:', err);
        })
        .finally(() => {
          setCollegesLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      showToast('Please select a role to apply for.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedRole === 'EMPLOYER') {
        await apiClient.post('/users/request/employer', {
          userId,
          companyName,
          companyWebsite
        });
      } else if (selectedRole === 'COLLEGE') {
        await apiClient.post('/users/request/college', {
          userId,
          name: collegeName,
          address: collegeAddress,
          email: collegeEmail,
          website: collegeWebsite
        });
      } else if (selectedRole === 'STUDENT') {
        if (!collegeId) {
          showToast('Please select a college.', 'error');
          return;
        }
        await apiClient.post(`/users/request/student`, {
          userId,
          collegeId,
          collegeName
        });
      }
      showToast('Role application submitted successfully.', 'success');
      onClose();
    } catch (err) {
      console.error('Failed to submit role application:', err);
      showToast('Failed to submit application. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-2xl p-8 max-w-md w-full shadow-xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-[#241E1A] transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-[#241E1A] mb-1">Apply for a New Role</h2>
        <p className="text-xs text-stone-500 mb-6">Select a role to request onboarding access.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Select Role</label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-[#EAE2D5] hover:border-[#241E1A] focus:border-[#241E1A] rounded-lg py-2.5 px-3 text-xs outline-none font-semibold text-[#241E1A] flex items-center justify-between transition-colors"
              >
                {selectedRole ? roles.find(r => r.value === selectedRole)?.label : <span className="text-stone-400">Choose a role...</span>}
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#EAE2D5] rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r.value);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#241E1A] hover:bg-[#F4ECE1] transition-colors"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedRole === 'EMPLOYER' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Company Name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full bg-white border border-[#EAE2D5] rounded-lg py-2 px-3 text-xs outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Company Website</label>
                <input type="url" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} required className="w-full bg-white border border-[#EAE2D5] rounded-lg py-2 px-3 text-xs outline-none" />
              </div>
            </div>
          )}

          {selectedRole === 'COLLEGE' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Institution Name</label>
                <input type="text" value={collegeName} onChange={e => setCollegeName(e.target.value)} required className="w-full bg-white border border-[#EAE2D5] rounded-lg py-2 px-3 text-xs outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Address</label>
                <input type="text" value={collegeAddress} onChange={e => setCollegeAddress(e.target.value)} required className="w-full bg-white border border-[#EAE2D5] rounded-lg py-2 px-3 text-xs outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Official Email</label>
                <input type="email" value={collegeEmail} onChange={e => setCollegeEmail(e.target.value)} required className="w-full bg-white border border-[#EAE2D5] rounded-lg py-2 px-3 text-xs outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Website</label>
                <input type="url" value={collegeWebsite} onChange={e => setCollegeWebsite(e.target.value)} required className="w-full bg-white border border-[#EAE2D5] rounded-lg py-2 px-3 text-xs outline-none" />
              </div>
            </div>
          )}

          {selectedRole === 'STUDENT' && (
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Select College</label>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCollegeDropdownOpen(!isCollegeDropdownOpen)}
                    className="w-full bg-white border border-[#EAE2D5] hover:border-[#241E1A] focus:border-[#241E1A] rounded-lg py-2.5 px-3 text-xs outline-none font-semibold text-[#241E1A] flex items-center justify-between transition-colors"
                    disabled={collegesLoading}
                  >
                    {collegeName ? collegeName : <span className="text-stone-400">Choose a college...</span>}
                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isCollegeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCollegeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#EAE2D5] rounded-xl shadow-lg z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
                      {collegesLoading ? (
                        <div className="px-4 py-2 text-xs text-stone-400">Loading colleges...</div>
                      ) : availableColleges.length > 0 ? (
                        availableColleges.map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => {
                              setCollegeId(col.id);
                              setCollegeName(col.name);
                              setIsCollegeDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#241E1A] hover:bg-[#F4ECE1] transition-colors"
                          >
                            {col.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-xs text-stone-400">No colleges available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#EAE2D5]">
            <button 
              type="submit"
              disabled={isSubmitting || !selectedRole}
              className="w-full bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Role Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, loading } = useContext(AuthContext);
  const { showToast } = useToast();

  const [applicantProfile, setApplicantProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const availableLocations = [
    "Remote", "Hybrid", "San Francisco, CA", "New York, NY", "London, UK", "Berlin, DE", "Toronto, CA", "Bengaluru, IN", "Singapore", "Sydney, AU", "Dubai, UAE"
  ];

  const isApplicant = user?.roles?.includes('APPLICANT') || user?.roles?.includes('USER');
  const certifiedSkills = applicantProfile?.certifiedSkills || [];

  useEffect(() => {
    if (isApplicant) {
      const fetchData = async () => {
        setIsFetchingData(true);
        try {
          const profileRes = await apiClient.get('/applicants/profile');
          const profileData = profileRes.data?.data || profileRes.data;
          setApplicantProfile(profileData);
          setPreferredLocations(profileData?.preferredLocations || []);

          const appsRes = await apiClient.get('/applicants/job-applications');
          const appsData = appsRes.data?.data?.content || appsRes.data?.content || appsRes.data || [];
          setApplications(Array.isArray(appsData) ? appsData : []);
        } catch (error) {
          console.error('Error fetching applicant data:', error);
          showToast('Failed to load some profile details.', 'error');
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchData();
    }
  }, [isApplicant, showToast]);

  const handleSaveProfile = async () => {
    if (!applicantProfile?.applicantId) return;
    setIsSaving(true);
    try {
      await apiClient.put(`/applicants/profile/${applicantProfile.applicantId}`, {
        skills: applicantProfile?.skills || [],
        preferredLocations
      });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast('Failed to save profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    try {
      await apiClient.post(`/applicants/jobs/${applicationId}/withdraw`);
      showToast('Application withdrawn.', 'success');
      setApplications(prev => prev.filter(app => app.applicationId !== applicationId));
    } catch (err) {
      showToast('Failed to withdraw application.', 'error');
    }
  };

  if (loading || isFetchingData) {
    return (
      <div className="min-h-[50vh] bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-lg bg-[#241E1A] animate-spin mx-auto flex items-center justify-center">
          </div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest animate-pulse">Loading Profile Node...</p>
        </div>
      </div>
    );
  }

  const name = user?.name || 'Anonymous User';
  const email = user?.email || 'No email provided';
  const roles = user?.roles || [];
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-16 relative">
      {/* Aesthetic grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <RoleApplicationModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        userId={user?.id}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Profile Card inspired by Image */}
        <div className="bg-white border border-[#EAE2D5] rounded-[32px] overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Banner */}
          <div className="h-40 bg-[#FCF9F3] relative overflow-hidden border-b border-[#EAE2D5]">
            <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-35 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FCF9F3]/40 via-transparent to-stone-400/10" />
          </div>

          <div className="px-8 pb-8 relative">
            {/* Overlapping Avatar */}
            <div className="absolute -top-16 left-8">
              <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-sm border border-[#EAE2D5]">
                <div className="w-full h-full rounded-full bg-[#241E1A] text-[#FDFBF7] flex items-center justify-center text-4xl font-bold shadow-inner font-serif">
                  {initials}
                </div>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex justify-end pt-5 gap-3">
               <button 
                 onClick={() => setIsRoleModalOpen(true)}
                 className="bg-[#241E1A] text-[#FAF6F0] hover:bg-[#382F29] text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-3xs cursor-pointer"
               >
                 Add Role
               </button>
               <button 
                 onClick={handleSaveProfile}
                 disabled={isSaving}
                 className="bg-white border border-[#EAE2D5] hover:bg-[#FAF6F0] text-[#241E1A] text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-3xs disabled:opacity-50 cursor-pointer"
               >
                 {isSaving ? 'Saving...' : 'Save Profile'}
               </button>
            </div>

            {/* Profile Info & Skills Layout */}
            <div className="mt-4 flex flex-col md:flex-row gap-8 justify-between items-start">
              
              {/* Left Side: Name, Role, Location */}
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl font-serif text-[#241E1A] uppercase tracking-tight font-medium">{name}</h1>
                {roles.length > 0 && (
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">
                    {roles.map(r => r.charAt(0) + r.slice(1).toLowerCase()).join(', ')}
                  </p>
                )}
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    {preferredLocations.length > 0 ? preferredLocations.join(', ') : 'Location not set'}
                  </p>
                  {/* Selected Locations Badges directly under the name */}
                  {preferredLocations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {preferredLocations.map((loc, i) => (
                        <div key={i} className="inline-flex items-center gap-1.5 bg-[#FCF9F3] text-[#241E1A] px-2 py-0.5 rounded border border-[#EAE2D5] shadow-3xs">
                          <span className="text-[10px] font-bold">{loc}</span>
                          <button onClick={() => setPreferredLocations(preferredLocations.filter((_, idx) => idx !== i))} className="hover:text-red-600 transition-colors">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Current Role & Skills */}
              <div className="flex flex-col gap-5 md:items-end min-w-[200px]">
                <div className="flex flex-col gap-2 md:items-end w-full">
                  <div className="flex items-center gap-1.5 text-stone-400 justify-end border-b border-[#EAE2D5] pb-1 w-full md:w-auto">
                    <span className="text-xs font-bold uppercase tracking-widest">Certified Skills</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#241E1A]" />
                  </div>
                  
                  {certifiedSkills.length > 0 ? (
                    <div className="flex flex-wrap md:justify-end gap-1.5 mt-1">
                      {certifiedSkills.map((skill, i) => (
                        <span key={i} className="bg-[#FCF9F3] text-[#241E1A] border border-[#EAE2D5] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded shadow-3xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-400 italic">No certified skills yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: 3 Cards mimicking the image */}
            {isApplicant && (
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Card 1: Ready for work */}
                <div className="bg-[#FCF9F3] rounded-[24px] p-6 flex flex-col relative border border-[#EAE2D5] hover:shadow-sm hover:scale-[1.02] transition-all duration-300">
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#241E1A] mb-1">Ready for work</h3>
                    <p className="text-[11px] text-stone-500 leading-tight">Show recruiters where you want to work.</p>
                  </div>
                  
                  <div className="mt-auto relative z-20">
                    <button
                      type="button"
                      onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                      className="w-full bg-white border border-[#EAE2D5] hover:border-[#241E1A] rounded-xl py-2 px-3.5 text-xs outline-none font-semibold text-[#241E1A] flex items-center justify-between transition-colors shadow-3xs cursor-pointer"
                    >
                      <span className="text-stone-400 truncate">Add locations...</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isLocationDropdownOpen && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#EAE2D5] rounded-xl shadow-lg overflow-hidden py-1 max-h-40 overflow-y-auto z-30">
                        {availableLocations.filter(loc => !preferredLocations.includes(loc)).length > 0 ? (
                          availableLocations.filter(loc => !preferredLocations.includes(loc)).map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setPreferredLocations([...preferredLocations, loc]);
                                setIsLocationDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#241E1A] hover:bg-[#F4ECE1] transition-colors"
                            >
                              {loc}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-xs text-stone-400">All added</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Update */}
                <Link to="/skills" className="bg-[#FCF9F3] rounded-[24px] p-6 flex items-center justify-between group hover:bg-[#FAF6F0] hover:scale-[1.02] transition-all duration-300 border border-[#EAE2D5] hover:shadow-sm">
                  <div className="pr-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#241E1A] mb-1">Update</h3>
                    <p className="text-[11px] text-stone-500 leading-tight">Keep your profile updated so that recruiters know you better.</p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full border border-stone-400 group-hover:border-[#241E1A] group-hover:bg-[#241E1A] group-hover:text-[#FAF6F0] flex items-center justify-center bg-white transition-all">
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-[#FAF6F0] transition-colors" />
                  </div>
                </Link>

                {/* Card 3: Active Jobs */}
                <Link to="/jobs" className="bg-[#FCF9F3] rounded-[24px] p-6 flex items-center justify-between group hover:bg-[#FAF6F0] hover:scale-[1.02] transition-all duration-300 border border-[#EAE2D5] hover:shadow-sm">
                  <div className="pr-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#241E1A] mb-1">Active Jobs</h3>
                    <p className="text-[11px] text-stone-500 leading-tight">Track your {applications.length} current job submissions.</p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full border border-stone-400 group-hover:border-[#241E1A] group-hover:bg-[#241E1A] group-hover:text-[#FAF6F0] flex items-center justify-center bg-white transition-all">
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-[#FAF6F0] transition-colors" />
                  </div>
                </Link>

              </div>
            )}
          </div>
        </div>

        {/* Detailed Application Tracking (Below Profile Card) */}
        {isApplicant && applications.length > 0 && (
          <div className="mt-12 bg-white border border-[#EAE2D5] rounded-[32px] p-8 shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex items-center gap-2 mb-6 border-b border-[#EAE2D5] pb-3">
              <Briefcase className="w-5 h-5 text-[#241E1A]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#241E1A]">Application Tracking Details</h2>
            </div>
            <div className="space-y-4">
              {applications.map((app) => (
                <div 
                  key={app.applicationId} 
                  className="border-b border-[#EAE2D5] pb-6 pt-2 hover:px-4 hover:bg-[#FCF9F3] hover:rounded-2xl transition-all duration-300 flex justify-between items-center gap-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"
                >
                  <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#241E1A]">Application #{app.applicationId}</h3>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mt-1">Job Ref: #{app.jobId}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${app.applicationStatus === 'WITHDRAWN' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <span className={`text-[10px] font-bold ${app.applicationStatus === 'WITHDRAWN' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {app.applicationStatus}
                      </span>
                    </div>
                  </div>

                  {app.applicationStatus !== 'WITHDRAWN' && (
                    <button 
                      onClick={() => handleWithdraw(app.applicationId)}
                      className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-4 py-2 rounded-xl border border-red-200 transition-colors shrink-0 cursor-pointer shadow-3xs"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}