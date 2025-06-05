import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { useMonthlyBudgets } from '../hooks/useMonthlyBudgets';

export function ExpenseTest() {
  // Hooks nutzen
  const { expenses, loading, error, createExpense, deleteExpense } =
    useExpenses();
  const { categories } = useCategories();
  const { budgetItems } = useMonthlyBudgets();

  // Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  // Aktueller Monat
  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  // Heutiges Datum im Input-Format
  const getTodayString = (): string => {
    return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

  // Form State initialisieren
  useState(() => {
    setExpenseDate(getTodayString());
  });

  // Neue Ausgabe erstellen
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      setExpenseError('Kategorie auswählen');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      setExpenseError('Betrag muss eine positive Zahl sein');
      return;
    }

    try {
      setIsCreating(true);
      setExpenseError('');

      await createExpense(
        parseInt(selectedCategoryId),
        expenseAmount,
        description.trim() || undefined,
        expenseDate
      );

      // Form zurücksetzen
      setSelectedCategoryId('');
      setAmount('');
      setDescription('');
      setExpenseDate(getTodayString());
    } catch (err) {
      setExpenseError(
        err instanceof Error ? err.message : 'Fehler beim Erstellen'
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Ausgabe löschen
  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Ausgabe wirklich löschen?')) return;

    try {
      await deleteExpense(expenseId);
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  };

  // Hilfsfunktionen für Statistiken
  const getTotalExpenses = (): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesForCategory = (categoryId: number): number => {
    return expenses
      .filter((expense) => expense.category_id === categoryId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getBudgetForCategory = (categoryId: number): number => {
    const item = budgetItems.find((item) => item.category_id === categoryId);
    return item ? item.planned_amount : 0;
  };

  return (
    <div className='space-y-6'>
      {/* Ausgaben-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>🧾 Ausgaben {getCurrentMonth()}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className='text-center text-gray-500'>🔄 Lade Ausgaben...</p>
          )}

          {error && (
            <p className='text-center text-red-600'>❌ Fehler: {error}</p>
          )}

          {!loading && !error && expenses.length === 0 && (
            <p className='text-center text-gray-500'>
              Noch keine Ausgaben für diesen Monat
            </p>
          )}

          {!loading && !error && expenses.length > 0 && (
            <div className='space-y-3'>
              <div className='mb-4 p-3 bg-blue-50 rounded-lg'>
                <p className='font-medium'>
                  Gesamt ausgegeben: {getTotalExpenses().toFixed(2)}€
                </p>
                <p className='text-sm text-gray-600'>
                  {expenses.length} Ausgaben
                </p>
              </div>

              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className='flex justify-between items-center p-3 border rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-4 h-4 rounded-full'
                      style={{
                        backgroundColor: expense.category_color || '#3b82f6',
                      }}
                    />
                    <div>
                      <h4 className='font-medium'>
                        {expense.description || 'Ohne Beschreibung'}
                      </h4>
                      <p className='text-sm text-gray-500'>
                        {expense.category_name} •{' '}
                        {new Date(expense.expense_date).toLocaleDateString(
                          'de-DE'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <span className='font-bold text-red-600'>
                      -{expense.amount.toFixed(2)}€
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Neue Ausgabe erstellen */}
      <Card>
        <CardHeader>
          <CardTitle>➕ Neue Ausgabe erfassen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateExpense} className='space-y-4'>
            {/* Kategorie auswählen */}
            <div>
              <label htmlFor='category' className='text-sm font-medium'>
                Kategorie
              </label>
              <select
                id='category'
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className='w-full p-2 border rounded-md'
                required
              >
                <option value=''>Kategorie wählen...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Betrag */}
            <div>
              <label htmlFor='amount' className='text-sm font-medium'>
                Betrag (€)
              </label>
              <Input
                id='amount'
                type='number'
                min='0'
                step='0.01'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder='z.B. 85.50'
                required
              />
            </div>

            {/* Beschreibung */}
            <div>
              <label htmlFor='description' className='text-sm font-medium'>
                Beschreibung (optional)
              </label>
              <Input
                id='description'
                type='text'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='z.B. Supermarkt Einkauf'
              />
            </div>

            {/* Datum */}
            <div>
              <label htmlFor='date' className='text-sm font-medium'>
                Datum
              </label>
              <Input
                id='date'
                type='date'
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>

            {expenseError && (
              <p className='text-red-600 text-sm'>❌ {expenseError}</p>
            )}

            <Button type='submit' className='w-full' disabled={isCreating}>
              {isCreating ? '⏳ Erstelle...' : '✅ Ausgabe hinzufügen'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Budget vs. Ist Vergleich */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Budget vs. Ist-Ausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {categories.map((category) => {
                const spent = getExpensesForCategory(category.id);
                const budget = getBudgetForCategory(category.id);
                const remaining = budget - spent;
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;

                return (
                  <div key={category.id} className='p-3 border rounded-lg'>
                    <div className='flex justify-between items-center mb-2'>
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{
                            backgroundColor: category.color || '#3b82f6',
                          }}
                        />
                        <span className='font-medium'>{category.name}</span>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {spent.toFixed(2)}€ von {budget.toFixed(2)}€
                      </span>
                    </div>

                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${
                          percentage > 100
                            ? 'bg-red-500'
                            : percentage > 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className='flex justify-between text-sm mt-1'>
                      <span
                        className={
                          remaining < 0 ? 'text-red-600' : 'text-green-600'
                        }
                      >
                        {remaining >= 0 ? 'Verbleibt: ' : 'Überzogen: '}
                        {Math.abs(remaining).toFixed(2)}€
                      </span>
                      <span className='text-gray-500'>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-sm space-y-1'>
            <p>
              <strong>Ausgaben geladen:</strong> {expenses.length}
            </p>
            <p>
              <strong>Kategorien verfügbar:</strong> {categories.length}
            </p>
            <p>
              <strong>Budget Items:</strong> {budgetItems.length}
            </p>
            <p>
              <strong>Aktueller Monat:</strong> {getCurrentMonth()}
            </p>
            <p>
              <strong>Loading:</strong> {loading ? 'Ja' : 'Nein'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
