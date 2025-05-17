import axios, { AxiosError, AxiosInstance } from 'axios';

let isRefreshing = false;
let failedQueue: any[] = [];
let refreshPromise: Promise<string | null> | null = null;

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
          // If there's already a refresh in progress, wait for it
          if (refreshPromise) {
            const token = await refreshPromise;
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            }
          }

          // Create new refresh promise
          refreshPromise = new Promise(async (resolve, reject) => {
            try {
              const response = await axios.post('/api/auth/refresh', {
                refreshToken: localStorage.getItem('refreshToken'),
              });

              const { accessToken } = response.data;
              
              localStorage.setItem('accessToken', accessToken);
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

              processQueue(null, accessToken);
              resolve(accessToken);
            } catch (error) {
              processQueue(error, null);
              reject(error);
            } finally {
              isRefreshing = false;
              refreshPromise = null;
            }
          });

          const token = await refreshPromise;
          if (token) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          refreshPromise = null;
          
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};