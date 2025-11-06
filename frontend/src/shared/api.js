// frontend/src/shared/api.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://cafe-fausse-backend-e3di.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});