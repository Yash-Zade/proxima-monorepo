import React, { useState } from 'react';
import { Plus, X, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";

const JobPostingForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    skillsRequired: [],
    jobStatus: 'OPEN',
    company: ''
  });
  const [currentSkill, setCurrentSkill] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/employers/jobs', formData);
      // apiClient throws on error, so if we're here, it's a success (within 2xx or GlobalResponseHandler logic)
      if (response.status >= 200 && response.status < 300) {
        alert('Job posted successfully!');
        setFormData({
          title: '',
          description: '',
          location: '',
          skillsRequired: [],
          jobStatus: 'OPEN',
          company: ''
        });
        navigate('/jobs');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      const errorMsg = error.response?.data?.error?.message || "Failed to post job";
      alert(errorMsg);
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skillsRequired.includes(currentSkill)) {
      setFormData({
        ...formData,
        skillsRequired: [...formData.skillsRequired, currentSkill.trim()]
      });
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skillsRequired: formData.skillsRequired.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-6 sm:px-12 selection:bg-zinc-800 selection:text-white font-sans flex justify-center">

      {/* Form Container */}
      <Card className="w-full max-w-3xl bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl p-2 h-fit">
        <CardHeader className="pb-8 border-b border-zinc-800/50">
          <CardTitle className="text-3xl font-bold text-white tracking-tight flex items-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mr-4">
              <Briefcase className="w-5 h-5 text-zinc-400" />
            </div>
            Provision New Node (Job)
          </CardTitle>
          <p className="text-zinc-500 text-sm mt-3 border-l-2 border-zinc-800 pl-3 ml-2">Define parameters to generate a new requirement listing.</p>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-3">
                <Label className="text-zinc-300 font-medium tracking-wide">Job Identifier</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                  placeholder="e.g. Senior Architecture Engineer"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-300 font-medium tracking-wide">Origin Network (Company)</Label>
                <Input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                  placeholder="e.g. Proxima Corp"
                  required
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className="text-zinc-300 font-medium tracking-wide">Location Coordinate</Label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                  placeholder="e.g. Bangalore, Earth"
                  required
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className="text-zinc-300 font-medium tracking-wide">Context Instructions</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 h-32 rounded-lg p-3 resize-none focus-visible:outline-none focus:ring-1 focus:ring-zinc-600 outline-none"
                  placeholder="Provide details about the required context operations..."
                  required
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className="text-zinc-300 font-medium tracking-wide">Req Capabilities (Skills)</Label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-zinc-50 h-11 rounded-lg"
                    placeholder="Add capability flag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
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

                {formData.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 p-3 border border-zinc-800/50 rounded-lg bg-zinc-950/50 min-h-[50px]">
                    {formData.skillsRequired.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-300 font-medium border border-zinc-700 hover:bg-zinc-700 pl-3 pr-2 py-1 gap-1 flex items-center"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-zinc-50 transition-colors bg-zinc-900/50 rounded-full p-0.5 ml-1 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full h-12 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold uppercase tracking-wider text-sm rounded-lg"
              >
                Deploy Node
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobPostingForm;