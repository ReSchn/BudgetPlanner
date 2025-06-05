import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useMonthlyBudgets } from '../hooks/useMonthlyBudgets';
import { useCategories } from '../hooks/useCategories';

export function Budget() {
  const {
    currentBudget,
    budgetItems,
    loading,
    error,
    createMonthlyBudget,
    updateIncome,
    setBudgetForCategory,
    getCurrentMonthBudget,
    getAvailableBudgetMonths,
  } = useMonthlyBudgets();
  const { categories } = useCategories();

  // State für Monatsauswahl
  const [selectedMonth, setSelectedMonth] = useState('');
  const [newMonthInput, setNewMonthInput] = useState('');
  const [existingMonths, setExistingMonths] = useState<string[]>([]);

  // State für Einkommen
  const [incomeInput, setIncomeInput] = useState('');
  const [isUpdatingIncome, setIsUpdatingIncome] = useState(false);

  // State für Budget-Items
  const [budgetInputs, setBudgetInputs] = useState<{
    [categoryId: number]: string;
  }>({});

  // Hilfsfunktion: Aktueller Monat als Default
  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  // Funktion um Monatsnamen zu formatieren
  const formatMonthName = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  // Neue Funktion: Alle Monate (existierende + aktueller)
  const getAllAvailableMonths = (): string[] => {
    const currentMonth = getCurrentMonth();
    const allMonths = [...new Set([...existingMonths, currentMonth])]
      .sort()
      .reverse();
    return allMonths;
  };

  // Initialisierung
  useEffect(() => {
    const currentMonth = getCurrentMonth();
    setNewMonthInput(currentMonth);
  }, []);

  // Existierende Monate laden
  useEffect(() => {
    const loadExistingMonths = async () => {
      const months = await getAvailableBudgetMonths();
      setExistingMonths(months);

      // Falls noch kein Monat gewählt oder gewählter Monat existiert nicht
      if (!selectedMonth || !months.includes(selectedMonth)) {
        // Aktueller Monat als Fallback, oder erster existierender Monat
        const currentMonth = getCurrentMonth();
        const defaultMonth = months.includes(currentMonth)
          ? currentMonth
          : months[0] || currentMonth;
        setSelectedMonth(defaultMonth);
      }
    };

    loadExistingMonths();
  }, [getAvailableBudgetMonths, selectedMonth]);

  // Daten laden wenn Monat sich ändert
  useEffect(() => {
    if (selectedMonth) {
      getCurrentMonthBudget(selectedMonth);
    }
  }, [selectedMonth, getCurrentMonthBudget]);

  // Budget-Inputs initialisieren wenn budgetItems sich ändern
  useEffect(() => {
    const inputs: { [categoryId: number]: string } = {};
    categories.forEach((category) => {
      const budgetItem = budgetItems.find(
        (item) => item.category_id === category.id
      );
      inputs[category.id] = budgetItem
        ? budgetItem.planned_amount.toString()
        : category.default_budget.toString();
    });
    setBudgetInputs(inputs);
  }, [budgetItems, categories]);

  // Einkommen-Input initialisieren
  useEffect(() => {
    if (currentBudget) {
      setIncomeInput(currentBudget.income.toString());
    } else {
      setIncomeInput('');
    }
  }, [currentBudget]);

  // Neuen Monat erstellen
  const handleCreateMonth = async () => {
    if (!newMonthInput) return;

    try {
      await createMonthlyBudget(newMonthInput, 0);
      setSelectedMonth(newMonthInput);

      // Existierende Monate neu laden
      const updatedMonths = await getAvailableBudgetMonths();
      setExistingMonths(updatedMonths);
    } catch (err) {
      console.error('Fehler beim Erstellen des Monats:', err);
    }
  };

  // Einkommen speichern
  const handleSaveIncome = async () => {
    const income = parseFloat(incomeInput) || 0;

    try {
      setIsUpdatingIncome(true);

      if (currentBudget) {
        // Budget existiert -> Einkommen aktualisieren
        await updateIncome(currentBudget.id, income);
      } else {
        // Kein Budget -> Neues erstellen
        await createMonthlyBudget(selectedMonth, income);

        // Existierende Monate neu laden
        const updatedMonths = await getAvailableBudgetMonths();
        setExistingMonths(updatedMonths);
      }
    } catch (err) {
      console.error('Fehler beim Speichern des Einkommens:', err);
    } finally {
      setIsUpdatingIncome(false);
    }
  };

  // Budget für Kategorie speichern
  const handleSaveCategoryBudget = async (
    categoryId: number,
    amount: string
  ) => {
    if (!currentBudget) return;

    const budgetAmount = parseFloat(amount) || 0;

    try {
      await setBudgetForCategory(currentBudget.id, categoryId, budgetAmount);
    } catch (err) {
      console.error('Fehler beim Speichern des Kategorie-Budgets:', err);
    }
  };

  // Budget-Input ändern
  const handleBudgetInputChange = (categoryId: number, value: string) => {
    setBudgetInputs((prev) => ({ ...prev, [categoryId]: value }));
  };

  // Berechnungen
  const totalPlanned = Object.values(budgetInputs).reduce(
    (sum, value) => sum + (parseFloat(value) || 0),
    0
  );
  const income = currentBudget?.income || 0;
  const remaining = income - totalPlanned;

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Monatliches Budget einrichten
        </h1>
        <p className='text-gray-600 mt-1'>
          Plane dein Budget für den gewählten Monat
        </p>
      </div>

      {/* Monatsauswahl - Nur existierende Monate */}
      <Card>
        <CardHeader>
          <CardTitle>Monat auswählen</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Hauptauswahl - nur existierende Monate */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Budget für welchen Monat?
            </label>

            {existingMonths.length === 0 ? (
              <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
                <p className='text-sm text-yellow-800'>
                  ⚠️ Noch keine Budget-Monate vorhanden. Erstelle unten einen
                  neuen Monat.
                </p>
              </div>
            ) : (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                {getAllAvailableMonths().map((month) => (
                  <option key={month} value={month}>
                    {formatMonthName(month)}
                    {month === getCurrentMonth() && ' (Aktueller Monat)'}
                    {existingMonths.includes(month) ? ' ✅' : ' (Neu)'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Neuen Monat hinzufügen */}
          <div className='border-t pt-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Neuen Monat erstellen:
            </label>
            <div className='flex gap-2'>
              <Input
                type='month'
                value={newMonthInput}
                onChange={(e) => setNewMonthInput(e.target.value)}
                className='flex-1'
              />
              <Button
                onClick={handleCreateMonth}
                disabled={
                  !newMonthInput || existingMonths.includes(newMonthInput)
                }
              >
                Erstellen
              </Button>
            </div>
            {newMonthInput && existingMonths.includes(newMonthInput) && (
              <p className='text-sm text-orange-600 mt-1'>
                ⚠️ Budget für diesen Monat existiert bereits
              </p>
            )}
          </div>

          {/* Aktueller Status */}
          <div className='bg-blue-50 p-3 rounded-lg'>
            <p className='text-sm'>
              <strong>Gewählter Monat:</strong>{' '}
              {selectedMonth
                ? formatMonthName(selectedMonth)
                : 'Nicht ausgewählt'}
              <br />
              <strong>Status:</strong>{' '}
              {currentBudget
                ? `Budget vorhanden (€${currentBudget.income.toFixed(
                    2
                  )} Einkommen)`
                : 'Noch kein Budget erstellt'}
              <br />
              <strong>Verfügbare Monate:</strong> {existingMonths.length}{' '}
              Budget(s) erstellt
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Einkommen */}
        <Card>
          <CardHeader>
            <CardTitle>Einkommen</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Gehalt für{' '}
                {selectedMonth
                  ? formatMonthName(selectedMonth)
                  : 'gewählten Monat'}
              </label>
              <Input
                type='number'
                min='0'
                step='0.01'
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                placeholder='3.500,00 €'
              />
            </div>

            <Button
              onClick={handleSaveIncome}
              disabled={isUpdatingIncome || !selectedMonth}
              className='w-full'
            >
              {isUpdatingIncome ? '⏳ Speichere...' : 'Einkommen speichern'}
            </Button>
          </CardContent>
        </Card>

        {/* Budget-Übersicht */}
        <Card>
          <CardHeader>
            <CardTitle>Budget-Übersicht</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between items-center py-2 border-b'>
              <span>Verfügbar:</span>
              <span className='font-semibold text-green-600'>
                €{income.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className='flex justify-between items-center py-2 border-b'>
              <span>Verplant:</span>
              <span className='font-semibold'>
                €
                {totalPlanned.toLocaleString('de-DE', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className='flex justify-between items-center py-2'>
              <span>Verbleibt:</span>
              <span
                className={`font-semibold ${
                  remaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                €
                {remaining.toLocaleString('de-DE', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            {remaining < 0 && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-red-800 text-sm'>
                  ⚠️ Du hast mehr Budget geplant als verfügbar ist!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget pro Kategorie */}
      <Card>
        <CardHeader>
          <CardTitle>Budget pro Kategorie</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className='text-center py-8 text-gray-500'>
              🔄 Lade Budget-Daten...
            </div>
          )}

          {error && (
            <div className='text-center py-8 text-red-600'>
              ❌ Fehler: {error}
            </div>
          )}

          {!currentBudget && selectedMonth && (
            <div className='text-center py-8 text-gray-500'>
              <div className='text-4xl mb-2'>💰</div>
              <p className='font-medium'>
                Noch kein Budget für {formatMonthName(selectedMonth)}
              </p>
              <p className='text-sm'>
                Erstelle zuerst ein Budget mit Einkommen
              </p>
            </div>
          )}

          {categories.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <div className='text-4xl mb-2'>📂</div>
              <p className='font-medium'>Noch keine Kategorien vorhanden</p>
              <p className='text-sm'>
                Erstelle zuerst Kategorien in der Kategorien-Verwaltung
              </p>
            </div>
          ) : (
            currentBudget && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className='flex items-center gap-4 p-4 border border-gray-200 rounded-lg'
                  >
                    <div
                      className='w-4 h-4 rounded-full flex-shrink-0'
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    />

                    <div className='flex-1'>
                      <h4 className='font-medium'>{category.name}</h4>
                      <p className='text-xs text-gray-500'>
                        Standard: €{category.default_budget.toFixed(2)}
                      </p>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        value={budgetInputs[category.id] || ''}
                        onChange={(e) =>
                          handleBudgetInputChange(category.id, e.target.value)
                        }
                        onBlur={() =>
                          handleSaveCategoryBudget(
                            category.id,
                            budgetInputs[category.id] || '0'
                          )
                        }
                        className='w-24 text-right'
                        placeholder='0.00'
                      />
                      <span className='text-sm text-gray-500'>€</span>
                    </div>
                  </div>
                ))}

                {/* Neue Kategorie während Budget-Eingabe hinzufügen */}
                <div className='flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg'>
                  <div className='w-4 h-4 rounded-full bg-gray-300 flex-shrink-0' />
                  <div className='flex-1'>
                    <p className='font-medium text-gray-600'>
                      + Neue Kategorie
                    </p>
                    <p className='text-xs text-gray-500'>
                      Füge eine neue Kategorie hinzu
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      // Navigation zur Kategorien-Seite
                      window.location.href = '/categories';
                    }}
                  >
                    Hinzufügen
                  </Button>
                </div>
              </div>
            )
          )}

          {categories.length > 0 && currentBudget && (
            <div className='mt-6 flex justify-end gap-4'>
              <Button variant='outline'>Abbrechen</Button>
              <Button>Budget speichern</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
