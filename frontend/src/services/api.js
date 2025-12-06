import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getOne: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  attachTag: (id, tagId) => api.post(`/contacts/${id}/tags`, { tag_id: tagId }),
  detachTag: (id, tagId) => api.delete(`/contacts/${id}/tags/${tagId}`),
};

export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
  update: (id, data) => api.put(`/tags/${id}`, data),
  delete: (id) => api.delete(`/tags/${id}`),
};

export const notesAPI = {
  getAll: (contactId) => api.get(`/contacts/${contactId}/notes`),
  create: (contactId, data) => api.post(`/contacts/${contactId}/notes`, data),
  update: (contactId, id, data) => api.put(`/contacts/${contactId}/notes/${id}`, data),
  delete: (contactId, id) => api.delete(`/contacts/${contactId}/notes/${id}`),
};

export const interactionsAPI = {
  getAll: (contactId) => api.get(`/contacts/${contactId}/interactions`),
  create: (contactId, data) => api.post(`/contacts/${contactId}/interactions`, data),
  update: (contactId, id, data) => api.put(`/contacts/${contactId}/interactions/${id}`, data),
  delete: (contactId, id) => api.delete(`/contacts/${contactId}/interactions/${id}`),
};

export default api;
