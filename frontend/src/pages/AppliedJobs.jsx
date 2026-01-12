import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import "../styles/AppliedJobs.css";

const AppliedJobs = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.type !== "college") {
      navigate("/home");
      return;
    }

    fetchAppliedJobs();
  }, [isAuthenticated, user, navigate]);

  const fetchAppliedJobs = async () => {
    setLoading(true);
    setError(null);
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
      } else {
        setError(data.message || "Failed to fetch applied jobs");
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      setError("An error occurred while fetching applied jobs");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      applied: "#2196F3",
      "under-review": "#FF9800",
      shortlisted: "#4CAF50",
      "interview-scheduled": "#9C27B0",
      interviewed: "#607D8B",
      accepted: "#4CAF50",
      rejected: "#F44336",
      withdrawn: "#757575",
    };
    return statusColors[status] || "#757575";
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      applied: "Applied",
      "under-review": "Under Review",
      shortlisted: "Shortlisted",
      "interview-scheduled": "Interview Scheduled",
      interviewed: "Interviewed",
      accepted: "Accepted",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
    };
    return statusLabels[status] || status;
  };

  const filteredJobs = appliedJobs.filter((application) => {
    if (filterStatus === "all") return true;
    return application.status === filterStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="applied-jobs-page">
        <div className="applied-jobs-container">
          <div className="loading-state">
            <p>Loading your applied jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applied-jobs-page">
        <div className="applied-jobs-container">
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={fetchAppliedJobs} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="applied-jobs-page">
      <div className="applied-jobs-container">
        <div className="page-header">
          <h1>My Applied Jobs</h1>
          <p className="subtitle">
            Track all your job applications and their status
          </p>
        </div>

        {appliedJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Applications Yet</h2>
            <p>You haven't applied for any jobs yet.</p>
            <p className="empty-hint">
              Browse available jobs and apply to get started!
            </p>
            <button
              className="browse-jobs-btn"
              onClick={() => navigate("/jobs")}
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <>
            {/* Status Filter */}
            <div className="filter-section">
              <label>Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Applications</option>
                <option value="applied">Applied</option>
                <option value="under-review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview-scheduled">Interview Scheduled</option>
                <option value="interviewed">Interviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="application-count">
                {filteredJobs.length} of {appliedJobs.length} applications
              </span>
            </div>

            {/* Applications List */}
            <div className="applications-list">
              {filteredJobs.map((application) => (
                <div key={application._id} className="application-card">
                  <div className="application-header">
                    <div className="job-title-section">
                      <h3>{application.job?.title || "Job Title"}</h3>
                      <div
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(application.status),
                        }}
                      >
                        {getStatusLabel(application.status)}
                      </div>
                    </div>
                    <div className="company-info">
                      {application.job?.company && (
                        <p className="company-name">
                          {application.job.company.companyName ||
                            application.job.company?.companyName ||
                            "Company"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="application-details">
                    <div className="detail-row">
                      <span className="detail-label">Applied On:</span>
                      <span className="detail-value">
                        {formatDate(application.appliedAt)}
                      </span>
                    </div>

                    {application.job?.location && (
                      <div className="detail-row">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">
                          {application.job.location.city},{" "}
                          {application.job.location.state}
                        </span>
                      </div>
                    )}

                    {application.job?.jobType && (
                      <div className="detail-row">
                        <span className="detail-label">Job Type:</span>
                        <span className="detail-value">
                          {application.job.jobType}
                        </span>
                      </div>
                    )}

                    {application.job?.salary && (
                      <div className="detail-row">
                        <span className="detail-label">Salary:</span>
                        <span className="detail-value">
                          {application.job.salary.min
                            ? `₹${application.job.salary.min.toLocaleString()}`
                            : ""}
                          {application.job.salary.min &&
                          application.job.salary.max
                            ? " - "
                            : ""}
                          {application.job.salary.max
                            ? `₹${application.job.salary.max.toLocaleString()}`
                            : ""}
                          {application.job.salary.period
                            ? ` ${application.job.salary.period.replace(
                                "-",
                                " "
                              )}`
                            : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="application-actions">
                    <button
                      className="view-job-btn"
                      onClick={() =>
                        navigate(`/jobs/${application.job?._id}`)
                      }
                    >
                      View Job Details
                    </button>
                    <button
                      className="view-application-btn"
                      onClick={() =>
                        navigate(
                          `/job-applications/view/${application._id}`
                        )
                      }
                    >
                      View Application
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;




