import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts';
import { useNavigate } from 'react-router-dom';
import './invite.css';

const Invite = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [invites, setInvites] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.type === 'company') {
      fetchColleges();
      fetchMyJobs();
      fetchSentInvites();
    } else if (user?.type === 'college') {
      fetchCollegeInvites();
    }
  }, [isAuthenticated, user]);

  const fetchColleges = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/colleges`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setColleges(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/job-posts/company`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMyJobs(data.data.jobPosts || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchSentInvites = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/company`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setInvites(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invites:", error);
    }
  };

  const fetchCollegeInvites = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/college`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setInvites(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (collegeId) => {
    if (!selectedJob) {
      alert("Please select a job first");
      return;
    }

    setSendingInvite(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          collegeId,
          jobId: selectedJob,
          message: inviteMessage || undefined
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Invite sent successfully!");
        fetchSentInvites();
        setInviteMessage('');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("Failed to send invite. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/${inviteId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        alert("Invite accepted successfully!");
        fetchCollegeInvites();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error accepting invite:", error);
      alert("Failed to accept invite. Please try again.");
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invites/${inviteId}/decline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        alert("Invite declined");
        fetchCollegeInvites();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error declining invite:", error);
      alert("Failed to decline invite. Please try again.");
    }
  };

  if (loading) {
    return <div className="container"><main><p>Loading...</p></main></div>;
  }

  // Company view - Show colleges list
  if (user?.type === 'company') {
    return (
      <div className="container">
        <main>
          <div className="invite-header">
            <h2>Send Invitations to Colleges</h2>
            <div className="job-selector">
              <label>Select Job for Invitation:</label>
              <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                <option value="">-- Select a Job --</option>
                {myJobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="colleges-grid">
            <h3>Registered Colleges</h3>
            {colleges.length === 0 ? (
              <p>No colleges registered yet.</p>
            ) : (
              colleges.map(college => (
                <div key={college._id} className="college-card">
                  <div className="college-info">
                    <h4>{college.collegeName}</h4>
                    <p><strong>Location:</strong> {college.city}, {college.state}</p>
                    <p><strong>Email:</strong> {college.email}</p>
                    {college.contactNo && <p><strong>Contact:</strong> {college.contactNo}</p>}
                    {college.universityAffiliation && <p><strong>University:</strong> {college.universityAffiliation}</p>}
                  </div>
                  <button 
                    className="send-invite-btn" 
                    onClick={() => handleSendInvite(college._id)}
                    disabled={!selectedJob || sendingInvite}
                  >
                    {sendingInvite ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="sent-invites-section">
            <h3>Sent Invitations ({invites.length})</h3>
            {invites.length === 0 ? (
              <p>No invitations sent yet.</p>
            ) : (
              <div className="invites-list">
                {invites.map(invite => (
                  <div key={invite._id} className="invite-item">
                    <p><strong>College:</strong> {invite.college?.collegeName}</p>
                    <p><strong>Job:</strong> {invite.job?.title}</p>
                    <p><strong>Status:</strong> <span className={`status-${invite.status}`}>{invite.status}</span></p>
                    <p><strong>Sent:</strong> {new Date(invite.invitedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // College view - Show received invites
  return (
    <div className="container">
      <main>
        <div className="invite-header">
          <div className="section-title">
            <h3>Placement Invites</h3>
          </div>
        </div>
        <div className="invite-grid">
          {invites.length === 0 ? (
            <p>No invitations received yet.</p>
          ) : (
            invites.map(invite => (
              <div key={invite._id} className="invite-card">
                <div className="company-header">
                  <div className="company-logo">
                    <span>Logo</span>
                  </div>
                  <h4>{invite.company?.companyName}</h4>
                </div>
                <div className="job-details">
                  <div className="detail-item">
                    <span className="label">Role:</span>
                    <span className="value">{invite.job?.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">{invite.job?.location?.city}, {invite.job?.location?.state}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Employment type:</span>
                    <span className="value">{invite.job?.employmentType}</span>
                  </div>
                  {invite.job?.salary && (
                    <div className="detail-item">
                      <span className="label">Salary:</span>
                      <span className="value">₹{invite.job.salary.min?.toLocaleString('en-IN')} {invite.job.salary.period}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Description:</span>
                    <span className="value">{invite.job?.description?.substring(0, 100)}...</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Message:</span>
                    <span className="value">{invite.message}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`value status-${invite.status}`}>{invite.status}</span>
                  </div>
                </div>
                {invite.status === 'pending' && (
                  <div className="action-buttons">
                    <button className="accept-btn" onClick={() => handleAcceptInvite(invite._id)}>Accept</button>
                    <button className="ignore-btn" onClick={() => handleDeclineInvite(invite._id)}>Decline</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Invite; 