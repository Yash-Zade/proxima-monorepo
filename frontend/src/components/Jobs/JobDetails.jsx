import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building, MapPin, Briefcase, Calendar, Clock, Network } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import apiClient from '../Auth/ApiClient';

const JobDetails = () => {
  const params = useParams();
  const jobId = params.jobid;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await apiClient.get(`/public/jobs/${jobId}`);
        setJob(response.data.data);
      } catch (error) {
        console.error("Failed to fetch job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleApply = (jId) => {
    navigate(`/apply/${jId}`);
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

  if (!job) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-lg font-medium">Job context not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-6 sm:px-12 selection:bg-zinc-800 selection:text-white font-sans flex justify-center">
      <div className="w-full max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white hover:bg-zinc-900 -ml-4"
          onClick={() => navigate('/jobs')}
        >
          ← Directory Return
        </Button>

        <Card className="bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl p-2 w-full">
          <CardHeader className="pb-8 border-b border-zinc-800/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
              <div>
                <CardTitle className="text-3xl font-extrabold text-white tracking-tight mb-3">
                  {job.title}
                </CardTitle>
                <p className="text-zinc-400 text-lg font-medium flex items-center">
                  <Building className="w-5 h-5 mr-2 text-zinc-500" />
                  {job.company || "Unknown"}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`px-3 py-1 font-semibold uppercase tracking-wider text-xs border ${job.jobStatus === "OPEN" ? "bg-emerald-900/20 text-emerald-400 border-emerald-900/50"
                  : job.jobStatus === "INTERVIEW" ? "bg-blue-900/20 text-blue-400 border-blue-900/50"
                    : "bg-red-900/20 text-red-400 border-red-900/50"
                  }`}
              >
                {job.jobStatus || "OPEN"} NODE
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-8 mt-6 text-zinc-400 text-sm">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-zinc-500" />
                {job.location || "Remote Optional"}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-zinc-500" />
                {job.type || "Full-Time"}
              </div>
              <div className="flex items-center text-zinc-300 font-medium">
                <Briefcase className="w-4 h-4 mr-2 text-zinc-500" />
                {job.stipend || "Compensation Pending"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8 space-y-10">

            {/* Description Area */}
            <div>
              <h2 className="text-lg font-semibold text-zinc-200 mb-4 tracking-tight flex items-center">
                <Network className="w-5 h-5 mr-2 text-zinc-500" /> Role Overview
              </h2>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 leading-relaxed text-zinc-300 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Skills Requirement Area */}
            <div>
              <h2 className="text-lg font-semibold text-zinc-200 mb-4 tracking-tight flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-zinc-500" /> Required Parameters
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired && job.skillsRequired.length > 0 ? job.skillsRequired.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1.5 bg-zinc-900 border-zinc-800 text-zinc-400 font-medium hover:text-zinc-200 transition-colors"
                  >
                    {skill}
                  </Badge>
                )) : <span className="text-zinc-500">None Specified</span>}
              </div>
            </div>

            <Separator className="bg-zinc-800/60" />

            <div className="grid grid-cols-2 gap-8 pt-2">
              <div>
                <h3 className="text-sm uppercase tracking-wider font-semibold text-zinc-500 mb-1">Origin Node</h3>
                <p className="text-zinc-200 font-medium">{job.postedBy || "Automated Terminal"}</p>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-wider font-semibold text-zinc-500 mb-1">Time Elapsed</h3>
                <p className="text-zinc-200 font-medium">{job.experienceRequired || "N/A"}</p>
              </div>
            </div>

          </CardContent>

          <CardFooter className="pt-4 pb-8 border-t border-zinc-800/50 mt-6 px-6">
            <Button
              onClick={() => handleApply(job.jobId)}
              className="w-full md:w-auto mt-4 px-10 h-12 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold tracking-wide"
              disabled={job.jobStatus === "CLOSED"}
            >
              {job.jobStatus === "CLOSED" ? 'Path Terminated' : 'Initialize Connection'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default JobDetails;