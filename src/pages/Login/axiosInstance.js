import axios from "axios";

// Debugging: Log API URL to check if it's being loaded
console.log("VITE_API_URL from .env:", import.meta.env.VITE_API_URL);

// Ensure API URL is correctly loaded, otherwise throw an error
if (!import.meta.env.VITE_API_URL) {
  console.error("❌ ERROR: VITE_API_URL is not defined in .env. Please check your environment variables.");
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://backend-production-8fda.up.railway.app";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // Use the dynamic environment variable
  withCredentials: true, // Ensures CSRF protection works
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default axiosInstance;
