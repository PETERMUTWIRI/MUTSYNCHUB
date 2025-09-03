import api from '@/lib/api';


export const getUserGrowth = (orgId: string, query: string = '') =>
  api.get(`/admin/stats/user-growth/${orgId}${query}`);

export const getRevenueTrend = (orgId: string, query: string = '') =>
  api.get(`/admin/stats/revenue-trend/${orgId}${query}`);

export const getActiveUsersTrend = (orgId: string, query: string = '') =>
  api.get(`/admin/stats/active-users-trend/${orgId}${query}`);

export const getChurnTrend = (orgId: string, query: string = '') =>
  api.get(`/admin/stats/churn-trend/${orgId}${query}`);
