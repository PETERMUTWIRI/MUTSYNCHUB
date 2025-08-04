import api from '../lib/api';

// Dashboard
export const getDashboardSummary = () => api.get('/user/dashboard/summary');

// Analytics
export const getUsageAnalytics = (params = {}) => api.get('/user/analytics/usage', { params });
export const getScheduledAnalytics = () => api.get('/user/analytics/scheduled');
export const createScheduledAnalytics = (data: any) => api.post('/user/analytics/scheduled', data);
export const updateScheduledAnalytics = (id: string, data: any) => api.put(`/user/analytics/scheduled/${id}`, data);
export const deleteScheduledAnalytics = (id: string) => api.delete(`/user/analytics/scheduled/${id}`);
export const getQueryHistory = () => api.get('/user/analytics/query-history');
export const runAdHocQuery = (data: any) => api.post('/user/analytics/query', data);
export const exportAnalytics = (format: 'csv' | 'pdf') => api.get(`/user/analytics/export?format=${format}`);

// Billing
export const getCurrentPlan = () => api.get('/user/billing/plan');
export const getInvoices = () => api.get('/user/billing/invoices');
export const upgradePlan = (planId: string) => api.post('/user/billing/upgrade', { planId });
export const cancelPlan = () => api.post('/user/billing/cancel');
export const getPaymentMethods = () => api.get('/user/billing/payment-methods');
export const addPaymentMethod = (data: any) => api.post('/user/billing/payment-methods', data);
export const deletePaymentMethod = (id: string) => api.delete(`/user/billing/payment-methods/${id}`);

// Profile & Settings
export const getProfile = () => api.get('/user/profile');
export const updateProfile = (data: any) => api.put('/user/profile', data);
export const getTeamMembers = () => api.get('/user/team');
export const inviteTeamMember = (email: string) => api.post('/user/team/invite', { email });
export const removeTeamMember = (id: string) => api.delete(`/user/team/${id}`);
export const getNotificationSettings = () => api.get('/user/settings/notifications');
export const updateNotificationSettings = (data: any) => api.put('/user/settings/notifications', data);

// Support
export const getSupportTickets = () => api.get('/user/support/tickets');
export const createSupportTicket = (data: any) => api.post('/user/support/tickets', data);

// Notifications
export const getNotifications = () => api.get('/user/notifications');
export const markNotificationAsRead = (id: string) => api.put(`/user/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/user/notifications/read-all');

// Security
export const getSecuritySettings = () => api.get('/user/security');
export const enable2FA = () => api.post('/user/security/2fa/enable');
export const disable2FA = () => api.post('/user/security/2fa/disable');
export const getSessions = () => api.get('/user/security/sessions');
export const revokeSession = (id: string) => api.delete(`/user/security/sessions/${id}`);
export const getApiKeys = () => api.get('/user/security/api-keys');
export const createApiKey = (name: string) => api.post('/user/security/api-keys', { name });
export const revokeApiKey = (id: string) => api.delete(`/user/security/api-keys/${id}`);

// Chatbot
export const getChatbotResponse = (message: string, context: any) => api.post('/chatbot', { message, context });
