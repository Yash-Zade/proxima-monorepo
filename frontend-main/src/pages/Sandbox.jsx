import React, { useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';
import { Shield, Cpu, RefreshCw, Copy, Check, Terminal, FileText, User, Award, Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Sandbox() {
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [applicantData, setApplicantData] = useState(null);
  const [certifiedSkills, setCertifiedSkills] = useState(null);
  const [newCertifiedSkill, setNewCertifiedSkill] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingApplicant, setLoadingApplicant] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);

  const [copiedProfile, setCopiedProfile] = useState(false);
  const [copiedApplicant, setCopiedApplicant] = useState(false);
  const [copiedSkills, setCopiedSkills] = useState(false);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await apiClient.get('/users/me');
      setProfileData(response.data?.data || response.data);
      showToast('Successfully fetched base profile data!', 'success');
    } catch (error) {
      console.error('Error fetching base profile:', error);
      showToast('Failed to fetch base profile from /users/me', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchApplicantProfile = async () => {
    setLoadingApplicant(true);
    try {
      const response = await apiClient.get('/applicants/profile');
      setApplicantData(response.data?.data || response.data);
      showToast('Successfully fetched applicant profile details!', 'success');
    } catch (error) {
      console.error('Error fetching applicant profile:', error);
      showToast('Failed to fetch applicant profile from /applicants/profile', 'error');
    } finally {
      setLoadingApplicant(false);
    }
  };

  const fetchCertifiedSkills = async () => {
    setLoadingSkills(true);
    try {
      const response = await apiClient.get('/applicants/certified-skills');
      setCertifiedSkills(response.data?.data || response.data);
      showToast('Successfully fetched certified skills!', 'success');
    } catch (error) {
      console.error('Error fetching certified skills:', error);
      showToast('Failed to fetch certified skills from /applicants/certified-skills', 'error');
    } finally {
      setLoadingSkills(false);
    }
  };

  const addSkill = async (e) => {
    e.preventDefault();
    if (!newCertifiedSkill.trim()) return;
    setAddingSkill(true);
    try {
      // POST requires a JSON list of strings
      const response = await apiClient.post('/applicants/certified-skills', [newCertifiedSkill.trim()]);
      setCertifiedSkills(response.data?.data || response.data);
      showToast(`Successfully certified "${newCertifiedSkill}"!`, 'success');
      setNewCertifiedSkill('');
      // Refresh applicant profile as well
      fetchApplicantProfile();
    } catch (error) {
      console.error('Error adding certified skill:', error);
      showToast('Failed to add certified skill', 'error');
    } finally {
      setAddingSkill(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchApplicantProfile();
    fetchCertifiedSkills();
  }, []);

  const handleCopy = (text, setCopied) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(true);
    showToast('Copied JSON data to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#FDFBF7]">
      {/* Header */}
      <div className="pb-6 border-b border-[#EAE2D5] mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#EAE2D5] bg-[#FCF9F3] mb-4">
          <Terminal className="w-3.5 h-3.5 text-[#241E1A]" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#241E1A]">Interactive API Sandbox</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#241E1A]">Profile API Inspector</h1>
        <p className="text-xs text-stone-500 mt-1">Verify backend state outputs, credentials, and API response JSON payloads.</p>
      </div>

      {/* Grid for panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel 1: Base User Profile */}
        <div className="bg-white border border-[#EAE2D5] rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="border-b border-[#EAE2D5] px-6 py-4 bg-[#FCF9F3] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#241E1A] flex items-center justify-center">
                <User className="w-4 h-4 text-[#FDFBF7]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">Base User Endpoint</h3>
                <code className="text-[10px] text-stone-400 font-mono">GET /users/me</code>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleCopy(profileData, setCopiedProfile)}
                className="p-1.5 border border-[#EAE2D5] hover:bg-stone-50 rounded-lg text-stone-600 transition-colors cursor-pointer"
                title="Copy Response JSON"
                disabled={!profileData}
              >
                {copiedProfile ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={fetchProfile}
                disabled={loadingProfile}
                className={`p-1.5 border border-[#EAE2D5] hover:bg-stone-50 rounded-lg text-stone-600 transition-colors cursor-pointer ${loadingProfile ? 'animate-spin' : ''}`}
                title="Refresh Endpoint Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col bg-stone-950 min-h-[350px]">
            {loadingProfile ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 text-stone-500 animate-spin" />
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Querying Node...</span>
              </div>
            ) : profileData ? (
              <div className="flex-1 overflow-auto max-h-[500px]">
                <pre className="text-xs font-mono text-emerald-400 select-text leading-relaxed p-2">
                  {JSON.stringify(profileData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-stone-800 rounded-xl">
                <Shield className="w-8 h-8 text-stone-600 mb-2" />
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">No Data Retrieved</p>
                <p className="text-[10px] text-stone-600 mt-1 max-w-[240px]">Initialize query using the fetch or refresh controls above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Applicant Profile Details */}
        <div className="bg-white border border-[#EAE2D5] rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="border-b border-[#EAE2D5] px-6 py-4 bg-[#FCF9F3] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#241E1A] flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#FDFBF7]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">Applicant Endpoint</h3>
                <code className="text-[10px] text-stone-400 font-mono">GET /applicants/profile</code>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleCopy(applicantData, setCopiedApplicant)}
                className="p-1.5 border border-[#EAE2D5] hover:bg-stone-50 rounded-lg text-stone-600 transition-colors cursor-pointer"
                title="Copy Response JSON"
                disabled={!applicantData}
              >
                {copiedApplicant ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={fetchApplicantProfile}
                disabled={loadingApplicant}
                className={`p-1.5 border border-[#EAE2D5] hover:bg-stone-50 rounded-lg text-stone-600 transition-colors cursor-pointer ${loadingApplicant ? 'animate-spin' : ''}`}
                title="Refresh Endpoint Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col bg-stone-950 min-h-[350px]">
            {loadingApplicant ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 text-stone-500 animate-spin" />
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Querying Node...</span>
              </div>
            ) : applicantData ? (
              <div className="flex-1 overflow-auto max-h-[500px]">
                <pre className="text-xs font-mono text-emerald-400 select-text leading-relaxed p-2">
                  {JSON.stringify(applicantData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-stone-800 rounded-xl">
                <Cpu className="w-8 h-8 text-stone-600 mb-2" />
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">No Data Retrieved</p>
                <p className="text-[10px] text-stone-600 mt-1 max-w-[240px]">This endpoint is restricted to users with APPLICANT credentials.</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Certified Skills Endpoint */}
        <div className="bg-white border border-[#EAE2D5] rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="border-b border-[#EAE2D5] px-6 py-4 bg-[#FCF9F3] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#241E1A] flex items-center justify-center">
                <Award className="w-4 h-4 text-[#FDFBF7]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">Certified Skills</h3>
                <code className="text-[10px] text-stone-400 font-mono">GET/POST /applicants/certified-skills</code>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleCopy(certifiedSkills, setCopiedSkills)}
                className="p-1.5 border border-[#EAE2D5] hover:bg-stone-50 rounded-lg text-stone-600 transition-colors cursor-pointer"
                title="Copy Response JSON"
                disabled={!certifiedSkills}
              >
                {copiedSkills ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={fetchCertifiedSkills}
                disabled={loadingSkills}
                className={`p-1.5 border border-[#EAE2D5] hover:bg-stone-50 rounded-lg text-stone-600 transition-colors cursor-pointer ${loadingSkills ? 'animate-spin' : ''}`}
                title="Refresh Endpoint Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add Skill Form */}
          <div className="p-4 bg-stone-900 border-b border-stone-800">
            <form onSubmit={addSkill} className="flex gap-2">
              <input
                type="text"
                value={newCertifiedSkill}
                onChange={(e) => setNewCertifiedSkill(e.target.value)}
                placeholder="Certify a skill (e.g. React, Go)..."
                className="flex-1 bg-stone-950 border border-stone-800 text-stone-100 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-stone-600 font-semibold"
                disabled={addingSkill}
              />
              <button
                type="submit"
                disabled={addingSkill || !newCertifiedSkill.trim()}
                className="px-3 py-1.5 bg-[#FDFBF7] hover:bg-[#F4ECE1] text-[#241E1A] text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>

          <div className="p-6 flex-1 flex flex-col bg-stone-950 min-h-[290px]">
            {loadingSkills ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 text-stone-500 animate-spin" />
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Querying Node...</span>
              </div>
            ) : certifiedSkills ? (
              <div className="flex-1 overflow-auto max-h-[440px]">
                <pre className="text-xs font-mono text-emerald-400 select-text leading-relaxed p-2">
                  {JSON.stringify(certifiedSkills, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-stone-800 rounded-xl">
                <Award className="w-8 h-8 text-stone-600 mb-2" />
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">No Data Retrieved</p>
                <p className="text-[10px] text-stone-600 mt-1 max-w-[240px]">This endpoint is restricted to users with APPLICANT credentials.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
