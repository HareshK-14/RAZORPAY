import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
    return Promise.reject(new Error(message));
  }
);

export async function scoreTransaction(data) {
  const res = await api.post('/score', data);
  return res.data;
}

export async function getMetrics() {
  const res = await api.get('/metrics');
  return res.data;
}

export async function getTransactions(page = 1, limit = 50, filters = {}) {
  const params = { page, limit, ...filters };
  const res = await api.get('/transactions', { params });
  return res.data;
}

export async function getTransaction(id) {
  const res = await api.get(`/transactions/${id}`);
  return res.data;
}

export async function getAuditLogs(page = 1, limit = 50, search = '') {
  const params = { page, limit };
  if (search) params.search = search;
  const res = await api.get('/audit', { params });
  return res.data;
}

export async function getReviews(page = 1, limit = 100, status = null) {
  const params = { page, limit };
  if (status) params.status = status;
  const res = await api.get('/reviews', { params });
  return res.data;
}

export async function updateReview(id, data) {
  const res = await api.patch(`/reviews/${id}`, data);
  return res.data;
}

export async function getHealth() {
  const res = await api.get('/health');
  return res.data;
}

export async function getAnalytics() {
  const res = await api.get('/analytics');
  return res.data;
}

export async function getNotifications() {
  const res = await api.get('/notifications');
  return res.data;
}

export async function getProfile() {
  const res = await api.get('/profile');
  return res.data;
}

export async function getUsers() {
  const res = await api.get('/users');
  return res.data;
}
