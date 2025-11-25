import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import PostsPage from './pages/PostsPage';
import PlansPage from './pages/PlansPage';
import AdsPage from './pages/AdsPage';
import RefundsPage from './pages/RefundsPage';
import RevenueReportPage from './pages/RevenueReportPage';
import AdPerformancePage from './pages/AdPerformancePage';
import AuditLogsPage from './pages/AuditLogsPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedTestPage from './pages/UnauthorizedTestPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <UsersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PostsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PlansPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/ads"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/refunds"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <RefundsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/reports/revenue"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <RevenueReportPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/reports/ad-performance"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdPerformancePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AuditLogsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/audit-logs/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AuditLogsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ProfilePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/test/unauthorized"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <UnauthorizedTestPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

