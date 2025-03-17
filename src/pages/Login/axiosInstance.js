import axios from "axios";

// Ensure VITE_API_URL is correctly set in .env
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
