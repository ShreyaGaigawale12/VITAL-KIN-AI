import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Consult from '@/pages/Consult';
import Pharmacy from '@/pages/Pharmacy';
import Watch from '@/pages/Watch';
import Appointments from '@/pages/Appointments';
import AppointmentsNew from '@/pages/AppointmentsNew';
import Finance from '@/pages/Finance';
import ComingSoon from '@/pages/ComingSoon';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/consult" element={<Consult />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointments/new" element={<AppointmentsNew />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/household" element={<ComingSoon title="Household Health Hub" note="One shared calendar for vaccinations, meds & check-ups across every family member and pet — plus zoonotic cross-alerts and a shared activity score." />} />
          <Route path="/medical-id" element={<ComingSoon title="Lock-screen Medical ID" note="QR medical ID with blood type, allergies, conditions, emergency contacts and pet details — readable by a first responder even with the phone locked." />} />
          <Route path="/blood" element={<ComingSoon title="Blood donor match network" note="Use your stored blood type to alert nearby compatible donors when someone posts an urgent need." />} />
          <Route path="/responders" element={<ComingSoon title="Community responder network" note="Off-duty doctors, nurses & CPR-trained volunteers opt in to get alerted for nearby cardiac emergencies." />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
