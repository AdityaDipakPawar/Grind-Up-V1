import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProfileCompletionWarning.css';

const ProfileCompletionWarning = () => {
  const { user, checkProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const [missingFields, setMissingFields] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      setLoading(true);
      try {
        if (user) {
          // If profile is already marked as complete, don't show banner
          if (user.profileComplete === true) {
            setLoading(false);
            return;
          }
          // If profile is incomplete, get missing fields
          const result = await checkProfileCompletion();
          if (result && result.missingFields) {
            setMissingFields(result.missingFields);
          }
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [user?.profileComplete, checkProfileCompletion]);

  // Don't show banner if:
  // 1. User is not authenticated
  // 2. Profile is complete
  // 3. Banner is dismissed
  // 4. Still loading
  if (!user || user.profileComplete === true || dismissed || loading) {
    return null;
  }

  return (
    <div className="profile-warning-container">
      <div className="profile-warning-banner">
        <div className="warning-icon">⚠️</div>
        <div className="warning-content">
          <h3>Complete Your Profile</h3>
          <p>
            Your profile is incomplete. Please complete the following required fields to get full access:
          </p>
          {missingFields.length > 0 && (
            <ul className="missing-fields">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="warning-actions">
          <button 
            className="btn-complete-profile"
            onClick={() => navigate('/profile')}
          >
            Complete Profile
          </button>
          <button 
            className="btn-dismiss"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionWarning;
