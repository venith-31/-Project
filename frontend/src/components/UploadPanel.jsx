import React, { useRef, useState } from "react";
import { bulkUploadLogs } from "../api";

export default function UploadPanel({ onUploadComplete }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      // Accept either { logs: [...] } or a raw array [...]
      const logs = Array.isArray(parsed) ? parsed : parsed.logs;

      if (!Array.isArray(logs)) {
        throw new Error("File must contain a JSON array of logs, or an object like { \"logs\": [...] }.");
      }

      const result = await bulkUploadLogs(logs);
      setStatus({
        type: "success",
        message: `Uploaded ${result.inserted} of ${result.totalReceived} records. ${
          result.rejected ? `${result.rejected} rejected.` : ""
        }`,
      });
      onUploadComplete();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || err.message || "Upload failed.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="upload-panel">
      <label className="btn-primary upload-btn">
        {uploading ? "Uploading..." : "Upload log file (JSON)"}
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          onChange={handleFile}
          disabled={uploading}
          hidden
        />
      </label>
      {status && <span className={`upload-status upload-status-${status.type}`}>{status.message}</span>}
    </div>
  );
}
