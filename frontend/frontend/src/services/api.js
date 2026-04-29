import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// This intercepts every request and adds the token if we have one!
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
