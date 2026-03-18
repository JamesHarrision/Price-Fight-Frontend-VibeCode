import axios from 'axios';

const api = axios.create({
  baseURL: 'https://price-fight-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor for requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['authorization'] = `Bearer ${token}`;
      config.headers['accesstoken'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/refresh-token') || originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['authorization'] = `Bearer ${token}`;
          originalRequest.headers['accesstoken'] = token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('https://price-fight-backend.onrender.com/api/auth/refresh-token', {
          refreshToken: refreshToken
        });

        const newAccessToken = data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Update defaults and current request headers
        api.defaults.headers.common['authorization'] = `Bearer ${newAccessToken}`;
        api.defaults.headers.common['accesstoken'] = newAccessToken;
        originalRequest.headers['authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['accesstoken'] = newAccessToken;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Redirect to login — more reliable than event dispatch when session is fully expired
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    // Global handling for 403 and 404 if not handled by components
    if (error.response?.status === 403) {
      // Allow components to handle it, but provide a way to redirect if needed
      // window.location.href = '/403'; 
    }

    if (error.response?.status === 404) {
      // window.location.href = '/404';
    }

    // Standardize error message extraction
    if (error.response?.data) {
      const message = error.response.data.message || error.response.data.error || 'Something went wrong';
      error.message = message; // Overwrite default axios error message
    }

    return Promise.reject(error);
  }
);

export default api;
