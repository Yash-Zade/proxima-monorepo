import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Briefcase, Plus, X, ChevronLeft, ChevronRight,
  Building2, Globe, Users, CheckCircle2,
  XCircle, Lock, Trash2, Edit3, Eye, ArrowLeft, Tag,
  Mail, MapPin, Award, FileText, ExternalLink, ShieldCheck, User
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../lib/apiClient';
import { Navigate } from 'react-router-dom';

/* ─── helpers ─── */
const STATUS_COLORS = {
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-stone-100 text-stone-500 border-stone-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
  WITHDRAWN: 'bg-stone-100 text-stone-400 border-stone-200',
};

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-stone-100 text-stone-500 border-stone-200';
  return (
    <span className={`inline-flex items-center border text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${cls}`}>
      {status}
    </span>
  );
}

/* ─── Skill tag input ─── */
function SkillTagInput({ skills, setSkills }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setInput('');
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {skills.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-[#F4ECE1] text-[#241E1A] border border-[#EAE2D5] text-[10px] font-bold px-2.5 py-1 rounded-md">
            {s}
            <button type="button" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}><X className="w-3 h-3 text-stone-400 hover:text-red-500" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Add a skill & press Enter…"
          className="flex-1 bg-[#FDFBF7] border border-[#EAE2D5] focus:border-[#241E1A] rounded-lg py-2 px-3 text-xs outline-none transition-colors"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className="px-3 border border-[#EAE2D5] rounded-lg text-stone-600 hover:bg-[#F4ECE1] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Create / Edit Job Modal ─── */
function JobFormModal({ isOpen, onClose, onSave, initial }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle(initial?.title || '');
      setDesc(initial?.description || '');
      setLocation(initial?.location || '');
      setSkills(initial?.skillsRequired || []);
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title || !location) { showToast('Title and location are required.', 'error'); return; }
    setSaving(true);
    try {
      await onSave({ title, description: desc, location, skillsRequired: skills });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-[#241E1A] transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-[#241E1A] mb-1">{initial ? 'Edit Job' : 'Post a New Job'}</h2>
        <p className="text-xs text-stone-500 mb-6">Fill in the details to {initial ? 'update' : 'create'} this listing.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Job Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-white border border-[#EAE2D5] focus:border-[#241E1A] rounded-lg py-2.5 px-3 text-sm outline-none transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Location *</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} required
              className="w-full bg-white border border-[#EAE2D5] focus:border-[#241E1A] rounded-lg py-2.5 px-3 text-sm outline-none transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
              className="w-full bg-white border border-[#EAE2D5] focus:border-[#241E1A] rounded-lg py-2.5 px-3 text-sm outline-none resize-none transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5"><Tag className="w-3 h-3" /> Skills Required</label>
            <SkillTagInput skills={skills} setSkills={setSkills} />
          </div>
          <div className="pt-2 border-t border-[#EAE2D5]">
            <button type="submit" disabled={saving}
              className="w-full bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : initial ? 'Update Listing' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Applicant Details Modal ─── */
function ApplicantDetailsModal({ app, onClose, onAccept, onReject, actingId }) {
  if (!app) return null;
  const applicant = app.applicant;
  const user = applicant?.user;
  const hasResumeUrl = applicant?.resume && applicant.resume.startsWith('http');

  const getPreviewUrl = (url) => {
    if (!url) return '';
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return url;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  // Format the applied date
  const appliedDateStr = app.appliedDate
    ? new Date(app.appliedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-slide-in">
      <div className={`bg-[#FCF9F3] border border-[#E5DAC9] rounded-3xl p-8 w-full shadow-2xl relative max-h-[90vh] overflow-y-auto transition-all duration-300 ${hasResumeUrl ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-[#241E1A] transition-colors p-1 hover:bg-[#F4ECE1] rounded-full">
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Header */}
        <div className="border-b border-[#E5DAC9] pb-6 mb-6">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Applicant Profile Details</span>
          <h2 className="text-2xl font-extrabold text-[#241E1A] serif-heading flex items-center gap-2">
            {user?.name || `Applicant #${applicant?.applicantId}`}
          </h2>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
            <span>Application #{app.applicationId}</span>
            <span className="text-stone-300">•</span>
            <span>Applied: {appliedDateStr}</span>
          </p>
        </div>

        {/* Conditional Layout */}
        <div className={hasResumeUrl ? "grid grid-cols-1 lg:grid-cols-12 gap-8" : "grid grid-cols-1 md:grid-cols-3 gap-8"}>
          {/* Main Info Columns */}
          <div className={hasResumeUrl ? "lg:col-span-7 space-y-6" : "md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8"}>
            
            {hasResumeUrl ? (
              // Split Content Layout for wide/preview modal
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left Column in wide layout: Contact Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Contact Details</h3>
                      <div className="space-y-3 bg-[#FDFBF7] border border-[#E5DAC9] p-4 rounded-2xl">
                        {user?.email && (
                          <div>
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Email Address</span>
                            <a href={`mailto:${user.email}`} className="text-xs font-semibold text-[#241E1A] hover:underline break-all flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                              {user.email}
                            </a>
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Applicant ID</span>
                          <span className="text-xs font-bold text-[#241E1A] flex items-center gap-1.5 mt-0.5">
                            <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            #{applicant?.applicantId}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Current Status</span>
                          <StatusBadge status={app.applicationStatus} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column in wide layout: Preferred Locations */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-500" />
                        Preferred Locations
                      </h3>
                      <div className="bg-[#FDFBF7] border border-[#E5DAC9] p-4 rounded-2xl flex flex-wrap gap-2 items-center min-h-[116px]">
                        {applicant?.preferredLocations && applicant.preferredLocations.length > 0 ? (
                          applicant.preferredLocations.map((loc, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-[#F4ECE1] text-[#241E1A] text-[10px] font-bold px-3 py-1 rounded-lg border border-[#EAE2D5] uppercase tracking-wider">
                              {loc}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-stone-400 italic">Open to all locations.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills below contact and locations */}
                <div className="space-y-6">
                  {/* Certified Skills (Terracotta Accent) */}
                  <div>
                    <h3 className="text-[10px] font-bold text-[#241E1A] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#DFA687]" />
                      Certified Skills
                    </h3>
                    <div className="bg-[#FCF9F3] border border-[#E5DAC9] p-4 rounded-2xl min-h-[64px] flex flex-wrap gap-2 items-center">
                      {applicant?.certifiedSkills && applicant.certifiedSkills.length > 0 ? (
                        applicant.certifiedSkills.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-[#DFA687] text-[#241E1A] text-[10px] font-bold px-3 py-1 rounded-xl shadow-sm border border-orange-200 uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 italic">No certified skills listed.</p>
                      )}
                    </div>
                  </div>

                  {/* General Skills (Sage Accent) */}
                  <div>
                    <h3 className="text-[10px] font-bold text-[#241E1A] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#C1CDBC]" />
                      Professional Skills
                    </h3>
                    <div className="bg-[#FCF9F3] border border-[#E5DAC9] p-4 rounded-2xl min-h-[64px] flex flex-wrap gap-2 items-center">
                      {applicant?.skills && applicant.skills.length > 0 ? (
                        applicant.skills.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center bg-[#C1CDBC] text-[#241E1A] text-[10px] font-bold px-3 py-1 rounded-xl border border-emerald-200 uppercase tracking-wider shadow-sm">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 italic">No skills listed.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Standard layout columns for narrower modal (no URL resume)
              <>
                {/* Left Column: Basic Info & Contacts */}
                <div className="md:col-span-1 space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Contact Details</h3>
                    <div className="space-y-3 bg-[#FDFBF7] border border-[#E5DAC9] p-4 rounded-2xl">
                      {user?.email && (
                        <div>
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Email Address</span>
                          <a href={`mailto:${user.email}`} className="text-xs font-semibold text-[#241E1A] hover:underline break-all flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            {user.email}
                          </a>
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Applicant ID</span>
                        <span className="text-xs font-bold text-[#241E1A] flex items-center gap-1.5 mt-0.5">
                          <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          #{applicant?.applicantId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Current Status</span>
                        <StatusBadge status={app.applicationStatus} />
                      </div>
                    </div>
                  </div>

                  {/* Resume / Cover Letter section for text bio */}
                  <div>
                    <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Resume / Credentials</h3>
                    <div className="bg-[#FDFBF7] border border-[#E5DAC9] p-4 rounded-2xl">
                      {applicant?.resume ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-stone-600">
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider">Credentials</span>
                          </div>
                          <p className="text-xs text-stone-600 bg-white border border-[#E5DAC9] p-2.5 rounded-lg font-mono break-all max-h-32 overflow-y-auto leading-relaxed">
                            {applicant.resume}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400 italic">No resume details provided.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Skills and Locations */}
                <div className="md:col-span-2 space-y-6">
                  {/* Certified Skills (Terracotta Accent) */}
                  <div>
                    <h3 className="text-[10px] font-bold text-[#241E1A] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#DFA687]" />
                      Certified Skills
                    </h3>
                    <div className="bg-[#FCF9F3] border border-[#E5DAC9] p-4 rounded-2xl min-h-[64px] flex flex-wrap gap-2 items-center">
                      {applicant?.certifiedSkills && applicant.certifiedSkills.length > 0 ? (
                        applicant.certifiedSkills.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-[#DFA687] text-[#241E1A] text-[10px] font-bold px-3 py-1 rounded-xl shadow-sm border border-orange-200 uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 italic">No certified skills listed.</p>
                      )}
                    </div>
                  </div>

                  {/* General Skills (Sage Accent) */}
                  <div>
                    <h3 className="text-[10px] font-bold text-[#241E1A] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#C1CDBC]" />
                      Professional Skills
                    </h3>
                    <div className="bg-[#FCF9F3] border border-[#E5DAC9] p-4 rounded-2xl min-h-[64px] flex flex-wrap gap-2 items-center">
                      {applicant?.skills && applicant.skills.length > 0 ? (
                        applicant.skills.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center bg-[#C1CDBC] text-[#241E1A] text-[10px] font-bold px-3 py-1 rounded-xl border border-emerald-200 uppercase tracking-wider shadow-sm">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 italic">No skills listed.</p>
                      )}
                    </div>
                  </div>

                  {/* Preferred Locations */}
                  <div>
                    <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-500" />
                      Preferred Locations
                    </h3>
                    <div className="bg-[#FDFBF7] border border-[#E5DAC9] p-4 rounded-2xl flex flex-wrap gap-2 items-center">
                      {applicant?.preferredLocations && applicant.preferredLocations.length > 0 ? (
                        applicant.preferredLocations.map((loc, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-[#F4ECE1] text-[#241E1A] text-[10px] font-bold px-3 py-1 rounded-lg border border-[#EAE2D5] uppercase tracking-wider">
                            {loc}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 italic">Open to all locations.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Right/Second Side of Wide Layout: Live Resume Previewer */}
          {hasResumeUrl && (
            <div className="lg:col-span-5 flex flex-col h-full border-t lg:border-t-0 lg:border-l border-[#E5DAC9] pt-6 lg:pt-0 lg:pl-6">
              <h3 className="text-[10px] font-bold text-[#241E1A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                Resume Live Preview
              </h3>
              <div className="flex-grow min-h-[460px] lg:h-[460px] border border-[#E5DAC9] rounded-2xl overflow-hidden bg-white shadow-inner flex flex-col">
                <div className="bg-[#F4ECE1] border-b border-[#E5DAC9] px-4 py-2.5 flex justify-between items-center shrink-0">
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest truncate">Document Viewer</span>
                  <a href={applicant.resume} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-[#241E1A] hover:underline flex items-center gap-1">
                    Open in New Tab <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <iframe
                  src={getPreviewUrl(applicant.resume)}
                  className="w-full flex-grow border-none min-h-[400px] lg:h-full bg-[#FAF6F0]"
                  title="Candidate Resume Preview"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Decision Footer */}
        {app.applicationStatus !== 'WITHDRAWN' && (
          <div className="flex gap-3 mt-8 pt-6 border-t border-[#E5DAC9]">
            {app.applicationStatus !== 'ACCEPTED' && (
              <button disabled={actingId === app.applicationId} onClick={() => onAccept(app.applicationId)}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-[#FDFBF7] bg-[#241E1A] hover:bg-[#382F29] rounded-xl transition-all disabled:opacity-40 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                <CheckCircle2 className="w-4 h-4 text-[#C1CDBC]" /> Accept Applicant
              </button>
            )}
            {app.applicationStatus !== 'REJECTED' && (
              <button disabled={actingId === app.applicationId} onClick={() => onReject(app.applicationId)}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-[#241E1A] bg-[#DFA687] hover:bg-[#CE9273] rounded-xl transition-all disabled:opacity-40 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                <XCircle className="w-4 h-4 text-red-700" /> Reject Applicant
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Applications drawer (slide-in panel) ─── */
function ApplicationsPanel({ job, onClose, onStatusChange }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!job) return;
    setLoading(true);
    apiClient.get(`/employers/jobs/${job.jobId}/applications`, { params: { pageOffset: 0, pageSize: 50 } })
      .then(res => {
        const d = res.data?.data ?? res.data;
        console.log(d);
        setApps(d?.content ?? []);
      })
      .catch(() => showToast('Failed to load applications.', 'error'))
      .finally(() => setLoading(false));
  }, [job]);

  useEffect(() => {
    setSelectedApp(null);
  }, [job]);

  const changeStatus = async (appId, status) => {
    setActingId(appId);
    try {
      await apiClient.post(`/employers/applications/${appId}/status`, null, { params: { status } });
      setApps(prev => prev.map(a => a.applicationId === appId ? { ...a, applicationStatus: status } : a));
      setSelectedApp(prev => prev && prev.applicationId === appId ? { ...prev, applicationStatus: status } : prev);
      onStatusChange?.();
      showToast(`Application marked ${status}.`, 'success');
    } catch {
      showToast('Failed to update status.', 'error');
    } finally {
      setActingId(null);
    }
  };

  if (!job) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex animate-fade-in">
        <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="w-full max-w-md bg-[#FDFBF7] border-l border-[#EAE2D5] flex flex-col shadow-2xl">
          {/* header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-[#EAE2D5] shrink-0">
            <button onClick={onClose} className="text-stone-400 hover:text-[#241E1A] transition-colors p-1 hover:bg-[#F4ECE1] rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Applications</p>
              <h3 className="text-sm font-extrabold text-[#241E1A] truncate serif-heading">{job.title}</h3>
            </div>
            <span className="text-[10px] font-bold bg-[#241E1A] text-white px-2 py-1 rounded-md">{apps.length}</span>
          </div>
          {/* body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-6 h-6 rounded-lg bg-[#241E1A] animate-spin" />
              </div>
            ) : apps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-stone-400">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-widest">No applications yet</p>
              </div>
            ) : apps.map(app => (
              <div key={app.applicationId}
                onClick={() => setSelectedApp(app)}
                className="group border border-[#EAE2D5] rounded-xl p-4 bg-white hover:border-[#241E1A] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col gap-2 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#241E1A] truncate serif-heading">
                      {app.applicant?.user?.name || `Applicant #${app.applicant?.applicantId}`}
                    </p>
                    <p className="text-[9px] text-stone-400 mt-0.5">
                      ID: #{app.applicant?.applicantId} • App #{app.applicationId}
                    </p>
                  </div>
                  <StatusBadge status={app.applicationStatus} />
                </div>

                {/* Skills summary (up to 3 tags) */}
                {app.applicant?.skills && app.applicant.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {app.applicant.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="text-[8px] font-bold bg-[#F4ECE1] text-[#241E1A] px-1.5 py-0.5 rounded border border-[#EAE2D5] uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                    {app.applicant.skills.length > 3 && (
                      <span className="text-[8px] font-bold text-stone-400 self-center ml-0.5">
                        +{app.applicant.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Email or Locations summary */}
                <div className="flex flex-col gap-0.5 text-[9px] text-stone-500 mt-1">
                  {app.applicant?.user?.email && (
                    <p className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{app.applicant.user.email}</span>
                    </p>
                  )}
                  {app.applicant?.preferredLocations && app.applicant.preferredLocations.length > 0 && (
                    <p className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{app.applicant.preferredLocations.slice(0, 2).join(', ')}</span>
                    </p>
                  )}
                </div>

                {app.appliedDate && (
                  <p className="text-[9px] text-stone-400 mt-1">
                    Applied: {new Date(app.appliedDate).toLocaleDateString()}
                  </p>
                )}

                {app.applicationStatus !== 'WITHDRAWN' && (
                  <div className="flex gap-2 pt-2 border-t border-[#EAE2D5] mt-1" onClick={e => e.stopPropagation()}>
                    {app.applicationStatus !== 'ACCEPTED' && (
                      <button disabled={actingId === app.applicationId} onClick={() => changeStatus(app.applicationId, 'ACCEPTED')}
                        className="flex-1 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-40 border border-emerald-200 cursor-pointer">
                        Accept
                      </button>
                    )}
                    {app.applicationStatus !== 'REJECTED' && (
                      <button disabled={actingId === app.applicationId} onClick={() => changeStatus(app.applicationId, 'REJECTED')}
                        className="flex-1 py-1 text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40 border border-red-200 cursor-pointer">
                        Reject
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedApp && (
        <ApplicantDetailsModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onAccept={id => changeStatus(id, 'ACCEPTED')}
          onReject={id => changeStatus(id, 'REJECTED')}
          actingId={actingId}
        />
      )}
    </>
  );
}

/* ─── Job card ─── */
function JobCard({ job, onView, onEdit, onClose, onDelete }) {
  return (
    <div className="group border border-[#EAE2D5] rounded-xl bg-white hover:border-[#241E1A] hover:shadow-sm transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-[#241E1A] truncate">{job.title}</h3>
            <p className="text-[10px] text-stone-500 mt-0.5">{job.location}</p>
          </div>
          <StatusBadge status={job.jobStatus} />
        </div>
        {job.description && (
          <p className="text-xs text-stone-500 line-clamp-2 mb-3">{job.description}</p>
        )}
        {job.skillsRequired?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skillsRequired.slice(0, 5).map((s, i) => (
              <span key={i} className="text-[9px] font-bold bg-[#F4ECE1] text-[#241E1A] px-2 py-0.5 rounded-md border border-[#EAE2D5] uppercase tracking-wider">{s}</span>
            ))}
            {job.skillsRequired.length > 5 && <span className="text-[9px] font-bold text-stone-400">+{job.skillsRequired.length - 5}</span>}
          </div>
        )}
        <div className="flex items-center gap-2 pt-3 border-t border-[#EAE2D5]">
          <button onClick={() => onView(job)}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-[#241E1A] border border-[#EAE2D5] rounded-lg hover:bg-[#F4ECE1] transition-colors uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" /> Applications
          </button>
          {job.jobStatus === 'OPEN' && (
            <>
              <button onClick={() => onEdit(job)}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-stone-600 border border-[#EAE2D5] rounded-lg hover:bg-[#F4ECE1] transition-colors uppercase tracking-wider">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => onClose(job.jobId)}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-stone-600 border border-[#EAE2D5] rounded-lg hover:bg-[#F4ECE1] transition-colors uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" /> Close
              </button>
            </>
          )}
          <button onClick={() => onDelete(job.jobId)}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors uppercase tracking-wider">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */
export default function EmployerDashboard() {
  const { user, loading } = useContext(AuthContext);
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [fetching, setFetching] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [viewJob, setViewJob] = useState(null);

  const isEmployer = user?.roles?.includes('EMPLOYER');

  /* ── load profile once ── */
  useEffect(() => {
    if (!isEmployer) return;
    apiClient.get('/employers/profile')
      .then(res => setProfile(res.data?.data ?? res.data))
      .catch(console.error);
  }, [isEmployer]);

  /* ── load jobs ── */
  const loadJobs = useCallback(async (pg = page) => {
    if (!profile?.employerId) return;
    setFetching(true);
    try {
      const res = await apiClient.get(`/employers/${profile.employerId}/jobs`, {
        params: { pageOffset: pg, pageSize: 9 }
      });
      const d = res.data?.data ?? res.data;
      setJobs(d?.content ?? []);
      setTotalPages(d?.totalPages ?? 1);
    } catch {
      showToast('Failed to load jobs.', 'error');
    } finally {
      setFetching(false);
    }
  }, [profile, page, showToast]);

  useEffect(() => { loadJobs(page); }, [profile, page]);

  /* ── actions ── */
  const handleCreate = async (dto) => {
    await apiClient.post('/employers/jobs', dto);
    showToast('Job posted successfully!', 'success');
    loadJobs(0); setPage(0);
  };

  const handleUpdate = async (dto) => {
    await apiClient.put(`/employers/jobs/${editTarget.jobId}`, dto);
    showToast('Job updated.', 'success');
    loadJobs(page);
  };

  const handleCloseJob = async (jobId) => {
    try {
      await apiClient.post(`/employers/jobs/${jobId}/close`);
      showToast('Job closed.', 'success');
      loadJobs(page);
    } catch { showToast('Failed to close job.', 'error'); }
  };

  const handleDelete = async (jobId) => {
    try {
      await apiClient.delete(`/employers/jobs/${jobId}`);
      showToast('Job deleted.', 'success');
      loadJobs(page);
    } catch { showToast('Failed to delete job.', 'error'); }
  };

  /* ── guards ── */
  if (loading || (isEmployer && !profile && fetching)) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-9 h-9 rounded-xl bg-[#241E1A] animate-spin mx-auto" />
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Loading Employer Node…</p>
        </div>
      </div>
    );
  }

  if (!user || !isEmployer) return <Navigate to="/" replace />;

  const openJobs = jobs.filter(j => j.jobStatus === 'OPEN').length;
  const closedJobs = jobs.filter(j => j.jobStatus === 'CLOSED').length;

  return (
    <div className="flex flex-col bg-[#FDFBF7]" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* ── header ── */}
      <div className="border-b border-[#EAE2D5] px-6 lg:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#241E1A] flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-[#FDFBF7]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#241E1A]">{profile?.companyName || 'Employer Dashboard'}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {profile?.companyWebsite && (
                <a href={profile.companyWebsite} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-[#241E1A] font-semibold transition-colors">
                  <Globe className="w-3 h-3" />{profile.companyWebsite}
                </a>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Post a Job
        </button>
      </div>

      {/* ── metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-6 lg:px-10 py-6 shrink-0">
        <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Total Listings</span>
            <div className="w-8 h-8 rounded-lg bg-[#F4ECE1] flex items-center justify-center"><Briefcase className="w-4 h-4 text-[#241E1A]" /></div>
          </div>
          <div className="text-4xl font-black text-[#241E1A] tabular-nums">{jobs.length}</div>
        </div>
        <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Active Jobs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
          </div>
          <div className="text-4xl font-black text-[#241E1A] tabular-nums">{openJobs}</div>
        </div>
        <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-2xl p-5 flex flex-col gap-3 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Closed Jobs</span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center"><XCircle className="w-4 h-4 text-stone-500" /></div>
          </div>
          <div className="text-4xl font-black text-[#241E1A] tabular-nums">{closedJobs}</div>
        </div>
      </div>

      {/* ── job listings grid ── */}
      <div className="flex-1 flex flex-col px-6 lg:px-10 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Your Job Listings</h2>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Page {page + 1} of {totalPages}</span>
        </div>

        {fetching ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-[#241E1A] animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#EAE2D5] rounded-2xl py-20 text-stone-400">
            <Briefcase className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest mb-4">No jobs posted yet</p>
            <button onClick={() => { setEditTarget(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#241E1A] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider rounded-lg">
              <Plus className="w-4 h-4" /> Post your first job
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {jobs.map(job => (
                <JobCard key={job.jobId} job={job}
                  onView={setViewJob}
                  onEdit={j => { setEditTarget(j); setFormOpen(true); }}
                  onClose={handleCloseJob}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#EAE2D5] pt-5">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#241E1A] border border-[#EAE2D5] rounded-lg hover:bg-[#F4ECE1] disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {page + 1} / {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#241E1A] border border-[#EAE2D5] rounded-lg hover:bg-[#F4ECE1] disabled:opacity-30 transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── modals & panels ── */}
      <JobFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={editTarget ? handleUpdate : handleCreate}
        initial={editTarget}
      />
      <ApplicationsPanel
        job={viewJob}
        onClose={() => setViewJob(null)}
        onStatusChange={() => loadJobs(page)}
      />
    </div>
  );
}
