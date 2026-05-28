import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, Star, Video, Check, Terminal, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import apiClient from "../Auth/ApiClient";

const MentorDashboard = () => {
  const [mentorData, setMentorData] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorProfile();
  }, []);

  const fetchMentorProfile = async () => {
    try {
      const response = await apiClient.get('/mentors/profile');
      setMentorData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch mentor dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSession = async (sessionId) => {
    try {
      // Endpoint mapping according to backend conventions:
      await apiClient.post(`/mentors/sessions/${sessionId}/accept`);

      // Update local state to show 'accepted'/'authorized' visually
      // Assuming sessionLink being set or something indicates authorization
      // For now modify the local copy to reflect change
      setMentorData((prev) => ({
        ...prev,
        sessions: prev.sessions.map((session) =>
          session.sessionId === sessionId
            ? { ...session, sessionLink: "accepted" } // using sessionLink as a proxy for accepted if status missing
            : session
        ),
      }));
      alert("Session authorized successfully.");
    } catch (error) {
      console.error("Failed to authorize session:", error);
      alert("Error authorizing session.");
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-zinc-950 font-sans flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-zinc-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!mentorData) {
    return (
      <div className="pt-24 min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <p className="text-zinc-500 text-lg">No mentor context found or not authorized.</p>
      </div>
    );
  }

  const {
    user = {},
    mentorId,
    expertise = [],
    sessions = [],
    ratings = [],
  } = mentorData;

  const {
    name = "Mentor Name",
    email = "N/A",
    bio = "No operational bio active.",
  } = user || {};

  return (
    <div className="pt-24 min-h-screen bg-zinc-950 font-sans selection:bg-zinc-800 selection:text-white p-4 md:p-6 pb-20 border-t border-zinc-900">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Profile Identity Node */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-5 h-5 text-zinc-500" />
                  <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
                    {name}
                  </h1>
                </div>
                <div className="flex items-center gap-3 text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1 mb-4">
                  <span>ID: MNT-{mentorId}</span>
                  <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                  <span>{email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 max-w-sm justify-end">
                {expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 text-[10px] uppercase font-bold tracking-wider"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Router Tabs */}
        <div className="flex overflow-x-auto bg-zinc-950 rounded-xl border border-zinc-800 p-1.5 gap-1 shadow-sm">
          {["Profile", "Sessions", "Ratings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-semibold tracking-wide ${activeTab === tab.toLowerCase()
                ? "bg-zinc-100 text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Content Module */}
        <div className="min-h-[400px]">
          {activeTab === "profile" && (
            <Card className="bg-zinc-900/40 border-zinc-800 border-dashed">
              <CardHeader className="border-b border-zinc-800/50 pb-5">
                <CardTitle className="text-sm uppercase tracking-widest text-zinc-400">Node Description Data</CardTitle>
                <CardDescription>Professional operational parameters and background.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-zinc-300 leading-relaxed text-sm max-w-3xl whitespace-pre-line">
                  {mentorData.bio || bio}
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "sessions" && (
            <div className="grid gap-4">
              {sessions.length > 0 ? sessions.map((session) => {
                // If there's a session link, treat it as accepted since there's no status 
                const isAccepted = session.sessionLink && session.sessionLink.length > 0;
                return (
                  <Card key={session.sessionId} className="bg-zinc-950 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">

                        {/* Session Details Box */}
                        <div className="flex-1 p-5 md:p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg">
                                <Video className="w-5 h-5 text-zinc-400" />
                              </div>
                              <div>
                                <h3 className="text-zinc-200 font-semibold tracking-tight">Teleconference Block #{session.sessionId}</h3>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-0.5">TYPE: {(session.sessionType || "").replace(/_/g, ' ')}</p>
                              </div>
                            </div>
                            <div className="hidden md:block text-right">
                              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 border border-zinc-800 bg-zinc-900 rounded-md px-2 py-1 inline-block">App. ID: {session.applicantId}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-800/50 text-sm font-medium">
                            <div className="flex items-center space-x-3 text-zinc-400">
                              <Calendar className="w-4 h-4 text-zinc-600" />
                              <span>Start: {formatDateTime(session.sessionStartTime)}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-zinc-400">
                              <Clock className="w-4 h-4 text-zinc-600" />
                              <span>End: {formatDateTime(session.sessionEndTime)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Session Action Control Box */}
                        <div className="bg-zinc-900 p-5 md:p-6 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col justify-center items-center md:items-start min-w-[200px] gap-4">
                          <div className="text-center md:text-left w-full">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">Contract Fee</span>
                            <span className="text-2xl font-mono font-bold text-zinc-200">₹{session.sessionFee}</span>
                          </div>

                          {!isAccepted ? (
                            <Button
                              onClick={() => handleAcceptSession(session.sessionId)}
                              className="w-full bg-zinc-100 hover:bg-zinc-300 text-zinc-900 font-bold"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Authorize Session
                            </Button>
                          ) : (
                            <div className="w-full text-center py-2.5 px-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                              <span className="text-xs uppercase tracking-widest font-bold text-emerald-400 flex items-center justify-center gap-2">
                                Authorized <Check className="w-3 h-3 text-emerald-500" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              }) : (
                <div className="text-zinc-500 text-center py-10">No sessions scheduled.</div>
              )}
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="grid gap-4 md:grid-cols-2">
              {ratings.length > 0 ? ratings.map((rating, i) => (
                <Card key={rating.id || i} className="bg-zinc-950 border-zinc-800">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-1 mb-4">
                        {[
                          ...Array(Math.max(0, Math.floor(rating.rating || 0))),
                        ].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-zinc-200 fill-current"
                          />
                        ))}
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-medium">"{rating.comment || "No comment provided"}"</p>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-zinc-500 col-span-2 text-center py-10">No ratings yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
