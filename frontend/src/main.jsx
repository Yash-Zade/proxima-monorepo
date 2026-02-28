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
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      //Add Protected Routes
      {
        path:"/admindashboard",
        element: 
          // <Protected>
            <AdminDashboard/>
          // </Protected>,
      },
      {
        path:"/forum",
        element:
          // <Protected>
        <AnonymousForum/>,
        // </Protected>,
      },
      {
        path:"/mentors",
        element:<MentorSearchPage/>
      },
      {
        path:"/mentor-profile/:id",
        element:<MentorProfile/>
      },
      {
        path:"/profile",
        element:
          <UserProfile/> 
      },
      {
        path:"/mentordashboard",
        element:<MentorDashboard/>
      },
      {
        path:"/employerdashboard",
        element:<EmployerDashboard/>
      },
      {
        path:"/collegedashboard",
        element:<CollegeDashboard/>
      },
      {
        path:"/jobs",
        element:<JobBoard/>
      },
      {
        path:"/chat",
        element:<ChatInteractions/>
      },
      {
        path:"/jobs/:jobid",
        element:<JobDetails/>
      },
      {
        path:"/apply/:jobid",
        element:
        // <Protected>
          <JobApplicationForm/>
        // </Protected>
      },
      {
        path:"/addJob",
        element:
        // <Protected>
        <JobPostingForm/>
        // </Protected>
      },
      {
        path:"/roles",
        element:<RoleSelector/>
      } , {
        path:"/exam",
        element:<ExamPortal/>
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
