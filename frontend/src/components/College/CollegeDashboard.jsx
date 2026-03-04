import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Briefcase, Mail, Home, User as UserIcon, MapPin, Globe, GraduationCap } from "lucide-react";
import WalletComponent from "../Wallet/Wallet";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import apiClient from '../Auth/ApiClient';

const CollegeDashboard = () => {
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [collegeProfile, setCollegeProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, studentsRes] = await Promise.all([
          apiClient.get('/college/profile'),
          apiClient.get('/college/student')
        ]);

        // ApiResponse wrapper check: { data: { ... } }
        setCollegeProfile(profileRes.data.data);
        setStudents(studentsRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch college dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !collegeProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-100 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Synchronizing Academic Dataset...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      "Applied": "bg-zinc-800 text-zinc-300 border-zinc-700",
      "Under Review": "bg-yellow-900/20 text-yellow-400 border-yellow-900/50",
      "Interview": "bg-blue-900/20 text-blue-400 border-blue-900/50",
      "Accepted": "bg-emerald-900/20 text-emerald-400 border-emerald-900/50",
      "Rejected": "bg-red-900/20 text-red-400 border-red-900/50"
    };
    return colors[status] || "bg-zinc-800 text-zinc-400 border-zinc-700";
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20 selection:bg-zinc-800 selection:text-white font-sans">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl p-2 mb-8">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-zinc-800/50">
            <h1 className="text-2xl font-bold text-zinc-50 flex items-center tracking-tight">
              <GraduationCap className="mr-3 text-zinc-400" size={28} />
              {collegeProfile.name}
            </h1>
            <div className="mt-4 md:mt-0">
              <WalletComponent />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center text-zinc-400 mb-3 space-x-2">
                  <MapPin className="text-zinc-500" size={16} />
                  <span className="font-medium">{collegeProfile.address}</span>
                </div>
                <div className="flex items-center text-zinc-400 mb-4 space-x-2">
                  <Globe className="text-zinc-500" size={16} />
                  <span className="font-medium">{collegeProfile.website || 'N/A'}</span>
                </div>
                <div className="flex items-center text-zinc-400 mb-4 space-x-2">
                  <Mail className="text-zinc-500" size={16} />
                  <span className="font-medium">{collegeProfile.email}</span>
                </div>
              </div>

              <div>
                <Card className="bg-zinc-950 border-zinc-800 shadow-none h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm tracking-wider uppercase text-zinc-400 font-semibold">
                      Operational Telemetry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-3">
                      <span className="text-zinc-400">Total Enrolled Nodes</span>
                      <span className="text-zinc-50 font-medium">{students?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-3">
                      <span className="text-zinc-400">Placement Rate</span>
                      <span className="text-zinc-50 font-medium">92%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Job Applications Dashboard */}
        <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl p-2 pt-6">
          <CardHeader className="p-6 pt-0 pb-4 border-b border-zinc-800/50 mb-4">
            <CardTitle className="text-xl font-bold text-zinc-50 tracking-tight">Active Monitored Nodes (Students)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {students.map((student, index) => (
              <div key={student.id || index} className="border-b border-zinc-800/50 last:border-b-0">
                <div
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-zinc-900/50 transition-colors duration-200"
                  onClick={() => setExpandedStudent(expandedStudent === index ? null : index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                      <UserIcon className="text-zinc-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-zinc-100 font-bold mb-1">{student.user?.name || 'Unknown Student'}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 font-medium">
                        <div className="flex items-center">
                          <Mail size={14} className="mr-1.5 text-zinc-600" />
                          {student.user?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  {expandedStudent === index ?
                    <ChevronDown className="text-zinc-400" size={20} /> :
                    <ChevronRight className="text-zinc-400" size={20} />
                  }
                </div>

                {expandedStudent === index && (
                  <div className="p-6 pt-0 border-t border-zinc-800/30 bg-zinc-950/20">
                    <div className="overflow-x-auto mt-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-950">
                            <th className="py-3 px-5 text-xs tracking-wider uppercase text-zinc-500 font-semibold border-b border-zinc-800">Target Organization</th>
                            <th className="py-3 px-5 text-xs tracking-wider uppercase text-zinc-500 font-semibold border-b border-zinc-800">Assigned Role</th>
                            <th className="py-3 px-5 text-xs tracking-wider uppercase text-zinc-500 font-semibold border-b border-zinc-800">Current Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {student.applicant?.jobApplications?.length > 0 ? (
                            student.applicant.jobApplications.map((app, appIndex) => (
                              <tr key={app.applicationId || appIndex} className="hover:bg-zinc-900/50 transition-colors duration-200">
                                <td className="py-4 px-5 text-zinc-100 font-medium text-sm">
                                  <div className="flex items-center">
                                    <Briefcase size={14} className="mr-2 text-zinc-500" />
                                    {app.job?.companyName || 'N/A'}
                                  </div>
                                </td>
                                <td className="py-4 px-5 text-zinc-300 text-sm whitespace-nowrap">{app.job?.title || 'N/A'}</td>
                                <td className="py-4 px-5 text-sm">
                                  <Badge variant="outline" className={`font-semibold tracking-wide border px-2.5 py-0.5 rounded-full ${getStatusColor(app.applicationStatus)}`}>
                                    {app.applicationStatus}
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="py-8 text-center text-zinc-600 text-xs uppercase tracking-widest font-medium">No active application payloads discovered.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollegeDashboard;