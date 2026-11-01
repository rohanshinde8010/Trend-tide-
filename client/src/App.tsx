import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RegionProvider } from './context/RegionContext';
import { BackgroundProvider } from './context/BackgroundContext';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TrendingFeed } from './pages/TrendingFeed';
import { Explore } from './pages/Explore';
import { WatchlistView } from './pages/WatchlistView';
import { SourcesView } from './pages/SourcesView';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { VerificationSuccess } from './pages/VerificationSuccess';
import { ResendVerification } from './pages/ResendVerification';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setGlobalSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAuthRoute = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/verification-success',
    '/resend-verification',
  ].includes(location.pathname);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-800 bg-[#EAEFF4]">
        <div className="relative mb-4">
          <img
            src="/trendtide-logo.jpg"
            alt="TrendTide"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-300 shadow-md animate-pulse"
          />
        </div>
        <p className="text-xs uppercase tracking-widest text-[#9D00FF] font-semibold font-mono">
          Connecting to TrendTide Live Telemetry...
        </p>
      </div>
    );
  }

  if (isAuthRoute) {
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      return <Navigate to="/" replace />;
    }
    return (
      <div className="min-h-screen relative text-slate-900 font-sans antialiased executive-bg">
        <BackgroundCanvas />
        <div className="relative z-10">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verification-success" element={<VerificationSuccess />} />
            <Route path="/resend-verification" element={<ResendVerification />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Require legitimate authentication for all protected desks
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div
      className="min-h-screen relative text-slate-900 font-sans antialiased executive-bg"
    >
      {/* Dynamic Visible Telemetry Web Background */}
      <BackgroundCanvas />

      {/* Twitter/X-style Fixed Left Navigation (w-64 on desktop, off-canvas on mobile) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Pane offset by Sidebar width on lg+ */}
      <div className="lg:pl-64 flex flex-col min-h-screen bg-transparent relative z-10">
        {/* Fixed Top Header */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onSearchChange={(q) => setGlobalSearch(q)}
        />

        {/* Dynamic Page Router */}
        <main className="w-full pt-16 min-h-screen px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            {/* Core Multi-Domain Twitter/X-style Trending Feeds */}
            <Route path="/" element={<TrendingFeed />} />
            <Route path="/x" element={<TrendingFeed />} />
            <Route path="/domain/:domainId" element={<TrendingFeed />} />

            {/* Specialized Intelligence Desks */}
            <Route path="/explore" element={<Explore />} />
            <Route path="/watchlist" element={<WatchlistView />} />
            <Route path="/sources" element={<SourcesView />} />
            <Route path="/settings" element={<Settings />} />

            {/* Seamless backward compatibility redirects */}
            <Route path="/fashion" element={<Navigate to="/domain/fashion-lifestyle" replace />} />
            <Route path="/social" element={<Navigate to="/x" replace />} />
            <Route path="/reddit" element={<Navigate to="/domain/tech-ai" replace />} />
            <Route path="/explorer" element={<Navigate to="/explore" replace />} />
            <Route path="/forecast" element={<Navigate to="/" replace />} />

            {/* System Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RegionProvider>
        <BackgroundProvider>
          <AppContent />
        </BackgroundProvider>
      </RegionProvider>
    </AuthProvider>
  );
};

export default App;
