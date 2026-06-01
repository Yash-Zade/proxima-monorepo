import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../lib/apiClient';

/**
 * @title Proxima Protected Route Guard
 * @notice Protects pages and validates session tokens, refreshing expired ones automatically.
 * @dev Inspects accessToken exp claim, connects to POST /auth/refresh on expiry, and maps role dashboards.
 * @param {React.ReactNode} children Target page components to serve.
 * @param {boolean} authentication If true, routes are for authenticated users; else, for guest routes only.
 */
export default function Protected({ children, authentication }) {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);

  /**
   * @notice Trigger HttpOnly refresh token rotation to retrieve new accessToken.
   * @dev Posts to Spring Boot '/auth/refresh' and stores the new key inside localStorage.
   */
  const refreshAccessToken = async () => {
    try {
      console.log('[Dev Alert] Expired token. Initiating refresh rotation...');
      const response = await apiClient.post('/auth/refresh');
      
      // Spring wraps LoginResponseDTO in ApiResponse generic wrapper
      const newAccessToken = response.data?.data?.accessToken;
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
        console.log('[Dev Alert] Token refreshed successfully inside guard.');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Dev Alert] Refresh intercept inside guard failed:', error);
      localStorage.removeItem('accessToken');
      return false;
    }
  };

  /**
   * @notice Inspects access keys and decodes claims.
   * @dev Validates token exp date and routes to dashboard segments according to localStorage userRole.
   */
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token || token === 'undefined') {
      setLoader(false);
      if (authentication) {
        navigate('/signin');
      }
      return;
    }

    try {
      // Decode JWT fields to verify expiration claims
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Access key is expired - attempt token rotation via HttpOnly refresh cookie
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          navigate('/signin');
          setLoader(false);
          return;
        }
      }

      // Session is valid. If this is a guest-only route (like SignIn/SignUp), redirect to profile dashboard
      if (!authentication) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('[Dev Alert] Invalid token structure parsed inside guard:', error);
      localStorage.removeItem('accessToken');
      if (authentication) {
        navigate('/signin');
      }
    }

    setLoader(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, [navigate, authentication]);

  if (loader) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-lg bg-[#241E1A] animate-spin mx-auto flex items-center justify-center">
            <span className="text-[#FDFBF7] font-black text-xs">P</span>
          </div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Validating credentials node...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
