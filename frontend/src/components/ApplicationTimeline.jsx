import React from "react";
import "../styles/timeline.css";

const ApplicationTimeline = ({ application }) => {
  const getStatusSteps = () => {
    const steps = [
      { label: "Applied", status: "applied", date: application.appliedAt },
      { label: "Under Review", status: "under-review", date: application.reviewedAt },
      { label: "Interview", status: "interview", date: application.interviewAt },
      { label: application.status === "rejected" ? "Rejected" : "Hired", status: application.status, date: application.finalizedAt },
    ];

    const currentStatusIndex = steps.findIndex(step => step.status === application.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex,
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
