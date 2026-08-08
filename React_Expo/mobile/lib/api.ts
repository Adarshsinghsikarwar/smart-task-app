import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../constants/Config";

const api = axios.create({
  baseURL: API_URL,
});

// Request Interceptor: Attach the token to the header dynamically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Error retrieving token from SecureStore:", err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
