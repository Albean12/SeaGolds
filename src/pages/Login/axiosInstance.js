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
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ Ensures cookies are included
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// ✅ Attach Token Automatically if Exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("✅ Token attached to request:", token);
    } else {
      console.warn("⚠️ No token found, request sent without Authorization header.");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle Expired Tokens & Auto Redirect
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("❌ API Error:", error);

    if (error.response) {
      const { status } = error.response;

      // ✅ If 401 Unauthorized, force logout & redirect to login
      if (status === 401) {
        console.warn("⚠️ Unauthorized! Clearing session and redirecting to login...");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        window.location.href = "/login"; // Redirect to login page
      }

      // ✅ If 419 CSRF error, attempt to refresh CSRF token
      if (status === 419) {
        console.warn("⚠️ CSRF token expired, refreshing...");
        try {
          await axiosInstance.get("/sanctum/csrf-cookie");
          console.log("✅ CSRF Token Refreshed!");
        } catch (csrfError) {
          console.error("❌ Failed to refresh CSRF token:", csrfError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
