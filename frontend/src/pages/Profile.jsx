import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { profileAPI } from '../services/api.js';

const Profile = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const loadProfile = async () => {
      try {
        const res = await profileAPI.getProfile();
        if (res.success) {
          setFormData(res.data || {});
        }
      } catch {
        setMessage('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await profileAPI.updateProfile(formData);
      if (res.success) {
        setMessage('Profile updated successfully');
        setFormData(res.data);
      } else {
        setMessage(res.message || 'Update failed');
      }
    } catch {
      setMessage('Update failed');
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading profile...</div>;
  }

  const isCollege = (user?.type === 'college');

  return (
    <div className="container" style={{ padding: 20 }}>
      <h2>Profile</h2>
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>
      )}

      <form onSubmit={handleSubmit} className="application-form">
        {isCollege ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>College Name</label>
                <input name="collegeName" value={formData.collegeName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Contact No</label>
                <input name="contactNo" value={formData.contactNo || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input name="collegeCity" value={formData.collegeCity || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Grade</label>
                <input name="grade" value={formData.grade || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>TPO Name</label>
                <input name="tpoName" value={formData.tpoName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>TPO Contact No</label>
                <input name="tpoContactNo" value={formData.tpoContactNo || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>University Affiliation</label>
                <input name="universityAffiliation" value={formData.universityAffiliation || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Courses</label>
                <input name="courses" value={formData.courses || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Number of Students</label>
                <input name="numStudents" type="number" value={formData.numStudents || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Highest CGPA</label>
                <input name="highestCGPA" value={formData.highestCGPA || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Average CTC</label>
                <input name="avgCTC" value={formData.avgCTC || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Average Placed</label>
                <input name="avgPlaced" type="number" value={formData.avgPlaced || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Placement Percent</label>
                <input name="placementPercent" value={formData.placementPercent || ''} onChange={handleChange} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input name="companyName" value={formData.companyName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Contact No</label>
                <input name="contactNo" value={formData.contactNo || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Industry</label>
                <input name="industry" value={formData.industry || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Company Size</label>
                <input name="companySize" value={formData.companySize || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input name="location" value={formData.location || ''} onChange={handleChange} />
              </div>
            </div>
          </>
        )}
        <button type="submit" className="submit-btn">Save</button>
      </form>
    </div>
  );
};

export default Profile;
