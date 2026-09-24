import axios from "axios";

const api = axios.create({
  baseURL: "https://notevaultspace.vercel.app/api", // or your local backend URL
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Check if the 401 came from the login endpoint
    const isLoginRoute = originalRequest.url && originalRequest.url.includes("/login");

    if (error.response && error.response.status === 401 && !isLoginRoute) {
      // ONLY redirect/clear session for protected routes, NOT the login page itself!
      localStorage.removeItem("token");
      window.location.href = "/"; // or your login route
    }

    return Promise.reject(error);
  }
);

export default api;