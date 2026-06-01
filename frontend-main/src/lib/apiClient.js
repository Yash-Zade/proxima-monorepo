import axios from 'axios';

/**
 * @title Proxima Vetted API client
 * @notice Handles communication between the React frontend and Spring Boot AuthController backend.
 * @dev Pre-configured Axios instance featuring auto-attach JWT headers and automatic HttpOnly refresh token rotation interceptors.
 */

// Load backend base URL or default to Spring Boot port 8080
const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial: enables sending HttpOnly cookies (refreshToken) with each request
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * @notice Request Interceptor
 * @dev Intercepts outgoing requests to attach the Bearer access token stored in localStorage,
 * except when targeting the refresh path.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    // Attach authorization bearer tag if token is present and not on refresh route
    if (token && !config.url.endsWith('/auth/refresh')) {
      config.headers.Authorization = `Bearer ${token}`;
      // Dev Note: Spring Security will parse this header in JwtAuthFilter to validate request scopes
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * @notice Response Interceptor
 * @dev Handles error codes globally. If a 401 Unauthorized is intercepted (access token expired),
 * this interceptor automatically pauses the queue, issues a POST request to '/auth/refresh' to cycle
 * the HttpOnly refreshToken cookie, saves the new accessToken, and retries the original failed request.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Trigger token rotation if 401 occurs and we haven't already retried this request
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith('/auth/refresh')
    ) {
      originalRequest._retry = true; // Mark to avoid infinite refresh loops if refresh itself fails

      try {
        console.log('[Dev Alert] Access token expired. Requesting refresh rotation...');
        
        // Post empty body to refresh endpoint; cookies (including refreshToken) will be included automatically
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Spring AuthController returns accessToken packaged inside LoginResponseDTO inside ApiResponse wrapper
        const newAccessToken = refreshResponse.data?.data?.accessToken;
        
        if (newAccessToken) {
          console.log('[Dev Alert] Token rotation successful. Provisioned new node credentials.');
          localStorage.setItem('accessToken', newAccessToken);
          
          // Re-attach new header and retry the request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('[Dev Alert] Token refresh rotation failed. Cleaning up node session:', refreshError);
        localStorage.removeItem('accessToken');
        
        // Redirect to signin route to prompt a fresh login credential check
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
