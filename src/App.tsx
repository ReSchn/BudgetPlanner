import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { CategoryTest } from './components/CategoryTest';
import { MonthlyBudgetTest } from './components/MonthlyBudgetTest';
import { ExpenseTest } from './components/ExpenseTest'; // Neuer Import

function App() {
  const { user, loading, signOut } = useAuth();

  // Loading und Login States bleiben gleich...
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

  if (!user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <LoginForm />
      </div>
    );
  }

  // Dashboard mit allen drei Test-Komponenten
  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {' '}
        {/* Noch breiter für 3 Spalten */}
        {/* Header */}
        <Card>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <CardTitle>🏠 Budgettracker - Vollständiger Test</CardTitle>
              <div className='flex items-center gap-4'>
                <span className='text-sm text-gray-600'>
                  Hallo, {user.email}
                </span>
                <Button onClick={signOut} variant='outline' size='sm'>
                  🚪 Ausloggen
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        {/* Workflow-Anleitung */}
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center space-y-2'>
              <h3 className='font-bold text-lg'>
                🎯 Vollständiger Budgettracker-Workflow
              </h3>
              <p className='text-gray-600'>
                <span className='font-medium'>1. Kategorien</span> erstellen →
                <span className='font-medium'> 2. Monatsbudget</span> einrichten
                →<span className='font-medium'> 3. Ausgaben</span> erfassen
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Drei-Spalten Layout */}
        <div className='grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6'>
          {/* Spalte 1: Kategorien */}
          <div className='space-y-4'>
            <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
              <span className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm'>
                1
              </span>
              📂 Kategorien
            </h2>
            <CategoryTest />
          </div>

          {/* Spalte 2: Budget */}
          <div className='space-y-4'>
            <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
              <span className='bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm'>
                2
              </span>
              💰 Budget
            </h2>
            <MonthlyBudgetTest />
          </div>

          {/* Spalte 3: Ausgaben */}
          <div className='space-y-4'>
            <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
              <span className='bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm'>
                3
              </span>
              🧾 Ausgaben
            </h2>
            <ExpenseTest />
          </div>
        </div>
        {/* Erfolgs-Message */}
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <h3 className='font-bold text-green-600 text-lg mb-2'>
                🎉 Vollständiger Budgettracker implementiert!
              </h3>
              <p className='text-gray-600'>
                Alle Kernfunktionen sind funktionsfähig: Kategorien, Budgets,
                Ausgaben, Budget-Tracking
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
