// frontend/src/shared/api.js
import axios from "axios";

const API_BASE = "https://cafe-fausse-backend-e3d1.onrender.com/api";

export default function api(path, options = {}) {
  return axios({
    url: API_BASE + path,
    method: options.method || "GET",
    data: options.body ? JSON.parse(options.body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  }).then(res => res.data);
}