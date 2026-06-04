import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  GraduationCap, Building2, Users, Plus, Search, Globe, Mail, MapPin,
  Award, Tag, FileText, ExternalLink, CheckCircle2, Shield, RefreshCw, Briefcase, Eye, X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../lib/apiClient';
import { Navigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/Skeleton';

/* ─────────────────────── sub-components ─────────────────────── */
function MetricCard({ label, value, icon: Icon, accent, description }) {
  return (
    <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-sm duration-200">
      {accent && <div className={`absolute inset-x-0 top-0 h-[3px] ${accent}`} />}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#F4ECE1] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#241E1A]" />
        </div>
      </div>
      <div className="text-3xl font-black text-[#241E1A] tabular-nums">{value}</div>
      {description && <p className="text-[10px] text-stone-400 font-medium">{description}</p>}
    </div>
  );
}

function StudentCard({ student, onViewApplications }) {
  const applicant = student.applicant;
  const user = student.user || applicant?.user;
  const name = user?.name || `Student #${student.id}`;
  const email = user?.email || 'No email provided';
  const skills = applicant?.skills || [];
  const certifiedSkills = applicant?.certifiedSkills || [];
  const preferredLocations = applicant?.preferredLocations || [];
  const hasResumeUrl = applicant?.resume && applicant.resume.startsWith('http');
  const jobApps = applicant?.jobApplications || [];

  // Determine placement status
  const isPlaced = jobApps.some(app => app.applicationStatus === 'ACCEPTED');
  const isPending = jobApps.some(app => app.applicationStatus === 'APPLIED' || app.applicationStatus === 'SHORTLISTED');

  let placementBadge = (
    <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-stone-100 text-stone-500 border border-stone-200">
      No Applications
    </span>
  );
  if (isPlaced) {
    placementBadge = (
      <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        Placed
      </span>
    );
  } else if (isPending) {
    placementBadge = (
      <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
        Active Applicant
      </span>
    );
  }

  return (
    <div className="group border border-[#EAE2D5] rounded-xl bg-white hover:border-[#241E1A] hover:shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-[#241E1A] truncate">{name}</h3>
            <p className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
              <Mail className="w-3 h-3 text-stone-400 shrink-0" />
              {email}
            </p>
          </div>
          {placementBadge}
        </div>

        {/* Skills Section */}
        <div className="space-y-2">
          {certifiedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {certifiedSkills.map((skill, index) => (
                <span key={index} className="inline-flex items-center gap-0.5 bg-[#DFA687] text-[#241E1A] text-[8px] font-bold px-2 py-0.5 rounded-md border border-orange-200 uppercase tracking-wider">
                  <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-emerald-800" />
                  {skill}
                </span>
              ))}
            </div>
          )}

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, index) => (
                <span key={index} className="text-[8px] font-bold bg-[#C1CDBC] text-[#241E1A] px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-stone-400 italic">No skills listed</p>
          )}
        </div>

        {/* Preferred Locations */}
        {preferredLocations.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{preferredLocations.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-[#FAF6F0] px-5 py-3 border-t border-[#EAE2D5] flex items-center justify-between gap-2 shrink-0">
        <div className="flex gap-2">
          {hasResumeUrl ? (
            <a
              href={applicant.resume}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#241E1A] hover:underline"
            >
              <FileText className="w-3 h-3 text-stone-500" /> Resume <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : applicant?.resume ? (
            <span className="text-[9px] text-stone-500 italic truncate max-w-[120px]" title={applicant.resume}>
              Bio: {applicant.resume}
            </span>
          ) : (
            <span className="text-[9px] text-stone-400 italic">No resume</span>
          )}
        </div>

        <button
          onClick={() => onViewApplications(student)}
          className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#241E1A] border border-[#EAE2D5] rounded bg-white hover:bg-[#F4ECE1] transition-all"
        >
          <Briefcase className="w-3 h-3" /> {jobApps.length} Apps
        </button>
      </div>
    </div>
  );
}

/* ─── Applications Overlay Modal ─── */
function ApplicationsModal({ student, onClose }) {
  if (!student) return null;
  const applicant = student.applicant;
  const jobApps = applicant?.jobApplications || [];
  const name = student.user?.name || `Student #${student.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative max-h-[80vh] overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute top-5 right-5 text-stone-400 hover:text-[#241E1A] transition-colors p-1 hover:bg-[#F4ECE1] rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[#EAE2D5] pb-4 mb-4 shrink-0">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Job Applications</span>
          <h2 className="text-base font-extrabold text-[#241E1A] mt-0.5">{name}</h2>
          <p className="text-[10px] text-stone-500 mt-1">Check current application status and hiring records</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {jobApps.length === 0 ? (
            <div className="text-center py-10 text-stone-400 space-y-2">
              <Briefcase className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs font-bold uppercase tracking-widest">No active applications</p>
            </div>
          ) : (
            jobApps.map((app, index) => {
              const status = app.applicationStatus || 'APPLIED';
              let badgeColor = 'bg-stone-50 text-stone-500 border-stone-200';
              if (status === 'ACCEPTED') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              else if (status === 'REJECTED') badgeColor = 'bg-red-50 text-red-700 border-red-200';
              else if (status === 'SHORTLISTED') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
              else if (status === 'APPLIED') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <div key={index} className="border border-[#EAE2D5] rounded-xl p-4 bg-white flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#241E1A] truncate">{app.jobTitle || `Job Listing #${app.jobId}`}</h4>
                    <p className="text-[9px] text-stone-400 mt-0.5">Applied: {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—'}</p>
                  </div>
                  <span className={`inline-flex items-center text-[8px] font-black border px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${badgeColor}`}>
                    {status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN COLLEGE DASHBOARD ═══════════════════════ */
export default function CollegeDashboard() {
  const { user, loading } = useContext(AuthContext);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('STUDENTS'); // STUDENTS, ONBOARD, EMPLOYERS
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [onboardRequests, setOnboardRequests] = useState([]);

  // States for search and filtering
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PLACED, APPLICANT, NONE

  const [onboardSearch, setOnboardSearch] = useState('');
  const [employerSearch, setEmployerSearch] = useState('');

  const [fetching, setFetching] = useState(true);
  const [acting, setActing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStudentApps, setSelectedStudentApps] = useState(null);

  const isCollege = user?.roles?.includes('COLLEGE');

  /* ── Fetch all dashboard data ── */
  const loadDashboardData = useCallback(async (quiet = false) => {
    if (!isCollege) return;
    if (!quiet) setFetching(true);
    else setIsRefreshing(true);

    try {
      console.log('[Dev Alert] College Dashboard - Beginning individual API fetches...');
      
      let profileData = null;
      try {
        const profileRes = await apiClient.get('/college/profile');
        console.log('[Dev Alert] College Dashboard - profileRes success:', profileRes);
        profileData = profileRes.data?.data ?? profileRes.data ?? null;
      } catch (err) {
        console.error('[Dev Alert] College Dashboard - profileRes failed:', err);
      }

      let studentsList = [];
      try {
        const studentsRes = await apiClient.get('/college/student');
        console.log('[Dev Alert] College Dashboard - studentsRes success:', studentsRes);
        studentsList = studentsRes.data?.data ?? studentsRes.data ?? [];
      } catch (err) {
        console.error('[Dev Alert] College Dashboard - studentsRes failed:', err);
      }

      let usersList = [];
      try {
        const usersRes = await apiClient.get('/users/all');
        console.log('[Dev Alert] College Dashboard - usersRes success:', usersRes);
        usersList = usersRes.data?.data ?? usersRes.data ?? [];
      } catch (err) {
        console.error('[Dev Alert] College Dashboard - usersRes failed:', err);
      }

      let requestsList = [];
      try {
        const requestsRes = await apiClient.get('/college/student/onboard/requests');
        console.log('[Dev Alert] College Dashboard - requestsRes success:', requestsRes);
        requestsList = requestsRes.data?.data ?? requestsRes.data ?? [];
      } catch (err) {
        console.error('[Dev Alert] College Dashboard - requestsRes failed:', err);
      }

      setProfile(profileData);
      setStudents(studentsList);
      setAllUsers(usersList);
      setOnboardRequests(requestsList);
      
      console.log('[Dev Alert] College Dashboard - All individual loads complete. Requests list set to:', requestsList);

    } catch (err) {
      console.error('[College] load error', err);
      showToast('Failed to load College Dashboard metrics.', 'error');
    } finally {
      setFetching(false);
      setIsRefreshing(false);
    }
  }, [isCollege, showToast]);

  useEffect(() => {
    loadDashboardData(false);
  }, [isCollege]);

  /* ── Action: Onboard New Student ── */
  const handleOnboardStudent = async (targetUser) => {
    setActing(true);
    try {
      await apiClient.post(`/college/onboard/student/${targetUser.id}`);
      showToast(`${targetUser.name || 'User'} successfully onboarded as student!`, 'success');
      setOnboardSearch('');
      await loadDashboardData(true);
    } catch (err) {
      console.error('[College] Onboard Error:', err);
      showToast('Failed to onboard student. Verify candidate user roles.', 'error');
    } finally {
      setActing(false);
    }
  };

  /* ── Action: Allow Employer ── */
  const handleAllowEmployer = async (targetEmployer) => {
    setActing(true);
    try {
      await apiClient.post(`/college/allow/employer/${targetEmployer.id}`);
      showToast(`${targetEmployer.name || 'Employer'} successfully authorized to recruit!`, 'success');
      setEmployerSearch('');
      await loadDashboardData(true);
    } catch (err) {
      console.error('[College] Allow Employer Error:', err);
      showToast('Failed to authorize employer.', 'error');
    } finally {
      setActing(false);
    }
  };

  /* ── Guards ── */
  if (loading || (isCollege && !profile && fetching)) {
    return <DashboardSkeleton type="college" />;
  }

  if (!user || !isCollege) return <Navigate to="/" replace />;

  /* ── Compute dashboard stats ── */
  const totalStudentsCount = students.length;
  const allowedEmployersCount = profile?.allowedEmployers?.length || 0;

  // Placement metrics
  const placedCount = students.filter(s =>
    (s.applicant?.jobApplications || []).some(app => app.applicationStatus === 'ACCEPTED')
  ).length;

  const activeApplicantsCount = students.filter(s => {
    const apps = s.applicant?.jobApplications || [];
    return !apps.some(app => app.applicationStatus === 'ACCEPTED') &&
      apps.some(app => app.applicationStatus === 'APPLIED' || app.applicationStatus === 'SHORTLISTED');
  }).length;

  const noAppsCount = students.filter(s => (s.applicant?.jobApplications || []).length === 0).length;

  const placementRate = totalStudentsCount > 0 ? Math.round((placedCount / totalStudentsCount) * 100) : 0;

  /* ── Filters application for Student Directory ── */
  const filteredStudents = students.filter(s => {
    const u = s.user || s.applicant?.user;
    const sName = (u?.name || '').toLowerCase();
    const sEmail = (u?.email || '').toLowerCase();
    const query = studentSearch.toLowerCase();

    // Check search term
    const matchesSearch = sName.includes(query) || sEmail.includes(query);
    if (!matchesSearch) return false;

    // Check placement status filters
    const apps = s.applicant?.jobApplications || [];
    const isPlaced = apps.some(app => app.applicationStatus === 'ACCEPTED');
    const isPending = apps.some(app => app.applicationStatus === 'APPLIED' || app.applicationStatus === 'SHORTLISTED');

    if (statusFilter === 'PLACED') return isPlaced;
    if (statusFilter === 'APPLICANT') return isPending;
    if (statusFilter === 'NONE') return apps.length === 0;

    return true;
  });

  /* ── Filter users eligible for student onboarding ── */
  // Users who have APPLICANT role, but are NOT already listed as students in our college.
  const enrolledStudentUserIds = new Set(students.map(s => s.user?.id || s.applicant?.user?.id).filter(Boolean));
  const eligibleStudents = allUsers.filter(u => {
    // Exclude existing college students
    if (enrolledStudentUserIds.has(u.id)) return false;
    // Must be applicant to be onboarded as student
    if (!u.roles?.includes('APPLICANT') && !u.roles?.includes('STUDENT')) return false;

    // Search query match
    const query = onboardSearch.toLowerCase();
    return (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query);
  });

  /* ── Filter employers eligible to be authorized ── */
  const allowedEmployerUserIds = new Set((profile?.allowedEmployers || []).map(emp => emp.user?.id).filter(Boolean));
  const eligibleEmployers = allUsers.filter(u => {
    if (!u.roles?.includes('EMPLOYER')) return false;
    if (allowedEmployerUserIds.has(u.id)) return false;

    const query = employerSearch.toLowerCase();
    return (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query);
  });

  return (
    <div className="flex flex-col bg-[#FDFBF7]" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* ── HEADER CONTAINER ── */}
      <div className="border-b border-[#EAE2D5] px-6 lg:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-white/40 backdrop-blur-md sticky top-16 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#241E1A] flex items-center justify-center shrink-0 transition-transform hover:rotate-3">
            <GraduationCap className="w-6 h-6 text-[#FDFBF7]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#241E1A] serif-heading">{profile?.name || user?.name || 'College Panel'}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
              {profile?.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" /> {profile.address}
                </span>
              )}
              {(profile?.email || user?.email) && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-stone-400" /> {profile?.email || user?.email}
                </span>
              )}
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#241E1A] hover:underline"
                >
                  <Globe className="w-3 h-3 text-stone-400" /> {profile.website}
                </a>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => loadDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#241E1A] border border-[#EAE2D5] rounded-xl hover:bg-[#F4ECE1] transition-colors disabled:opacity-40 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Panel
        </button>
      </div>

      {/* ── METRICS DISPLAY ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 lg:px-10 py-6 shrink-0">
        <MetricCard
          label="Enrolled Students"
          value={totalStudentsCount}
          icon={Users}
          description="Total students registered"
        />
        <MetricCard
          label="Employment Rate"
          value={`${placementRate}%`}
          icon={Award}
          accent="bg-emerald-500"
          description={`${placedCount} of ${totalStudentsCount} hired`}
        />
        <MetricCard
          label="Active Applicants"
          value={activeApplicantsCount}
          icon={Briefcase}
          accent="bg-amber-500"
          description="Pending recruiter reviews"
        />
        <MetricCard
          label="Allowed Employers"
          value={allowedEmployersCount}
          icon={Building2}
          description="Authorized companies list"
        />
      </div>

      {/* ── TAB NAVIGATION BAR ── */}
      <div className="flex-1 flex flex-col mx-6 lg:mx-10 mb-8 border border-[#EAE2D5] rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Tab Links */}
        <div className="flex shrink-0 border-b border-[#EAE2D5] bg-[#FAF6F0]">
          {[
            { key: 'STUDENTS', label: 'Student Directory', icon: Users, count: totalStudentsCount },
            { key: 'ONBOARD', label: 'Onboard Requests', icon: Plus, count: onboardRequests.length },
            { key: 'EMPLOYERS', label: 'Approved Recruiters', icon: Building2, count: allowedEmployersCount }
          ].map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#EAE2D5]
                  ${isActive
                    ? 'text-[#241E1A] bg-white'
                    : 'text-stone-500 hover:text-[#241E1A] hover:bg-[#F4ECE1]'
                  }`}
              >
                {isActive && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#241E1A]" />}
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#241E1A] text-white' : 'bg-[#EAE2D5] text-stone-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative min-h-[400px]">
          {acting && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="w-6 h-6 rounded-lg bg-[#241E1A] animate-spin" />
            </div>
          )}

          {/* ──────────────── TAB 1: STUDENT DIRECTORY ──────────────── */}
          {activeTab === 'STUDENTS' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Directory Filter Bar */}
              <div className="border-b border-[#EAE2D5] px-6 py-4 bg-[#FAF6F0] flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div className="relative max-w-md w-full">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-stone-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by student name or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full bg-white border border-[#EAE2D5] focus:border-[#241E1A] rounded-xl pl-10 pr-4 py-2 text-xs outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider shrink-0">Status Filter:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-[#EAE2D5] focus:border-[#241E1A] text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl outline-none"
                  >
                    <option value="ALL">All Students</option>
                    <option value="PLACED">Placed</option>
                    <option value="APPLICANT">Active Applicant</option>
                    <option value="NONE">No Applications</option>
                  </select>
                </div>
              </div>

              {/* Grid directory */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredStudents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-stone-400">
                    <Users className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-xs font-bold uppercase tracking-widest">No matching students found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map(student => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        onViewApplications={(s) => setSelectedStudentApps(s)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────── TAB 2: STUDENT ONBOARDING ──────────────── */}
          {activeTab === 'ONBOARD' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8">

                  {/* Section A: Pending Onboarding Requests */}
                  <div>
                    <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-stone-500" />
                      Pending Onboard Requests ({onboardRequests.length})
                    </h3>

                    {onboardRequests.length === 0 ? (
                      <div className="bg-[#FAF6F0] rounded-xl p-6 border border-[#EAE2D5] text-center text-stone-400 space-y-1">
                        <CheckCircle2 className="w-8 h-8 mx-auto opacity-30 text-[#C1CDBC] mb-1" />
                        <p className="text-xs font-bold uppercase tracking-widest">No pending onboarding requests</p>
                        <p className="text-[10px] text-stone-400">Students requesting to join your college will appear here.</p>
                      </div>
                    ) : (
                      <div className="border border-[#EAE2D5] rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="divide-y divide-[#EAE2D5]">
                          {onboardRequests.map(req => {
                            const candidate = allUsers.find(u => u.id === req.userId) || { id: req.userId, name: `Applicant #${req.userId}`, email: 'No email record' };
                            return (
                              <div key={req.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors">
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-[#241E1A] truncate">{candidate.name}</h4>
                                  <p className="text-[10px] text-stone-500 mt-0.5">{candidate.email}</p>
                                  <span className="inline-flex items-center text-[8px] font-bold bg-[#F4ECE1] text-[#241E1A] px-2 py-0.5 rounded border border-[#EAE2D5] uppercase tracking-wider mt-1.5">
                                    Request ID: #{req.id}
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleOnboardStudent(candidate)}
                                  disabled={acting}
                                  className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#FDFBF7] bg-[#241E1A] hover:bg-[#382F29] rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Onboard
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section B: Global Search and Invite */}
                  <div className="border-t border-[#EAE2D5] pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-widest flex items-center gap-2">
                          <Search className="w-4 h-4 text-stone-500" />
                          Invite Candidates (Global Search)
                        </h3>
                        <p className="text-[10px] text-stone-400 mt-0.5">Search unregistered applicant profiles across the platform</p>
                      </div>

                      <div className="relative max-w-xs w-full shrink-0">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Search className="w-3.5 h-3.5 text-stone-400" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search applicant name or email..."
                          value={onboardSearch}
                          onChange={(e) => setOnboardSearch(e.target.value)}
                          className="w-full bg-white border border-[#EAE2D5] focus:border-[#241E1A] rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {eligibleStudents.length === 0 ? (
                      <div className="text-center py-10 text-stone-400 border border-dashed border-[#EAE2D5] rounded-xl">
                        <p className="text-xs font-bold uppercase tracking-widest">No applicant profiles found</p>
                      </div>
                    ) : (
                      <div className="border border-[#EAE2D5] rounded-xl overflow-hidden bg-white">
                        <div className="divide-y divide-[#EAE2D5] max-h-96 overflow-y-auto">
                          {eligibleStudents.map(candidate => (
                            <div key={candidate.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors">
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-[#241E1A] truncate">{candidate.name}</h4>
                                <p className="text-[10px] text-stone-500 mt-0.5">{candidate.email}</p>
                                {candidate.roles && (
                                  <div className="flex gap-1 mt-1">
                                    {candidate.roles.map((role, i) => (
                                      <span key={i} className="text-[8px] font-bold bg-[#FAF6F0] text-stone-500 border border-[#EAE2D5] px-1.5 py-0.2 rounded uppercase">
                                        {role}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleOnboardStudent(candidate)}
                                disabled={acting}
                                className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#241E1A] border border-[#EAE2D5] bg-white hover:bg-[#F4ECE1] rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                              >
                                <Plus className="w-3.5 h-3.5" /> Onboard Student
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 3: APPROVED EMPLOYERS ──────────────── */}
          {activeTab === 'EMPLOYERS' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#EAE2D5] flex-1 overflow-hidden">
                {/* Left Side: Current Allowed Employers */}
                <div className="lg:col-span-6 flex flex-col overflow-hidden">
                  <div className="border-b border-[#EAE2D5] px-6 py-4 bg-[#FAF6F0] flex items-center justify-between shrink-0">
                    <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-widest">Currently Allowed Recruiter Nodes</h3>
                    <span className="text-[9px] font-black bg-[#241E1A] text-white px-2 py-0.5 rounded-full">{allowedEmployersCount}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {allowedEmployersCount === 0 ? (
                      <div className="text-center py-20 text-stone-400">
                        <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-bold uppercase tracking-widest">No employers authorized yet</p>
                      </div>
                    ) : (
                      (profile?.allowedEmployers || []).map(emp => (
                        <div key={emp.employerId} className="border border-[#EAE2D5] rounded-xl p-4 bg-[#FDFBF7] flex justify-between items-center gap-4">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#241E1A] truncate">{emp.companyName || `Employer #${emp.employerId}`}</h4>
                            {emp.companyWebsite && (
                              <a
                                href={emp.companyWebsite}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] text-stone-400 hover:text-[#241E1A] hover:underline flex items-center gap-1 mt-0.5 truncate"
                              >
                                <Globe className="w-3 h-3" /> {emp.companyWebsite}
                              </a>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            <Shield className="w-3 h-3" /> Authorized
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Side: Authorize New Employers */}
                <div className="lg:col-span-6 flex flex-col overflow-hidden">
                  <div className="border-b border-[#EAE2D5] px-6 py-4 bg-[#FAF6F0] flex flex-col gap-3 shrink-0">
                    <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-widest">Authorize Recruiter Access</h3>
                    <div className="relative w-full">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-stone-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search system employers by name..."
                        value={employerSearch}
                        onChange={(e) => setEmployerSearch(e.target.value)}
                        className="w-full bg-white border border-[#EAE2D5] focus:border-[#241E1A] rounded-xl pl-10 pr-4 py-1.5 text-xs outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {eligibleEmployers.length === 0 ? (
                      <div className="text-center py-20 text-stone-400">
                        <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-bold uppercase tracking-widest">No matching employers available</p>
                      </div>
                    ) : (
                      eligibleEmployers.map(empUser => (
                        <div key={empUser.id} className="border border-[#EAE2D5] rounded-xl p-4 bg-white flex justify-between items-center gap-4 hover:border-[#241E1A] transition-colors">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#241E1A] truncate">{empUser.name}</h4>
                            <p className="text-[9px] text-stone-500 truncate mt-0.5">{empUser.email}</p>
                          </div>

                          <button
                            onClick={() => handleAllowEmployer(empUser)}
                            disabled={acting}
                            className="flex items-center gap-1.5 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-[#FDFBF7] bg-[#241E1A] hover:bg-[#382F29] rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-40 shadow-sm"
                          >
                            <Shield className="w-3 h-3" /> Authorize Recruiter
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Overlay Modal for Student Applications ── */}
      {selectedStudentApps && (
        <ApplicationsModal
          student={selectedStudentApps}
          onClose={() => setSelectedStudentApps(null)}
        />
      )}
    </div>
  );
}
