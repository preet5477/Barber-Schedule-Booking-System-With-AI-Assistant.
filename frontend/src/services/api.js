import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL, 
  withCredentials: false, 
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
  
  isRefreshing = false;
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const token = localStorage.getItem('token');
      
      if (!token) {
        processQueue(new Error('No token found'), null);
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }

      return api.post(
        '/auth/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(({ data }) => {
          if (data.success && data.token) {
            localStorage.setItem('token', data.token);
            
            // Dispatch event so AuthContext can update
            window.dispatchEvent(new CustomEvent('token-refreshed', { 
              detail: { token: data.token, user: data.user } 
            }));
            
            originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
            processQueue(null, data.token);
            return api(originalRequest);
          } else {
            processQueue(new Error('Failed to refresh token'), null);
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        })
        .catch((err) => {
          processQueue(err, null);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
};

export default api;