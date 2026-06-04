import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../lib/apiClient';
import {
  Building2, MapPin, Mail, Globe, Users, ChevronRight, X, Briefcase,
  ExternalLink, ClipboardList, CheckCircle2, Clock, RefreshCw, AlertCircle,
  Send, Hash, FileText, Shield, ThumbsUp, ThumbsDown, ChevronDown
} from 'lucide-react';
import { MassHiringSkeleton } from '../components/Skeleton';

/* ─── Status badge helper ─── */
function StatusBadge({ status }) {
  const map = {
    PENDING:     'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED:    'bg-red-50 text-red-700 border-red-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED:   'bg-purple-50 text-purple-700 border-purple-200',
    CANCELLED:   'bg-stone-100 text-stone-500 border-stone-200',
    FAILED:      'bg-red-100 text-red-600 border-red-200',
  };
  const icons = {
    PENDING:     <Clock className="w-3 h-3" />,
    APPROVED:    <CheckCircle2 className="w-3 h-3" />,
    REJECTED:    <ThumbsDown className="w-3 h-3" />,
    IN_PROGRESS: <RefreshCw className="w-3 h-3" />,
    COMPLETED:   <ThumbsUp className="w-3 h-3" />,
    CANCELLED:   <X className="w-3 h-3" />,
    FAILED:      <AlertCircle className="w-3 h-3" />,
  };
  const cls = map[status] || 'bg-stone-100 text-stone-500 border-stone-200';
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black border px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${cls}`}>
      {icons[status]} {status?.replace('_', ' ')}
    </span>
  );
}

/* ─── Request Form Modal ─── */
function RequestModal({ college, employerProfile, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [description, setDescription] = useState('');
  const [requiredStudents, setRequiredStudents] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) { showToast('Please provide a description.', 'error'); return; }
    if (!requiredStudents || Number(requiredStudents) < 1) { showToast('Required students must be at least 1.', 'error'); return; }
    if (!college?.id) { showToast('Invalid college selection. Please close and try again.', 'error'); return; }

    setSubmitting(true);
    try {
      await apiClient.post(`/employers/college/${college.id}/mass-hiring`, {
        description: description.trim(),
        requiredStudents: Number(requiredStudents),
      });
      showToast(`Mass hiring request sent to ${college.name}!`, 'success');
      onSuccess();
    } catch (err) {
      console.error('[MassHiring] Submit error:', err);
      const msg = err?.response?.data?.error?.message
        || err?.response?.data?.message
        || err?.message
        || 'Failed to submit request. Try again.';
      showToast(msg, 'error');
      console.error('[MassHiring] Server error detail:', err?.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-3xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Modal header */}
        <div className="h-28 bg-[#241E1A] relative flex items-end px-7 pb-5">
          <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white border-4 border-[#241E1A] flex items-center justify-center absolute -bottom-7 left-7 shadow-sm">
            <Briefcase className="w-7 h-7 text-[#241E1A]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-7 pt-11 pb-7 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Requesting Partnership With</p>
            <h2 className="text-xl font-black text-[#241E1A] mt-0.5 leading-tight">{college.name}</h2>
            {college.address && (
              <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {college.address}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <FileText className="w-3 h-3" /> Job Description / Requirements
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the roles, skills required, timeline, and any other relevant details…"
              className="w-full bg-white border border-[#EAE2D5] focus:border-[#241E1A] rounded-xl px-4 py-3 text-xs text-[#241E1A] placeholder-stone-300 outline-none resize-none transition-colors"
              required
            />
          </div>

          {/* Required Students */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <Hash className="w-3 h-3" /> Number of Students Required
            </label>
            <input
              type="number"
              min="1"
              value={requiredStudents}
              onChange={e => setRequiredStudents(e.target.value)}
              placeholder="e.g. 25"
              className="w-full bg-white border border-[#EAE2D5] focus:border-[#241E1A] rounded-xl px-4 py-2.5 text-xs text-[#241E1A] placeholder-stone-300 outline-none transition-colors"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#241E1A] hover:bg-[#382F29] disabled:opacity-40 text-[#FDFBF7] text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Submitting…' : 'Send Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 bg-white hover:bg-[#FAF6F0] border border-[#EAE2D5] text-[#241E1A] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── College Detail + Request trigger modal ─── */
function CollegeDetailModal({ college, employerProfile, onClose, onRequestSent }) {
  const [showRequestForm, setShowRequestForm] = useState(false);

  if (showRequestForm) {
    return (
      <RequestModal
        college={college}
        employerProfile={employerProfile}
        onClose={() => setShowRequestForm(false)}
        onSuccess={() => { setShowRequestForm(false); onClose(); onRequestSent(); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-3xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="h-32 bg-[#241E1A] relative flex items-end px-8 pb-6">
          <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white border-4 border-[#241E1A] flex items-center justify-center absolute -bottom-8 left-8 shadow-sm">
            <Building2 className="w-8 h-8 text-[#241E1A]" />
          </div>
        </div>

        <div className="px-8 pt-12 pb-8">
          <h2 className="text-2xl font-black text-[#241E1A] mb-6 tracking-tight leading-tight">{college.name}</h2>

          <div className="space-y-5 bg-white border border-[#EAE2D5] rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 border border-[#EAE2D5]">
                <MapPin className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Location</p>
                <p className="text-sm font-semibold text-[#241E1A]">{college.address || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 border border-[#EAE2D5]">
                <Mail className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Contact Email</p>
                {college.email
                  ? <a href={`mailto:${college.email}`} className="text-sm font-semibold text-amber-700 hover:text-amber-800">{college.email}</a>
                  : <p className="text-sm font-semibold text-stone-400">Not provided</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 border border-[#EAE2D5]">
                <Globe className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Website</p>
                {college.website
                  ? <a href={college.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1">{college.website} <ExternalLink className="w-3 h-3" /></a>
                  : <p className="text-sm font-semibold text-stone-400">Not provided</p>}
              </div>
            </div>
          </div>

          <div className="mt-7 flex gap-3">
            <button
              onClick={() => setShowRequestForm(true)}
              className="flex-1 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Initiate Mass Hiring
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-white hover:bg-[#FAF6F0] border border-[#EAE2D5] text-[#241E1A] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ MAIN COMPONENT ══════════════════════ */
export default function MassHiring() {
  const { user, loading } = useContext(AuthContext);
  const { showToast } = useToast();

  const [colleges, setColleges] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [employerProfile, setEmployerProfile] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [activeSection, setActiveSection] = useState('DIRECTORY'); // DIRECTORY | MY_REQUESTS
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');

  const isEmployer = user?.roles?.includes('EMPLOYER');

  const loadData = useCallback(async (quiet = false) => {
    if (!isEmployer) return;
    if (!quiet) setIsFetching(true);
    else setIsRefreshing(true);

    try {
      const [collegesRes, requestsRes, profileRes] = await Promise.allSettled([
        apiClient.get('/public/colleges'),
        apiClient.get('/employers/mass-hiring'),
        apiClient.get('/employers/profile'),
      ]);

      if (collegesRes.status === 'fulfilled') {
        const d = collegesRes.value.data?.data ?? collegesRes.value.data ?? [];
        setColleges(Array.isArray(d) ? d : []);
      }
      if (requestsRes.status === 'fulfilled') {
        const d = requestsRes.value.data?.data ?? requestsRes.value.data ?? [];
        setMyRequests(Array.isArray(d) ? d : []);
      }
      if (profileRes.status === 'fulfilled') {
        setEmployerProfile(profileRes.value.data?.data ?? profileRes.value.data ?? null);
      }
    } catch (err) {
      console.error('[MassHiring] loadData error:', err);
      showToast('Failed to load data.', 'error');
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  }, [isEmployer, showToast]);

  useEffect(() => { loadData(false); }, [isEmployer]);

  /* ── Guards ── */
  if (loading || isFetching) {
    return <MassHiringSkeleton />;
  }

  if (!isEmployer) return <Navigate to="/" replace />;

  /* ── Derived data ── */
  const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;
  const filteredRequests = requestStatusFilter === 'ALL'
    ? myRequests
    : myRequests.filter(r => r.status === requestStatusFilter);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="mb-8 border-b border-[#EAE2D5] pb-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#241E1A] flex items-center justify-center shadow-md shrink-0">
              <Users className="w-6 h-6 text-[#FDFBF7]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#241E1A]">Mass Hiring</h1>
              <p className="text-xs font-medium text-stone-400 mt-0.5">
                Partner with verified academic institutions for bulk campus recruitment.
              </p>
            </div>
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#241E1A] border border-[#EAE2D5] rounded-xl hover:bg-[#F4ECE1] transition-colors disabled:opacity-40 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Section Tabs ── */}
        <div className="flex border border-[#EAE2D5] rounded-2xl overflow-hidden bg-white shadow-sm mb-8">
          {[
            { key: 'DIRECTORY', label: 'College Directory', icon: Building2, count: colleges.length },
            { key: 'MY_REQUESTS', label: 'My Requests', icon: ClipboardList, count: pendingCount, badge: pendingCount > 0 },
          ].map(tab => {
            const isActive = activeSection === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`relative flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#EAE2D5] last:border-r-0
                  ${isActive ? 'text-[#241E1A] bg-white' : 'text-stone-500 hover:text-[#241E1A] hover:bg-[#FAF6F0] bg-[#FAF6F0]'}`}
              >
                {isActive && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#241E1A]" />}
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    tab.badge
                      ? 'bg-amber-500 text-white'
                      : isActive ? 'bg-[#241E1A] text-white' : 'bg-[#EAE2D5] text-stone-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Section: College Directory ── */}
        {activeSection === 'DIRECTORY' && (
          <>
            {colleges.length === 0 ? (
              <div className="bg-white border border-[#EAE2D5] border-dashed rounded-3xl p-12 text-center">
                <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#241E1A] mb-2">No Institutions Found</h3>
                <p className="text-sm text-stone-500">There are currently no colleges registered on the platform.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {colleges.map(college => (
                  <div
                    key={college.id}
                    onClick={() => setSelectedCollege(college)}
                    className="bg-white border border-[#EAE2D5] hover:border-[#241E1A] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col relative overflow-hidden"
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

                    <h3 className="text-base font-bold text-[#241E1A] mb-3 leading-tight relative z-10 line-clamp-2">
                      {college.name}
                    </h3>

                    <div className="mt-auto space-y-1.5 relative z-10">
                      {college.address && (
                        <div className="flex items-center gap-1.5 text-stone-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-medium truncate">{college.address}</span>
                        </div>
                      )}
                      {college.email && (
                        <div className="flex items-center gap-1.5 text-stone-400">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-medium truncate">{college.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EAE2D5] relative z-10">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Click to initiate partnership
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Section: My Requests ── */}
        {activeSection === 'MY_REQUESTS' && (
          <div className="bg-white border border-[#EAE2D5] rounded-2xl overflow-hidden shadow-sm">
            {/* Filter bar */}
            <div className="border-b border-[#EAE2D5] px-6 py-4 bg-[#FAF6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-stone-400" />
                  Applied College Requests
                  {pendingCount > 0 && (
                    <span className="text-[9px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      {pendingCount} Awaiting Response
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Track the status of all your submitted mass hiring partnership requests.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Filter:</span>
                <select
                  value={requestStatusFilter}
                  onChange={e => setRequestStatusFilter(e.target.value)}
                  className="bg-white border border-[#EAE2D5] focus:border-[#241E1A] text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl outline-none"
                >
                  <option value="ALL">All Requests</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="py-20 text-center text-stone-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-widest">No requests found</p>
                <p className="text-[10px] text-stone-400 mt-1">
                  {requestStatusFilter === 'ALL'
                    ? "You haven't submitted any mass hiring requests yet. Browse the College Directory to get started."
                    : `No requests with status "${requestStatusFilter.replace('_', ' ')}".`}
                </p>
                {requestStatusFilter === 'ALL' && (
                  <button
                    onClick={() => setActiveSection('DIRECTORY')}
                    className="mt-4 text-[10px] font-bold text-[#241E1A] border border-[#EAE2D5] px-4 py-2 rounded-xl hover:bg-[#FAF6F0] transition-colors uppercase tracking-wider"
                  >
                    Browse Colleges
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#EAE2D5]">
                {filteredRequests.map(req => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';

                  // Look up college name from the loaded colleges list
                  const collegeInfo = colleges.find(c => c.id === req.college);
                  const collegeName = collegeInfo?.name || (req.college ? `College #${req.college}` : 'Unknown College');
                  const collegeAddress = collegeInfo?.address;
                  const collegeEmail = collegeInfo?.email;

                  // Border accent per status
                  const borderAccent = isPending
                    ? 'border-l-4 border-l-amber-400'
                    : isApproved
                    ? 'border-l-4 border-l-emerald-500'
                    : isRejected
                    ? 'border-l-4 border-l-red-400'
                    : '';

                  return (
                    <div
                      key={req.id}
                      className={`p-6 hover:bg-[#FDFBF7] transition-colors ${borderAccent}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                        {/* Left: College + Description */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Building2 className="w-4 h-4 text-stone-400 shrink-0" />
                            <div className="min-w-0">
                              <h4 className="text-sm font-extrabold text-[#241E1A]">{collegeName}</h4>
                              {collegeAddress && (
                                <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" /> {collegeAddress}
                                </p>
                              )}
                              {collegeEmail && (
                                <p className="text-[10px] text-stone-400 flex items-center gap-1">
                                  <Mail className="w-2.5 h-2.5 shrink-0" /> {collegeEmail}
                                </p>
                              )}
                            </div>
                            <StatusBadge status={req.status} />
                          </div>

                          {req.description && (
                            <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">
                              {req.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3">
                            <div className="bg-[#FAF6F0] border border-[#EAE2D5] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-stone-400" />
                              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Required Students:</span>
                              <span className="text-xs font-black text-[#241E1A]">{req.requiredStudents ?? '—'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Status summary */}
                        <div className="shrink-0 text-right space-y-1">
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Status</p>
                          <div className="flex justify-end">
                            <StatusBadge status={req.status} />
                          </div>
                          {isPending && (
                            <p className="text-[9px] text-amber-600 font-medium mt-1">Awaiting college review</p>
                          )}
                          {isApproved && (
                            <p className="text-[9px] text-emerald-600 font-medium mt-1">College accepted!</p>
                          )}
                          {isRejected && (
                            <p className="text-[9px] text-red-500 font-medium mt-1">College declined</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary footer */}
            {myRequests.length > 0 && (
              <div className="border-t border-[#EAE2D5] px-6 py-3 bg-[#FAF6F0] flex items-center gap-4 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                <span>Total: {myRequests.length}</span>
                <span className="text-amber-600">Pending: {myRequests.filter(r => r.status === 'PENDING').length}</span>
                <span className="text-emerald-600">Approved: {myRequests.filter(r => r.status === 'APPROVED').length}</span>
                <span className="text-red-500">Rejected: {myRequests.filter(r => r.status === 'REJECTED').length}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── College Detail Modal ── */}
      {selectedCollege && (
        <CollegeDetailModal
          college={selectedCollege}
          employerProfile={employerProfile}
          onClose={() => setSelectedCollege(null)}
          onRequestSent={() => { loadData(true); setActiveSection('MY_REQUESTS'); }}
        />
      )}
    </div>
  );
}
