import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_BASE });

export function fetchLogs(params) {
  return api.get("/logs", { params }).then((res) => res.data);
}

export function fetchFacets() {
  return api.get("/logs/facets").then((res) => res.data);
}

export function bulkUploadLogs(logs) {
  return api.post("/logs/bulk", { logs }).then((res) => res.data);
}
