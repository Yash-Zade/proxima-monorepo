import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import apiClient from '../Auth/ApiClient';

const JobCard = ({ job, onClick }) => (
  <Card
    className="bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900/50 transition-colors cursor-pointer group backdrop-blur-sm shadow-sm hover:shadow-md"
    onClick={onClick}
  >
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-semibold text-zinc-100 mb-2">{job.title}</CardTitle>
          <CardDescription className="text-zinc-400 text-sm line-clamp-2 leading-relaxed max-w-2xl">
            {job.description}
          </CardDescription>
        </div>
        <div className="p-2 rounded-full bg-zinc-900 border border-zinc-800 group-hover:bg-zinc-800 transition-colors hidden sm:block">
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <div className="flex flex-wrap gap-2 mb-6">
        {job.skillsRequired && job.skillsRequired.length > 0 ? (
          job.skillsRequired.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-medium px-3 py-1 text-xs"
            >
              {skill}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-zinc-500">No skills specified</span>
        )}
      </div>

      <div className="flex justify-between items-center text-sm pt-4 border-t border-zinc-800/50">
        <div className="flex items-center text-zinc-400 font-medium">
          <Briefcase className="w-4 h-4 mr-2 text-zinc-500" />
          {job.company || 'Unknown'}
        </div>
        <Badge
          variant="outline"
          className={`font-semibold tracking-wider uppercase text-[10px] px-2.5 py-0.5 rounded-full border-zinc-800 bg-transparent ${job.jobStatus === 'OPEN' ? 'text-emerald-400 border-emerald-900/30 bg-emerald-900/10' : 'text-zinc-500'
            }`}
        >
          {job.jobStatus === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>}
          {job.jobStatus || 'OPEN'}
        </Badge>
      </div>
    </CardContent>
  </Card>
);

const JobBoard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiClient.get('/public/jobs');
        // GlobalResponseHandler wraps all responses: { timeStamp, data: <payload>, error }
        // Page<JobDTO> is inside response.data.data
        setJobs(response.data.data?.content || []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleJobClick = (job) => {
    navigate(`/jobs/${job.jobId}`);
  };

  const filteredJobs = searchQuery
    ? jobs.filter((job) =>
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : jobs;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-zinc-800 selection:text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">

        <div className="mb-12">
          <Badge variant="outline" className="px-3 py-1 mb-6 rounded-full border-zinc-800 bg-zinc-950/50 text-zinc-400 gap-2 font-normal">
            <Search className="w-3 h-3" />
            Opportunity Matrix
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter mb-4">Job Listing</h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Discover your next professional engagement. Explore highly curated roles parsed specifically for your expertise.
          </p>
        </div>

        <div className="relative mb-10 group">
          <Input
            type="text"
            placeholder="Search by role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/50 border-zinc-800 rounded-2xl px-5 py-7 pl-14 h-14
            focus-visible:ring-1 focus-visible:ring-zinc-600 focus-visible:border-zinc-700 transition-all text-zinc-50 placeholder-zinc-500 text-base shadow-sm"
          />
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors pointer-events-none" size={20} />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-24 text-zinc-500 flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium">Connecting to nodes...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="bg-zinc-950/30 border-dashed border-zinc-800 text-center py-20">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
                  <Search className="w-6 h-6 text-zinc-500" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-200 mb-2">No active missions</h3>
                <p className="text-zinc-500">Adjust your search parameters to discover new opportunities.</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.jobId} job={job} onClick={() => handleJobClick(job)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBoard;