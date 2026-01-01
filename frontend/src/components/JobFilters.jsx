import React from "react";
import "../styles/filters.css";

const JobFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="job-filters">
      <div className="filters-header">
        <h3>Filter Jobs</h3>
        <button className="clear-filters-btn" onClick={onClearFilters}>
          Clear All
        </button>
      </div>

      <div className="filter-group">
        <label>Search</label>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Job title, skills, company..."
        />
      </div>

      <div className="filter-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="City or state"
        />
      </div>

      <div className="filter-group">
        <label>Job Type</label>
        <select name="jobType" value={filters.jobType} onChange={handleChange}>
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="freelance">Freelance</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Work Mode</label>
        <select name="workMode" value={filters.workMode} onChange={handleChange}>
          <option value="">All Modes</option>
          <option value="onsite">Onsite</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Experience Level</label>
        <select name="experienceLevel" value={filters.experienceLevel} onChange={handleChange}>
          <option value="">All Levels</option>
          <option value="fresher">Fresher</option>
          <option value="entry-level">Entry Level</option>
          <option value="mid-level">Mid Level</option>
          <option value="senior-level">Senior Level</option>
          <option value="executive">Executive</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Min Salary (₹)</label>
        <input
          type="number"
          name="salaryMin"
          value={filters.salaryMin}
          onChange={handleChange}
          placeholder="0"
        />
      </div>

      <div className="filter-group">
        <label>Max Salary (₹)</label>
        <input
          type="number"
          name="salaryMax"
          value={filters.salaryMax}
          onChange={handleChange}
          placeholder="Any"
        />
      </div>

      <div className="filter-group">
        <label>Category</label>
        <input
          type="text"
          name="category"
          value={filters.category}
          onChange={handleChange}
          placeholder="Engineering, Marketing..."
        />
      </div>

      <div className="filter-group">
        <label>Sort By</label>
        <select name="sortBy" value={filters.sortBy} onChange={handleChange}>
          <option value="postedAt">Date Posted</option>
          <option value="title">Title</option>
          <option value="salary.min">Salary</option>
          <option value="applicationDeadline">Deadline</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sort Order</label>
        <select name="sortOrder" value={filters.sortOrder} onChange={handleChange}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
};

export default JobFilters;
