import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import PcDashboard from './pages/PcDashboard';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'admin' | 'pc' }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'pc' | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        setUserRole(session.user.email.startsWith('pc') ? 'pc' : 'admin');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        setUserRole(session.user.email.startsWith('pc') ? 'pc' : 'admin');
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#00ffcc' }}>Memuat...</div>;
  if (!session) return <Navigate to="/secret-login" />;
  
  if (allowedRole === 'admin' && userRole === 'pc') return <Navigate to="/pc-dashboard" />;
  if (allowedRole === 'pc' && userRole === 'admin') return <Navigate to="/admin" />;
  
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/secret-login" element={<LoginPage />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/pc-dashboard" element={
          <ProtectedRoute allowedRole="pc">
            <PcDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
