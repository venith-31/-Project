import React, { useCallback, useEffect, useState } from "react";
import FilterBar from "./components/FilterBar";
import LogTable from "./components/LogTable";
import Pagination from "./components/Pagination";
import UploadPanel from "./components/UploadPanel";
import { fetchLogs, fetchFacets } from "./api";

const DEFAULT_FILTERS = {
  search: "",
  severity: "",
  status: "",
  region: "",
  action: "",
  resourceType: "",
  from: "",
  to: "",
  page: 1,
  limit: 25,
};

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 25 });
  const [facets, setFacets] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFacets = useCallback(async () => {
    try {
      const data = await fetchFacets();
      setFacets(data);
    } catch (err) {
      // Facets are non-critical; fail silently in the console.
      console.error("Failed to load facets", err);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy,
        sortOrder,
      };
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "page" && key !== "limit") params[key] = value;
      });

      const data = await fetchLogs(params);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load logs. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    loadFacets();
  }, [loadFacets]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilterChange = (next) => setFilters(next);
  const handleReset = () => setFilters(DEFAULT_FILTERS);
  const handleSort = (col, order) => {
    setSortBy(col);
    setSortOrder(order);
  };
  const handlePageChange = (page) => setFilters((f) => ({ ...f, page }));
  const handleLimitChange = (limit) => setFilters((f) => ({ ...f, limit, page: 1 }));
  const handleUploadComplete = () => {
    loadFacets();
    loadLogs();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Audit Log Dashboard</h1>
          <p className="subtitle">Investigate system activity across every service and region.</p>
        </div>
        <UploadPanel onUploadComplete={handleUploadComplete} />
      </header>

      <FilterBar filters={filters} facets={facets} onChange={handleFilterChange} onReset={handleReset} />

      {error && <div className="error-banner">{error}</div>}

      <LogTable logs={logs} loading={loading} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={filters.limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}
