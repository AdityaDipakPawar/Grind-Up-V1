import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts";
import ProfileCompletionWarning from "./components/ProfileCompletionWarning";
import "./styles/home.css";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [myJobPosts, setMyJobPosts] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs();
      if (user?.type === "college") {
        fetchAppliedJobs();
      } else if (user?.type === "company") {
        fetchMyJobPosts();
      }
    }
  }, [isAuthenticated, user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setJobs(data.data.jobPosts || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-applications/college`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAppliedJobs(data.data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };

  const fetchMyJobPosts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-posts/company`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMyJobPosts(data.data.jobPosts || []);
      }
    } catch (error) {
      console.error("Error fetching job posts:", error);
    }
  };

  const handleApplyForJob = async (jobId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-applications/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          coverLetter: "Interested in this position",
          resume: "resume_url_here"
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Application submitted successfully!");
        fetchAppliedJobs();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to apply for job. Please try again.");
    }
  };

  const isJobApplied = (jobId) => {
    return appliedJobs.some(application => application.job._id === jobId);
  };

  return (
    <div className="home-page">
      <main className="main-content">
        <div className="hero-section">
          {isAuthenticated && <ProfileCompletionWarning />}
          {isAuthenticated && user?.type === "company" && (
            <div className="company-actions">
              <h2>Welcome, {user.companyName}</h2>
              <button 
                className="post-job-btn" 
                onClick={() => navigate('/post-job')}
              >
                Post a New Job
              </button>

              {myJobPosts.length > 0 && (
                <div className="my-job-posts">
                  <h3>My Job Postings</h3>
                  <div className="job-list">
                    {myJobPosts.map(job => (
                      <div key={job._id} className="job-card">
                        <h4>{job.title}</h4>
                        <p>{job.shortDescription || job.description.substring(0, 100)}...</p>
                        <div className="job-meta">
                          <span>Location: {job.location.city}, {job.location.state}</span>
                          <span>Applications: {job.stats?.totalApplications || 0}</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/job-applications/${job._id}`)}
                          className="view-applications-btn"
                        >
                          View Applications
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isAuthenticated && user?.type === "college" && (
            <div className="college-actions">
              <h2>Welcome, {user.collegeName}</h2>
              
              {appliedJobs.length > 0 && (
                <div className="applied-jobs">
                  <h3>My Applied Jobs</h3>
                  <div className="job-list">
                    {appliedJobs.map(application => (
                      <div key={application._id} className="job-card">
                        <h4>{application.job.title}</h4>
                        <p>Status: {application.status}</p>
                        <p>Applied on: {new Date(application.appliedAt).toLocaleDateString()}</p>
                        <button 
                          onClick={() => navigate(`/job-applications/view/${application._id}`)}
                          className="view-application-btn"
                        >
                          View Application
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="search-section">
            <h2>Start your placement search</h2>
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search companies, jobs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="button" className="search-btn">
                <img src="/Logos/Search.svg" alt="Search" />
              </button>
            </div>
          </div>

          <div className="jobs-section">
            <div className="section-header">
              <h3>Available Jobs</h3>
            </div>
            {loading ? (
              <p>Loading jobs...</p>
            ) : jobs.length > 0 ? (
              <div className="jobs-grid">
                {jobs
                  .filter(job => 
                    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(job => (
                    <div key={job._id} className="job-card">
                      <h4>{job.title}</h4>
                      <p>{job.shortDescription || job.description.substring(0, 100)}...</p>
                      <div className="job-meta">
                        <span>Location: {job.location.city}, {job.location.state}</span>
                        <span>Type: {job.jobType}</span>
                        {job.salary && <span>Salary: {job.salary}</span>}
                      </div>
                      {isAuthenticated && user?.type === "college" && (
                        <button 
                          onClick={() => handleApplyForJob(job._id)}
                          className={`apply-btn ${isJobApplied(job._id) ? 'applied' : ''}`}
                          disabled={isJobApplied(job._id)}
                        >
                          {isJobApplied(job._id) ? 'Applied' : 'Apply Now'}
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="view-details-btn"
                      >
                        View Details
                      </button>
                    </div>
                  ))
                }
              </div>
            ) : (
              <p>No jobs available at the moment.</p>
            )}
          </div>

          <div className="companies-section">
            <div className="section-header">
              <h3>Top companies</h3>
            </div>
            <div className="companies-grid">
              <div className="company-card">
                <div className="company-logo">
                  <span>Logo</span>
                </div>
                <div className="company-info">
                  <h4>company name</h4>
                  <button className="view-btn">View</button>
                </div>
              </div>
              <div className="company-card">
                <div className="company-logo">
                  <span>Logo</span>
                </div>
                <div className="company-info">
                  <h4>company name</h4>
                  <button className="view-btn">View</button>
                </div>
              </div>
              <div className="company-card">
                <div className="company-logo">
                  <span>Logo</span>
                </div>
                <div className="company-info">
                  <h4>company name</h4>
                  <button className="view-btn">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
