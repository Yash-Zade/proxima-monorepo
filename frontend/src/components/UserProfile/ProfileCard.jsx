import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, User as UserIcon, MapPin, Building, Target, Briefcase, Mail } from "lucide-react";
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
      } else if (role === "college") {
        await apiClient.post("/users/request/college", {
          name: formData.companyName,
          website: formData.website,
          address: formData.address,
          email: formData.email
        });
        alert("College registration submitted successfully.");
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
      title={role === "mentor" ? "Become a Mentor" : role === "college" ? "Register Institution" : "Register as Employer"}
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
      ) : role === "college" ? (
      <>
        <div className="space-y-1.5">
          <Label className="text-zinc-300 text-sm font-medium">Institution Name</Label>
          <Input
            type="text"
            placeholder="MIT University"
            className="w-full bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300 text-sm font-medium">Official Website</Label>
          <Input
            type="url"
            placeholder="https://mit.edu"
            className="w-full bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300 text-sm font-medium">Official Email</Label>
          <Input
            type="email"
            placeholder="admin@mit.edu"
            className="w-full bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300 text-sm font-medium">Address</Label>
          <Input
            type="text"
            placeholder="Cambridge, MA"
            className="w-full bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
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
    </Modal >
  );
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ skills: "", preferredLocations: "" });
  const [uploading, setUploading] = useState(false);
  const getResumeUrl = (resumePath) => {
    if (!resumePath) return "";
    if (resumePath.startsWith("http")) return resumePath;
    const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8080';
    return `${baseUrl.replace(/\/$/, '')}/applicants/resume/download/${resumePath}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/applicants/profile');
        setProfile(response.data.data);
      } catch (error) {
        console.error("Failed to fetch applicant profile", error);
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

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await apiClient.post('/applicants/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Resume uploaded successfully!');
      // Refresh profile
      const response = await apiClient.get('/applicants/profile');
      setProfile(response.data.data);
    } catch (error) {
      console.error('Resume upload failed', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/applicants/profile/${profile.applicantId}`, {
        skills: editData.skills.split(',').map(s => s.trim()),
        preferredLocations: editData.preferredLocations.split(',').map(l => l.trim())
      });
      setShowEditModal(false);
      const response = await apiClient.get('/applicants/profile');
      setProfile(response.data.data);
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Update failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-zinc-900 border-t-zinc-100 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 font-medium">Synchronizing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-lg mb-4">Profile not initialized.</p>
          <Button onClick={() => navigate('/roles')}>Complete Onboarding</Button>
        </div>
      </div>
    );
  }

  const {
    applicantId = "",
    skills = [],
    preferredLocations = [],
    certifiedSkills = [],
    jobApplications = [],
    resume = "",
    user = {},
  } = profile || {};

  const {
    name = "User Name",
    email = "email@example.com",
    roles = [],
  } = user || {};

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-20 font-sans">
      {/* Hero Section / Cover */}
      <div className="relative h-64 w-full bg-gradient-to-br from-zinc-800 to-zinc-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-950 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Profile Card & Quick Info */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md shadow-2xl overflow-hidden">
              <div className="p-8 text-center border-b border-zinc-800/50">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-zinc-800 border-4 border-zinc-950 flex items-center justify-center shadow-2xl mb-6 ring-1 ring-zinc-700">
                  <UserIcon className="w-16 h-16 text-zinc-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
                <p className="text-zinc-400 text-sm mb-4">{email}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {roles.map((role, idx) => (
                    <Badge key={idx} variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 capitalize px-3">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Member Since</span>
                  <span className="text-zinc-300">March 2026</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Applications</span>
                  <span className="text-zinc-300 font-bold">{jobApplications.length}</span>
                </div>
                <div className="pt-4">
                  <WalletComponent />
                </div>
              </div>
            </Card>

            {/* Quick Actions / Portals */}
            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md p-6">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Quick Access</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full justify-between bg-zinc-950 border-zinc-800 hover:bg-zinc-800 hover:text-white group relative"
                >
                  <span className="text-zinc-400 group-hover:text-zinc-200">Switch Role</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 gap-1 mt-1"
                  >
                    <button onClick={() => handleRoleSelect("mentor")} className="text-left px-4 py-3 text-sm rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:bg-zinc-800/80 transition-colors text-zinc-300">Elevate to Mentor</button>
                    <button onClick={() => handleRoleSelect("employer")} className="text-left px-4 py-3 text-sm rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:bg-zinc-800/80 transition-colors text-zinc-300">Register as Employer</button>
                    <button onClick={() => handleRoleSelect("college")} className="text-left px-4 py-3 text-sm rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:bg-zinc-800/80 transition-colors text-zinc-300">Register as College</button>
                  </motion.div>
                )}

                <div className="h-px bg-zinc-800 my-2"></div>

                <Link to="/jobs">
                  <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800/50">Explore Jobs</Button>
                </Link>
                <Link to="/forum">
                  <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800/50">Community Forum</Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Right Column: Detailed Stats & Skills */}
          <div className="lg:w-2/3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Card */}
              <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-zinc-500" /> Professional Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.length > 0 ? (
                      skills.map((skill, idx) => (
                        <Badge key={idx} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 px-3 py-1">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-zinc-600 italic">No skills added yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Certified Skills Card */}
              <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md shadow-xl border-l-2 border-l-emerald-500/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" /> Verified Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {certifiedSkills.length > 0 ? (
                      certifiedSkills.map((skill, idx) => (
                        <Badge key={idx} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-zinc-600 italic">No certifications found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resume & Bio Section */}
            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Portfolio & Resume</h3>
                  <p className="text-zinc-400 max-w-md">Your professional profile is your gateway to new opportunities. Keep it updated for better match results.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {resume ? (
                    <a href={getResumeUrl(resume)} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-6">View Resume</Button>
                    </a>
                  ) : null}
                  <div className="relative">
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploading}
                    />
                    <Button
                      asChild
                      className="bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                    >
                      <label htmlFor="resume-upload">
                        {uploading ? "Uploading..." : resume ? "Update Resume" : "Upload Resume"}
                      </label>
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => {
                      setEditData({
                        skills: skills.join(', '),
                        preferredLocations: preferredLocations.join(', ')
                      });
                      setShowEditModal(true);
                    }}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </Card>

            {/* Applications List */}
            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md overflow-hidden">
              <CardHeader className="p-8 border-b border-zinc-800/50">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                  <Briefcase className="text-zinc-500" /> Professional Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                  {jobApplications.length > 0 ? jobApplications.map((app, idx) => (
                    <div key={idx} className="p-6 hover:bg-zinc-800/20 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                          <Building size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{app.title || "Software Architect"}</h4>
                          <p className="text-zinc-500 text-sm">{app.companyName || "Acme Corps"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t border-zinc-800/30 md:border-t-0 pt-4 md:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Applied Date</p>
                          <p className="text-zinc-300 text-xs">{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "March 04, 2026"}</p>
                        </div>
                        <div>
                          <Badge className={`bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 uppercase text-[10px] font-black tracking-widest`}>
                            {app.applicationStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-zinc-600 italic">No active applications in the network.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Target Locations</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                {preferredLocations.length > 0 ? (
                  preferredLocations.map((loc, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-3 text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-blue-500/50"></span>
                      {loc}
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-600 italic">No preferences set.</p>
                )}
              </div>
            </Card>

            {/* Dashboard Navigation Section - Less prominent but clean */}
            <div className="pt-8">
              <h3 className="text-sm font-semibold text-zinc-600 uppercase tracking-[0.2em] mb-6 px-2">Administrative Hubs</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Employer", path: "/employerdashboard", color: "from-blue-500/10 to-transparent" },
                  { name: "Admin", path: "/AdminDashboard", color: "from-red-500/10 to-transparent" },
                  { name: "Mentor", path: "/MentorDashboard", color: "from-purple-500/10 to-transparent" },
                  { name: "Institution", path: "/CollegeDashboard", color: "from-emerald-500/10 to-transparent" }
                ].map((portal, idx) => (
                  <Link key={idx} to={portal.path} className="group">
                    <div className={`h-24 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-700 transition-all duration-300 p-4 flex flex-col justify-end overflow-hidden relative`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${portal.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      <span className="text-zinc-500 group-hover:text-zinc-200 font-medium text-sm relative z-10 transition-colors">{portal.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        role={selectedRole}
        id={applicantId}
      />

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Refine Professional Meta"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Capabilities (Skills)</Label>
            <Input
              value={editData.skills}
              onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
              placeholder="React, Java, Spring Boot..."
              className="bg-zinc-900 border-zinc-800 text-white h-12"
            />
            <p className="text-[10px] text-zinc-600">Comma separated list of your technical power-ups.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Target Regions (Locations)</Label>
            <Input
              value={editData.preferredLocations}
              onChange={(e) => setEditData({ ...editData, preferredLocations: e.target.value })}
              placeholder="San Francisco, New York, Remote..."
              className="bg-zinc-900 border-zinc-800 text-white h-12"
            />
          </div>
          <Button type="submit" className="w-full bg-zinc-50 hover:bg-white text-zinc-950 font-bold h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Synchronize Profile
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default UserProfile;
