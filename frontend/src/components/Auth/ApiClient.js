import axios from 'axios';

// Strip trailing slash from base URL to avoid double-slash issues with endpoint paths
const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

// Create Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include cookies with requests
});

// Add request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log("token", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 errors (token expiry)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        // GlobalResponseHandler wraps every response: { timeStamp, data: <payload>, error }
        // So for LoginResponseDTO the token is at response.data.data.accessToken
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data?.data?.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Retry the original request
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        console.error('Unable to refresh token:', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
