import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

export const AuthContext = createContext(null);

/**
 * @title Proxima Authentication Context Provider
 * @notice Maintains user login state and implements backend login, signup, and logout integrations.
 * @dev Connects directly to Spring Boot AuthController endpoints using the secure apiClient Axios instance.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session state on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await apiClient.get('/users/me');
          setUser(response.data?.data || response.data);
        } catch (error) {
          console.error('[Dev Alert] Session restore failed:', error);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  /**
   * @notice Attempts authentication against backend POST /auth/login.
   * @dev Recovers AccessToken from ApiResponse and stores it inside localStorage.
   * @param {string} email User credential identifier.
   * @param {string} password User credential secret key.
   */
  const login = async (email, password) => {
    try {
      console.log('[Dev Alert] Directing AuthContext login dispatch...');
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Spring wraps LoginResponseDTO in ApiResponse generic wrapper
      const accessToken = response.data?.data?.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        try {
          const profileRes = await apiClient.get('/users/me');
          const userData = profileRes.data?.data || profileRes.data;
          setUser(userData);
          if (userData && userData.roles && userData.roles.length > 0) {
            localStorage.setItem('userRole', userData.roles[0]);
          }
        } catch (err) {
          console.error('[Dev Alert] Failed to fetch profile after login', err);
          setUser({ email });
        }
        return response;
      } else {
        throw new Error('Access token absent from response payload.');
      }
    } catch (error) {
      console.error('[Dev Alert] AuthContext login transaction reject:', error);
      throw error;
    }
  };

  /**
   * @notice Registers a new developer node via POST /auth/signup.
   * @dev Delivers DTO structure and forwards output response.
   * @param {object} signUpData Credentials data (name, email, password).
   */
  const signup = async (signUpData) => {
    try {
      console.log('[Dev Alert] Directing AuthContext signup dispatch...');
      const response = await apiClient.post('/auth/signup', {
        name: signUpData.fullName,
        email: signUpData.email,
        password: signUpData.password,
      });
      return response;
    } catch (error) {
      console.error('[Dev Alert] AuthContext signup transaction reject:', error);
      throw error;
    }
  };

  /**
   * @notice Invalidates current session via POST /auth/logout.
   * @dev Performs post command and clears localStorage tokens.
   */
  const logout = async () => {
    try {
      console.log('[Dev Alert] Cleaning up node session credentials...');
      await apiClient.post('/auth/logout');
    } catch (_) {
      // Ignore logout exception signals
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    signup,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
