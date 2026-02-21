import axios from 'axios';
const API_URL = 'https://taskflow-backend-kohl.vercel.app/';
export const api = axios.create({ baseURL: API_URL });