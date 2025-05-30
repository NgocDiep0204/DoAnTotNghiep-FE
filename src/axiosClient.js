import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7282/api/',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

let isLoggingOut = false;

axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

      localStorage.removeItem('token'); // chỉ xóa token

      // Redirect về login, không cần reload nữa
      window.location.href = '/dang-nhap';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
