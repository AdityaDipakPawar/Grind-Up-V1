import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts";
import "../styles/CollegeDetails.css";

const CollegeDetails = () => {
  const { collegeId } = useParams();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [college, setCollege] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchCollegeDetails = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/colleges/${collegeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setCollege(data.data);
        } else {
          setError(data.message || "Failed to fetch college details");
        }
      } catch (error) {
        console.error("Error fetching college details:", error);
        setError("An error occurred while fetching college details");
      } finally {
        setLoading(false);
      }
    };

    const fetchApplicationDetails = async () => {
      if (applicationId && user?.type === "company") {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/job-applications/${applicationId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          const data = await response.json();
          if (data.success) {
            setApplication(data.data);
          }
        } catch (error) {
          console.error("Error fetching application details:", error);
        }
      }
    };

    fetchCollegeDetails();
    fetchApplicationDetails();
  }, [collegeId, applicationId, isAuthenticated, navigate, user]);

  const handleStatusChange = async (newStatus) => {
    if (!applicationId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/job-applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setApplication({ ...application, status: newStatus });
        alert(`Application status updated to ${newStatus}`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading college details...</div>;
  }

  if (error) {
    return (
      <div className="college-details-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="college-details-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="error">College not found.</div>
      </div>
    );
  }

  return (
    <div className="college-details-page">
      <div className="college-details-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back to Applications
        </button>

        {/* Application Status Section (if viewing from application) */}
        {application && user?.type === "company" && (
          <div className="application-status-section">
            <div className="status-header">
              <h2>Application Status</h2>
              <div className="status-badge" data-status={application.status}>
                {application.status}
              </div>
            </div>
            <div className="status-actions">
              <button
                className={`status-btn ${application.status === "under-review" || application.status === "applied" ? "active" : ""}`}
                onClick={() => handleStatusChange("under-review")}
                disabled={application.status === "under-review" || application.status === "applied"}
              >
                Mark as Under Review
              </button>
              <button
                className={`status-btn ${application.status === "shortlisted" ? "active" : ""}`}
                onClick={() => handleStatusChange("shortlisted")}
                disabled={application.status === "shortlisted"}
              >
                Shortlist
              </button>
              <button
                className={`status-btn ${application.status === "accepted" ? "active" : ""}`}
                onClick={() => handleStatusChange("accepted")}
                disabled={application.status === "accepted"}
              >
                Accept
              </button>
              <button
                className={`status-btn ${application.status === "rejected" ? "active" : ""}`}
                onClick={() => handleStatusChange("rejected")}
                disabled={application.status === "rejected"}
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* College Header */}
        <div className="college-header">
          <div className="college-logo-placeholder">
            {college.collegeName?.charAt(0).toUpperCase() || "C"}
          </div>
          <div className="college-title">
            <h1>{college.collegeName}</h1>
            {college.approvalStatus && (
              <span className={`approval-badge ${college.approvalStatus}`}>
                {college.approvalStatus === "approved" ? "✓ Verified" : college.approvalStatus}
              </span>
            )}
          </div>
        </div>

        {/* College Information Sections */}
        <div className="college-details-grid">
          {/* Contact Information */}
          <div className="details-section">
            <h2 className="section-title">Contact Information</h2>
            <div className="details-list">
              <div className="detail-item">
                <strong>Email:</strong>
                <span>
                  <a href={`mailto:${college.email}`}>{college.email}</a>
                </span>
              </div>
              <div className="detail-item">
                <strong>Phone:</strong>
                <span>{college.contactNo || "Not provided"}</span>
              </div>
              {college.collegeCity && (
                <div className="detail-item">
                  <strong>City:</strong>
                  <span>{college.collegeCity}</span>
                </div>
              )}
            </div>
          </div>

          {/* TPO Information */}
          {(college.tpoName || college.tpoContactNo) && (
            <div className="details-section">
              <h2 className="section-title">TPO (Training & Placement Officer)</h2>
              <div className="details-list">
                {college.tpoName && (
                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{college.tpoName}</span>
                  </div>
                )}
                {college.tpoContactNo && (
                  <div className="detail-item">
                    <strong>Contact:</strong>
                    <span>{college.tpoContactNo}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Academic Information */}
          {(college.universityAffiliation || college.courses || college.grade || college.numStudents) && (
            <div className="details-section">
              <h2 className="section-title">Academic Information</h2>
              <div className="details-list">
                {college.universityAffiliation && (
                  <div className="detail-item">
                    <strong>University Affiliation:</strong>
                    <span>{college.universityAffiliation}</span>
                  </div>
                )}
                {college.courses && (
                  <div className="detail-item">
                    <strong>Courses:</strong>
                    <span>{college.courses}</span>
                  </div>
                )}
                {college.grade && (
                  <div className="detail-item">
                    <strong>Grade:</strong>
                    <span>{college.grade}</span>
                  </div>
                )}
                {college.numStudents && (
                  <div className="detail-item">
                    <strong>Number of Students:</strong>
                    <span>{college.numStudents.toLocaleString()}</span>
                  </div>
                )}
                {college.highestCGPA && (
                  <div className="detail-item">
                    <strong>Highest CGPA:</strong>
                    <span>{college.highestCGPA}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Placement Statistics */}
          {(college.avgCTC || college.placementPercent || college.avgPlaced) && (
            <div className="details-section">
              <h2 className="section-title">Placement Statistics</h2>
              <div className="details-list">
                {college.avgCTC && (
                  <div className="detail-item">
                    <strong>Average CTC:</strong>
                    <span>{college.avgCTC}</span>
                  </div>
                )}
                {college.placementPercent && (
                  <div className="detail-item">
                    <strong>Placement Percentage:</strong>
                    <span>{college.placementPercent}%</span>
                  </div>
                )}
                {college.avgPlaced && (
                  <div className="detail-item">
                    <strong>Average Placed:</strong>
                    <span>{college.avgPlaced}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(college.linkedinProfile || college.collegeWebsite) && (
            <div className="details-section">
              <h2 className="section-title">Links</h2>
              <div className="details-list">
                {college.linkedinProfile && (
                  <div className="detail-item">
                    <strong>LinkedIn:</strong>
                    <span>
                      <a
                        href={college.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link"
                      >
                        View Profile →
                      </a>
                    </span>
                  </div>
                )}
                {college.collegeWebsite && (
                  <div className="detail-item">
                    <strong>Website:</strong>
                    <span>
                      <a
                        href={college.collegeWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link"
                      >
                        Visit Website →
                      </a>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Placement Records */}
          {college.placementRecordUrl && (
            <div className="details-section">
              <h2 className="section-title">Placement Records</h2>
              <div className="details-list">
                <div className="detail-item">
                  <a
                    href={college.placementRecordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                  >
                    📥 Download Last 3 Years Placement Records
                  </a>
                  {college.placementRecordUploadedAt && (
                    <p className="upload-date">
                      Uploaded: {new Date(college.placementRecordUploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Application Details (if viewing from application) */}
        {application && (
          <div className="application-details-section">
            <h2 className="section-title">Application Details</h2>
            <div className="details-section">
              <div className="detail-item-full">
                <p>
                  <strong>Applied on:</strong> {new Date(application.appliedAt).toLocaleString()}
                </p>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                  Note: This is a college application. The college has expressed interest on behalf of their students.
                  {!application.coverLetter && !application.resume && ' No additional cover letter or resume was provided.'}
                </p>
              </div>
              {application.coverLetter && (
                <div className="detail-item-full">
                  <h3>Cover Letter</h3>
                  <p className="cover-letter-text">{application.coverLetter}</p>
                </div>
              )}
              {application.resume && (
                <div className="detail-item-full">
                  <h3>Resume</h3>
                  <a
                    href={application.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                  >
                    📄 View Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeDetails;

