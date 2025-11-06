// frontend/src/shared/api.js
import axios from "axios";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://cafe-fausse-backend-e3d1.onrender.com/api"
    : "http://localhost:5000/api";

export default function api(path, options = {}) {
  const url = ${API_BASE}${path.startsWith("/") ? "" : "/"}${path};
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  return axios({ url, ...options, headers }).then(res => res.data);
}