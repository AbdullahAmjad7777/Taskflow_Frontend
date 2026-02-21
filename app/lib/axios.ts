import axios from 'axios';
const API_URL = 'https://taskflow-backend-kohl.vercel.app/api';
export const api = axios.create({ baseURL: API_URL });
