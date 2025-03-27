import axios from 'axios';

export const apiLocal = axios.create({
  baseURL: 'http://localhost:4200/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = axios.create({
  baseURL: 'https://tassky-back.vercel.app/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
