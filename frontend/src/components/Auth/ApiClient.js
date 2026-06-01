import axios from 'axios';

// Strip trailing slash from base URL to avoid double-slash issues with endpoint paths
const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

// Create Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include cookies with requests
});

// Queue management variables to handle concurrent 401s
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log("token", token);
    // Skip attaching Authorization header if this is the refresh token endpoint
    if (token && !config.url.endsWith('/auth/refresh')) {
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
    const originalRequest = error.config;

    // If the error is 401 and the request was NOT the refresh token endpoint itself
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith('/auth/refresh')
    ) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // GlobalResponseHandler wraps every response: { timeStamp, data: <payload>, error }
        // So for LoginResponseDTO the token is at response.data.data.accessToken
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data?.data?.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Resolve all queued requests with the new token
        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Unable to refresh token:', refreshError);
        
        // Reject all queued requests
        processQueue(refreshError, null);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole'); // Added cleanup for safety
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
