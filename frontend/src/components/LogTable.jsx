import React from "react";

const COLUMNS = [
  { key: "timestamp", label: "Timestamp", sortable: true },
  { key: "actor", label: "Actor", sortable: true },
  { key: "role", label: "Role", sortable: false },
  { key: "action", label: "Action", sortable: true },
  { key: "resource", label: "Resource", sortable: false },
  { key: "ipAddress", label: "IP Address", sortable: false },
  { key: "region", label: "Region", sortable: true },
  { key: "severity", label: "Severity", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

function SeverityBadge({ value }) {
  return <span className={`badge badge-severity-${(value || "").toLowerCase()}`}>{value}</span>;
}

function StatusBadge({ value }) {
  return <span className={`badge badge-status-${(value || "").toLowerCase()}`}>{value}</span>;
}

export default function LogTable({ logs, loading, sortBy, sortOrder, onSort }) {
  const handleSort = (col) => {
    if (!col.sortable) return;
    if (sortBy === col.key) {
      onSort(col.key, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(col.key, "desc");
    }
  };

  return (
    <div className="table-wrap">
      <table className="log-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? "sortable" : ""}
                onClick={() => handleSort(col)}
              >
                {col.label}
                {col.sortable && sortBy === col.key && (
                  <span className="sort-arrow">{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={COLUMNS.length} className="empty-row">
                Loading logs...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="empty-row">
                No logs match the current filters.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log._id}>
                <td className="mono">{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.actor}</td>
                <td>{log.role}</td>
                <td className="mono">{log.action}</td>
                <td className="mono">{log.resource}</td>
                <td className="mono">{log.ipAddress}</td>
                <td>{log.region}</td>
                <td>
                  <SeverityBadge value={log.severity} />
                </td>
                <td>
                  <StatusBadge value={log.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
