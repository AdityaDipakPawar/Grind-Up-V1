import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import JobFilters from "../components/JobFilters";
import "../styles/jobs.css";

const Jobs = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    jobType: "",
    workMode: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    category: "",
    sortBy: "postedAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    fetchJobs();
    if (isAuthenticated && user?.type === "college") {
      fetchAppliedJobs();
    }
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/job-posts?${queryParams}`,
        {
          headers: isAuthenticated
            ? { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            : {},
        }
      );
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/job-applications/college`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAppliedJobs(data.data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };

  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.type !== "college") {
      alert("Only college accounts can apply to jobs.");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/job-applications/${jobId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            coverLetter: "Interested in this position",
            resume: "resume_url_here",
          }),
        }
      );
      const data = await response.json();
      if (data?.success) {
        alert("Application submitted successfully!");
        fetchAppliedJobs();
      } else {
        alert(data?.message || "Failed to apply. Please try again.");
      }
    } catch (err) {
      alert("Failed to apply. Please try again.");
    }
  };

  const isJobApplied = (jobId) => {
    return appliedJobs.some((application) => application.job?._id === jobId);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "",
      jobType: "",
      workMode: "",
      experienceLevel: "",
      salaryMin: "",
      salaryMax: "",
      category: "",
      sortBy: "postedAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="jobs-page">
      <main className="main-content main-auth">
        <div className="container">
          <h1 className="page-title">Find Your Next Opportunity</h1>

          <div className="jobs-layout">
            <aside className="filters-sidebar">
              <JobFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </aside>

            <div className="jobs-content">
              {loading ? (
                <div className="loading-state">
                  <p>Loading jobs...</p>
                </div>
              ) : jobs.length > 0 ? (
                <>
                  <div className="results-header">
                    <p>{jobs.length} job(s) found</p>
                  </div>
                  <div className="jobs-grid">
                    {jobs.map((job) => (
                      <div key={job._id} className="job-card">
                        <div className="job-header">
                          <h3>{job.title}</h3>
                          <span className="job-type-badge">{job.jobType}</span>
                        </div>
                        <p className="company-name">
                          {job.company?.companyName || "Company"}
                        </p>
                        <p className="job-description">
                          {job.shortDescription ||
                            job.description.substring(0, 150)}
                          ...
                        </p>
                        <div className="job-meta">
                          <span>
                            📍 {job.location.city}, {job.location.state}
                          </span>
                          <span>💼 {job.workMode}</span>
                          {job.salary?.min && (
                            <span>
                              💰 ₹{job.salary.min}
                              {job.salary.max ? `-${job.salary.max}` : "+"}
                            </span>
                          )}
                        </div>
                        <div className="job-actions">
                          <button
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            className="view-details-btn"
                          >
                            View Details
                          </button>
                          {isAuthenticated && user?.type === "college" && (
                            <button
                              onClick={() => handleApply(job._id)}
                              className={`apply-btn ${
                                isJobApplied(job._id) ? "applied" : ""
                              }`}
                              disabled={isJobApplied(job._id)}
                            >
                              {isJobApplied(job._id) ? "Applied" : "Apply Now"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>No jobs match your filters. Try adjusting your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
