// lib/axiosInstance.ts
 
import axios from 'axios';
 
 
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/`, // Ensure this is set in your .env.local file
  headers: {
    'Content-Type': 'application/json',
   
  },
  withCredentials: true,
});
 
 
axiosInstance.interceptors.request.use(
  (config) => {
    const rawAuth =
      sessionStorage.getItem("currentAuth") ||
      localStorage.getItem("currentAuth") ||
      sessionStorage.getItem("ai4planning-auth") ||
      localStorage.getItem("ai4planning-auth");

    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      const token = parsed?.token ?? parsed?.state?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
 
 
export default axiosInstance;
 
 
 
