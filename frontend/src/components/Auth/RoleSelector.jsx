import React, { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Users 
} from 'lucide-react';
import { AuthContext } from './context/AuthContext.jsx';
import apiClient from './ApiClient';

const RoleSelector = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const  auth  = useContext(AuthContext);
  const user=auth?.user;
  console.log("user"  , auth);

  const roles = [
    { id: 'employer', title: 'Employer', icon: Briefcase, description: 'Hiring manager' },
    { id: 'student', title: 'Student', icon: GraduationCap, description: 'Learning path' },
    { id: 'college', title: 'College', icon: Building2, description: 'Institution' },
    { id: 'mentor', title: 'Mentor', icon: Users, description: 'Guide others' }
  ];

  const handleClick = async (roleId) => {
    setSelectedRole(roleId);

    const appendUserId = roleId === "student"  ? `/${user.data.id}` : "";
    const apiUrl = `${import.meta.env.VITE_BACKEND_BASE_URL}users/request/${roleId}${appendUserId}`;
    console.log("apiUrl", apiUrl);
    try {
      const res = await apiClient.post(apiUrl, { role: roleId });
      console.log("res", res);
      if (res) {
        navigate('/');
      }
    } catch (error) {
      console.error("Error sending role request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-8">Select your role</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleClick(role.id)}
                className={`
                  relative group p-6 rounded-xl transition-all duration-300 ease-in-out
                  ${selectedRole === role.id ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-gray-800 hover:bg-gray-750'}
                `}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-xl mb-3 ${selectedRole === role.id ? 'bg-blue-500' : 'bg-gray-700 group-hover:bg-gray-600'}`}>
                    <Icon size={24} className={`${selectedRole === role.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
                  </div>
                  <h2 className={`text-lg font-medium mb-1 ${selectedRole === role.id ? 'text-white' : 'text-gray-200'}`}>
                    {role.title}
                  </h2>
                  <p className={`text-sm ${selectedRole === role.id ? 'text-blue-100' : 'text-gray-400'}`}>
                    {role.description}
                  </p>
                </div>
                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${selectedRole === role.id ? 'bg-white' : 'bg-gray-600'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
