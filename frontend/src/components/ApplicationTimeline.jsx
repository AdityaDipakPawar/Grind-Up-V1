import React from "react";
import "../styles/timeline.css";

const ApplicationTimeline = ({ application }) => {
  if (!application) {
    return null;
  }

  const getStatusSteps = () => {
    const status = application.status || "applied";
    
    const steps = [
      { label: "Applied", status: "applied", date: application.appliedAt || application.createdAt },
      { label: "Under Review", status: "under-review", date: application.reviewedAt || application.processTracking?.underReview },
      { label: "Interview", status: "interview", date: application.interviewAt || application.processTracking?.interviewScheduled },
      { 
        label: status === "rejected" ? "Rejected" : status === "accepted" ? "Accepted" : "Final Decision", 
        status: status === "rejected" ? "rejected" : status === "accepted" ? "accepted" : "final", 
        date: application.finalizedAt || application.processTracking?.finalDecision 
      },
    ];

    // Map status to step indices
    const statusIndexMap = {
      "applied": 0,
      "pending": 0,
      "under-review": 1,
      "reviewing": 1,
      "shortlisted": 1,
      "interview-scheduled": 2,
      "interviewed": 2,
      "interview": 2,
      "accepted": 3,
      "rejected": 3,
      "withdrawn": -1
    };

    const currentStatusIndex = statusIndexMap[status] !== undefined ? statusIndexMap[status] : 0;
    
    return steps.map((step, index) => ({
      ...step,
      completed: currentStatusIndex >= 0 && index <= currentStatusIndex,
      current: index === currentStatusIndex,
    }));
  };

  const steps = getStatusSteps();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return "";
    }
  };

  return (
    <div className="application-timeline">
      <h3>Application Progress</h3>
      <div className="timeline-container">
        {steps.map((step, index) => (
          <div key={index} className="timeline-step">
            <div className="timeline-line-wrapper">
              {index > 0 && (
                <div className={`timeline-line ${step.completed ? 'completed' : ''}`}></div>
              )}
            </div>
            <div className={`timeline-dot ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}>
              {step.completed && !step.current && <span className="checkmark">✓</span>}
              {step.current && <span className="pulse"></span>}
            </div>
            <div className="timeline-content">
              <div className={`timeline-label ${step.current ? 'current' : ''}`}>
                {step.label}
              </div>
              {step.date && (
                <div className="timeline-date">{formatDate(step.date)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
