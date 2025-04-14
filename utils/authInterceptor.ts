import axios, { AxiosError, AxiosInstance } from 'axios';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const setupAuthInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;

      // If error is 401 and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If we're already refreshing, add this request to queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call your refresh token endpoint
          const response = await axios.post('/api/auth/refresh', {
            refreshToken: localStorage.getItem('refreshToken'),
          });

          const { accessToken } = response.data;
          
          // Save the new token
          localStorage.setItem('accessToken', accessToken);
          
          // Update authorization header
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          // Process any requests that were waiting
          processQueue(null, accessToken);
          
          isRefreshing = false;
          
          // Retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // If refresh token fails, redirect to login or handle as needed
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // You might want to redirect to login here
          // window.location.href = '/login';
          
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};