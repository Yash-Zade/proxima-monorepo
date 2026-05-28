import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout/Layout.jsx";
import Signup from "./components/Auth/Signup.jsx";
import Login from "./components/Auth/Login.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import AnonymousForum from "./components/AnonymousForum/AnonymousForum.jsx";
import Home from "./components/Home/Home.jsx";
import MentorSearchPage from "./components/mentor/MentorSearchPage.jsx";
import MentorProfile from "./components/mentor/MentorProfile.jsx";
import UserProfile from "./components/UserProfile/ProfileCard.jsx";
import MentorDashboard from "./components/mentor/MentorDashboard.jsx";
import EmployerDashboard from "./components/Employer/EmployerDashboard.jsx";
import CollegeDashboard from "./components/College/CollegeDashboard.jsx";
import JobBoard from "./components/Jobs/JobBoard.jsx";
import ChatInteractions from "./components/ChatInteractions/ChatInteractions.jsx";
import JobDetails from "./components/Jobs/JobDetails.jsx";
import JobPostingForm from "./components/Jobs/PostForm.jsx"
import JobApplicationForm from "./components/Jobs/ApplyJob.jsx";
import RoleSelector from "./components/Auth/RoleSelector.jsx";
import ExamPortal from "./components/ExamPortal/Portal.jsx";
import Protected from "./components/Auth/Protected.jsx";
import { AuthProvider } from "./components/Auth/context/AuthContext.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Protected authentication={false}><Login /></Protected>,
      },
      {
        path: "/signup",
        element: <Protected authentication={false}><Signup /></Protected>,
      },
      // Protected Routes
      {
        path: "/admindashboard",
        element:
          <Protected authentication={true}>
            <AdminDashboard />
          </Protected>,
      },
      {
        path: "/forum",
        element:
          <Protected authentication={true}>
            <AnonymousForum />
          </Protected>,
      },
      {
        path: "/mentors",
        element: <MentorSearchPage />
      },
      {
        path: "/mentor-profile/:id",
        element: <MentorProfile />
      },
      {
        path: "/profile",
        element:
          <Protected authentication={true}>
            <UserProfile />
          </Protected>
      },
      {
        path: "/mentordashboard",
        element:
          <Protected authentication={true}>
            <MentorDashboard />
          </Protected>
      },
      {
        path: "/employerdashboard",
        element:
          <Protected authentication={true}>
            <EmployerDashboard />
          </Protected>
      },
      {
        path: "/collegedashboard",
        element:
          <Protected authentication={true}>
            <CollegeDashboard />
          </Protected>
      },
      {
        path: "/jobs",
        element: <JobBoard />
      },
      {
        path: "/chat",
        element:
          <Protected authentication={true}>
            <ChatInteractions />
          </Protected>
      },
      {
        path: "/jobs/:jobid",
        element: <JobDetails />
      },
      {
        path: "/apply/:jobid",
        element:
          <Protected authentication={true}>
            <JobApplicationForm />
          </Protected>
      },
      {
        path: "/addJob",
        element:
          <Protected authentication={true}>
            <JobPostingForm />
          </Protected>
      },
      {
        path: "/roles",
        element:
          <Protected authentication={true}>
            <RoleSelector />
          </Protected>
      }, {
        path: "/exam",
        element:
          <Protected authentication={true}>
            <ExamPortal />
          </Protected>
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
