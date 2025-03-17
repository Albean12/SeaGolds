import axios from 'axios';

// Debugging: Log VITE_API_URL to check if it's being read correctly
console.log("✅ VITE_API_URL from .env:", import.meta.env.VITE_API_URL);

if (!import.meta.env.VITE_API_URL) {
  console.error("❌ ERROR: VITE_API_URL is NOT defined. Check your .env file and Vercel environment variables.");
}

// Fallback: Use the `.env` variable if available, otherwise default to Railway backend
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://backend-production-8fda.up.railway.app";

// Debugging: Confirm the final API_BASE_URL being used
console.log("🔗 Final API_BASE_URL:", API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // ✅ Uses dynamic environment variable
  withCredentials: true, // Ensures cookies are sent with requests (important for authentication)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Debugging: Test an API request to see if axios is working
axiosInstance.get("/sanctum/csrf-cookie")
  .then(() => console.log("✅ Successfully connected to backend!"))
  .catch(error => console.error("❌ Failed to connect to backend:", error));

export default axiosInstance;
