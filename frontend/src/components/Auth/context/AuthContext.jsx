/* eslint-disable no-useless-catch */
import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../ApiClient';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}auth/login`, {
        email,
        password
      });
      const { accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      // console.log(response.data);
      // setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}auth/signup`, data);
      console.log(response.data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
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
