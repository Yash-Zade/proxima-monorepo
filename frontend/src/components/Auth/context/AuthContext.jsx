/* eslint-disable no-useless-catch */
import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../ApiClient';

export const AuthContext = createContext();

/**
 * NOTE on backend response structure:
 * The backend has a GlobalResponseHandler (ResponseBodyAdvice) that wraps ALL
 * responses in ApiResponse<T>:
 *   { timeStamp: "...", data: <payload>, error: null }
 *
 * So for login:  response.data.data.accessToken
 * For signup:    response.data.data  (UserDTO)
 * For errors:    error.response.data.error.message
 */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      // Backend POST /auth/login → ApiResponse<LoginResponseDTO>
      // Actual token: response.data.data.accessToken
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('[DEBUG] Login full response.data:', JSON.stringify(response.data));
      const accessToken = response.data?.data?.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        setUser({ email });
        return response;
      } else {
        throw new Error(`No access token in response. Got: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      // Re-throw so Login.jsx can catch and display the error
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      // Backend POST /auth/signup → ApiResponse<UserDTO>
      const response = await apiClient.post('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      return response;
    } catch (error) {
      // Re-throw so Signup.jsx can catch and display the error
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (_) {
      // ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    signup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
