import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, Video, X, User as UserIcon, BookOpen, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../Auth/ApiClient";

// Modern Booking Modal based on Shadcn aesthetic
const BookingModal = ({ session, onClose, onSubmit }) => {
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...bookingData, sessionId: session.sessionId });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-50 tracking-tight">Book Session Node</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-all">
              <X className="text-zinc-500 hover:text-zinc-300 w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-1.5">Date Parameter</label>
              <input
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-50 focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700 transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-1.5">Time Parameter</label>
              <input
                type="time"
                value={bookingData.time}
                onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-50 focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700 transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-1.5">Context Variables</label>
              <textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-50 h-24 resize-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700 transition-all outline-none"
                placeholder="Initial problem space..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold h-11"
              >
                Execute Booking
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent border-zinc-800 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 h-11"
              >
                Abort
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const MentorProfile = () => {
  const params = useParams();
  const mentorId = params.id;

  const [mentor, setMentor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorRes, sessionsRes] = await Promise.all([
          apiClient.get(`/public/mentors/${mentorId}`),
          apiClient.get(`/public/sessions`)
        ]);

        setMentor(mentorRes.data.data);
        const allSessions = sessionsRes.data.data?.content || [];
        const mentorSessions = allSessions.filter(s => s.mentorId === parseInt(mentorId));
        setSessions(mentorSessions);
      } catch (error) {
        console.error("Failed to fetch mentor profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mentorId]);

  const handleBookSession = async (bookingData) => {
    try {
      // Endpoint mapping according to backend conventions:
      await apiClient.post(`/applicants/sessions/${bookingData.sessionId}/request`);
      alert(`Session request initiated for session ID: ${bookingData.sessionId}`);
    } catch (error) {
      console.error("Failed to book session:", error);
      alert("Error booking session.");
    } finally {
      setSelectedSession(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-zinc-500">Retrieving node data...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center flex-col">
        <div className="text-zinc-500 text-lg font-medium mb-4">Profile context not found.</div>
      </div>
    );
  }

  const mentorName = mentor.user?.name || "Unknown Mentor";

  return (
    <div className="pt-32 pb-20 min-h-screen bg-zinc-950 text-zinc-50 px-6 sm:px-12 selection:bg-zinc-800 selection:text-white font-sans flex justify-center">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">

        {/* Profile Section */}
        <div className="flex-1 space-y-6">
          <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl p-2 h-full">
            <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-zinc-800/50 mb-6">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border border-zinc-800 bg-zinc-900 shadow-lg">
                <AvatarImage src="" alt={mentorName} />
                <AvatarFallback className="bg-zinc-900 text-zinc-300 text-2xl font-semibold">
                  {mentorName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center sm:text-left flex-1 mt-2">
                <CardTitle className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  {mentorName}
                </CardTitle>
                <p className="text-lg text-zinc-300 font-medium">Mentor Authority</p>
                {mentor.user?.roles && (
                  <p className="text-zinc-500 flex items-center justify-center sm:justify-start mt-1 space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    <span>Role Hash: {mentor.user.roles}</span>
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-10">

              {/* Expertise Section */}
              <div>
                <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                  <Award size={20} className="text-zinc-500" />
                  Expertise Capabilities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise && mentor.expertise.length > 0 ? mentor.expertise.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 bg-zinc-900 border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-800"
                    >
                      {skill}
                    </Badge>
                  )) : <span className="text-zinc-500">Unspecified capabilities</span>}
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-zinc-500" />
                  Context Variables
                </h2>
                <p className="text-zinc-400 leading-relaxed bg-zinc-950 border border-zinc-800/60 p-5 rounded-xl whitespace-pre-line">
                  {mentor.bio || "No expanded bio profile is loaded for this node."}
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Session Booking Section */}
        <div className="lg:w-96">
          <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl p-2 lg:sticky lg:top-24">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">Active Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.length > 0 ? sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:bg-zinc-900 transition-all duration-300 group"
                >
                  <h3 className="font-semibold text-lg text-zinc-100 mb-3">{session.sessionType || "1-on-1"}</h3>
                  <div className="flex flex-col gap-2 text-sm text-zinc-500 mb-5">
                    <span className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1.5 rounded-md break-all">
                      <Clock size={14} className="flex-shrink-0" />
                      {new Date(session.sessionStartTime).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1.5 rounded-md">
                      <Video size={14} />
                      Remote Link: {session.sessionLink ? "Available" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                    <span className="text-xl font-bold text-zinc-50">${session.sessionFee}</span>
                    <Button
                      onClick={() => setSelectedSession(session)}
                      className="bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold px-6"
                    >
                      Initialize
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-zinc-500 text-center py-10 bg-zinc-950 border border-zinc-800/50 rounded-xl">
                  No availability windows detected for this mentor.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedSession && (
        <BookingModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSubmit={handleBookSession}
        />
      )}
    </div>
  );
};

export default MentorProfile;