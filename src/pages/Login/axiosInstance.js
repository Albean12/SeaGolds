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
  withCredentials: true, // ✅ Ensures cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Fetch CSRF token before login/authentication requests
axiosInstance.get("/sanctum/csrf-cookie")
  .then(() => console.log("✅ CSRF Token Set Successfully"))
  .catch((error) => console.error("❌ CSRF Token Error:", error));

export default axiosInstance;
