import axios from 'axios';

// Debug log để kiểm tra env
console.log('🔍 Checking environment variables:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Error:', error.response?.status, error.config?.url);
    }
    
    // Xử lý lỗi chung
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Export các method thường dùng
export const api = {
  get: (url: string, config?: any) => axiosInstance.get(url, config),
  post: (url: string, data?: any, config?: any) => axiosInstance.post(url, data, config),
  put: (url: string, data?: any, config?: any) => axiosInstance.put(url, data, config),
  patch: (url: string, data?: any, config?: any) => axiosInstance.patch(url, data, config),
  delete: (url: string, config?: any) => axiosInstance.delete(url, config),
};

// Utility functions cho các trường hợp đặc biệt
export const apiUtils = {
  // Upload file
  uploadFile: (url: string, file: File, onUploadProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  // Download file
  downloadFile: async (url: string, filename: string) => {
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },
}; 