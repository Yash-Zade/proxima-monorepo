import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import JobListings from './pages/JobListings';
import JobDetail from './pages/JobDetail';
import DirectMessages from './pages/DirectMessages';
import Profile from './pages/Profile';
import MySkills from './pages/MySkills';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import Sandbox from './pages/Sandbox';
import Protected from './components/Protected';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* Dynamic responsive Navigation Bar */}
      <Navbar />

      {/* Main Core Layout View */}
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public / Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Guest-only auth routes */}
          <Route
            path="/signin"
            element={
              <Protected authentication={false}>
                <SignIn />
              </Protected>
            }
          />
          <Route
            path="/signup"
            element={
              <Protected authentication={false}>
                <SignUp />
              </Protected>
            }
          />

          {/* Secure authenticated routes */}
          <Route
            path="/jobs"
            element={
              <Protected authentication={true}>
                <JobListings />
              </Protected>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <Protected authentication={true}>
                <JobDetail />
              </Protected>
            }
          />
          <Route
            path="/messages"
            element={
              <Protected authentication={true}>
                <DirectMessages />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected authentication={true}>
                <Profile />
              </Protected>
            }
          />
          <Route
            path="/skills"
            element={
              <Protected authentication={true}>
                <MySkills />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected authentication={true}>
                <AdminDashboard />
              </Protected>
            }
          />
          <Route
            path="/employer"
            element={
              <Protected authentication={true}>
                <EmployerDashboard />
              </Protected>
            }
          />
          <Route
            path="/sandbox"
            element={
              <Protected authentication={true}>
                <Sandbox />
              </Protected>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Corporate Minimal Footer */}
      <Footer />
    </div>
  );
}
