import React, { useState, useEffect } from "react";
import { Search, Star, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import apiClient from "../Auth/ApiClient";

const MentorCard = ({ mentor }) => {
  const navigate = useNavigate();
  const handleMentor = () => {
    navigate(`/mentor-profile/${mentor.mentorId}`);
  };

  const mentorName = mentor.user?.name || "Unknown Mentor";
  const avgRating = mentor.averageRating || 0;

  return (
    <Card className="bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900/50 transition-colors backdrop-blur-sm shadow-sm hover:shadow-md flex flex-col h-full group">
      <CardHeader className="pb-4 flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-12 w-12 border border-zinc-800 bg-zinc-900">
          <AvatarImage src="" alt={mentorName} />
          <AvatarFallback className="bg-zinc-800 text-zinc-300 font-semibold">{mentorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl font-bold text-zinc-100">{mentorName}</CardTitle>
          <div className="flex items-center text-zinc-400 mt-1">
            <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 mr-1.5" />
            <span className="font-semibold text-sm text-zinc-300">{avgRating.toFixed(1)}</span>
            <span className="mx-2 text-zinc-700">•</span>
            <span className="text-sm font-medium">Expert</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pb-4">
        <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3">
          {mentor.bio || "No professional overview available."}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {mentor.expertise && mentor.expertise.length > 0 ? (
            mentor.expertise.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-medium px-2.5 py-0.5 text-xs"
              >
                {skill}
              </Badge>
            ))
          ) : (
            <span className="text-zinc-500 text-sm">No specific expertise cataloged</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-6 border-t border-zinc-800/30 mt-4 px-6 relative">
        <Button
          variant="ghost"
          className="w-full mt-4 bg-zinc-900/50 border border-zinc-800 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-all font-medium h-10 group-hover:border-zinc-700"
          onClick={handleMentor}
        >
          Review Profile
          <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const LoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="animate-pulse bg-zinc-950/50 border-zinc-800/80 h-[280px]">
        <CardHeader className="flex flex-row gap-4">
          <div className="h-12 w-12 rounded-full bg-zinc-900" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-zinc-900 rounded-md w-1/3" />
            <div className="h-4 bg-zinc-900 rounded-md w-1/4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 bg-zinc-900 rounded-md w-full" />
          <div className="h-4 bg-zinc-900 rounded-md w-4/5" />
          <div className="flex gap-2 pt-4">
            <div className="h-5 bg-zinc-900 rounded-md w-16" />
            <div className="h-5 bg-zinc-900 rounded-md w-20" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const MentorSearchPage = () => {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await apiClient.get('/public/mentors');
        // Extract mentor data from response.data.data (ApiResponse.data)
        const mentorData = response.data.data?.content || [];
        setMentors(mentorData);
        setFilteredMentors(mentorData);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentors();
  }, []);

  useEffect(() => {
    const filtered = mentors.filter(
      (mentor) => {
        const name = mentor.user?.name || "";
        const expertise = mentor.expertise || [];
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expertise.some((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          );
      }
    );
    setFilteredMentors(filtered);
  }, [searchQuery, mentors]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-zinc-800 selection:text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">

        <div className="mb-12">
          <Badge variant="outline" className="px-3 py-1 mb-6 rounded-full border-zinc-800 bg-zinc-950/50 text-zinc-400 gap-2 font-normal">
            <Users className="w-3 h-3" />
            Mentor Network
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter mb-4">
            Elite Expertise
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Connect directly with seasoned professionals, founders, and architects actively shaping the industry.
          </p>
        </div>

        <div className="relative mb-12 group">
          <Input
            type="text"
            placeholder="Search by exact capability, name, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/50 border-zinc-800 rounded-2xl px-5 py-7 pl-14 h-14
                focus-visible:ring-1 focus-visible:ring-zinc-600 focus-visible:border-zinc-700 transition-all text-zinc-50 placeholder-zinc-500 text-base shadow-sm"
          />
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors pointer-events-none" size={20} />
        </div>

        <div>
          {isLoading ? (
            <LoadingState />
          ) : filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.mentorId} mentor={mentor} />
              ))}
            </div>
          ) : (
            <Card className="bg-zinc-950/30 border-dashed border-zinc-800 text-center py-20">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
                  <Users className="w-6 h-6 text-zinc-500" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-200 mb-2">
                  No experts identified
                </h3>
                <p className="text-zinc-500">Your specific query yielded zero results. Alter your parameters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorSearchPage;