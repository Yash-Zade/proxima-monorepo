import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const GradientOrb = ({ className, delay = 0 }) => (
  <motion.div 
    className={`absolute rounded-full blur-3xl opacity-0 ${className}`}
    animate={{ 
      opacity: [0, 0.25],
      scale: [0.9, 1.1],
    }}
    transition={{ 
      duration: 2,
      delay,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse"
    }}
  />
);

const JobDetails = () => {
  const params = useParams();
  const jobId = params.jobid;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dummy data (replace with API call in production)
  const DUMMY_JOBS = [
    {
      jobId: 1001,
      jobTitle: "Software Engineer",
      description: "Develop and maintain software applications for various platforms.",
      skillsRequired: ["Java", "Python", "C++", "Problem Solving"],
      company: "Tech Bharat Innovations",
      status: "Open"
    },
    {
      jobId: 1002,
      jobTitle: "Data Analyst",
      description: "Analyze large datasets to extract actionable insights for decision making.",
      skillsRequired: ["SQL", "Excel", "Python", "Data Visualization"],
      company: "DataPrabhu Solutions",
      status: "Closed"
    },
    {
      jobId: 1003,
      jobTitle: "Marketing Manager",
      description: "Create and implement marketing strategies to promote products and services.",
      skillsRequired: ["SEO", "Content Marketing", "Google Analytics"],
      company: "Global Bharat Marketing",
      status: "Open"
    },
    {
      jobId: 1004,
      jobTitle: "Product Manager",
      description: "Oversee the development of new products from concept to launch.",
      skillsRequired: ["Project Management", "Agile", "Communication"],
      company: "Niti Innovate Co.",
      status: "Open"
    },
    {
      jobId: 1005,
      jobTitle: "UX/UI Designer",
      description: "Design user-friendly interfaces for websites and mobile apps.",
      skillsRequired: ["Adobe XD", "Figma", "HTML/CSS", "User Research"],
      company: "DesignSutra Pro",
      status: "Interview"
    },
    {
      jobId: 1006,
      jobTitle: "HR Specialist",
      description: "Manage recruitment, employee relations, and benefits administration.",
      skillsRequired: ["HR Software", "Communication", "Conflict Resolution"],
      company: "JanSeva Inc.",
      status: "Closed"
    },
    {
      jobId: 1007,
      jobTitle: "Financial Analyst",
      description: "Analyze financial data, prepare reports, and advise on investment decisions.",
      skillsRequired: ["Excel", "Financial Modeling", "Accounting"],
      company: "Artha Solutions Pvt. Ltd.",
      status: "Open"
    },
    {
      jobId: 1008,
      jobTitle: "Customer Support Lead",
      description: "Oversee customer service team and ensure customer satisfaction.",
      skillsRequired: ["Communication", "Problem Solving", "CRM Tools"],
      company: "SevaPlus Ltd.",
      status: "Open"
    },
    {
      jobId: 1009,
      jobTitle: "Network Administrator",
      description: "Manage and maintain network systems and infrastructure.",
      skillsRequired: ["Networking", "VPNs", "Troubleshooting"],
      company: "NetSuraksha Inc.",
      status: "Open"
    },
    {
      jobId: 1010,
      jobTitle: "Sales Executive",
      description: "Drive sales strategies, manage client relationships, and close deals.",
      skillsRequired: ["Negotiation", "CRM", "Presentation Skills"],
      company: "Vikray Bharat Global",
      status: "Closed"
    }
    // Add other dummy jobs here...
  ];

  useEffect(() => {
    setTimeout(() => {
      const foundJob = DUMMY_JOBS.find(j => j.jobId === parseInt(jobId));
      setJob(foundJob || null);
      setLoading(false);
    }, 500);
  }, [jobId]);

  const handleApply = (jobId) => {
    navigate(`/apply/${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-lg font-semibold"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-lg font-semibold"
        >
          Job not found
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="pt-24 relative max-w-3xl mx-auto">
        {/* Gradient Orbs for Background Effect */}
        <GradientOrb className="w-72 h-72 bg-cyan-500/20 -top-20 -left-32" delay={0.2} />
        <GradientOrb className="w-96 h-96 bg-purple-500/20 -bottom-32 -right-40" delay={0.4} />
        <GradientOrb className="w-60 h-60 bg-pink-400/20 top-1/3 left-1/4" delay={0.6} />

        {/* Job Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700/50"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              >
                {job.jobTitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-gray-400 text-sm mt-1"
              >
                {job.company} • {job.status}
              </motion.p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === "Open" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
              }`}
            >
              {job.status}
            </span>
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Description</h2>
            <p className="text-gray-300 leading-relaxed">{job.description}</p>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                  className="px-3 py-1 bg-gray-800 text-cyan-300 rounded-full text-sm border border-cyan-500/30 hover:bg-gray-700 transition-colors"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-200">Posted By</h2>
              <p className="text-gray-400">{job.postedBy}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-200">Experience</h2>
              <p className="text-gray-400">{job.experienceRequired}</p>
            </div>
          </motion.div>

          {/* Apply Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleApply(job.jobId)}
              className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Apply Now
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetails;