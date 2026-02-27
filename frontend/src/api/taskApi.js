import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getAllTasks = () => api.get('/api/tasks').then(r => r.data);
export const getTaskById = (id) => api.get(`/api/tasks/${id}`).then(r => r.data);
export const createTask = (task) => api.post('/api/tasks', task).then(r => r.data);
export const updateTask = (id, task) => api.put(`/api/tasks/${id}`, task).then(r => r.data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`).then(r => r.data);
