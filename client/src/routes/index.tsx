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





const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'home', element: <Home /> },
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
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <SystemSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <AuditLogsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'revenue',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <RevenuePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'system-status',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <SystemStatusPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <SystemSettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];


export default createBrowserRouter(routes);