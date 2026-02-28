import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import WalletComponent from "../Wallet/Wallet.jsx";
import apiClient from "../Auth/ApiClient";
import { useNavigate, Link } from "react-router-dom";

const GradientOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 ${className}`} />
);

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md relative"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const RoleModal = ({ isOpen, onClose, role, id }) => {
  const [formData, setFormData] = useState({
    expertise: "",
    yearsOfExperience: "",
    companyName: "",
    website: "",
  });
  console.log("ID:", id);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    if (role === "mentor") {
      try {
        const response = await apiClient.post(`users/request/mentor`, formData);
        console.log("API Response:", response.data); // Add this for debugging
        if (response.data) {
          console.log("Mentor added successfully");
        }
      } catch (error) {
        console.log("Error adding mentor:", error);
      }
    } else if (role === "employer") {
      try {
        const response = await apiClient.post(
          `users/request/employer`,
          formData
        );
        console.log("API Response:", response.data); // Add this for debugging
        if (response.data) {
          console.log("Employer added successfully");
        }
      } catch (error) {
        console.log("Error adding employer:", error);
      }
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role === "mentor" ? "Become a Mentor" : "Register as Employer"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {role === "mentor" ? (
          <>
            <div>
              <label className="block text-sm text-white/60 mb-1">
                Expertise
              </label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                value={formData.expertise}
                onChange={(e) =>
                  setFormData({ ...formData, expertise: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearsOfExperience: e.target.value,
                  })
                }
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm text-white/60 mb-1">
                Company Name
              </label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">
                Website
              </label>
              <input
                type="url"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </div>
          </>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 transition-colors"
        >
          Submit
        </button>
      </form>
    </Modal>
  );
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const dummyData = {
    applicants: [
      {
        applicantId: 1,
        name: "Rohit Sharma",
        email: "rohit.sharma@example.com",
        phone: "+91 98765 11111",
        skills: [
          "JavaScript",
          "React",
          "Node.js",
          "TypeScript",
          "AWS",
          "MongoDB",
        ],
        preferredLocations: ["Mumbai", "Bangalore", "Remote"],
        education: [
          {
            degree: "Bachelor of Technology in Computer Science",
            institution: "IIT Delhi",
            graduationYear: 2023,
          },
        ],
        experience: [],
        jobApplications: [
          {
            jobId: 2001,
            status: "Applied",
            companyName: "Microsoft",
            position: "Software Engineer",
            appliedDate: "2024-03-10",
          },
          {
            jobId: 2003,
            status: "Interview Scheduled",
            companyName: "Amazon",
            position: "Frontend Developer",
            appliedDate: "2024-03-05",
          },
        ],
        user: {
          name: "Rohit Sharma",
          email: "rohit.sharma@example.com",
          roles: ["Applicant"],
          profilePicture: "/api/placeholder/150/150",
          joinedDate: "2024-01-10",
          lastActive: "2024-03-15",
        },
      },
      {
        applicantId: 2,
        name: "Virat Kohli",
        email: "virat.kohli@example.com",
        phone: "+91 87654 22222",
        skills: [
          "Python",
          "Data Science",
          "SQL",
          "Machine Learning",
          "TensorFlow",
          "Scikit-learn",
        ],
        preferredLocations: ["Delhi", "Pune", "Remote"],
        education: [
          {
            degree: "Master in Data Science",
            institution: "IIM Bangalore",
            graduationYear: 2023,
          },
        ],
        experience: [],
        jobApplications: [
          {
            jobId: 2002,
            status: "Applied",
            companyName: "Tesla",
            position: "Data Analyst",
            appliedDate: "2024-03-12",
          },
          {
            jobId: 2007,
            status: "Rejected",
            companyName: "Apple",
            position: "Machine Learning Engineer",
            appliedDate: "2024-02-28",
          },
        ],
        user: {
          name: "Virat Kohli",
          email: "virat.kohli@example.com",
          roles: ["Applicant"],
          profilePicture: "/api/placeholder/150/150",
          joinedDate: "2023-12-05",
          lastActive: "2024-03-18",
        },
      },
    ],
    mentors: [
      {
        mentorId: 1,
        expertise: "Frontend Development",
        yearsOfExperience: 7,
        availability: "15 hours/week",
        mentees: 6,
        rating: 4.7,
      },
      {
        mentorId: 2,
        expertise: "Data Science",
        yearsOfExperience: 5,
        availability: "12 hours/week",
        mentees: 4,
        rating: 4.8,
      },
    ],
    employers: [
      {
        employerId: 1,
        companyName: "Microsoft",
        website: "https://microsoft.com",
        industry: "Technology",
        companySize: "100000+",
        locations: ["Seattle", "Bangalore", "Hyderabad"],
      },
      {
        employerId: 2,
        companyName: "Tesla",
        website: "https://tesla.com",
        industry: "Automotive & AI",
        companySize: "80000+",
        locations: ["California", "Delhi", "Shanghai"],
      },
    ],
  };
  

  useEffect(() => {
    const getProfile = async () => {
      try {
        // Simulating API call with dummy data
        // const response =await apiClient.get(`${import.meta.env.VITE_BACKEND_BASE_URL}applicants/profile`);
        // console.log("API Response:", response.data); // Add this for debugging
        setProfile(dummyData.applicants[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.message);
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  // useEffect(() => {
  //   async function GetProfile() {
  //     const AppllicantProfile= await apiClient.get (`${import.meta.env.VITE_BACKEND_BASE_URL}/applicants/profile`);
  //     setProfile(AppllicantProfile.data);
  //   }
  //   GetProfile();
  // },[profile])

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
    setShowRoleModal(true);
  };

  const handleMentorRole = () => {
    navigate("/mentor-profile/");
  };

  const handleEmployerRole = () => {
    navigate("/employer-profile/");
  };

  // Check loading and error states first
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <p>No profile data available</p>
      </div>
    );
  }

  // Destructure with default values for all properties
  // console.log("Profile:", profile); // Add this for debugging
  const {
    applicantId = "",
    skills = [],
    preferredLocations = [],
    jobApplications = [],
    user = {},
  } = profile || {};
  // console.log("Applicant ID:",applicantId)
  const {
    name = "No name available",
    email = "No email available",
    roles = [],
  } = user || {};

  // Add this for debugging

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden p-6 md:p-12 space-y-8">
      {/* Gradient Background Orbs */}
      <GradientOrb className="w-96 h-96 bg-purple-500 left-0 top-0" />
      <GradientOrb className="w-96 h-96 bg-blue-500 right-0 bottom-0" />
      <GradientOrb className="w-64 h-64 bg-pink-500 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />

      {/* Profile Section */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="backdrop-blur-xl bg-gray-900/40 rounded-3xl p-6 shadow-xl border border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Applicant Profile
              </h1>

              <div className="flex items-center space-x-4">
                <WalletComponent />
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition"
                  >
                    <span>Select Role</span>
                    <ChevronDown size={20} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-white/10">
                      <button
                        onClick={() => handleRoleSelect("mentor")}
                        className="w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        Become a Mentor
                      </button>
                      <button
                        onClick={() => handleRoleSelect("employer")}
                        className="w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        Register as Employer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">
                  Personal Information
                </h2>
                <p>
                  <span className="text-white/60">Name:</span> {name}
                </p>
                <p>
                  <span className="text-white/60">Email:</span> {email}
                </p>
              </div>

              {/* Skills */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-white/10 rounded-full px-3 py-1 text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-center w-full">No skills specified</p>
                  )}
                </div>
              </div>

              {/* Preferred Locations */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">
                  Preferred Locations
                </h2>
                {preferredLocations.length > 0 ? (
                  preferredLocations.map((location, index) => (
                    <p key={index}>{location}</p>
                  ))
                ) : (
                  <p>No preferred locations specified</p>
                )}
              </div>

              {/* Current Role */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Current Role</h2>
                {roles.length > 0 ? (
                  roles.map((role, index) => (
                    <p key={index} className="capitalize">
                      {role}
                    </p>
                  ))
                ) : (
                  <p>No role selected</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Dashboards */}
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-gray-900/40 rounded-3xl p-6 shadow-xl border border-white/20">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboards
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Link to="/employerdashboard" className="w-full">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg p-3 rounded-lg shadow-md transition-all duration-300">
                  Employer Dashboard
                </button>
              </Link>

              <Link to="/AdminDashboard" className="w-full">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg p-3 rounded-lg shadow-md transition-all duration-300">
                  Admin Dashboard
                </button>
              </Link>

              <Link to="/MentorDashboard" className="w-full">
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold text-lg p-3 rounded-lg shadow-md transition-all duration-300">
                  Mentor Dashboard
                </button>
              </Link>

              <Link to="/CollegeDashboard" className="w-full">
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg p-3 rounded-lg shadow-md transition-all duration-300">
                  College Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        role={selectedRole}
        id={applicantId}
      />
    </div>
  );
};

export default UserProfile;
