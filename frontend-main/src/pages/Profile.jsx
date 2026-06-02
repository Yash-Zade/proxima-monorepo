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
        await apiClient.post(`/users/request/student`, {
          userId,
          collegeId
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
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">College Name</label>
                <input type="text" value={collegeName} onChange={e => setCollegeName(e.target.value)} required placeholder="e.g. Stanford University" className="w-full bg-white border border-[#EAE2D5] rounded-lg py-2 px-3 text-xs outline-none" />
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
  const [isSaving, setIsSaving] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-[50vh] bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-lg bg-[#241E1A] animate-spin mx-auto flex items-center justify-center">
            <span className="text-[#FDFBF7] font-black text-xs">P</span>
          </div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Loading Profile Node...</p>
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
    <div className="min-h-screen bg-[#FDFBF7]">
      <RoleApplicationModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        userId={user?.id}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-[#EAE2D5]">
        <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left: Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#241E1A] to-stone-400" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-xl bg-[#241E1A] text-[#FDFBF7] flex items-center justify-center text-2xl font-bold shadow-sm mb-4">
                    {initials}
                  </div>
                  
                  <h1 className="text-lg font-bold text-[#241E1A] leading-tight">{name}</h1>
                  <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-1">{email}</p>
                  
                  <div className="w-full border-t border-[#EAE2D5] my-5 pt-5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4ECE1] border border-[#EAE2D5] text-[9px] font-bold uppercase tracking-wider text-[#241E1A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Node
                    </div>
                  </div>

                  {roles.length > 0 && (
                    <div className="w-full mt-5 pt-5 border-t border-[#EAE2D5] space-y-3">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Roles</span>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {roles.map((role, idx) => (
                          <span key={idx} className="bg-[#241E1A] text-[#FDFBF7] text-[8px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setIsRoleModalOpen(true)}
                    className="w-full mt-6 bg-white hover:bg-[#FAF6F0] border border-[#EAE2D5] hover:border-[#241E1A] text-[#241E1A] text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all duration-300"
                  >
                    Add Role
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Identity Section */}
              <div className="bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[#F4ECE1] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#241E1A]" />
                  </div>
                  <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">Core Identity</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-stone-500 uppercase tracking-wider block">Name</label>
                    <div className="bg-[#FAF6F0] border border-[#EAE2D5] rounded-lg py-2.5 px-3.5 text-xs text-[#241E1A] font-semibold">
                      {name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-stone-500 uppercase tracking-wider block">Email</label>
                    <div className="bg-[#FAF6F0] border border-[#EAE2D5] rounded-lg py-2.5 px-3.5 text-xs text-[#241E1A] font-semibold truncate">
                      {email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/skills"
                  className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] border border-[#241E1A] rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 shadow-sm"
                >
                  <Brain className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-center">Manage Skills</span>
                </Link>
                <Link
                  to="/jobs"
                  className="bg-[#FCF9F3] hover:bg-[#FAF6F0] text-[#241E1A] border border-[#EAE2D5] rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 shadow-sm"
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-center">Browse Jobs</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isApplicant && !isFetchingData && (
          <div className="space-y-8">
            
            {/* Certified Skills */}
            <div className="bg-white border border-[#EAE2D5] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#F4ECE1] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#241E1A]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#241E1A] uppercase tracking-wider">Certified Skills</h2>
                  <p className="text-[9px] text-stone-400 uppercase tracking-wider">Verified Capabilities</p>
                </div>
              </div>

              {certifiedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {certifiedSkills.map((skill, i) => (
                    <div key={i} className="inline-flex items-center gap-2 bg-[#241E1A] text-[#FDFBF7] px-4 py-2 rounded-lg shadow-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">{skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-[#FCF9F3] border border-dashed border-[#EAE2D5] rounded-xl">
                  <Code2 className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">No Certified Skills Yet</p>
                  <Link to="/skills" className="text-[10px] text-[#241E1A] font-bold underline mt-2 hover:text-stone-700 inline-block">
                    Certify Your Skills →
                  </Link>
                </div>
              )}
            </div>

            {/* Preferred Locations */}
            <div className="bg-white border border-[#EAE2D5] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#F4ECE1] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#241E1A]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#241E1A] uppercase tracking-wider">Preferred Locations</h2>
                    <p className="text-[9px] text-stone-400 uppercase tracking-wider">Remote Work Zones</p>
                  </div>
                </div>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-[10px] font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>

              <div className="space-y-4">
                {preferredLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferredLocations.map((loc, i) => (
                      <div key={i} className="inline-flex items-center gap-2 bg-[#F4ECE1] text-[#241E1A] border border-[#EAE2D5] px-3 py-2 rounded-lg">
                        <span className="text-xs font-semibold">{loc}</span>
                        <button 
                          onClick={() => setPreferredLocations(preferredLocations.filter((_, idx) => idx !== i))}
                          className="hover:text-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newLocation} 
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="Add a location..."
                    className="flex-1 bg-white border border-[#EAE2D5] focus:border-[#241E1A] rounded-lg py-2.5 px-4 text-xs outline-none transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newLocation) {
                        e.preventDefault();
                        setPreferredLocations([...preferredLocations, newLocation]);
                        setNewLocation('');
                      }
                    }}
                  />
                  <button 
                    onClick={() => { 
                      if(newLocation) { 
                        setPreferredLocations([...preferredLocations, newLocation]); 
                        setNewLocation(''); 
                      } 
                    }} 
                    className="bg-white hover:bg-[#FAF6F0] border border-[#EAE2D5] text-[#241E1A] p-2.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Job Applications */}
            <div className="bg-white border border-[#EAE2D5] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#F4ECE1] flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-[#241E1A]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#241E1A] uppercase tracking-wider">Active Submissions</h2>
                  <p className="text-[9px] text-stone-400 uppercase tracking-wider">{applications.length} Applications</p>
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-10 px-4 bg-[#FCF9F3] rounded-xl border border-dashed border-[#EAE2D5]">
                  <Briefcase className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">No Active Applications</p>
                  <Link to="/jobs" className="text-[10px] text-[#241E1A] font-bold underline mt-2 hover:text-stone-700 inline-block">
                    Explore Job Registry →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div 
                      key={app.applicationId} 
                      className="border border-[#EAE2D5] hover:border-[#241E1A] rounded-xl p-4 bg-[#FDFBF7] transition-all duration-300 flex justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">App #{app.applicationId}</h3>
                        <p className="text-[10px] text-stone-400 mt-1">Job Ref: #{app.jobId}</p>
                        <div className="mt-2 inline-flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${app.applicationStatus === 'WITHDRAWN' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${app.applicationStatus === 'WITHDRAWN' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {app.applicationStatus}
                          </span>
                        </div>
                      </div>

                      {app.applicationStatus !== 'WITHDRAWN' && (
                        <button 
                          onClick={() => handleWithdraw(app.applicationId)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Withdraw
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}