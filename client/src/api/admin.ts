import api from '../lib/api';

// User Management
export const getUsers = (params = {}) => api.get('/admin/users', { params });
export const getUser = (id: string) => api.get(`/admin/users/${id}`);
export const createUser = (data: any) => api.post('/admin/users', data);
export const updateUser = (id: string, data: any) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/admin/users/${id}`);
export const assignRole = (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role });
export const assignTenant = (id: string, tenantId: string) => api.put(`/admin/users/${id}/tenant`, { tenantId });

// Organization/Tenant Management
export const getOrgs = (params = {}) => api.get('/admin/orgs', { params });
export const getOrg = (id: string) => api.get(`/admin/orgs/${id}`);
export const createOrg = (data: any) => api.post('/admin/orgs', data);
export const updateOrg = (id: string, data: any) => api.put(`/admin/orgs/${id}`, data);
export const deleteOrg = (id: string) => api.delete(`/admin/orgs/${id}`);

// Analytics & Usage
export const getAnalytics = (params = {}) => api.get('/admin/analytics', { params });
export const exportAnalytics = (params = {}) => api.get('/admin/analytics/export', { params });

// Audit Logs
export const getAuditLogs = (params = {}) => api.get('/admin/audit-logs', { params });

// Revenue & Billing
export const getRevenue = (params = {}) => api.get('/admin/revenue', { params });
export const getInvoices = (params = {}) => api.get('/admin/invoices', { params });
export const updatePlan = (id: string, data: any) => api.put(`/admin/plans/${id}`, data);

// Settings & Configuration
export const getSettings = () => api.get('/admin/settings');
export const updateSettings = (data: any) => api.put('/admin/settings', data);

// Support & Notifications
export const getSupportTickets = (params = {}) => api.get('/admin/support-tickets', { params });
export const respondToTicket = (id: string, response: string) => api.post(`/admin/support-tickets/${id}/respond`, { response });
export const sendNotification = (data: any) => api.post('/admin/notifications', data);
