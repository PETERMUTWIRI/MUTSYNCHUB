import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from '../App';
import SolutionsWithSidebar from '../pages/Solutions';
import Resources from '../pages/Resources';
import Home from '../pages/Home';
import Support from '../pages/Support';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import Spinner from '../components/ui/Spinner';

const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'));
const AuditLogsPage = lazy(() => import('../pages/admin/AuditLogsPage'));
const RevenuePage = lazy(() => import('../pages/admin/RevenuePage'));
const SystemStatusPage = lazy(() => import('../pages/admin/SystemStatusPage'));
const SystemSettingsPage = lazy(() => import('../pages/admin/SystemSettingsPage'));
const SupportPage = lazy(() => import('../pages/admin/SupportPage'));
const NotificationsPage = lazy(() => import('../pages/admin/NotificationsPage'));
const AdvancedAnalytics = lazy(() => import('../pages/admin/AdvancedAnalytics'));
const FeatureFlags = lazy(() => import('../pages/admin/FeatureFlags'));
const SystemControls = lazy(() => import('../pages/admin/SystemControls'));
const AnalyticsDashboardLanding = lazy(() => import('../pages/AnalyticsDashboardLanding'));
const UserLayout = lazy(() => import('../components/UserLayout'));
const UserDashboard = lazy(() => import('../pages/UserDashboard'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Billing = lazy(() => import('../pages/Billing'));
const Profile = lazy(() => import('../pages/Profile'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Security = lazy(() => import('../pages/Security'));

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
        <Suspense fallback={<Spinner />}>
          <UserDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredRoles={['USER']}>
        <Suspense fallback={<Spinner />}>
          <UserLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Spinner />}>
            <UserDashboard />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<Spinner />}>
            <Analytics />
          </Suspense>
        ),
      },
      {
        path: 'billing',
        element: (
          <Suspense fallback={<Spinner />}>
            <Billing />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<Spinner />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: 'support',
        element: (
          <Suspense fallback={<Spinner />}>
            <Support />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<Spinner />}>
            <Notifications />
          </Suspense>
        ),
      },
      {
        path: 'security',
        element: (
          <Suspense fallback={<Spinner />}>
            <Security />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Spinner />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: 'advanced-analytics',
        element: (
          <Suspense fallback={<Spinner />}>
            <AdvancedAnalytics />
          </Suspense>
        ),
      },
      {
        path: 'feature-flags',
        element: (
          <Suspense fallback={<Spinner />}>
            <FeatureFlags />
          </Suspense>
        ),
      },
      {
        path: 'system-controls',
        element: (
          <Suspense fallback={<Spinner />}>
            <SystemControls />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<Spinner />}>
            <UserManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <Suspense fallback={<Spinner />}>
            <AuditLogsPage />
          </Suspense>
        ),
      },
      {
        path: 'revenue',
        element: (
          <Suspense fallback={<Spinner />}>
            <RevenuePage />
          </Suspense>
        ),
      },
      {
        path: 'system-status',
        element: (
          <Suspense fallback={<Spinner />}>
            <SystemStatusPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<Spinner />}>
            <SystemSettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'support',
        element: (
          <Suspense fallback={<Spinner />}>
            <SupportPage />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<Spinner />}>
            <NotificationsPage />
          </Suspense>
        ),
      },
    ],
  },
];

export default createBrowserRouter(routes);