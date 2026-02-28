import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, X, User, BookOpen, Award } from 'lucide-react';

// Gradient orb for background flair
const GradientOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-30 ${className}`} />
);

// Mock data
const DUMMY_MENTOR = {
  mentorId: 1,
  expertise: ["React", "JavaScript", "System Design", "Career Guidance"],
  user: {
    name: "Dr. Arjun Patel",
    title: "Senior Software Architect",
    email: "arjun.patel@example.com",
    bio: "15+ years of experience in software development and architecture. Passionate about mentoring and helping others grow in their tech careers.",
    company: "Tech Innovate India",
    imageUrl: null
  },
  sessions: [
    {
      id: 1,
      title: "One-on-One Mentorship",
      duration: "60 min",
      price: 150.00,
      type: "ONE_ON_ONE"
    },
    {
      id: 2,
      title: "Code Review Session",
      duration: "45 min",
      price: 120.00,
      type: "ONE_ON_ONE"
    }
  ]
};

// Modern Booking Modal
const BookingModal = ({ session, onClose, onSubmit }) => {
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...bookingData, sessionId: session.id });
  };

  return (
    <div className=" fixed inset-0 bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-2xl rounded-3xl p-8 border border-gray-700/50 shadow-xl transform transition-all duration-300 scale-100 hover:scale-102">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Book Your Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800/50 rounded-full transition-all">
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-200 font-medium mb-2">Pick a Date</label>
            <input
              type="date"
              value={bookingData.date}
              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-gray-200 font-medium mb-2">Choose a Time</label>
            <input
              type="time"
              value={bookingData.time}
              onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-gray-200 font-medium mb-2">Add Notes</label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white h-28 resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="What would you like to focus on?"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
            >
              Book Now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-800/50 rounded-lg font-semibold text-gray-300 hover:bg-gray-700/50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MentorProfile = () => {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setMentor(DUMMY_MENTOR);
      setLoading(false);
    }, 500);
  }, []);

  const handleBookSession = async (bookingData) => {
    console.log('Booking session:', bookingData);
    setSelectedSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-xl font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-950 text-white p-6 relative overflow-hidden">
      {/* Gradient Orbs */}
      <GradientOrb className="w-72 h-72 bg-cyan-500/50 -left-36 -top-36" />
      <GradientOrb className="w-96 h-96 bg-purple-500/50 -right-48 -bottom-48" />

      <div className="max-w-6xl mx-auto relative">
        <div className="pt-20 flex flex-col lg:flex-row gap-8">
          {/* Profile Section */}
          <div className="flex-1">
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50 shadow-2xl transform transition-all duration-300 hover:shadow-cyan-500/20">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
                <div className="w-28 h-28 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User size={40} className="text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
                    {mentor.user.name}
                  </h1>
                  <p className="text-lg text-gray-300 mt-1">{mentor.user.title}</p>
                  <p className="text-gray-400">{mentor.user.company}</p>
                </div>
              </div>

              {/* Expertise Section */}
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <Award size={24} className="text-cyan-400" />
                    Expertise
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {mentor.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-sm text-cyan-300 font-medium hover:bg-gray-700/50 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <BookOpen size={24} className="text-cyan-400" />
                    About
                  </h2>
                  <p className="text-gray-300 leading-relaxed">{mentor.user.bio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Booking Section */}
          <div className="lg:w-96">
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 border border-gray-800/50 lg:sticky lg:top-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-200 mb-6 tracking-tight">Book a Session</h2>
              <div className="space-y-4">
                {mentor.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all transform hover:scale-105 duration-300"
                  >
                    <h3 className="font-semibold text-lg text-white mb-2">{session.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {session.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video size={16} />
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-cyan-400">${session.price}</span>
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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