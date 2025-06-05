import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';

// Expense-Typ Interface
interface ExpenseWithCategory {
  id: number;
  user_id: string;
  category_id: number;
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
  category_name: string;
  category_color: string | null;
}

export function Expenses() {
  const {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();
  const { categories } = useCategories();

  // Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  // Edit State
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Heutiges Datum als Default
  useState(() => {
    const today = new Date().toISOString().split('T')[0];
    setExpenseDate(today);
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
      setExpenseDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setExpenseError(
        err instanceof Error ? err.message : 'Fehler beim Erstellen'
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Bearbeitung starten
  const startEdit = (expense: ExpenseWithCategory) => {
    setEditingExpense(expense.id);
    setEditCategoryId(expense.category_id.toString());
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description || '');
    setEditDate(expense.expense_date);
  };

  // Bearbeitung abbrechen
  const cancelEdit = () => {
    setEditingExpense(null);
    setEditCategoryId('');
    setEditAmount('');
    setEditDescription('');
    setEditDate('');
  };

  // Ausgabe aktualisieren
  const handleUpdateExpense = async (expenseId: number) => {
    if (!editCategoryId) return;

    const expenseAmount = parseFloat(editAmount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) return;

    try {
      setIsUpdating(true);
      await updateExpense(
        expenseId,
        parseInt(editCategoryId),
        expenseAmount,
        editDescription.trim() || undefined,
        editDate
      );
      setEditingExpense(null);
    } catch (err) {
      console.error('Fehler beim Aktualisieren:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Schnellerfassung - häufige Ausgaben
  const handleQuickExpense = async (
    categoryId: number,
    amount: number,
    description: string
  ) => {
    try {
      await createExpense(categoryId, amount, description);
    } catch (err) {
      console.error('Fehler bei Schnellerfassung:', err);
    }
  };

  // Ausgabe löschen
  const handleDeleteExpense = async (
    expenseId: number,
    description: string
  ) => {
    if (
      !confirm(
        `Ausgabe "${description || 'Ohne Beschreibung'}" wirklich löschen?`
      )
    )
      return;

    try {
      await deleteExpense(expenseId);
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  };

  // Schnellerfassung-Optionen generieren
  const getQuickExpenseOptions = () => {
    return categories.slice(0, 3).map((category) => {
      let defaultAmount = 50;
      let defaultDescription = 'Ausgabe';

      // Intelligente Defaults basierend auf Kategorie-Namen
      if (
        category.name.toLowerCase().includes('auto') ||
        category.name.toLowerCase().includes('tank')
      ) {
        defaultAmount = 60;
        defaultDescription = 'Tanken';
      } else if (
        category.name.toLowerCase().includes('haushalt') ||
        category.name.toLowerCase().includes('lebensmittel')
      ) {
        defaultAmount = 80;
        defaultDescription = 'Einkauf';
      } else if (category.name.toLowerCase().includes('miete')) {
        defaultAmount = category.default_budget;
        defaultDescription = `Miete ${new Date().toLocaleDateString('de-DE', {
          month: 'long',
        })}`;
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        amount: defaultAmount,
        description: defaultDescription,
      };
    });
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Ausgaben erfassen</h1>
        <p className='text-gray-600 mt-1'>
          Erfasse deine täglichen Ausgaben und behalte den Überblick
        </p>
      </div>

      {/* Grid Layout wie im Mockup */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Neue Ausgabe hinzufügen */}
        <Card>
          <CardHeader>
            <CardTitle>Neue Ausgabe hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateExpense} className='space-y-4'>
              {/* Kategorie auswählen */}
              <div>
                <label
                  htmlFor='category'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Kategorie
                </label>
                <select
                  id='category'
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded-md'
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
                <label
                  htmlFor='amount'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
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

              {/* Datum */}
              <div>
                <label
                  htmlFor='date'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
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

              {/* Beschreibung */}
              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
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

              {expenseError && (
                <div className='text-red-600 text-sm'>❌ {expenseError}</div>
              )}

              <Button type='submit' className='w-full' disabled={isCreating}>
                {isCreating ? '⏳ Erstelle...' : '+ Ausgabe hinzufügen'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Schnellerfassung */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellerfassung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-gray-600 mb-4'>Häufige Ausgaben</p>

            {categories.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <div className='text-4xl mb-2'>📂</div>
                <p>Noch keine Kategorien verfügbar</p>
                <p className='text-sm'>Erstelle zuerst Kategorien</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-3'>
                {/* Intelligente Schnellerfassung */}
                {getQuickExpenseOptions().map((option) => (
                  <Button
                    key={option.categoryId}
                    variant='outline'
                    className='p-4 h-auto flex flex-col items-start hover:bg-gray-50'
                    onClick={() =>
                      handleQuickExpense(
                        option.categoryId,
                        option.amount,
                        option.description
                      )
                    }
                  >
                    <div className='flex items-center gap-2 mb-1'>
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{
                          backgroundColor: option.categoryColor || '#3b82f6',
                        }}
                      />
                      <span className='font-medium'>{option.description}</span>
                    </div>
                    <span className='text-sm text-gray-500'>
                      €{option.amount} - {option.categoryName}
                    </span>
                  </Button>
                ))}

                {/* Platzhalter wenn weniger als 3 Kategorien */}
                {categories.length < 3 && (
                  <div className='p-4 border-2 border-dashed border-gray-300 rounded-lg text-center'>
                    <p className='text-sm text-gray-500'>
                      Mehr Schnellerfassung-Optionen werden verfügbar, wenn du
                      mehr Kategorien erstellst
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Letzte Ausgaben */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Ausgaben</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className='text-center py-8 text-gray-500'>
              🔄 Lade Ausgaben...
            </div>
          )}

          {error && (
            <div className='text-center py-8 text-red-600'>
              ❌ Fehler: {error}
            </div>
          )}

          {!loading && !error && expenses.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <div className='text-4xl mb-2'>🧾</div>
              <p className='font-medium'>
                Noch keine Ausgaben für diesen Monat
              </p>
              <p className='text-sm'>Erfasse deine erste Ausgabe oben</p>
            </div>
          )}

          {!loading && !error && expenses.length > 0 && (
            <div className='space-y-3'>
              {/* Monatsstatistik */}
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
                  <div>
                    <div className='text-2xl font-bold text-blue-600'>
                      {expenses.length}
                    </div>
                    <div className='text-sm text-blue-800'>
                      Ausgaben diesen Monat
                    </div>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-red-600'>
                      €
                      {expenses
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toFixed(2)}
                    </div>
                    <div className='text-sm text-red-800'>Total ausgegeben</div>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-green-600'>
                      €
                      {expenses.length > 0
                        ? (
                            expenses.reduce(
                              (sum, expense) => sum + expense.amount,
                              0
                            ) / expenses.length
                          ).toFixed(2)
                        : '0.00'}
                    </div>
                    <div className='text-sm text-green-800'>
                      Durchschnitt pro Ausgabe
                    </div>
                  </div>
                </div>
              </div>

              {/* Ausgaben-Liste mit Edit-Mode */}
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50'
                >
                  {editingExpense === expense.id ? (
                    // Edit Mode
                    <div className='space-y-3'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {/* Kategorie Select */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Kategorie
                          </label>
                          <select
                            value={editCategoryId}
                            onChange={(e) => setEditCategoryId(e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded-md text-sm'
                          >
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Betrag Input */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Betrag (€)
                          </label>
                          <Input
                            type='number'
                            min='0'
                            step='0.01'
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className='text-sm'
                          />
                        </div>

                        {/* Datum Input */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Datum
                          </label>
                          <Input
                            type='date'
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className='text-sm'
                          />
                        </div>

                        {/* Beschreibung Input */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Beschreibung
                          </label>
                          <Input
                            type='text'
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder='Beschreibung'
                            className='text-sm'
                          />
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          onClick={() => handleUpdateExpense(expense.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? '⏳' : '💾'} Speichern
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={cancelEdit}
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-3'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{
                            backgroundColor:
                              expense.category_color || '#3b82f6',
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
                          -€{expense.amount.toFixed(2)}
                        </span>

                        {/* Separate Buttons für Bearbeiten und Löschen */}
                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => startEdit(expense)}
                          >
                            ✏️ Bearbeiten
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleDeleteExpense(
                                expense.id,
                                expense.description || ''
                              )
                            }
                            className='text-red-600 border-red-200 hover:bg-red-50'
                          >
                            🗑️ Löschen
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kategorien-Übersicht - Bonus */}
      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Ausgaben nach Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {categories.map((category) => {
                const categoryExpenses = expenses.filter(
                  (expense) => expense.category_id === category.id
                );
                const totalSpent = categoryExpenses.reduce(
                  (sum, expense) => sum + expense.amount,
                  0
                );

                if (totalSpent === 0) return null;

                return (
                  <div
                    key={category.id}
                    className='p-4 border border-gray-200 rounded-lg'
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <div
                        className='w-4 h-4 rounded-full'
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                      />
                      <h4 className='font-medium'>{category.name}</h4>
                    </div>
                    <p className='text-2xl font-bold text-red-600 mb-1'>
                      €{totalSpent.toFixed(2)}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {categoryExpenses.length} Ausgabe
                      {categoryExpenses.length !== 1 ? 'n' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
