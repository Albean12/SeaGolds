import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  baseURL: 'https://backend-production-8fda.up.railway.app',  // ✅ Use your deployed backend URL
  withCredentials: true, // Sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default axiosInstance;
