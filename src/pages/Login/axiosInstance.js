import axios from 'axios';

// Debugging: Log VITE_API_URL to check if it's loading
console.log("✅ VITE_API_URL from .env:", import.meta.env.VITE_API_URL);

if (!import.meta.env.VITE_API_URL) {
  console.error("❌ ERROR: VITE_API_URL is NOT defined. Check your .env file.");
}

// Use the VITE_API_URL from .env or default to Railway backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://backend-production-8fda.up.railway.app";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // ✅ Uses dynamic environment variable
  withCredentials: true, // Ensures cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default axiosInstance;
