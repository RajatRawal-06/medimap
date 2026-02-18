import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import { useAuthStore } from './store/useAuthStore';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const HospitalDetail = lazy(() => import('./pages/HospitalDetail'));
const DoctorDetail = lazy(() => import('./pages/DoctorDetail'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const MyAppointments = lazy(() => import('./pages/MyAppointments'));
const HospitalNavigation = lazy(() => import('./pages/HospitalNavigation'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FacilitiesList = lazy(() => import('./pages/FacilitiesList'));
const PractitionersList = lazy(() => import('./pages/PractitionersList'));
const Emergency = lazy(() => import('./pages/Emergency'));

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

function AnimatedRoutes() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/facilities" element={<FacilitiesList />} />
          <Route path="/facilities/:id" element={<HospitalDetail />} />
          <Route path="/facilities/:id/map" element={<HospitalNavigation />} />
          <Route path="/practitioners" element={<PractitionersList />} />
          <Route path="/practitioners/:id" element={<DoctorDetail />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-appointments" element={<MyAppointments />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
