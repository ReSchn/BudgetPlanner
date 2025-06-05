import { Routes, Route, Navigate } from 'react-router-dom';
import { Card, CardContent } from './components/ui/card';
import { useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { AppLayout } from './components/layout/AppLayout';

// Seiten importieren
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Budget } from './pages/Budget';
import { Expenses } from './pages/Expenses';
import { Analytics } from './pages/Analytics';

function App() {
  const { user, loading } = useAuth();

  // Loading State
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-center'>🔄 Lade Auth-Status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login Form (wenn nicht eingeloggt)
  if (!user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <LoginForm />
      </div>
    );
  }

  // Hauptapp mit Routing (wenn eingeloggt)
  return (
    <Routes>
      {/* Alle App-Routen mit Layout */}
      <Route path='/' element={<AppLayout />}>
        <Route index element={<Navigate to='/dashboard' replace />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='categories' element={<Categories />} />
        <Route path='budget' element={<Budget />} />
        <Route path='expenses' element={<Expenses />} />
        <Route path='analytics' element={<Analytics />} />
      </Route>

      {/* Fallback für unbekannte Routen */}
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
}

export default App;
