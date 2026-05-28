import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './ApiClient';
import { jwtDecode } from 'jwt-decode';

const Protected = ({ children, authentication }) => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);

  const refreshAccessToken = async () => {
    try {
      console.log("refreshAccessToken");
      // apiClient already has the correct baseURL; cookies sent automatically via withCredentials
      const response = await apiClient.post('/auth/refresh');
      // GlobalResponseHandler wraps all responses: { timeStamp, data: <payload>, error }
      const { accessToken } = response.data?.data; // LoginResponseDTO inside ApiResponse.data
      localStorage.setItem('accessToken', accessToken);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      localStorage.removeItem('accessToken');
      return false;
    }
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoader(false);
      if (authentication) {
        navigate('/login');
      }
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token expired — try to refresh via HttpOnly cookie
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          navigate('/login');
          setLoader(false);
          return;
        }
      }

      // Token is valid (or refreshed). If this is a guest-only route (login/signup), redirect to dashboard or roles.
      if (!authentication) {
        const role = localStorage.getItem('userRole');
        if (role) {
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
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('accessToken');
      if (authentication) {
        navigate('/login');
      }
    }

    setLoader(false);
  };

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, authentication]);

  return loader ? <h1>Loading...</h1> : <>{children}</>;
};

export default Protected;
