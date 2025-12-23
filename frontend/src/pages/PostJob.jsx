import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import "../styles/home.css";

const PostJob = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    location: {
      city: "",
      state: "",
    },
    salary: "",
    jobType: "full-time",
    workMode: "onsite",
    requiredSkills: "",
    applicationDeadline: "",
    vacancies: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.type !== "company") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "city" || name === "state") {
      setJobFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else {
      setJobFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleJobFormSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.type !== "company") return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/job-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          ...jobFormData,
          requiredSkills: jobFormData.requiredSkills
            ? jobFormData.requiredSkills.split(",").map((skill) => skill.trim())
            : [],
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Job posted successfully");
        setJobFormData({
          title: "",
          description: "",
          location: { city: "", state: "" },
          salary: "",
          jobType: "full-time",
          workMode: "onsite",
          requiredSkills: "",
          applicationDeadline: "",
          vacancies: 1,
        });
      } else {
        setMessage(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      setMessage("Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isApproved = user?.approvalStatus === "approved";

  return (
    <div className="home-page post-job-page">
      <main className="main-content">
        <div className="hero-section">
          <div className="job-form-container">
            <h2>Post a New Job</h2>
            {user && user.approvalStatus && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ffeaa7",
                  background: isApproved ? "#d4edda" : "#fff3cd",
                  color: isApproved ? "#155724" : "#856404",
                }}
              >
                {isApproved
                  ? "Your company is approved. You can post jobs."
                  : "Your company profile is not approved yet. You cannot post jobs until it is approved."}
              </div>
            )}

            <form onSubmit={handleJobFormSubmit} className="job-form">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={jobFormData.title}
                  onChange={handleJobFormChange}
                  required
                  disabled={!isApproved || submitting}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={jobFormData.description}
                  onChange={handleJobFormChange}
                  required
                  disabled={!isApproved || submitting}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={jobFormData.location.city}
                    onChange={handleJobFormChange}
                    required
                    disabled={!isApproved || submitting}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={jobFormData.location.state}
                    onChange={handleJobFormChange}
                    required
                    disabled={!isApproved || submitting}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="text"
                    name="salary"
                    value={jobFormData.salary}
                    onChange={handleJobFormChange}
                    disabled={!isApproved || submitting}
                  />
                </div>
                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    name="jobType"
                    value={jobFormData.jobType}
                    onChange={handleJobFormChange}
                    disabled={!isApproved || submitting}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Work Mode</label>
                  <select
                    name="workMode"
                    value={jobFormData.workMode}
                    onChange={handleJobFormChange}
                    disabled={!isApproved || submitting}
                  >
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Vacancies</label>
                  <input
                    type="number"
                    name="vacancies"
                    value={jobFormData.vacancies}
                    onChange={handleJobFormChange}
                    min="1"
                    disabled={!isApproved || submitting}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Required Skills (comma separated)</label>
                <input
                  type="text"
                  name="requiredSkills"
                  value={jobFormData.requiredSkills}
                  onChange={handleJobFormChange}
                  disabled={!isApproved || submitting}
                />
              </div>
              <div className="form-group">
                <label>Application Deadline</label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={jobFormData.applicationDeadline}
                  onChange={handleJobFormChange}
                  disabled={!isApproved || submitting}
                />
              </div>
              <button type="submit" className="submit-btn" disabled={!isApproved || submitting}>
                {submitting ? "Posting..." : "Post Job"}
              </button>
            </form>
            {message && <p style={{ marginTop: "12px", color: message.includes("success") ? "#155724" : "#c53030" }}>{message}</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostJob;
