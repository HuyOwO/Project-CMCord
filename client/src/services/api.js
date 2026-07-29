import axios from 'axios';
import { API_BASE_URL } from '../config';

// Nếu API_BASE_URL rỗng (dev 1 máy) -> '/api' đi qua Vite proxy như cũ.
// Nếu có set VITE_API_URL -> gọi thẳng tới backend đó (vd backend chạy ở máy khác).
const api = axios.create({ baseURL: `${API_BASE_URL}/api` });

// Tự động đính kèm JWT token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự động logout nếu token hết hạn
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

<<<<<<< HEAD
export default api;
=======
export default api;
>>>>>>> milestone2-import
