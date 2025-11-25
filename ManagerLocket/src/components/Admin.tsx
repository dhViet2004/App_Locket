import { useState } from 'react';
import AdminLayout from './AdminLayout';
import DashboardContent from './DashboardContent';
import UserManagement from './UserManagement';
import Plans from './Plans';
import Refunds from './Refunds';
import Reports from './Reports';
import AuditLogs from './AuditLogs';

interface AdminProps {
  onLogout: () => void;
  username?: string;
}

export default function Admin({ onLogout, username }: AdminProps) {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement onBack={() => setCurrentView('dashboard')} />;
      case 'plans':
        return <Plans />;
      case 'refunds':
        return <Refunds />;
      case 'ads':
        return <DashboardContent />; // Reuse dashboard content for ads
      case 'reports':
        return <Reports />;
      case 'audit-logs':
        return <AuditLogs />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <AdminLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onLogout={onLogout}
      appName="Locket Admin"
    >
      {renderContent()}
    </AdminLayout>
  );
}

