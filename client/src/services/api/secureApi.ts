import axios, { AxiosInstance } from 'axios';

const apiProtected: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true,
});

export default apiProtected;
