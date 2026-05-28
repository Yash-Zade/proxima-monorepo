import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Briefcase, Mail, Home, User as UserIcon, MapPin, Globe, GraduationCap, Target } from "lucide-react";
import WalletComponent from "../Wallet/Wallet";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import apiClient from '../Auth/ApiClient';
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const CollegeDashboard = () => {
  const [collegeProfile, setCollegeProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    website: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, studentsRes] = await Promise.all([
          apiClient.get('/college/profile'),
          apiClient.get('/college/student')
        ]);
        setCollegeProfile(profileRes.data.data);
        const studentData = studentsRes.data.data || [];
        setStudents(studentData);
        setFilteredStudents(studentData);
      } catch (err) {
        console.error("Failed to fetch college dashboard data", err);
        const errorData = err.response?.data;
        if (err.response?.status === 409 ||
          errorData?.error?.message?.includes("ONBOARDING_PENDING") ||
          errorData?.message?.includes("ONBOARDING_PENDING")) {
          setError("submitted");
        } else if (err.response && err.response.status === 404) {
          setError("not_onboarded");
        } else {
          setError("api_failed");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = students;
    if (searchQuery) {
      result = result.filter(s =>
        s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      result = result.filter(s =>
        s.applicant?.jobApplications?.some(app => app.applicationStatus === statusFilter)
      );
    }
    setFilteredStudents(result);
  }, [searchQuery, statusFilter, students]);

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/users/request/college', formData);
      setError("submitted");
      setShowOnboarding(false);
    } catch (err) {
      console.error("Onboarding failed", err);
      alert("Failed to initialize institution. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-zinc-900 border-t-zinc-100 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium font-sans">Accessing Institutional Database...</p>
      </div>
    );
  }

  if (error === "submitted") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center backdrop-blur-sm shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="text-emerald-400" size={40} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Request Processed</h2>
          <p className="text-zinc-500 text-sm mb-8">Your institution onboarding request has been logged. Our administration will verify and activate your node shortly.</p>
          <Button onClick={() => window.location.href = '/'} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold h-12 rounded-xl border border-zinc-700">
            Return to Nexus
          </Button>
        </div>
      </div>
    );
  }

  if (error === "not_onboarded" || !collegeProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 border border-zinc-700">
              <GraduationCap className="text-zinc-500" size={40} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Initialize Institution</h2>
            <p className="text-zinc-500 text-sm">You haven't registered your college node yet. Complete the onboarding to access the dashboard.</p>
          </div>

          <form onSubmit={handleOnboardSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Institution Name</label>
              <Input
                placeholder="e.g. Stanford University"
                className="bg-zinc-800 border-zinc-700 text-white h-12"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Website</label>
                <Input
                  type="url"
                  placeholder="https://..."
                  className="bg-zinc-800 border-zinc-700 text-white h-12"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Contact Email</label>
                <Input
                  type="email"
                  placeholder="admin@..."
                  className="bg-zinc-800 border-zinc-700 text-white h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Physical Address</label>
              <Input
                placeholder="City, State, Country"
                className="bg-zinc-800 border-zinc-700 text-white h-12"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-zinc-50 hover:bg-white text-zinc-950 font-black h-12 mt-4 rounded-xl shadow-lg shadow-white/5 transition-all hover:scale-[1.02]">
              Start Institution Log
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      "Applied": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Under Review": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      "Interview": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Accepted": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      "Rejected": "bg-red-500/10 text-red-400 border-red-500/20"
    };
    return colors[status] || "bg-zinc-800 text-zinc-400 border-zinc-700";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-20 font-sans">
      {/* Hero Section */}
      <div className="relative h-72 w-full bg-gradient-to-br from-zinc-800 to-zinc-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-zinc-950 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-40 relative z-10">
        {/* College Profile Header */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
          <div className="flex-1 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-40 h-40 rounded-3xl bg-zinc-900 border-4 border-zinc-950 flex items-center justify-center shadow-2xl ring-1 ring-zinc-700">
              <GraduationCap className="w-20 h-20 text-zinc-500" />
            </div>
            <div className="pt-4">
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{collegeProfile.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-zinc-400 text-sm font-medium">
                <div className="flex items-center gap-2"><MapPin size={16} /> {collegeProfile.address}</div>
                <div className="flex items-center gap-2"><Globe size={16} /> {collegeProfile.website || "No Website"}</div>
                <div className="flex items-center gap-2"><Mail size={16} /> {collegeProfile.email}</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center min-w-[200px]">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Treasury Balance</span>
            <WalletComponent />
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Talent Pool", value: students.length, icon: UserIcon, color: "text-blue-400" },
            { label: "Active Applications", value: students.reduce((acc, s) => acc + (s.applicant?.jobApplications?.length || 0), 0), icon: Briefcase, color: "text-purple-400" },
            { label: "Placement Index", value: "92.4%", icon: Target, color: "text-emerald-400" }
          ].map((stat, idx) => (
            <Card key={idx} className="bg-zinc-900/30 border-zinc-800/50 p-6 flex items-center gap-6">
              <div className={`p-4 rounded-2xl bg-zinc-950 border border-zinc-800 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Student Management Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Student Success Nodes</h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                placeholder="Search nodes by name..."
                className="bg-zinc-900 border-zinc-800 text-zinc-300 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="bg-zinc-900 border-zinc-800 text-zinc-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Accepted</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredStudents.length > 0 ? filteredStudents.map((student, idx) => (
              <Card key={idx} className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all group overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-0.5">{student.user?.name}</h3>
                      <p className="text-zinc-500 text-sm flex items-center gap-2"><Mail size={14} /> {student.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {student.applicant?.skills?.slice(0, 3).map((skill, sIdx) => (
                      <Badge key={sIdx} variant="secondary" className="bg-zinc-950 border-zinc-800 text-zinc-400 group-hover:bg-zinc-800 transition-colors">
                        {skill}
                      </Badge>
                    ))}
                    {student.applicant?.skills?.length > 3 && (
                      <span className="text-xs text-zinc-600 flex items-center">+{student.applicant.skills.length - 3} more</span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t border-zinc-800 md:border-t-0 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">Latest Status</p>
                      <Badge className={getStatusColor(student.applicant?.jobApplications?.[0]?.applicationStatus || "None")}>
                        {student.applicant?.jobApplications?.[0]?.applicationStatus || "Inactive"}
                      </Badge>
                    </div>
                    <Button variant="ghost" className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl p-2 h-auto">
                      <ChevronRight size={24} />
                    </Button>
                  </div>
                </div>

                {/* Expandable Application List */}
                <div className="px-6 pb-6 border-t border-zinc-800/30 bg-zinc-950/20 pt-4">
                  <div className="space-y-3">
                    {student.applicant?.jobApplications?.length > 0 ? student.applicant.jobApplications.map((app, appIdx) => (
                      <div key={appIdx} className="flex items-center justify-between text-sm py-2 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800/30">
                        <div className="flex items-center gap-3">
                          <Briefcase size={14} className="text-zinc-600" />
                          <span className="text-zinc-300 font-medium">{app.title || "Software Architect"}</span>
                          <span className="text-zinc-700">•</span>
                          <span className="text-zinc-500">{app.companyName || "Acme Tech"}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(app.applicationStatus)}`}>
                          {app.applicationStatus}
                        </span>
                      </div>
                    )) : (
                      <p className="text-zinc-600 text-xs text-center py-2 italic font-mono">No active application logs found in this sector.</p>
                    )}
                  </div>
                </div>
              </Card>
            )) : (
              <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-600 font-medium">No talent nodes match your current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDashboard;