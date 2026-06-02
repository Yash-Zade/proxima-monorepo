import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Shield, ShieldAlert, FileText, UploadCloud, X, Plus, Save, Download, ArrowRight, Sparkles, Brain } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../lib/apiClient';

export default function MySkills() {
  const { user, loading } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [applicantProfile, setApplicantProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [extractedSkills, setExtractedSkills] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCertifying, setIsCertifying] = useState(false);

  const isApplicant = user?.roles?.includes('APPLICANT') || user?.roles?.includes('USER');

  // Dynamic calculations
  const certifiedSkills = applicantProfile?.certifiedSkills || [];
  const nonCertifiedSkills = skills.filter(skill => !certifiedSkills.includes(skill));

  const handleExtractSkills = async () => {
    if (!applicantProfile?.resume) {
      showToast('Please upload a resume first to extract skills.', 'warning');
      return;
    }
    setIsExtracting(true);
    try {
      const res = await apiClient.post('/public/extract-skills', {
        resume: applicantProfile.resume
      });
      const extracted = res.data?.data || res.data || [];
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
          
          if (location.state?.message) {
            showToast(location.state.message, location.state.message.includes('Failed') ? 'error' : 'success');
            navigate(location.pathname, { replace: true, state: {} });
          }
        } catch (error) {
          console.error('[Dev Alert] Error fetching applicant data:', error);
          showToast('Failed to load profile details.', 'error');
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchData();
    }
  }, [isApplicant, showToast, location, navigate]);

  const handleSaveProfile = async () => {
    if (!applicantProfile?.applicantId) return;
    setIsSaving(true);
    try {
      await apiClient.put(`/applicants/profile/${applicantProfile.applicantId}`, {
        skills,
        preferredLocations: applicantProfile?.preferredLocations || []
      });
      showToast('Skills saved successfully.', 'success');
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

  const handleCertifySkills = () => {
    if (nonCertifiedSkills.length === 0) return;
    navigate('/exam', {
      state: {
        nonCertifiedSkills,
        resume: applicantProfile?.resume,
        certifiedSkills
      }
    });
  };

  if (loading || isFetchingData) {
    return (
      <div className="min-h-[50vh] bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-lg bg-[#241E1A] animate-spin mx-auto flex items-center justify-center">
            <span className="text-[#FDFBF7] font-black text-xs">P</span>
          </div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest animate-pulse">Loading Skills Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#FDFBF7]">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#EAE2D5] mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#241E1A] flex items-center gap-2">
            <Brain className="w-8 h-8 text-[#241E1A]" />
            Expertise & Skills Hub
          </h1>
          <p className="text-xs text-stone-500 mt-1">Manage your professional credentials, leverage AI parser extraction, and verify your actual skills.</p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-md self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Changes...' : 'Save Skill Changes'}
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-[#EAE2D5] p-5 rounded-2xl shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4ECE1] rounded-bl-full opacity-30 -z-0" />
          <div className="w-10 h-10 rounded-xl bg-[#241E1A] text-[#FDFBF7] flex items-center justify-center font-bold relative z-10">
            {skills.length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Profile Skills</p>
            <p className="text-lg font-bold text-[#241E1A]">Added Technical Skills</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAE2D5] p-5 rounded-2xl shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full opacity-50 -z-0" />
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold relative z-10">
            {certifiedSkills.length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Verified Badges</p>
            <p className="text-lg font-bold text-emerald-800">Certified Skills</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAE2D5] p-5 rounded-2xl shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full opacity-50 -z-0" />
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold relative z-10">
            {nonCertifiedSkills.length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Awaiting Verification</p>
            <p className="text-lg font-bold text-amber-800">Non-Certified Skills</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Document uploads and AI Actions */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs">
            <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-6 flex items-center gap-2 pb-3 border-b border-[#EAE2D5]">
              <FileText className="w-4 h-4 text-stone-400" />
              Professional Resume
            </h2>
            <p className="text-[11px] text-stone-500 mb-6 leading-relaxed">
              Upload a matching professional PDF/Word document. Our AI tool parses your resume content to extract unlisted talents.
            </p>

            <div className="flex flex-col gap-4">
              <label className={`inline-flex items-center justify-center gap-2 bg-[#FDFBF7] border border-dashed border-[#241E1A] hover:bg-[#F4ECE1] text-[#241E1A] text-xs font-semibold uppercase tracking-wider px-4 py-4 rounded-xl transition-all cursor-pointer shadow-xs ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <UploadCloud className="w-5 h-5 text-stone-500" />
                <span>{isUploading ? 'Uploading Document...' : 'Upload Document'}</span>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
              </label>

              {applicantProfile?.resume && (
                <div className="flex items-center justify-between p-3.5 bg-[#FCF9F3] border border-[#EAE2D5] rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-stone-400" />
                    Resume Available
                  </span>
                  <a
                    href={applicantProfile.resume.startsWith('http') ? applicantProfile.resume : `https://ucarecdn.com/${applicantProfile.resume}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-[#241E1A] underline transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </a>
                </div>
              )}
            </div>

            {/* AI Skills Extractor */}
            {applicantProfile?.resume && (
              <div className="mt-8 pt-8 border-t border-[#EAE2D5] space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    AI Engine Extractor
                  </label>
                  <button
                    type="button"
                    onClick={handleExtractSkills}
                    disabled={isExtracting}
                    className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                  >
                    <Brain className="w-4 h-4 text-stone-300" />
                    {isExtracting ? 'Analyzing...' : 'Parse Resume Skills'}
                  </button>
                </div>

                {extractedSkills.length > 0 ? (
                  <div className="space-y-3 p-4 bg-[#FCF9F3] border border-[#EAE2D5] rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <p className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest">
                      Extracted Talents (Tap to add to Technical Skills):
                    </p>
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
                          className="bg-white hover:bg-[#F4ECE1] text-[#241E1A] border border-[#EAE2D5] text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-xs transform hover:-translate-y-0.5"
                        >
                          <Plus className="w-3 h-3 text-stone-400" />
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#FAF6F0] rounded-xl border border-dashed border-[#EAE2D5] text-center text-stone-400 text-[10px]">
                    Run Parse Resume Skills to automatically build your list.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Skill editors & verified sections */}
        <div className="lg:col-span-7 space-y-8">
          {/* Skills manager */}
          <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs">
            <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-6 pb-3 border-b border-[#EAE2D5]">
              Technical Skills Manager
            </h2>
            <div className="space-y-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  placeholder="Enter a capability name (e.g. Docker, TypeScript)..."
                  className="flex-1 bg-[#FDFBF7] border border-[#EAE2D5] focus:border-[#241E1A] rounded-xl py-2.5 px-4 text-xs outline-none transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSkill.trim()) {
                      e.preventDefault();
                      setSkills([...skills, newSkill.trim()]);
                      setNewSkill('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newSkill.trim()) {
                      setSkills([...skills, newSkill.trim()]);
                      setNewSkill('');
                    }
                  }}
                  className="px-4 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] rounded-xl transition-all flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Your Capabilities List</label>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5 p-4 bg-[#FCF9F3] border border-[#EAE2D5] rounded-2xl">
                    {skills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-[#F4ECE1] text-[#241E1A] border border-[#EAE2D5] text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-2xs">
                        {skill}
                        <button
                          onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                          className="hover:text-red-500 text-stone-400 transition-colors ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#FAF6F0] rounded-2xl border border-dashed border-[#EAE2D5] text-stone-400 text-xs">
                    No technical skills added yet. Add them above or extract from resume!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Verified Skills */}
            <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4ECE1] rounded-bl-full opacity-50 flex items-start justify-end p-2">
                <Shield className="w-5 h-5 text-[#241E1A]/20" />
              </div>
              <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10">
                <Shield className="w-4 h-4 text-[#241E1A]" />
                Certified Skills
              </h2>
              <p className="text-[10px] text-stone-500 mb-4 relative z-10">Verified capabilities through structured skill assessment tests.</p>

              {certifiedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2 relative z-10">
                  {certifiedSkills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-[#241E1A] text-[#FDFBF7] text-[9px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-300" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-[#FCF9F3] border border-dashed border-[#EAE2D5] rounded-xl relative z-10">
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">None Verified Yet</p>
                  <p className="text-[9px] text-stone-400 mt-1">Complete job application assessments to certify skills.</p>
                </div>
              )}
            </div>

            {/* Non-Certified Skills */}
            <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full opacity-50 flex items-start justify-end p-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600/20" />
                </div>
                <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Non-Certified Skills
                </h2>
                <p className="text-[10px] text-stone-500 mb-4 relative z-10">Capabilities added to your profile but not yet verified on the platform.</p>

                {nonCertifiedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 relative z-10 mb-4">
                    {nonCertifiedSkills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 bg-emerald-50/50 border border-dashed border-emerald-200 rounded-xl relative z-10 mb-4">
                    <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">All Skills Certified!</p>
                  </div>
                )}
              </div>

              {nonCertifiedSkills.length > 0 && (
                <button
                  type="button"
                  onClick={handleCertifySkills}
                  disabled={isCertifying}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm mt-2"
                >
                  {isCertifying ? 'Processing...' : 'Get Certification to These Skills Now'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
