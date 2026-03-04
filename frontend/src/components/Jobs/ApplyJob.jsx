import React, { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";

const JobApplicationForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const jobId = params.jobid;

  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicantId, setApplicantId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/applicants/profile');
        const data = response.data.data;
        if (data) {
          setApplicantId(data.applicantId);
          setSkills(data.skills || []);
          setLocations(data.preferredLocations || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const addLocation = () => {
    if (currentLocation.trim() && !locations.includes(currentLocation.trim())) {
      setLocations([...locations, currentLocation.trim()]);
      setCurrentLocation('');
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const removeLocation = (indexToRemove) => {
    setLocations(locations.filter((_, index) => index !== indexToRemove));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleLocationKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLocation();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (resumeFile) {
        // Upload resume first if selected
        const formData = new FormData();
        formData.append('file', resumeFile);
        await apiClient.post('/applicants/resume/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Persist skills and locations to the profile
      if (applicantId) {
        await apiClient.put(`/applicants/profile/${applicantId}`, {
          skills: skills,
          preferredLocations: locations
        });
      }

      // We send the JobApplicationDTO 
      await apiClient.post(`/applicants/jobs/${jobId}/apply`, {
        jobId: parseInt(jobId),
        applicantId: applicantId
      });

      alert("Application successfully submitted!");
      navigate('/jobs'); // Standard redirect after apply
    } catch (err) {
      console.log("Error during submission", err);
      const errorMsg = err.response?.data?.error?.message || "An error occurred during submission.";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20 flex items-center justify-center p-6 selection:bg-zinc-800 selection:text-white font-sans">
      <Card className="w-full max-w-2xl bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl p-2">
        <CardHeader className="pb-8 border-b border-zinc-800/50">
          <CardTitle className="text-3xl font-bold text-white tracking-tight">
            Node Application Profile
          </CardTitle>
          <p className="text-zinc-500 text-sm mt-2">Initialize your data packet for submission.</p>
        </CardHeader>

        <CardContent className="pt-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Resume Upload */}
            <div className="space-y-3">
              <Label className="text-zinc-300 font-medium">Data Blob (Resume)</Label>
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="flex h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm file:border-0 file:bg-zinc-800 file:text-zinc-300 file:text-sm file:font-medium file:px-3 file:py-1 file:mr-4 file:rounded-md text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                  required={false}
                />
              </div>
            </div>

            {/* Skills Input */}
            <div className="space-y-3">
              <Label className="text-zinc-300 font-medium">Technical Parameters (Skills)</Label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  placeholder="Add a parameter..."
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  variant="secondary"
                  className="h-11 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Skills Tags */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 border border-zinc-800/50 rounded-lg bg-zinc-950/50 min-h-[50px]">
                  {skills.map((skill, index) => (
                    <Badge
                      key={skill + index}
                      variant="secondary"
                      className="bg-zinc-800 text-zinc-300 font-medium border border-zinc-700 hover:bg-zinc-700 pl-3 pr-2 py-1 gap-1 flex items-center"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="hover:text-zinc-50 transition-colors bg-zinc-900/50 rounded-full p-0.5 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Locations */}
            <div className="space-y-3">
              <Label className="text-zinc-300 font-medium">Geographical Nodes</Label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  onKeyPress={handleLocationKeyPress}
                  placeholder="Add a location..."
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                />
                <Button
                  type="button"
                  onClick={addLocation}
                  variant="secondary"
                  className="h-11 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Location Tags */}
              {locations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 border border-zinc-800/50 rounded-lg bg-zinc-950/50 min-h-[50px]">
                  {locations.map((location, index) => (
                    <Badge
                      key={location + index}
                      variant="secondary"
                      className="bg-zinc-800 text-zinc-300 font-medium border border-zinc-700 hover:bg-zinc-700 pl-3 pr-2 py-1 gap-1 flex items-center"
                    >
                      {location}
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="hover:text-zinc-50 transition-colors bg-zinc-900/50 rounded-full p-0.5 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold h-12 rounded-lg text-sm tracking-wide"
              >
                {isSubmitting ? "Executing..." : "Execute Transmission"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobApplicationForm;