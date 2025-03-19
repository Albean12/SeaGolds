import axios from "axios";

// Ensure REACT_APP_API_URL is correctly set in .env
console.log("✅ REACT_APP_API_URL from .env:", process.env.REACT_APP_API_URL);

if (!process.env.REACT_APP_API_URL) {
  console.error("❌ ERROR: REACT_APP_API_URL is NOT defined. Check your .env file and Vercel environment variables.");
}

// Use the REACT_APP_API_URL from .env or fallback to Railway backend
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://backend-production-8fda.up.railway.app";

// Debugging API Base URL
console.log("✅ Final API_BASE_URL:", API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // ✅ Uses dynamic environment variable
  withCredentials: false, // ❌ CSRF is removed, so credentials are not needed
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Automatically Attach Authentication Token to Requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authentication Token Attached:", token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
