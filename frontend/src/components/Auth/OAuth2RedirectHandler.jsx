import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import apiClient from './ApiClient';

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRedirect = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const errorMsg = params.get('error');

      if (errorMsg) {
        console.error('[OAuth2] Redirect error from backend:', errorMsg);
        setError(errorMsg);
        return;
      }

      if (token) {
        try {
          console.log('[OAuth2] Token found, setting accessToken and restoring profile...');
          localStorage.setItem('accessToken', token);

          // Retrieve user profile
          const profileRes = await apiClient.get('/users/me');
          const userData = profileRes.data?.data || profileRes.data;

          if (userData) {
            setUser(userData);
            
            // Handle role mapping and routing
            const role = userData.roles?.[0];
            if (role) {
              localStorage.setItem('userRole', role);
              const dashboardPaths = {
                employer: '/employerdashboard',
                student: '/profile',
                college: '/collegedashboard',
                mentor: '/mentordashboard',
                admin: '/admindashboard'
              };
              navigate(dashboardPaths[role] || '/');
            } else {
              navigate('/roles');
            }
          } else {
            throw new Error('Could not fetch user profile details');
          }
        } catch (err) {
          console.error('[OAuth2] Session profile retrieval failed:', err);
          setError(err.message || 'Authentication failed. Please try again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
        }
      } else {
        console.error('[OAuth2] No token found in redirect parameters.');
        setError('No authentication token received.');
      }
    };

    handleRedirect();
  }, [location, navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-red-500">Authentication Failed</h2>
          <p className="text-zinc-400 text-sm">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-medium rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 rounded-lg bg-zinc-50 animate-spin flex items-center justify-center shadow-md">
          <div className="w-4 h-4 bg-zinc-950 rounded-sm"></div>
        </div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
