import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  GraduationCap,
  Building2,
  Users
} from 'lucide-react';
import { AuthContext } from './context/AuthContext.jsx';
import { Button } from "../ui/button";

const RoleSelector = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const roles = [
    { id: 'employer', title: 'Employer', icon: Briefcase, description: 'Hiring manager' },
    { id: 'student', title: 'Student', icon: GraduationCap, description: 'Learning path' },
    { id: 'college', title: 'College', icon: Building2, description: 'Institution' },
    { id: 'mentor', title: 'Mentor', icon: Users, description: 'Guide others' }
  ];

  const handleClick = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    setIsLoading(true);

    // Save role to localStorage
    localStorage.setItem('userRole', selectedRole);

    setTimeout(() => {
      setIsLoading(false);
      // Redirect to the role-specific dashboard
      const dashboardPaths = {
        employer: '/employerdashboard',
        student: '/profile',
        college: '/collegedashboard',
        mentor: '/mentordashboard',
        admin: '/admindashboard'
      };
      navigate(dashboardPaths[selectedRole] || '/');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 mb-2">Select your role</h1>
          <p className="text-zinc-400">Choose how you want to interact with the platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => handleClick(role.id)}
                className={`
                  relative group p-6 rounded-2xl border transition-all duration-200 text-left
                  ${isSelected
                    ? 'bg-zinc-900 border-zinc-700'
                    : 'bg-zinc-950/50 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-800'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-zinc-800 text-zinc-50' : 'bg-zinc-900 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-zinc-300'}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold mb-1 transition-colors ${isSelected ? 'text-zinc-50' : 'text-zinc-300 group-hover:text-white'}`}>
                      {role.title}
                    </h2>
                    <p className={`text-sm transition-colors ${isSelected ? 'text-zinc-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                      {role.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-zinc-50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className="px-8 py-5 h-auto text-base"
          >
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
