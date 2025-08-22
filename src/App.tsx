import React, { useState, useEffect } from 'react';
import './index.css';
import './i18n';
import { useAuth } from './contexts/AuthContext';
import LoginScreen from './components/Auth/LoginScreen';
import LoginModal from './components/Auth/LoginModal';

// Static imports for critical components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ShareButton from './components/Dashboard/ShareButton';
import LanguageSwitcher from './components/LanguageSwitcher';
import OAuthCallback from './pages/oauth2/callback';

// Dynamic imports for better code splitting
const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard'));
const LeadsManager = React.lazy(() => import('./components/Leads/LeadsManager'));
const GoogleSearchManager = React.lazy(() => import('./components/GoogleSearch/GoogleSearchManager'));
const FavoritesManager = React.lazy(() => import('./components/Favorites/FavoritesManager'));
const TasksManager = React.lazy(() => import('./components/Tasks/TasksManager'));
const CashFlowManager = React.lazy(() => import('./components/CashFlow/CashFlowManager'));
const DuplicatesManager = React.lazy(() => import('./components/Duplicates/DuplicatesManager'));
const CommunicationManager = React.lazy(() => import('./components/Communication/CommunicationManager'));
const CalendarManager = React.lazy(() => import('./components/Calendar/CalendarManager'));
const SettingsManager = React.lazy(() => import('./components/Settings/SettingsManager'));
const SupportCenter = React.lazy(() => import('./components/Support/SupportCenter'));
const AdminPanel = React.lazy(() => import('./components/Admin/AdminPanel'));
const SeanAdminDashboard = React.lazy(() => import('./components/Admin/SeanAdminDashboard'));
const SharedView = React.lazy(() => import('./components/Shared/SharedView'));
const InviteAccept = React.lazy(() => import('./components/Shared/InviteAccept'));
const PaymentPage = React.lazy(() => import('./components/Auth/PaymentPage'));
const PaymentModal = React.lazy(() => import('./components/Auth/PaymentModal'));
const EmailExtractionManager = React.lazy(() => import('./components/EmailExtraction/EmailExtractionManager'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
      <p className="text-slate-600">טוען...</p>
    </div>
  </div>
);

function App() {
  const { user, isAuthenticated, isLoading, loginAsAdmin, loginAsGuest } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    const inviteToken = urlParams.get('token');
    
    if (shareId) {
      setCurrentView('shared');
    } else if (inviteToken) {
      setCurrentView('invite');
    }
  }, []);

  const handleLogin = (userType: 'admin' | 'google' | 'guest') => {
    if (userType === 'admin') {
      loginAsAdmin();
    } else if (userType === 'guest') {
      loginAsGuest();
    }
    // Google handled by GoogleSignInButton
  };

  // מסך טעינה יציב
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">טוען מערכת...</p>
        </div>
      </div>
    );
  }

  // מסך כניסה - רק אחרי אתחול מלא
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const renderCurrentView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    const inviteToken = urlParams.get('token');
    const isOAuthCallback = window.location.pathname === '/oauth2/callback' || 
                            window.location.hash === '#oauth2/callback' ||
                            urlParams.get('code'); // Handle OAuth callback with code parameter

    if (isOAuthCallback) {
      return <OAuthCallback />;
    }

    if (shareId) {
      return (
        <React.Suspense fallback={<LoadingSpinner />}>
          <SharedView shareId={shareId} onBack={() => setCurrentView('dashboard')} />
        </React.Suspense>
      );
    }

    if (inviteToken) {
      return (
        <React.Suspense fallback={<LoadingSpinner />}>
          <InviteAccept token={inviteToken} onSuccess={() => setCurrentView('dashboard')} />
        </React.Suspense>
      );
    }

    if (showPaymentPage) {
      return (
        <React.Suspense fallback={<LoadingSpinner />}>
          <PaymentPage onBack={() => setShowPaymentPage(false)} />
        </React.Suspense>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </React.Suspense>
        );
      case 'leads':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <LeadsManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'google-search':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <GoogleSearchManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'favorites':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <FavoritesManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'tasks':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <TasksManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'cashflow':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <CashFlowManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'duplicates':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <DuplicatesManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'communication':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <CommunicationManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'calendar':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <CalendarManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'settings':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <SettingsManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'support':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <SupportCenter onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'email-extraction':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <EmailExtractionManager onNavigate={handleViewChange} />
          </React.Suspense>
        );
      case 'oauth2/callback':
        return <OAuthCallback />;
      case 'admin':
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            {user?.role === 'admin' ? 
              <SeanAdminDashboard /> : 
              <AdminPanel />}
          </React.Suspense>
        );
      default:
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </React.Suspense>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex" dir="rtl">
      {/* Backdrop */}
      <div
        className={`backdrop ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        sidebarOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentView={currentView}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Search Dropdown */}
      <div id="searchDrop" className="search-drop hidden"></div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <React.Suspense fallback={<LoadingSpinner />}>
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
          />
        </React.Suspense>
      )}

      {/* Auth Guard Modal */}
      <LoginModal />
    </div>
  );
}

export default App;