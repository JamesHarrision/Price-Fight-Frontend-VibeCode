import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EventDetail } from './pages/EventDetail';
import { ItemDetail } from './pages/ItemDetail';
import { NotFound } from './pages/NotFound';
import { Forbidden } from './pages/Forbidden';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { Transactions } from './pages/Transactions';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EventManager } from './pages/admin/EventManager';
import { EventAdminDetails } from './pages/admin/EventAdminDetails';
import { UserManager } from './pages/admin/UserManager';
import { ItemManager } from './pages/admin/ItemManager';
import { AdminTransactions } from './pages/admin/AdminTransactions';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/403" element={<Forbidden />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/items/:itemId" element={<ItemDetail />} />
            <Route path="/transactions" element={<Transactions />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<EventManager />} />
              <Route path="events/:eventId" element={<EventAdminDetails />} />
              <Route path="items" element={<ItemManager />} />
              <Route path="users" element={<UserManager />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="settings" element={<div className="p-8 text-center text-gray-400 font-black uppercase italic tracking-widest">Governance Control: Coming Soon</div>} />
            </Route>
          </Route>

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
