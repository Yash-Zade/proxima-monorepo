import React, { useContext, useEffect, useState } from 'react';
import { User, CheckCircle2, Shield, Mail, FileText, UploadCloud, X, Plus, Save, Briefcase, Download, Trash2, ArrowRight, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../lib/apiClient';

function RoleApplicationModal({ isOpen, onClose, userId }) {
  const { showToast } = useToast();
  
  const [selectedRole, setSelectedRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeAddress, setCollegeAddress] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [collegeWebsite, setCollegeWebsite] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const roles = [
    { value: 'EMPLOYER', label: 'Employer' },
    { value: 'COLLEGE', label: 'College / University' },
    { value: 'STUDENT', label: 'Student' }
  ];

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
      } else if (selectedRole === 'APPLICANT') {
        await apiClient.post(`/users/request/applicant/${userId}`);
      } else if (selectedRole === 'STUDENT') {
        await apiClient.post(`/users/request/student/${userId}`, collegeName, {
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      showToast('Role application submitted successfully.', 'success');
      onClose();
    } catch (err) {
      console.error('[Dev Alert] Failed to submit role application:', err);
      showToast('Failed to submit application. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
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
                className="w-full bg-white border border-[#EAE2D5] focus:border-[#241E1A] hover:border-[#241E1A] rounded-lg py-2.5 px-3 text-xs outline-none font-semibold text-[#241E1A] flex items-center justify-between transition-colors shadow-sm"
              >
                {selectedRole ? roles.find(r => r.value === selectedRole)?.label : <span className="text-stone-400">Choose a role...</span>}
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#EAE2D5] rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
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
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
              className="w-full bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider py-3 rounded-xl transition-colors disabled:opacity-50"
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
  const [skills, setSkills] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [extractedSkills, setExtractedSkills] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const isApplicant = user?.roles?.includes('APPLICANT') || user?.roles?.includes('USER');

  const handleExtractSkills = async () => {
    if (!applicantProfile?.resume) {
      console.log('No resume found to extract skills from.');
      return;
    }
    setIsExtracting(true);
    console.log('Starting skill extraction for resume:', applicantProfile.resume);
    try {
      const res = await apiClient.post('/public/extract-skills', {
        resume: applicantProfile.resume
      });
      console.log('Extract skills response:', res);
      const extracted = res.data?.data || res.data || [];
      console.log('Extracted skills array:', extracted);
      if (Array.isArray(extracted) && extracted.length > 0) {
        setExtractedSkills(extracted);
        showToast('Skills extracted successfully!', 'success');
      } else {
        showToast('No skills could be extracted. Please try again.', 'warning');
      }
    } catch (err) {
      console.error('[Dev Alert] Skill extraction failed:', err);
      showToast('Failed to extract skills.', 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    if (isApplicant) {
      const fetchData = async () => {
        setIsFetchingData(true);
        try {
          const profileRes = await apiClient.get('/applicants/profile');
          const profileData = profileRes.data?.data || profileRes.data;
          setApplicantProfile(profileData);
          setSkills(profileData?.skills || []);
          setPreferredLocations(profileData?.preferredLocations || []);

          const appsRes = await apiClient.get('/applicants/job-applications');
          const appsData = appsRes.data?.data?.content || appsRes.data?.content || appsRes.data || [];
          setApplications(Array.isArray(appsData) ? appsData : []);
        } catch (error) {
          console.error('[Dev Alert] Error fetching applicant data:', error);
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
        skills,
        preferredLocations
      });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast('Failed to save profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiClient.post('/applicants/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Resume uploaded successfully.', 'success');
      const profileRes = await apiClient.get('/applicants/profile');
      const profileData = profileRes.data?.data || profileRes.data;
      setApplicantProfile(profileData);
    } catch (err) {
      showToast('Failed to upload resume.', 'error');
    } finally {
      setIsUploading(false);
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
    <div className="max-w-7xl min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#FDFBF7]">
      <RoleApplicationModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        userId={user?.id}
      />

      {/* Page Header */}
      <div className="pb-6 border-b border-[#EAE2D5] mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-[#241E1A]">Talent Console</h1>
        <p className="text-xs text-stone-500 mt-1">Manage your verified matching details and platform settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - console details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#FCF9F3] border border-[#EAE2D5] p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#241E1A]" />
            <div className="w-16 h-16 rounded-xl bg-[#241E1A] text-[#FDFBF7] flex items-center justify-center text-xl font-bold mt-4 shadow-sm">
              {initials}
            </div>
            <h2 className="text-sm font-bold text-[#241E1A] mt-4">{name}</h2>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-1">{email}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4ECE1] border border-[#EAE2D5] mt-4 text-[9px] font-bold uppercase tracking-wider text-[#241E1A]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#241E1A]" />
              Verified Node
            </div>
            {roles.length > 0 && (
              <div className="w-full border-t border-[#EAE2D5] mt-6 pt-6 text-center space-y-2">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Assigned Roles</span>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {roles.map((role, idx) => (
                    <span key={idx} className="bg-[#241E1A] text-[#FDFBF7] text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply for Role Button */}
            <div className="w-full mt-6 pt-6 border-t border-[#EAE2D5]">
              <button 
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full bg-white border border-[#EAE2D5] hover:border-[#241E1A] text-[#241E1A] text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                Apply for a New Role
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right column - profile fields & applicant controls */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs">
            <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-6">Core Identity</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  disabled
                  className="w-full bg-[#FAF6F0] border border-[#EAE2D5] rounded-lg py-2.5 px-3.5 text-xs text-stone-500 cursor-not-allowed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[#FAF6F0] border border-[#EAE2D5] rounded-lg py-2.5 px-3.5 text-xs text-stone-500 cursor-not-allowed outline-none"
                />
              </div>
            </form>
          </div>

          {isApplicant && !isFetchingData && (
            <>
              {/* Applicant Profile Controls */}
              <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs">
                <div className="flex justify-between items-center mb-6 border-b border-[#EAE2D5] pb-4">
                  <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-400" />
                    Applicant Parameters
                  </h2>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-[10px] font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3 h-3" />
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Skills Manager */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Technical Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-[#F4ECE1] text-[#241E1A] border border-[#EAE2D5] text-[10px] font-bold px-2.5 py-1 rounded-md">
                          {skill}
                          <button onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="hover:text-red-500 text-stone-400 transition-colors ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newSkill} 
                        onChange={e => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        className="flex-1 bg-[#FDFBF7] border border-[#EAE2D5] focus:border-[#241E1A] rounded-lg py-2 px-3 text-xs outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSkill) {
                            e.preventDefault();
                            setSkills([...skills, newSkill]);
                            setNewSkill('');
                          }
                        }}
                      />
                      <button onClick={() => { if(newSkill) { setSkills([...skills, newSkill]); setNewSkill(''); } }} className="p-2 border border-[#EAE2D5] text-stone-600 hover:bg-[#F4ECE1] rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Locations Manager */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Preferred Locations</label>
                    <div className="flex flex-wrap gap-2">
                      {preferredLocations.map((loc, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-[#F4ECE1] text-[#241E1A] border border-[#EAE2D5] text-[10px] font-bold px-2.5 py-1 rounded-md">
                          {loc}
                          <button onClick={() => setPreferredLocations(preferredLocations.filter((_, idx) => idx !== i))} className="hover:text-red-500 text-stone-400 transition-colors ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newLocation} 
                        onChange={e => setNewLocation(e.target.value)}
                        placeholder="Add a location..."
                        className="flex-1 bg-[#FDFBF7] border border-[#EAE2D5] focus:border-[#241E1A] rounded-lg py-2 px-3 text-xs outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newLocation) {
                            e.preventDefault();
                            setPreferredLocations([...preferredLocations, newLocation]);
                            setNewLocation('');
                          }
                        }}
                      />
                      <button onClick={() => { if(newLocation) { setPreferredLocations([...preferredLocations, newLocation]); setNewLocation(''); } }} className="p-2 border border-[#EAE2D5] text-stone-600 hover:bg-[#F4ECE1] rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resume Upload section */}
                <div className="mt-8 pt-6 border-t border-[#EAE2D5] space-y-4">
                   <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Professional Resume</label>
                   <div className="flex items-center gap-4">
                     <label className={`inline-flex items-center justify-center gap-2 bg-[#FDFBF7] border border-dashed border-[#241E1A] hover:bg-[#F4ECE1] text-[#241E1A] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <UploadCloud className="w-4 h-4" />
                        {isUploading ? 'Uploading...' : 'Upload Document'}
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                     </label>

                     {applicantProfile?.resume && (
                       <a href={applicantProfile.resume.startsWith('http') ? applicantProfile.resume : `https://ucarecdn.com/${applicantProfile.resume}/`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#241E1A] underline transition-colors">
                         <Download className="w-3.5 h-3.5" />
                         View Current Resume
                       </a>
                     )}
                   </div>
                </div>

                {/* AI Skills Extractor */}
                {applicantProfile?.resume && (
                  <div className="mt-6 pt-6 border-t border-[#EAE2D5] space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">AI Skills Extractor</label>
                      <button
                        type="button"
                        onClick={handleExtractSkills}
                        disabled={isExtracting}
                        className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-[10px] font-semibold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {isExtracting ? 'Extracting...' : 'Extract Skills'}
                      </button>
                    </div>
                    {extractedSkills.length > 0 && (
                      <div className="space-y-3 p-4 bg-[#FCF9F3] border border-[#EAE2D5] rounded-xl animate-in fade-in slide-in-from-top-2">
                        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Extracted Skills (Click to Add):</p>
                        <div className="flex flex-wrap gap-2">
                          {extractedSkills.map((skill, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (!skills.includes(skill)) {
                                  setSkills([...skills, skill]);
                                }
                                setExtractedSkills(extractedSkills.filter((_, i) => i !== idx));
                              }}
                              className="bg-white hover:bg-[#F4ECE1] text-[#241E1A] border border-[#EAE2D5] text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <Plus className="w-3 h-3 text-stone-400" />
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Verified Skills Card */}
              <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F4ECE1] rounded-bl-full -z-0 opacity-50 flex items-start justify-end p-4">
                  <Shield className="w-6 h-6 text-[#241E1A]/20" />
                </div>
                <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10">
                  <Shield className="w-4 h-4 text-[#241E1A]" />
                  Verified Skills
                </h2>
                <p className="text-[10px] text-stone-500 mb-4 relative z-10">These skills have been verified and certified through our skill assessment tests.</p>
                
                {applicantProfile?.certifiedSkills && applicantProfile.certifiedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {applicantProfile.certifiedSkills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 bg-[#241E1A] text-[#FDFBF7] border border-[#241E1A] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-stone-300" />
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 bg-[#FCF9F3] border border-dashed border-[#EAE2D5] rounded-xl relative z-10">
                    <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">No Verified Skills yet.</p>
                    <p className="text-[9px] text-stone-400 mt-1">Complete job application tests to earn skill certifications.</p>
                  </div>
                )}
              </div>

              {/* Job Applications Tracker */}
              <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs">
                <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-stone-400" />
                  Active Submissions
                </h2>
                
                {applications.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-[#FAF6F0] rounded-xl border border-dashed border-[#EAE2D5]">
                    <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">No active job applications.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.applicationId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-[#EAE2D5] rounded-xl bg-[#FDFBF7] hover:border-[#241E1A] transition-colors">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-[#241E1A]">Application #{app.applicationId}</h3>
                          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Job Ref: #{app.jobId}</p>
                          <div className="flex gap-3 mt-2 text-[10px] font-semibold text-stone-600">
                            <span className="flex items-center gap-1">
                              Status: <span className={app.applicationStatus === 'WITHDRAWN' ? 'text-red-500' : 'text-green-600'}>{app.applicationStatus}</span>
                            </span>
                          </div>
                        </div>
                        {app.applicationStatus !== 'WITHDRAWN' && (
                          <button 
                            onClick={() => handleWithdraw(app.applicationId)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
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
            </>
          )}

        </div>
      </div>
    </div>
  );
}
