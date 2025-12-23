import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import Home from "./Home";
import Placements from "./Placements";
import Navbar from "./Navbar";
import FirstView from "./FirstView";
import Invite from "./Invite";
import Login from "./Login";
import CollegeSignup from "./CollegeSignup";
import AdminSignup from "./AdminSignup";
import AdminPanel from "./pages/AdminPanel";
import AdminRoute from "./components/AdminRoute";
import CompanySignup from "./CompanySignup";
import Footer from "./Footer";
import JobApplications from "./pages/JobApplications";
import ApplicationDetails from "./pages/ApplicationDetails";
import Profile from "./pages/Profile";
import Dashboard from "./components/Dashboard";
import PostJob from "./pages/PostJob";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/home" element={<Home />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/first-view" element={<FirstView />} />
          <Route path="/invite" element={<Invite />} />
          <Route path="/login" element={<Login />} />
          <Route path="/college-signup" element={<CollegeSignup />} />
          <Route path="/company-signup" element={<CompanySignup />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/job-applications/:jobId"
            element={<JobApplications />}
          />
          <Route
            path="/job-applications/view/:applicationId"
            element={<ApplicationDetails />}
          />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
