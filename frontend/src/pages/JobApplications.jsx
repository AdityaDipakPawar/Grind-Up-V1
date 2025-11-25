import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import "../styles/index.css";

const JobApplications = () => {
  const { jobId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.type !== "company") {
      navigate("/home");
      return;
    }

    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-posts/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setJob(data.data.jobPost);
        } else {
          setError(data.message || "Failed to fetch job details");
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError("An error occurred while fetching job details");
      }
    };

    const fetchApplications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-applications/job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setApplications(data.data.applications || []);
        } else {
          setError(data.message || "Failed to fetch applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError("An error occurred while fetching applications");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
    fetchApplications();
  }, [isAuthenticated, jobId, navigate, user]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        // Update the application status in the local state
        setApplications(
          applications.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="applications-container">
      <div className="job-header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          Back to Home
        </button>
        <h1>Applications for {job?.title}</h1>
        <p className="job-meta">
          Location: {job?.location?.city}, {job?.location?.state} | 
          Type: {job?.jobType} | 
          Total Applications: {applications.length}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="no-applications">
          <p>No applications received for this job posting yet.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((application) => (
            <div key={application._id} className="application-card">
              <div className="applicant-info">
                <h3>{application.applicant.collegeName}</h3>
                <p>Applied on: {new Date(application.appliedAt).toLocaleDateString()}</p>
                <div className="status-badge" data-status={application.status}>
                  {application.status}
                </div>
              </div>
              
              <div className="application-details">
                <div className="detail-group">
                  <h4>Contact Information</h4>
                  <p>Email: {application.applicant.email}</p>
                  <p>Phone: {application.applicant.contactNumber || "Not provided"}</p>
                </div>
                
                <div className="detail-group">
                  <h4>Cover Letter</h4>
                  <p>{application.coverLetter || "No cover letter provided"}</p>
                </div>
                
                {application.resume && (
                  <div className="detail-group">
                    <h4>Resume</h4>
                    <a href={application.resume} target="_blank" rel="noopener noreferrer" className="resume-link">
                      View Resume
                    </a>
                  </div>
                )}
              </div>
              
              <div className="application-actions">
                <h4>Update Status</h4>
                <div className="status-buttons">
                  <button
                    className={`status-btn ${application.status === "pending" ? "active" : ""}`}
                    onClick={() => handleStatusChange(application._id, "pending")}
                    disabled={application.status === "pending"}
                  >
                    Pending
                  </button>
                  <button
                    className={`status-btn ${application.status === "reviewing" ? "active" : ""}`}
                    onClick={() => handleStatusChange(application._id, "reviewing")}
                    disabled={application.status === "reviewing"}
                  >
                    Reviewing
                  </button>
                  <button
                    className={`status-btn ${application.status === "shortlisted" ? "active" : ""}`}
                    onClick={() => handleStatusChange(application._id, "shortlisted")}
                    disabled={application.status === "shortlisted"}
                  >
                    Shortlisted
                  </button>
                  <button
                    className={`status-btn ${application.status === "rejected" ? "active" : ""}`}
                    onClick={() => handleStatusChange(application._id, "rejected")}
                    disabled={application.status === "rejected"}
                  >
                    Rejected
                  </button>
                  <button
                    className={`status-btn ${application.status === "accepted" ? "active" : ""}`}
                    onClick={() => handleStatusChange(application._id, "accepted")}
                    disabled={application.status === "accepted"}
                  >
                    Accepted
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;