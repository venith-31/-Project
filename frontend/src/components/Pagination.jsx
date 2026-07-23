import React from "react";

export default function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }) {
  return (
    <div className="pagination">
      <div className="pagination-info">
        Page {page} of {totalPages || 1} &middot; {total} total records
      </div>
      <div className="pagination-controls">
        <button disabled={page <= 1} onClick={() => onPageChange(1)}>
          « First
        </button>
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹ Prev
        </button>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next ›
        </button>
        <button disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}>
          Last »
        </button>
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
