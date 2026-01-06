import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import ApplicationTimeline from "../components/ApplicationTimeline";
import "../styles/ApplicationDetails.css";

const ApplicationDetails = () => {
  const { applicationId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.type !== "college") {
      console.error("User type check failed:", { userType: user?.type, user });
      navigate("/home");
      return;
    }

    const fetchApplicationDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching application:", applicationId);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-applications/${applicationId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        
        console.log("Response status:", response.status);
        
        let data;
        try {
          data = await response.json();
          console.log("Response data:", data);
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          setError("Invalid response from server");
          setLoading(false);
          return;
        }
        
        if (response.ok && data.success) {
          console.log("Application data:", data.data);
          setApplication(data.data);
        } else {
          console.error("API error:", data);
          setError(data.message || `Failed to fetch application details (Status: ${response.status})`);
        }
      } catch (error) {
        console.error("Error fetching application details:", error);
        setError(error.message || "An error occurred while fetching application details");
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationDetails();
    } else {
      setError("Application ID is missing");
      setLoading(false);
    }
  }, [isAuthenticated, applicationId, navigate, user]);

  const getStatusClass = (status) => {
    switch (status) {
      case "applied":
      case "pending":
        return "status-pending";
      case "under-review":
      case "reviewing":
        return "status-reviewing";
      case "shortlisted":
        return "status-shortlisted";
      case "interview-scheduled":
      case "interviewed":
        return "status-shortlisted";
      case "rejected":
        return "status-rejected";
      case "accepted":
        return "status-accepted";
      case "withdrawn":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  if (loading) {
    return (
      <div className="application-details-container">
        <div className="loading-state">
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="application-details-container">
        <button className="back-btn" onClick={() => navigate("/applied-jobs")}>
          ← Back to Applied Jobs
        </button>
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="application-details-container">
        <button className="back-btn" onClick={() => navigate("/applied-jobs")}>
          ← Back to Applied Jobs
        </button>
        <div className="error-state">
          <h2>Application Not Found</h2>
          <p>The application you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={() => navigate("/applied-jobs")} className="retry-btn">
            Go to Applied Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="application-details-container">
      <div className="application-header">
        <button className="back-btn" onClick={() => navigate("/applied-jobs")}>
          ← Back to Applied Jobs
        </button>
        <h1>Application Details</h1>
        <div className={`application-status ${getStatusClass(application.status)}`}>
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </div>
      </div>

      <div className="application-content">
        <div className="job-details-section">
          <h2>Job Details</h2>
          <div className="detail-card">
            <h3>{application.job?.title || "Job Title"}</h3>
            <p className="company-name">
              {application.job?.company?.companyName || 
               application.job?.company || 
               "Company"}
            </p>
            {application.job?.location && (
              <div className="job-meta">
                <span>
                  Location: {application.job.location.city || ""}, {application.job.location.state || ""}
                </span>
              </div>
            )}
            {application.job?.jobType && (
              <div className="job-meta">
                <span>Job Type: {application.job.jobType}</span>
              </div>
            )}
            {application.job?.salary && (
              <div className="job-meta">
                <span>
                  Salary: ₹{application.job.salary.min?.toLocaleString() || ""}
                  {application.job.salary.max ? ` - ₹${application.job.salary.max.toLocaleString()}` : ""}
                  {application.job.salary.period ? ` ${application.job.salary.period.replace("-", " ")}` : ""}
                </span>
              </div>
            )}
            {application.job?.description && (
              <div className="job-description">
                <h4>Description</h4>
                <p>{application.job.description}</p>
              </div>
            )}
            {application.job?.requiredSkills && application.job.requiredSkills.length > 0 && (
              <div className="skills-section">
                <h4>Required Skills</h4>
                <div className="skills-list">
                  {application.job.requiredSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {application && <ApplicationTimeline application={application} />}

        <div className="application-details-section">
          <h2>Your Application</h2>
          <div className="detail-card">
            <div className="application-meta">
              <p>Applied on: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : "N/A"}</p>
              {application.updatedAt && (
                <p>Last updated: {new Date(application.updatedAt).toLocaleDateString()}</p>
              )}
            </div>
            
            {/* Cover letter and resume are optional for college applications */}
            {application.coverLetter && (
              <div className="cover-letter-section">
                <h4>Cover Letter</h4>
                <p>{application.coverLetter}</p>
              </div>
            )}
            
            {application.resume && (
              <div className="resume-section">
                <h4>Resume</h4>
                <a href={application.resume} target="_blank" rel="noopener noreferrer" className="resume-link">
                  View Resume
                </a>
              </div>
            )}

            {!application.coverLetter && !application.resume && (
              <div className="application-note">
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  Note: This is a college application. The college has expressed interest on behalf of their students.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;