import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, MessageCircle, BarChart3, Rocket, FileText, UserCheck, ArrowRight, Activity, Terminal } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const features = [
    {
      icon: <Terminal className="w-4 h-4 text-zinc-400" />,
      title: "Intelligent Matching",
      description: "Proprietary algorithms that parse your experience and map it directly to high-impact engineering roles."
    },
    {
      icon: <UserCheck className="w-4 h-4 text-zinc-400" />,
      title: "Elite Mentorship",
      description: "Direct 1-on-1 access to distinguished industry experts, founders, and senior architects."
    },
    {
      icon: <Activity className="w-4 h-4 text-zinc-400" />,
      title: "Real-time Telemetry",
      description: "Comprehensive analytics dashboard tracking application conversions and interview progression."
    },
    {
      icon: <Users className="w-4 h-4 text-zinc-400" />,
      title: "Anonymous Forums",
      description: "Secure, encrypted discussion boards for transparent salary sharing and unfiltered company insights."
    },
    {
      icon: <Rocket className="w-4 h-4 text-zinc-400" />,
      title: "Startup Sandbox",
      description: "A dedicated portal to discover stealth startups, seed-stage ventures, and potential co-founders."
    },
    {
      icon: <FileText className="w-4 h-4 text-zinc-400" />,
      title: "Dynamic Resumes",
      description: "AI-generated tailored profiles that highlight relevant skills based on active job requirements algorithmically."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 selection:text-white pb-20">

      {/* Hero Section */}
      <section className="relative px-6 py-32 md:py-48 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-zinc-900/50 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <Badge variant="outline" className="px-4 py-1.5 mb-8 rounded-full border-zinc-800 bg-zinc-950/50 text-zinc-300 gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
            System Status: Operational
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 max-w-4xl leading-[1.1]">
            The unified infrastructure for <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">elite tech talent.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed">
            Accelerate your professional trajectory. Discover highly curated roles, engage with senior mentors, and leverage deep career analytics — all in one unified ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              size="lg"
              className="px-8 h-14 bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-semibold text-base transition-all "
              onClick={() => handleNavigate('/signup')}
            >
              Initialize Profile
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 h-14 border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-300 font-semibold text-base flex items-center group transition-all backdrop-blur-sm"
              onClick={() => handleNavigate('/jobs')}
            >
              Explore the Matrix
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 max-w-7xl mx-auto border-t border-zinc-900/80">
        <div className="mb-16 flex flex-col items-start max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100 mb-4">Core Capabilities</h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Engineered exclusively for developers, designers, and originators. We abstract away the friction of career advancement, allowing you to focus purely on shipping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900/50 transition-colors backdrop-blur-sm group">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-zinc-700 transition-colors">
                  {feature.icon}
                </div>
                <CardTitle className="text-zinc-100 text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action Matrix */}
      <section className="px-6 py-24 max-w-7xl mx-auto mt-12 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Ready to deploy your career?
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto mb-10">
            Secure early access to our platform. Join a network of individuals building the next generation of software.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-bold text-base shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all"
            onClick={() => handleNavigate('/signup')}
          >
            Create Developer Account
          </Button>
        </div>
      </section>

    </div>
  );
};

export default Home;