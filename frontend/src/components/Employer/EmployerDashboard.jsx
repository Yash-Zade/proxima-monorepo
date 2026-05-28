import React, { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Mail,
  User2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
} from "lucide-react";
import WalletComponent from "../Wallet/Wallet";
import apiClient from "../Auth/ApiClient";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

// Status badge component mapping to strict zinc system
const StatusBadge = ({ status }) => {
  if (!status) return null;
  const isPositive = ["OPEN", "ACCEPTED", "ACTIVE"].includes(status);
  const isNeutral = ["DRAFT", "APPLIED", "SHORTLISTED"].includes(status);
  const isNegative = ["CLOSED", "WITHDRAWN", "REJECTED", "CLOSED_JOB"].includes(status);

  let variant = "outline";
  if (isPositive) variant = "default"; // Usually green, now zinc-100 logic
  else if (isNegative) variant = "destructive"; // Red
  else if (isNeutral) variant = "secondary"; // Grey fill

  return (
    <Badge variant={variant} className="px-2 py-0.5 text-[10px] tracking-wider font-semibold uppercase">
      {status.replace('_', ' ')}
    </Badge>
  );
};

const EmployerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const resp = await apiClient.get('/employers/profile');
      setProfile(resp.data.data);
    } catch (err) {
      console.error("Failed to fetch employer profile:", err);
      setError("Failed to load profile. Please check your credentials.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && profile.employerId) {
      fetchJobs();
    }
  }, [profile, currentPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.get(`/employers/${profile.employerId}/jobs?pageOffset=${currentPage}&pageSize=${pageSize}`);
      setJobs(resp.data.data?.content || []);
      setTotalPages(resp.data.data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError("Failed to fetch job postings.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    setIsApplicationsModalOpen(true);
    try {
      // jobId maps to either id or jobId depending on DTO
      const jobId = job.jobId || job.id;
      const resp = await apiClient.get(`/employers/jobs/${jobId}/applications`);
      // Since JobApplicationDTO lacks applicantName, we might only have applicantId
      setApplications(resp.data.data?.content || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const handleToggleJobStatus = async (job) => {
    const jobId = job.jobId || job.id;
    try {
      if (job.status === "OPEN" || job.jobStatus === "OPEN") {
        await apiClient.post(`/employers/jobs/${jobId}/close`);
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            (j.jobId || j.id) === jobId
              ? { ...j, status: "CLOSED", jobStatus: "CLOSED" }
              : j
          )
        );
      } else {
        // Assume backend allows PUT updates for status
        await apiClient.put(`/employers/jobs/${jobId}`, { status: "OPEN", jobStatus: "OPEN" });
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            (j.jobId || j.id) === jobId
              ? { ...j, status: "OPEN", jobStatus: "OPEN" }
              : j
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert("Error toggling job status.");
    }
  };

  const handleToggleApplicationStatus = async (applicationId, currentStatus) => {
    const nextStatus = toggleStatus(currentStatus);
    try {
      await apiClient.post(`/employers/applications/${applicationId}/status?status=${nextStatus}`);
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          (app.applicationId || app.id) === applicationId
            ? { ...app, applicationStatus: nextStatus, status: nextStatus }
            : app
        )
      );
    } catch (err) {
      console.error("Failed to update application status:", err);
      alert("Error updating application status.");
    }
  };

  const toggleStatus = (currentStatus) => {
    const statusFlow = {
      APPLIED: "SHORTLISTED",
      SHORTLISTED: "ACCEPTED",
      ACCEPTED: "CLOSED",
      REJECTED: "WITHDRAWN",
      WITHDRAWN: "APPLIED",
      OPEN: "CLOSED",
      CLOSED: "OPEN",
    };
    return statusFlow[currentStatus] || "SHORTLISTED";
  };

  const getNextStatusText = (currentStatus) => {
    const statusFlow = {
      APPLIED: "Shortlist",
      SHORTLISTED: "Accept",
      ACCEPTED: "Close",
      REJECTED: "Withdraw",
      WITHDRAWN: "Apply",
    };
    return statusFlow[currentStatus] || "Shortlist";
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
          <p className="tracking-widest uppercase text-sm font-semibold text-zinc-500 animate-pulse">Initializing Data Stream...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex items-center justify-center p-4">
        <p className="text-red-400 font-mono text-sm border border-red-900/50 bg-red-950/20 p-4 rounded-lg">ERR: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white pb-20">

      <div className="max-w-7xl mx-auto space-y-8 px-6 pt-24">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              Enterprise Hub
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
              Manage corporate node details, open positions, and review application streams from the network.
            </p>
          </div>
          <div className="w-full md:w-auto p-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl min-w-[300px]">
            <WalletComponent />
          </div>
        </div>

        {/* Profile Section */}
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-md">
          <CardHeader className="border-b border-zinc-800/50 pb-5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-zinc-400" />
              Corporate Operator Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="flex items-start flex-col gap-1.5 p-3 rounded-lg hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800/50">
                  <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 flex items-center gap-2"><Building2 className="w-4 h-4" /> Entity Name</p>
                  <p className="text-[15px] font-medium text-zinc-200">{profile?.companyName}</p>
                </div>

                <div className="flex items-start flex-col gap-1.5 p-3 rounded-lg hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800/50">
                  <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 flex items-center gap-2"><Globe className="w-4 h-4" /> Domain</p>
                  <p className="text-[15px] font-medium text-zinc-200 font-mono tracking-tight cursor-pointer hover:underline underline-offset-4 decoration-zinc-700">
                    {profile?.companyWebsite}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-start flex-col gap-1.5 p-3 rounded-lg hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800/50">
                  <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 flex items-center gap-2"><User2 className="w-4 h-4" /> Primary Contact</p>
                  <p className="text-[15px] font-medium text-zinc-200">{profile?.user?.name}</p>
                </div>

                <div className="flex items-start flex-col gap-1.5 p-3 rounded-lg hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800/50">
                  <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 flex items-center gap-2"><Mail className="w-4 h-4" /> Communication Address</p>
                  <p className="text-[15px] font-medium text-zinc-200">{profile?.user?.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List Section */}
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-md">
          <CardHeader className="border-b border-zinc-800/50 pb-5 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-zinc-400" />
                Active Postings
              </CardTitle>
              <CardDescription>Review and manage all corporate network jobs.</CardDescription>
            </div>
            <Button variant="default" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 font-semibold" asChild>
              <Link to="/addJob">Deploy New Node</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-900/80 text-xs uppercase text-zinc-500 font-bold border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 tracking-wider">Position Title</th>
                    <th className="px-6 py-4 tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right tracking-wider">Execution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {jobs.length > 0 ? jobs.map((job) => (
                    <tr key={job.jobId || job.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-5 font-semibold text-zinc-200 text-[15px]">{job.title || job.jobTitle}</td>
                      <td className="px-6 py-5">
                        <StatusBadge status={job.jobStatus || job.status} />
                      </td>
                      <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 text-xs"
                          onClick={() => handleViewApplications(job)}
                        >
                          Applications
                        </Button>
                        <Button
                          variant={(job.status === "OPEN" || job.jobStatus === "OPEN") ? "destructive" : "secondary"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleJobStatus(job);
                          }}
                          className="text-xs"
                        >
                          {(job.status === "OPEN" || job.jobStatus === "OPEN") ? "Halt" : "Re-open"}
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No postings recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-between items-center p-6 bg-zinc-900/30 border-t border-zinc-800/50">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                  Page {(currentPage + 1)} / {totalPages}
                </p>
                <div className="flex items-center space-x-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="w-8 h-8 rounded-lg border-zinc-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="w-8 h-8 rounded-lg border-zinc-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications Modal */}
        {isApplicationsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="bg-zinc-950 border-zinc-800 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              <CardHeader className="border-b border-zinc-800 flex flex-row items-center justify-between py-4 bg-zinc-900/50">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Packet Stream: {selectedJob?.title || selectedJob?.jobTitle}</CardTitle>
                  <CardDescription>Managing applicants for selected node.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="hover:bg-zinc-800 text-zinc-400" onClick={() => setIsApplicationsModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <div className="overflow-y-auto flex-1 p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-900 text-xs uppercase text-zinc-500 font-bold sticky top-0 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 tracking-wider">Candidate Node (App ID)</th>
                      <th className="px-6 py-4 tracking-wider">Stage</th>
                      <th className="px-6 py-4 text-right tracking-wider">Decision Matrix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {applications.length > 0 ? applications.map((application) => (
                      <tr key={application.applicationId || application.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-zinc-200 text-xs font-mono">
                          ID: {application.applicantId || application.applicantName}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={application.applicationStatus || application.status} />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            onClick={() => handleToggleApplicationStatus(application.applicationId || application.id, application.applicationStatus || application.status)}
                          >
                            Progress: {getNextStatusText(application.applicationStatus || application.status)}
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No applications found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;