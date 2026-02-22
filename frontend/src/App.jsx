// ==================================================
// SportVerse AI - Main Application Component
// ==================================================
// Sets up routing, authentication context, and layout structure.
// ==================================================

import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import AITrainer from './pages/AITrainer';
import AuthCallback from './pages/AuthCallback';
import CoachPortal from './pages/CoachPortal';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import FindPlayers from './pages/FindPlayers';
import Home from './pages/Home';
import Login from './pages/Login';
import Messages from './pages/Messages';
import PersonalizedTrainer from './pages/PersonalizedTrainer';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Register from './pages/Register';

// Protected Route wrapper - redirects to login if not authenticated
function ProtectedRoute({ children, requireCoach = false }) {
  const { isAuthenticated, loading, isCoach } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireCoach && !isCoach) return <Navigate to="/dashboard" />;

  return children;
}

// App Layout with Sidebar and Navbar for authenticated pages
function AppLayout({ children }) {
  return (
    <div className="flex h-screen sport-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes - Wrapped in AppLayout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/personalized-trainer" element={
        <ProtectedRoute>
          <AppLayout><PersonalizedTrainer /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/ai-trainer" element={
        <ProtectedRoute>
          <AppLayout><AITrainer /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/community" element={
        <ProtectedRoute>
          <AppLayout><Community /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <AppLayout><Messages /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/find-players" element={
        <ProtectedRoute>
          <AppLayout><FindPlayers /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/coach-portal" element={
        <ProtectedRoute requireCoach>
          <AppLayout><CoachPortal /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><Profile /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user/:userId" element={
        <ProtectedRoute>
          <AppLayout><PublicProfile /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', background: '#333', color: '#fff' }
          }}
        />
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  );
}
