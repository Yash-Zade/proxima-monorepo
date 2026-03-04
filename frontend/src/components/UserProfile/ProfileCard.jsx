import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, User as UserIcon, MapPin, Building, Target } from "lucide-react";
import WalletComponent from "../Wallet/Wallet.jsx";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import apiClient from "../Auth/ApiClient";

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold mb-6 text-zinc-50 tracking-tight">{title}</h2>
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (role === "mentor") {
        await apiClient.post("/users/request/mentor", {
          expertise: formData.expertise.split(',').map(s => s.trim()),
          experience: parseInt(formData.yearsOfExperience) || 0
        });
        alert("Mentor request submitted successfully.");
      } else if (role === "employer") {
        await apiClient.post("/users/request/employer", {
          companyName: formData.companyName,
          companyWebsite: formData.website
        });
        alert("Employer registration submitted successfully.");
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role === "mentor" ? "Become a Mentor" : "Register as Employer"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {role === "mentor" ? (
          <>
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm font-medium">Expertise Parameter (Comma separated)</Label>
              <Input
                type="text"
                placeholder="e.g. Frontend Architecture, React"
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                value={formData.expertise}
                onChange={(e) =>
                  setFormData({ ...formData, expertise: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm font-medium">Years of Experience</Label>
              <Input
                type="number"
                placeholder="5"
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  setFormData({ ...formData, yearsOfExperience: e.target.value })
                }
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm font-medium">Company Name</Label>
              <Input
                type="text"
                placeholder="Acme Corp"
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm font-medium">Registry Website</Label>
              <Input
                type="url"
                placeholder="https://acme.com"
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                required
              />
            </div>
          </>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold h-11 mt-4 rounded-lg"
        >
          {loading ? "Initializing..." : "Initialize Request"}
        </Button>
      </form>
    </Modal>
  );
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/applicants/profile');
        setProfile(response.data.data);
      } catch (error) {
        console.error("Failed to fetch applicant profile", error);
        // Error handling if response.data.error.message exists
        if (error.response?.data?.error?.message) {
          console.error("Backend Error:", error.response.data.error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
    setShowRoleModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-zinc-500">Retrieving profile matrix...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500 text-lg">Applicant Matrix Not Found.</p>
      </div>
    );
  }

  const {
    applicantId = "",
    skills = [],
    preferredLocations = [],
    user = {},
  } = profile || {};

  const {
    name = "No name available",
    email = "No email available",
    roles = [],
  } = user || {};

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-6 md:p-12 selection:bg-zinc-800 selection:text-white pt-40 pb-20 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Section - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl p-2">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8">
              <CardTitle className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-zinc-400" />
                </div>
                Identity Layer
              </CardTitle>

              <div className="flex items-center space-x-4">
                <WalletComponent />
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition text-zinc-300 h-10"
                  >
                    <span>Role Modifications</span>
                    <ChevronDown size={14} className="opacity-70" />
                  </Button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-zinc-950/95 backdrop-blur-md rounded-xl shadow-2xl border border-zinc-800 overflow-hidden z-10 p-1">
                      <button
                        onClick={() => handleRoleSelect("mentor")}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300"
                      >
                        Elevate to Mentor
                      </button>
                      <button
                        onClick={() => handleRoleSelect("employer")}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300"
                      >
                        Register as Employer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Info */}
                <Card className="bg-zinc-950 border-zinc-800/60 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-zinc-400 tracking-wider uppercase flex items-center">
                      <Target className="w-4 h-4 mr-2 opacity-50" /> Base Attributes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500 font-medium">Designation</span>
                      <span className="text-zinc-100 font-medium">{name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500 font-medium">Contact Node</span>
                      <span className="text-zinc-100 font-medium truncate max-w-[150px]">{email}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card className="bg-zinc-950 border-zinc-800/60 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-zinc-400 tracking-wider uppercase flex items-center">
                      <Building className="w-4 h-4 mr-2 opacity-50" /> Technical Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skills && skills.length > 0 ? (
                        skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-zinc-900 border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-800"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-zinc-500 text-sm">No capabilities synced</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Preferred Locations */}
                <Card className="bg-zinc-950 border-zinc-800/60 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-zinc-400 tracking-wider uppercase flex items-center">
                      <MapPin className="w-4 h-4 mr-2 opacity-50" /> Geographical Nodes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-zinc-300">
                      {preferredLocations && preferredLocations.length > 0 ? (
                        preferredLocations.map((location, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mr-2.5"></div>
                            {location}
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 text-sm">No regions specified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Role */}
                <Card className="bg-zinc-950 border-zinc-800/60 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-zinc-400 tracking-wider uppercase flex items-center">
                      <UserIcon className="w-4 h-4 mr-2 opacity-50" /> Access Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-zinc-300">
                      {roles && roles.length > 0 ? (
                        roles.map((role, index) => (
                          <div key={index} className="capitalize flex items-center font-medium text-emerald-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2.5 animate-pulse"></div>
                            {role}
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 text-sm">No role attached</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Dashboards */}
        <div className="space-y-6">
          <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl p-2 h-full">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">
                Control Portals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Link to="/employerdashboard" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-12 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white text-zinc-400 transition-all font-medium">
                    Employer Subsystem
                  </Button>
                </Link>

                <Link to="/AdminDashboard" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-12 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white text-zinc-400 transition-all font-medium">
                    Admin Master
                  </Button>
                </Link>

                <Link to="/MentorDashboard" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-12 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white text-zinc-400 transition-all font-medium">
                    Mentor Operations
                  </Button>
                </Link>

                <Link to="/CollegeDashboard" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-12 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white text-zinc-400 transition-all font-medium">
                    Institution Command
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
