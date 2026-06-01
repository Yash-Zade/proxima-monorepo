import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Users, Briefcase, FileText, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Building, GraduationCap, Shield, RefreshCw
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../lib/apiClient';
import { Navigate } from 'react-router-dom';

/* ─────────────────────── helpers ─────────────────────── */
const EMPTY_PAGE = { content: [], totalPages: 1 };

/* ─────────────────────── sub-components ─────────────────────── */
function MetricCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
      {accent && <div className={`absolute inset-x-0 top-0 h-[3px] ${accent}`} />}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#F4ECE1] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#241E1A]" />
        </div>
      </div>
      <div className="text-4xl font-black text-[#241E1A] tabular-nums">{value}</div>
    </div>
  );
}

function RequestCard({ item, tab, onApprove, onReject, isActing }) {
  return (
    <div className="group border border-[#EAE2D5] rounded-xl bg-white hover:border-[#241E1A] hover:shadow-sm transition-all duration-200">
      <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#241E1A] text-[#FDFBF7] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              #{item.id}
            </span>
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
              User {item.userId}
            </span>
          </div>
          <h3 className="text-base font-bold text-[#241E1A] truncate">
            {tab === 'EMPLOYERS' ? item.companyName : item.name}
          </h3>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-stone-500">
            {tab === 'EMPLOYERS' ? (
              <a href={item.companyWebsite} target="_blank" rel="noreferrer"
                className="underline hover:text-[#241E1A] transition-colors truncate max-w-xs">
                {item.companyWebsite}
              </a>
            ) : (
              <>
                {item.address && <span>{item.address}</span>}
                {item.email && <span>{item.email}</span>}
                {item.website && (
                  <a href={item.website} target="_blank" rel="noreferrer"
                    className="underline hover:text-[#241E1A] transition-colors">
                    {item.website}
                  </a>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            disabled={isActing}
            onClick={() => onReject(item)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
          <button
            disabled={isActing}
            onClick={() => onApprove(item)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#FDFBF7] bg-[#241E1A] hover:bg-[#382F29] rounded-lg transition-colors disabled:opacity-40"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}

function TabContent({ data, tab, page, totalPages, onPageChange, onApprove, onReject, isActing }) {
  return (
    <div className="flex flex-col h-full">
      {/* scrollable list — fixed height prevents layout shift */}
      <div className="flex-1 overflow-y-auto">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 text-stone-400">
            <CheckCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-xs font-bold uppercase tracking-widest">No pending requests</p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {data.map(item => (
              <RequestCard
                key={item.id}
                item={item}
                tab={tab}
                onApprove={onApprove}
                onReject={onReject}
                isActing={isActing}
              />
            ))}
          </div>
        )}
      </div>

      {/* pagination always mounted so height is stable */}
      <div className="shrink-0 border-t border-[#EAE2D5] px-6 py-3 flex items-center justify-between bg-[#FDFBF7]">
        <button
          onClick={() => onPageChange(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#241E1A] px-3 py-1.5 rounded-lg hover:bg-[#F4ECE1] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(p => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#241E1A] px-3 py-1.5 rounded-lg hover:bg-[#F4ECE1] disabled:opacity-30 transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── main page ─────────────────────── */
export default function AdminDashboard() {
  const { user, loading } = useContext(AuthContext);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('EMPLOYERS');

  const [metrics, setMetrics] = useState({ users: '—', employers: '—', requests: '—' });

  const [employerData, setEmployerData] = useState(EMPTY_PAGE);
  const [collegeData, setCollegeData] = useState(EMPTY_PAGE);

  const [employerPage, setEmployerPage] = useState(0);
  const [collegePage, setCollegePage] = useState(0);

  const [initialLoading, setInitialLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAdmin = user?.roles?.includes('ADMIN');

  /* fetch all data in parallel */
  const loadAll = useCallback(async (empPage = employerPage, colPage = collegePage, quiet = false) => {
    if (!isAdmin) return;
    if (!quiet) setIsRefreshing(true);
    try {
      const [usersRes, empRes, reqRes, empListRes, colListRes] = await Promise.all([
        apiClient.get('/admin/totalUsers'),
        apiClient.get('/admin/totalEmployers'),
        apiClient.get('/admin/requests'),
        apiClient.get('/admin/requests/employers', { params: { pageOffset: empPage, pageSize: 10 } }),
        apiClient.get('/admin/requests/colleges', { params: { pageOffset: colPage, pageSize: 10 } }),
      ]);

      setMetrics({
        users:     usersRes.data?.data ?? usersRes.data ?? 0,
        employers: empRes.data?.data   ?? empRes.data   ?? 0,
        requests:  reqRes.data?.data   ?? reqRes.data   ?? 0,
      });

      const empPageData = empListRes.data?.data ?? empListRes.data ?? EMPTY_PAGE;
      setEmployerData({ content: empPageData.content ?? [], totalPages: empPageData.totalPages ?? 1 });

      const colPageData = colListRes.data?.data ?? colListRes.data ?? EMPTY_PAGE;
      setCollegeData({ content: colPageData.content ?? [], totalPages: colPageData.totalPages ?? 1 });
    } catch (err) {
      console.error('[Admin] load error', err);
      showToast('Failed to load admin data.', 'error');
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [isAdmin, employerPage, collegePage, showToast]);

  /* initial load */
  useEffect(() => { loadAll(0, 0, false); }, [isAdmin]);

  /* paginate employer list */
  useEffect(() => {
    if (initialLoading || !isAdmin) return;
    const refetch = async () => {
      try {
        const res = await apiClient.get('/admin/requests/employers', { params: { pageOffset: employerPage, pageSize: 10 } });
        const d = res.data?.data ?? res.data ?? EMPTY_PAGE;
        setEmployerData({ content: d.content ?? [], totalPages: d.totalPages ?? 1 });
      } catch {}
    };
    refetch();
  }, [employerPage]);

  /* paginate college list */
  useEffect(() => {
    if (initialLoading || !isAdmin) return;
    const refetch = async () => {
      try {
        const res = await apiClient.get('/admin/requests/colleges', { params: { pageOffset: collegePage, pageSize: 10 } });
        const d = res.data?.data ?? res.data ?? EMPTY_PAGE;
        setCollegeData({ content: d.content ?? [], totalPages: d.totalPages ?? 1 });
      } catch {}
    };
    refetch();
  }, [collegePage]);

  const handleApprove = async (item) => {
    setIsActing(true);
    try {
      if (activeTab === 'EMPLOYERS') {
        await apiClient.post(`/admin/onBoardNewEmployer/${item.userId}`, item);
      } else {
        await apiClient.post(`/admin/onBoardNewCollege/${item.userId}`, item);
      }
      showToast('Request approved.', 'success');
      await loadAll(employerPage, collegePage, true);
    } catch {
      showToast('Failed to approve request.', 'error');
    } finally {
      setIsActing(false);
    }
  };

  const handleReject = async (item) => {
    setIsActing(true);
    try {
      if (activeTab === 'EMPLOYERS') {
        await apiClient.post(`/admin/reject/employer/${item.userId}`, item);
      } else {
        await apiClient.post(`/admin/reject/college/${item.userId}`, item);
      }
      showToast('Request rejected.', 'success');
      await loadAll(employerPage, collegePage, true);
    } catch {
      showToast('Failed to reject request.', 'error');
    } finally {
      setIsActing(false);
    }
  };

  /* ── guards ── */
  if (loading || initialLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-9 h-9 rounded-xl bg-[#241E1A] animate-spin mx-auto" />
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Initialising Admin Node…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const activeData      = activeTab === 'EMPLOYERS' ? employerData : collegeData;
  const activePage      = activeTab === 'EMPLOYERS' ? employerPage : collegePage;
  const setActivePage   = activeTab === 'EMPLOYERS' ? setEmployerPage : setCollegePage;

  return (
    /* full-viewport column layout */
    <div className="flex flex-col bg-[#FDFBF7]" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* ── header ── */}
      <div className="border-b border-[#EAE2D5] px-6 lg:px-10 py-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#241E1A] flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#FDFBF7]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[#241E1A]">Admin Control Panel</h1>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest">Platform management &amp; onboarding</p>
          </div>
        </div>
        <button
          onClick={() => loadAll(employerPage, collegePage, false)}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#241E1A] border border-[#EAE2D5] rounded-lg hover:bg-[#F4ECE1] transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── metrics row ── */}
      <div className="grid grid-cols-3 gap-4 px-6 lg:px-10 py-6 shrink-0">
        <MetricCard label="Total Users"       value={metrics.users}     icon={Users}     />
        <MetricCard label="Verified Employers" value={metrics.employers} icon={Briefcase} />
        <MetricCard label="Pending Requests"  value={metrics.requests}  icon={FileText}  accent="bg-amber-500" />
      </div>

      {/* ── request panel ── grows to fill remaining space ── */}
      <div className="flex-1 flex flex-col mx-6 lg:mx-10 mb-8 border border-[#EAE2D5] rounded-2xl overflow-hidden">

        {/* tab bar */}
        <div className="flex shrink-0 border-b border-[#EAE2D5] bg-[#FAF6F0]">
          {[
            { key: 'EMPLOYERS', label: 'Employers', icon: Building,       count: employerData.content.length },
            { key: 'COLLEGES',  label: 'Colleges',  icon: GraduationCap,  count: collegeData.content.length  },
          ].map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-7 py-4 text-xs font-bold uppercase tracking-wider transition-colors
                  ${active
                    ? 'text-[#241E1A] bg-white border-r border-[#EAE2D5]'
                    : 'text-stone-500 hover:text-[#241E1A] hover:bg-[#F4ECE1]'
                  }`}
              >
                {active && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#241E1A]" />}
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${active ? 'bg-[#241E1A] text-white' : 'bg-[#EAE2D5] text-stone-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* content area — fixed, no height changes on switch */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          {/* acting overlay — subtle, doesn't cause resize */}
          {isActing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="w-6 h-6 rounded-lg bg-[#241E1A] animate-spin" />
            </div>
          )}

          {/* Both tab contents are always rendered but only one is visible.
              This is the key trick: no mount/unmount → no layout shift. */}
          <div className={`flex-1 flex flex-col overflow-hidden absolute inset-0 transition-opacity duration-150 ${activeTab === 'EMPLOYERS' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <TabContent
              data={employerData.content}
              tab="EMPLOYERS"
              page={employerPage}
              totalPages={employerData.totalPages}
              onPageChange={setEmployerPage}
              onApprove={handleApprove}
              onReject={handleReject}
              isActing={isActing}
            />
          </div>

          <div className={`flex-1 flex flex-col overflow-hidden absolute inset-0 transition-opacity duration-150 ${activeTab === 'COLLEGES' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <TabContent
              data={collegeData.content}
              tab="COLLEGES"
              page={collegePage}
              totalPages={collegeData.totalPages}
              onPageChange={setCollegePage}
              onApprove={handleApprove}
              onReject={handleReject}
              isActing={isActing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
