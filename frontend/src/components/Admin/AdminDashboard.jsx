import React, { useEffect, useState } from "react";
import { Users, Settings, Bell, Search, UserCog, Shield, Activity, X, Check } from "lucide-react";
import WalletComponent from "../Wallet/Wallet";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import apiClient from "../Auth/ApiClient";

// Settings Modal Component refactored into zinc modal design
const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-zinc-950 border-zinc-800 shadow-2xl w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 hover:bg-zinc-900 text-zinc-400 rounded-lg"
        >
          <X className="w-5 h-5" />
        </Button>
        <CardHeader className="border-b border-zinc-800 pb-5">
          <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-400" />
            System Configurations
          </CardTitle>
          <CardDescription className="text-zinc-500">Tune global parameters for node management.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">Notice Threshold</label>
              <select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm font-medium text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors">
                <option value="all">Stream All Events</option>
                <option value="important">Critical Alerts Only</option>
                <option value="none">Mute Activity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">Automated Digests</label>
              <select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm font-medium text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors">
                <option value="daily">Daily Cron</option>
                <option value="weekly">Weekly Rollup</option>
                <option value="monthly">Monthly Snapshot</option>
              </select>
            </div>
            <Button className="w-full bg-zinc-100 hover:bg-zinc-300 text-zinc-900 font-bold mt-4" onClick={onClose}>
              Commit Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    totalMentors: 0,
    totalRequests: 0,
  });

  const [employerRequests, setEmployerRequests] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [
        usersRes,
        employersRes,
        mentorsRes,
        requestsRes,
        empReqRes,
        mentReqRes
      ] = await Promise.all([
        apiClient.get('/admin/totalUsers'),
        apiClient.get('/admin/totalEmployers'),
        apiClient.get('/admin/totalMentors'),
        apiClient.get('/admin/requests'),
        apiClient.get('/admin/requests/employers?pageOffset=0&pageSize=50'),
        apiClient.get('/admin/requests/mentors?pageOffset=0&pageSize=50'),
      ]);

      setMetrics({
        totalUsers: usersRes.data.data || 0,
        totalEmployers: employersRes.data.data || 0,
        totalMentors: mentorsRes.data.data || 0,
        totalRequests: requestsRes.data.data || 0,
      });

      setEmployerRequests(empReqRes.data.data?.content || []);
      setMentorRequests(mentReqRes.data.data?.content || []);
    } catch (err) {
      console.error("Failed to load admin data", err);
      setError("Failed to initialize secure uplink.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEmployer = async (request) => {
    try {
      await apiClient.post(`/admin/onBoardNewEmployer/${request.userId}`, request);
      alert("Employer authorized successfully.");
      fetchAdminData();
    } catch (err) {
      console.error("Error approving employer", err);
      alert("Error approving employer");
    }
  };

  const handleRejectEmployer = async (request) => {
    if (!window.confirm("Reject this employer node?")) return;
    try {
      await apiClient.post(`/admin/reject/employer/${request.userId}`, request);
      alert("Employer rejected.");
      fetchAdminData();
    } catch (err) {
      console.error("Error rejecting employer", err);
      alert("Error rejecting employer");
    }
  };

  const handleApproveMentor = async (request) => {
    try {
      await apiClient.post(`/admin/onBoardNewMentor/${request.userId}`, request);
      alert("Mentor authorized successfully.");
      fetchAdminData();
    } catch (err) {
      console.error("Error approving mentor", err);
      alert("Error approving mentor");
    }
  };

  const handleRejectMentor = async (request) => {
    if (!window.confirm("Reject this mentor node?")) return;
    try {
      await apiClient.post(`/admin/reject/mentor/${request.userId}`, request);
      alert("Mentor rejected.");
      fetchAdminData();
    } catch (err) {
      console.error("Error rejecting mentor", err);
      alert("Error rejecting mentor");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
          <p className="tracking-widest uppercase text-sm font-semibold text-zinc-500 animate-pulse">Establishing Secure Uplink...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex items-center justify-center p-4">
        <p className="text-red-400 font-mono text-sm border border-red-900/50 bg-red-950/20 p-4 rounded-lg">SYS_ERR: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-24 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-zinc-400" />
              Administrative Root
            </h1>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider">Root Operator // Network Management</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search network registers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors placeholder-zinc-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
            </div>

            <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 shadow-sm hidden md:block">
              <WalletComponent />
            </div>

            <Button variant="outline" size="icon" className="border-zinc-800 hover:bg-zinc-900 text-zinc-400 h-11 w-11 rounded-lg" onClick={() => setShowSettings(true)}>
              <Settings className="w-5 h-5" />
            </Button>

            <Button variant="outline" size="icon" className="border-zinc-800 hover:bg-zinc-900 text-zinc-400 h-11 w-11 rounded-lg relative">
              <Bell className="w-5 h-5" />
              {metrics.totalRequests > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-zinc-900"></span>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Metrics Telemetry */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Total Users</p>
                  <Users className="w-4 h-4 text-zinc-600" />
                </div>
                <p className="text-3xl font-bold text-zinc-100 tracking-tight">{metrics.totalUsers}</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Employers</p>
                  <Activity className="w-4 h-4 text-zinc-600" />
                </div>
                <p className="text-3xl font-bold text-zinc-100 tracking-tight">{metrics.totalEmployers}</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Mentors</p>
                  <Bell className="w-4 h-4 text-zinc-600" />
                </div>
                <p className="text-3xl font-bold text-zinc-100 tracking-tight">{metrics.totalMentors}</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Pending Auth</p>
                  <UserCog className="w-4 h-4 text-zinc-600" />
                </div>
                <p className="text-3xl font-bold text-zinc-100 tracking-tight">{metrics.totalRequests}</p>
              </CardContent>
            </Card>
          </div>

          {/* Operator Profile */}
          <div className="md:col-span-4 h-full">
            <Card className="bg-zinc-900/50 border-zinc-800 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-zinc-200">Session Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">Operator Node</span>
                  <span className="text-sm font-mono text-zinc-300">ADMIN-ROOT</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">Status</span>
                  <span className="text-sm font-medium text-emerald-400">Authenticated Uplink Active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Requests Stream */}
          <div className="md:col-span-12 mt-2 space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="border-b border-zinc-800 pb-5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-zinc-400" />
                  Employer Authorization Queue
                </CardTitle>
                <CardDescription>Nodes requesting enterprise hub access.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-600 font-bold border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 tracking-wider">User Node ID</th>
                        <th className="px-6 py-4 tracking-wider">Entity Name</th>
                        <th className="px-6 py-4 tracking-wider">Domain</th>
                        <th className="px-6 py-4 tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 font-mono">
                      {employerRequests.length > 0 ? employerRequests.map((req, i) => (
                        <tr key={req.userId || i} className="hover:bg-zinc-900 transition-colors">
                          <td className="px-6 py-4 text-zinc-400 text-xs">USR-{req.userId || "UNKNOWN"}</td>
                          <td className="px-6 py-4 text-zinc-300 text-sm font-sans font-medium">{req.companyName}</td>
                          <td className="px-6 py-4 text-zinc-500 text-xs">{req.companyWebsite}</td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 border-zinc-700 hover:bg-zinc-800" onClick={() => handleApproveEmployer(req)}>
                              <Check className="w-4 h-4 mr-1 text-emerald-400" /> Accept
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => handleRejectEmployer(req)}>
                              Reject
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-6 text-center text-zinc-500 font-sans">No pending employer requests.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="border-b border-zinc-800 pb-5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-zinc-400" />
                  Mentor Authorization Queue
                </CardTitle>
                <CardDescription>Nodes requesting mentoring operator privileges.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-600 font-bold border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 tracking-wider">User Node ID</th>
                        <th className="px-6 py-4 tracking-wider">Experience</th>
                        <th className="px-6 py-4 tracking-wider">Expertise Variables</th>
                        <th className="px-6 py-4 tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 font-mono">
                      {mentorRequests.length > 0 ? mentorRequests.map((req, i) => (
                        <tr key={req.userId || i} className="hover:bg-zinc-900 transition-colors">
                          <td className="px-6 py-4 text-zinc-400 text-xs">USR-{req.userId || "UNKNOWN"}</td>
                          <td className="px-6 py-4 text-zinc-300 text-sm">{req.experience} yrs</td>
                          <td className="px-6 py-4 text-zinc-500 text-xs">
                            <div className="flex flex-wrap gap-1">
                              {(req.expertise || []).map((exp, idx) => (
                                <span key={idx} className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-300">
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 border-zinc-700 hover:bg-zinc-800" onClick={() => handleApproveMentor(req)}>
                              <Check className="w-4 h-4 mr-1 text-emerald-400" /> Accept
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => handleRejectMentor(req)}>
                              Reject
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-6 text-center text-zinc-500 font-sans">No pending mentor requests.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default AdminDashboard;