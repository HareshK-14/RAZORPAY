import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Header from './components/Header';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import Review from './pages/Review';
import AuditPage from './pages/AuditPage';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Users from './pages/Users';

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f8fafc] to-[#ffffff] text-slate-800 flex">
      <Navbar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Accessible by all 3 roles: Administrator, Risk Analyst, Reviewer */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['Administrator', 'Risk Analyst', 'Reviewer']}>
              <AppShell><Dashboard /></AppShell>
            </ProtectedRoute>
          } />
          
          <Route path="/review" element={
            <ProtectedRoute allowedRoles={['Administrator', 'Risk Analyst', 'Reviewer']}>
              <AppShell><Review /></AppShell>
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={['Administrator', 'Risk Analyst', 'Reviewer']}>
              <AppShell><Transactions /></AppShell>
            </ProtectedRoute>
          } />
          
          <Route path="/audit" element={
            <ProtectedRoute allowedRoles={['Administrator', 'Risk Analyst', 'Reviewer']}>
              <AppShell><AuditPage /></AppShell>
            </ProtectedRoute>
          } />

          {/* Accessible by Administrator and Risk Analyst (Restricted for Reviewer) */}
          <Route path="/analyze" element={
            <ProtectedRoute allowedRoles={['Administrator', 'Risk Analyst']}>
              <AppShell><Analyze /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['Administrator', 'Risk Analyst']}>
              <AppShell><Analytics /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['Administrator', 'Risk Analyst']}>
              <AppShell><Settings /></AppShell>
            </ProtectedRoute>
          } />

          {/* Accessible ONLY by Administrator */}
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <AppShell><Users /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
