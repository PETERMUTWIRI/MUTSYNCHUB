// src/routes/index.tsx



import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from '../App';
import SolutionsWithSidebar from '../pages/Solutions';
import Resources from '../pages/Resources';
import Home from '../pages/Home';
import Support from '../pages/Support';
import AnalyticsEngineDashboard from '../pages/AdminDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AnalyticsDashboardLanding from '../pages/AnalyticsDashboardLanding';
import AuditLogs from '../components/admin/AuditLogs';
import AdminLayout from '../pages/admin/AdminLayout';
import Revenue from '../components/admin/Revenue';
import UsersOrgs from '../components/admin/UsersOrgs';
import Analytics from '../components/admin/Analytics';
import Settings from '../components/admin/Settings';
import ProtectedRoute from '../components/ProtectedRoute';
import UserManagementPage from '../pages/admin/UserManagementPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';
import RevenuePage from '../pages/admin/RevenuePage';
import SystemStatusPage from '../pages/admin/SystemStatusPage';
import SystemSettingsPage from '../pages/admin/SystemSettingsPage';
import SupportPage from '../pages/admin/SupportPage';
import NotificationsPage from '../pages/admin/NotificationsPage';





const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'solutions', element: <SolutionsWithSidebar /> },
      { path: 'resources', element: <Resources /> },
      { path: 'support', element: <Support /> },
    ],
  },
  {
    path: '/analytics',
    element: (
      <ProtectedRoute requiredRoles={['USER']}>
        <AnalyticsDashboardLanding />
      </ProtectedRoute>
    ),
    // Add analytics children if needed
  },
  {
    path: '/admin',
    element: <AdminLayout />, // No ProtectedRoute for visual testing
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <UserManagementPage />,
      },
      {
        path: 'audit-logs',
        element: <AuditLogsPage />,
      },
      {
        path: 'revenue',
        element: <RevenuePage />,
      },
      {
        path: 'system-status',
        element: <SystemStatusPage />,
      },
      {
        path: 'settings',
        element: <SystemSettingsPage />,
      },
      {
        path: 'support',
        element: <SupportPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
    ],
  },
];


export default createBrowserRouter(routes);