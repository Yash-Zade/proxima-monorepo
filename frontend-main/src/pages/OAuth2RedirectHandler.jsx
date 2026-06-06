import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../lib/apiClient';

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);
  const { showToast } = useToast();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRedirect = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const errorMsg = params.get('error');

      if (errorMsg) {
        console.error('[OAuth2] Redirect error from backend:', errorMsg);
        setError(errorMsg);
        showToast(errorMsg, 'error');
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
            if (userData.roles && userData.roles.length > 0) {
              localStorage.setItem('userRole', userData.roles[0]);
            }
            showToast('Credential keys synchronized successfully!', 'success');
            
            setTimeout(() => {
              navigate('/profile');
            }, 1000);
          } else {
            throw new Error('Could not fetch user profile details');
          }
        } catch (err) {
          console.error('[OAuth2] Session profile retrieval failed:', err);
          setError(err.message || 'Authentication failed. Please try again.');
          showToast(err.message || 'Authentication failed.', 'error');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
        }
      } else {
        console.error('[OAuth2] No token found in redirect parameters.');
        setError('No authentication token received.');
      }
    };

    handleRedirect();
  }, [location, navigate, setUser, showToast]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-[#E5DAC9] p-8 max-w-md w-full text-center space-y-6 rounded-3xl shadow-sm">
          <h2 className="text-2xl font-black text-stone-800">Authentication Failed</h2>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{error}</p>
          <button
            onClick={() => navigate('/signin')}
            className="w-full py-3 px-4 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Back to SignIn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 rounded-lg bg-[#241E1A] animate-spin flex items-center justify-center shadow-md">
        </div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest animate-pulse">
          Authenticating credentials...
        </p>
      </div>
    </div>
  );
}
