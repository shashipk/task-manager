import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/tasks`
  : '/api/tasks';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getAllTasks = () => api.get('/').then(r => r.data);
export const getTaskById = (id) => api.get(`/${id}`).then(r => r.data);
export const createTask = (task) => api.post('/', task).then(r => r.data);
export const updateTask = (id, task) => api.put(`/${id}`, task).then(r => r.data);
export const deleteTask = (id) => api.delete(`/${id}`).then(r => r.data);
