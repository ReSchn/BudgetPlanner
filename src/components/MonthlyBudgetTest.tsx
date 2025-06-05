import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useMonthlyBudgets } from '@/hooks/useMonthlyBudgets';
import { useCategories } from '../hooks/useCategories';

export function MonthlyBudgetTest() {
  // Hooks nutzen
  const {
    currentBudget,
    budgetItems,
    loading,
    error,
    createMonthlyBudget,
    updateIncome,
    setBudgetForCategory,
  } = useMonthlyBudgets();
  const { categories } = useCategories();

  // Form State
  const [newIncome, setNewIncome] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [budgetError, setBudgetError] = useState('');

  // Aktueller Monat als String
  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  const currentMonth = getCurrentMonth();

  // Neues Monatsbudget erstellen
  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    const income = parseFloat(newIncome);
    if (isNaN(income) || income <= 0) {
      setBudgetError('Einkommen muss eine positive Zahl sein');
      return;
    }

    try {
      setIsCreating(true);
      setBudgetError('');

      await createMonthlyBudget(currentMonth, income);
      setNewIncome('');
    } catch (err) {
      setBudgetError(
        err instanceof Error ? err.message : 'Fehler beim Erstellen'
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Einkommen ändern
  const handleUpdateIncome = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBudget) return;

    const income = parseFloat(newIncome);
    if (isNaN(income) || income <= 0) {
      setBudgetError('Einkommen muss eine positive Zahl sein');
      return;
    }

    try {
      setIsUpdating(true);
      setBudgetError('');

      await updateIncome(currentBudget.id, income);
      setNewIncome('');
    } catch (err) {
      setBudgetError(
        err instanceof Error ? err.message : 'Fehler beim Aktualisieren'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Budget für Kategorie setzen
  const handleSetCategoryBudget = async (
    categoryId: number,
    amount: string
  ) => {
    if (!currentBudget) return;

    const budgetAmount = parseFloat(amount) || 0;

    try {
      await setBudgetForCategory(currentBudget.id, categoryId, budgetAmount);
    } catch (err) {
      console.error('Fehler beim Setzen des Kategorie-Budgets:', err);
    }
  };

  // Hilfsfunktion: Aktuelles Budget für eine Kategorie finden
  const getBudgetForCategory = (categoryId: number): number => {
    const item = budgetItems.find((item) => item.category_id === categoryId);
    return item ? item.planned_amount : 0;
  };

  return (
    <div className='space-y-6'>
      {/* Aktueller Monat Header */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Monatsbudget für {currentMonth}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className='text-center text-gray-500'>🔄 Lade Monatsbudget...</p>
          )}

          {error && (
            <p className='text-center text-red-600'>❌ Fehler: {error}</p>
          )}

          {!loading && !error && !currentBudget && (
            <p className='text-center text-orange-600'>
              ⚠️ Noch kein Budget für diesen Monat erstellt
            </p>
          )}

          {!loading && !error && currentBudget && (
            <div className='space-y-2'>
              <p className='text-lg'>
                <strong>💰 Einkommen:</strong> {currentBudget.income.toFixed(2)}
                €
              </p>
              <p className='text-sm text-gray-600'>
                Erstellt:{' '}
                {new Date(currentBudget.created_at).toLocaleDateString('de-DE')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget erstellen/ändern */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentBudget
              ? '✏️ Einkommen ändern'
              : '➕ Monatsbudget erstellen'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={currentBudget ? handleUpdateIncome : handleCreateBudget}
            className='space-y-4'
          >
            <div>
              <label htmlFor='income' className='text-sm font-medium'>
                Monatliches Einkommen (€)
              </label>
              <Input
                id='income'
                type='number'
                min='0'
                step='0.01'
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
                placeholder={
                  currentBudget ? currentBudget.income.toString() : 'z.B. 3500'
                }
                required
              />
            </div>

            {budgetError && (
              <p className='text-red-600 text-sm'>❌ {budgetError}</p>
            )}

            <Button
              type='submit'
              className='w-full'
              disabled={isCreating || isUpdating}
            >
              {isCreating
                ? '⏳ Erstelle...'
                : isUpdating
                ? '⏳ Aktualisiere...'
                : currentBudget
                ? '💾 Einkommen aktualisieren'
                : '✅ Budget erstellen'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Budget pro Kategorie (nur wenn Monatsbudget existiert) */}
      {currentBudget && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Budget pro Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className='text-center text-gray-500'>
                Erst Kategorien erstellen, dann Budget zuweisen
              </p>
            ) : (
              <div className='space-y-4'>
                {categories.map((category) => {
                  const currentAmount = getBudgetForCategory(category.id);
                  return (
                    <div
                      key={category.id}
                      className='flex items-center gap-4 p-3 border rounded-lg'
                    >
                      {/* Kategorie-Info */}
                      <div className='flex items-center gap-3 flex-1'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{
                            backgroundColor: category.color || '#3b82f6',
                          }}
                        />
                        <div>
                          <h4 className='font-medium'>{category.name}</h4>
                          <p className='text-xs text-gray-500'>
                            Standard: {category.default_budget.toFixed(2)}€
                          </p>
                        </div>
                      </div>

                      {/* Budget Input */}
                      <div className='w-32'>
                        <Input
                          type='number'
                          min='0'
                          step='0.01'
                          value={currentAmount}
                          onChange={(e) =>
                            handleSetCategoryBudget(category.id, e.target.value)
                          }
                          placeholder='0.00'
                          className='text-right'
                        />
                      </div>

                      <span className='text-sm text-gray-500'>€</span>
                    </div>
                  );
                })}

                {/* Gesamt-Übersicht */}
                <div className='pt-4 border-t'>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium'>Gesamt geplant:</span>
                    <span className='font-bold'>
                      {budgetItems
                        .reduce((sum, item) => sum + item.planned_amount, 0)
                        .toFixed(2)}
                      €
                    </span>
                  </div>
                  {currentBudget && (
                    <div className='flex justify-between items-center text-sm text-gray-600'>
                      <span>Verbleibt:</span>
                      <span>
                        {(
                          currentBudget.income -
                          budgetItems.reduce(
                            (sum, item) => sum + item.planned_amount,
                            0
                          )
                        ).toFixed(2)}
                        €
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
              <strong>Aktueller Monat:</strong> {currentMonth}
            </p>
            <p>
              <strong>Budget existiert:</strong> {currentBudget ? 'Ja' : 'Nein'}
            </p>
            <p>
              <strong>Budget Items:</strong> {budgetItems.length}
            </p>
            <p>
              <strong>Verfügbare Kategorien:</strong> {categories.length}
            </p>
            <p>
              <strong>Hook lädt:</strong> {loading ? 'Ja' : 'Nein'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
