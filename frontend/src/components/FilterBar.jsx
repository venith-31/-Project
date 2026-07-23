import React from "react";

export default function FilterBar({ filters, facets, onChange, onReset }) {
  const handleField = (field) => (e) => {
    onChange({ ...filters, [field]: e.target.value, page: 1 });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Search</label>
        <input
          type="text"
          placeholder="actor, action, resource, IP..."
          value={filters.search || ""}
          onChange={handleField("search")}
        />
      </div>

      <div className="filter-group">
        <label>Severity</label>
        <select value={filters.severity || ""} onChange={handleField("severity")}>
          <option value="">All</option>
          {(facets.severity || []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Status</label>
        <select value={filters.status || ""} onChange={handleField("status")}>
          <option value="">All</option>
          {(facets.status || []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Region</label>
        <select value={filters.region || ""} onChange={handleField("region")}>
          <option value="">All</option>
          {(facets.region || []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Action</label>
        <select value={filters.action || ""} onChange={handleField("action")}>
          <option value="">All</option>
          {(facets.action || []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Resource Type</label>
        <select value={filters.resourceType || ""} onChange={handleField("resourceType")}>
          <option value="">All</option>
          {(facets.resourceType || []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>From</label>
        <input type="date" value={filters.from || ""} onChange={handleField("from")} />
      </div>

      <div className="filter-group">
        <label>To</label>
        <input type="date" value={filters.to || ""} onChange={handleField("to")} />
      </div>

      <button className="btn-secondary" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}
