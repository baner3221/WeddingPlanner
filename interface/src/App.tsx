import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Inspiration from './pages/Inspiration';
import Quotations from './pages/Quotations';
import Logistics from './pages/Logistics';
import Itinerary from './pages/Itinerary';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Family from './pages/Family';
import Rooms from './pages/Rooms';
import RunSheet from './pages/RunSheet';
import Budget from './pages/Budget';
import Bookings from './pages/Bookings';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import Expenses from './pages/Expenses';
import { AIChat } from './components/AIChat';

// Auth Guard Component
const PrivateRoute = ({ children, session, isLoading }: { children: React.ReactNode, session: any, isLoading: boolean }) => {
  if (isLoading) return <div className="min-h-screen bg-bg-base flex items-center justify-center text-text-tertiary">Loading...</div>;
  if (!session) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children, session, isLoading }: { children: React.ReactNode, session: any, isLoading: boolean }) => {
  if (isLoading) return <div className="min-h-screen bg-bg-base flex items-center justify-center text-text-tertiary">Loading...</div>;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/welcome" element={
          <PublicRoute session={session} isLoading={isLoading}>
            <Welcome />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute session={session} isLoading={isLoading}>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute session={session} isLoading={isLoading}>
            <Signup />
          </PublicRoute>
        } />

        {/* Private App Routes */}
        <Route path="/" element={
          <PrivateRoute session={session} isLoading={isLoading}>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="checklist" element={<Tasks />} />
          <Route path="guests" element={<Logistics />} />
          <Route path="vendors" element={<Quotations />} />
          <Route path="timeline" element={<Itinerary />} />
          
          {/* Net New Modules */}
          <Route path="family" element={<Family />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="runsheet" element={<RunSheet />} />
          <Route path="budget" element={<Budget />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="documents" element={<Documents />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="expenses" element={<Expenses />} />

          {/* Legacy routes for backward compatibility */}
          <Route path="tasks" element={<Tasks />} />
          <Route path="inspiration" element={<Inspiration />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="logistics" element={<Logistics />} />
          <Route path="itinerary" element={<Itinerary />} />
        </Route>
      </Routes>

      {/* Show AI Chat only when logged in */}
      {session && <AIChat />}
      
      <Toaster position="top-center" toastOptions={{
        className: 'rounded-xl shadow-lg border text-[14px]',
        style: {
          background: '#03352a',
          color: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
        success: {
          iconTheme: {
            primary: '#f59e0b',
            secondary: '#ffffff',
          },
        },
      }} />
    </BrowserRouter>
  );
}

export default App;
