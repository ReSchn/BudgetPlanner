import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useMonthlyBudgets } from '../hooks/useMonthlyBudgets';
import { useCategories } from '../hooks/useCategories';
import { useExpenses } from '../hooks/useExpenses';

// TypeScript Interface für Kategorie-Statistiken
interface CategoryStats {
  name: string;
  amount: number;
  color: string | null;
}

export function Analytics() {
  const { getAvailableBudgetMonths } = useMonthlyBudgets();
  const { categories } = useCategories();
  const { expenses } = useExpenses();

  // State für verfügbare Monate
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // Hilfsfunktion: Monatsnamen formatieren
  const formatMonthName = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('de-DE', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Verfügbare Monate laden
  useEffect(() => {
    const loadData = async () => {
      const months = await getAvailableBudgetMonths();
      setAvailableMonths(months.slice(0, 6)); // Letzten 6 Monate
    };
    loadData();
  }, [getAvailableBudgetMonths]);

  // Berechnungen für aktuelle Statistiken
  const currentMonthExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Ausgaben für Sparen-Kategorie separat berechnen
  const sparenCategoryExpenses = expenses
    .filter((expense) => {
      const category = categories.find((cat) => cat.id === expense.category_id);
      return category && category.name.toLowerCase().includes('spar');
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Echte Ausgaben = Alle Ausgaben - Sparen
  const realExpenses = currentMonthExpenses - sparenCategoryExpenses;

  const categoriesWithExpenses: CategoryStats[] = categories
    .map((category) => {
      const categoryExpenses = expenses.filter(
        (exp) => exp.category_id === category.id
      );
      const totalSpent = categoryExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      return {
        name: category.name,
        amount: totalSpent,
        color: category.color,
      };
    })
    .filter((cat) => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Spar-Rate berechnen: (Einkommen - Echte Ausgaben + Sparen) / Einkommen
  const estimatedIncome = 3500; // Könnte aus aktueller Budget geholt werden
  const leftOver = estimatedIncome - currentMonthExpenses;
  const totalSaved = leftOver + sparenCategoryExpenses;
  const savingsRate = (totalSaved / estimatedIncome) * 100;

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Auswertungen & Trends
        </h1>
        <p className='text-gray-600 mt-1'>
          Analysiere deine Ausgaben und erkenne Trends
        </p>
      </div>

      {/* Grid Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Ausgaben-Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Ausgaben-Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
              <div className='text-center text-gray-500'>
                <div className='text-4xl mb-2'>📈</div>
                <div className='font-medium'>Liniendiagramm:</div>
                <div className='text-sm'>Monatliche Ausgaben</div>
                <div className='text-sm'>der letzten 6 Monate</div>
                {availableMonths.length > 0 && (
                  <div className='text-xs mt-2 text-blue-600'>
                    Daten für: {availableMonths.map(formatMonthName).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kategorie-Vergleich */}
        <Card>
          <CardHeader>
            <CardTitle>Kategorie-Vergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
              <div className='text-center text-gray-500'>
                <div className='text-4xl mb-2'>📊</div>
                <div className='font-medium'>Balkendiagramm:</div>
                <div className='text-sm'>Geplant vs. Ist</div>
                <div className='text-sm'>aktueller Monat</div>
                {categoriesWithExpenses.length > 0 && (
                  <div className='text-xs mt-2 text-blue-600'>
                    {categoriesWithExpenses.length} aktive Kategorien
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zweite Reihe */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Spar-Rate mit korrigierter Berechnung */}
        <Card>
          <CardHeader>
            <CardTitle>Spar-Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              <div className='text-6xl font-bold text-green-600 mb-2'>
                {Math.max(0, Math.round(savingsRate))}%
              </div>
              <p className='text-gray-600'>
                vom Einkommen gespart
                <br />
                im aktuellen Monat
              </p>

              <div className='mt-6 space-y-2 text-sm'>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <div className='grid grid-cols-2 gap-4 text-left'>
                    <div>
                      <p className='text-gray-600'>Einkommen:</p>
                      <p className='font-semibold'>
                        €{estimatedIncome.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600'>Echte Ausgaben:</p>
                      <p className='font-semibold text-red-600'>
                        €{realExpenses.toFixed(2)}
                      </p>
                    </div>
                    {sparenCategoryExpenses > 0 && (
                      <>
                        <div>
                          <p className='text-gray-600'>Aktiv gespart:</p>
                          <p className='font-semibold text-green-600'>
                            €{sparenCategoryExpenses.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600'>Übrig geblieben:</p>
                          <p className='font-semibold text-blue-600'>
                            €{leftOver.toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className='mt-3 pt-3 border-t border-gray-200'>
                    <div className='flex justify-between items-center'>
                      <p className='font-medium text-gray-700'>
                        Total gespart:
                      </p>
                      <p className='font-bold text-green-600 text-lg'>
                        €{totalSaved.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top-Kategorien */}
        <Card>
          <CardHeader>
            <CardTitle>Top-Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesWithExpenses.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <div className='text-4xl mb-2'>📊</div>
                <p>Noch keine Ausgaben vorhanden</p>
                <p className='text-sm'>Erfasse Ausgaben um Trends zu sehen</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {categoriesWithExpenses.slice(0, 4).map((category, index) => {
                  const isSavingsCategory = category.name
                    .toLowerCase()
                    .includes('spar');

                  return (
                    <div
                      key={category.name}
                      className='flex justify-between items-center py-2'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='text-lg font-bold text-gray-400'>
                          {index + 1}.
                        </span>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{
                            backgroundColor: category.color || '#3b82f6',
                          }}
                        />
                        <span className='font-medium'>{category.name}</span>
                        {isSavingsCategory && (
                          <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
                            💰 Sparen
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-bold ${
                          isSavingsCategory ? 'text-green-600' : 'text-gray-900'
                        }`}
                      >
                        €{category.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {categoriesWithExpenses.length > 4 && (
                  <div className='text-center text-sm text-gray-500 pt-2 border-t'>
                    und {categoriesWithExpenses.length - 4} weitere Kategorien
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historischer Vergleich */}
      <Card>
        <CardHeader>
          <CardTitle>Historischer Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-80 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
            <div className='text-center text-gray-500'>
              <div className='text-4xl mb-2'>📊</div>
              <div className='font-medium'>Gestapeltes Balkendiagramm:</div>
              <div className='text-sm'>Monatliche Ausgaben nach Kategorien</div>
              <div className='text-sm'>über die letzten 12 Monate</div>
              {availableMonths.length > 0 && (
                <div className='text-xs mt-2 text-blue-600'>
                  Verfügbare Monate: {availableMonths.length}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zusätzliche Statistiken */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>💰 Gesamtausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center'>
              <div className='text-3xl font-bold text-red-600'>
                €{currentMonthExpenses.toFixed(2)}
              </div>
              <p className='text-sm text-gray-600'>diesen Monat</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🏠 Echte Ausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center'>
              <div className='text-3xl font-bold text-orange-600'>
                €{realExpenses.toFixed(2)}
              </div>
              <p className='text-sm text-gray-600'>ohne Sparen</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Aktive Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>
                {categoriesWithExpenses.length}
              </div>
              <p className='text-sm text-gray-600'>
                von {categories.length} Kategorien
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🧾 Anzahl Ausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center'>
              <div className='text-3xl font-bold text-purple-600'>
                {expenses.length}
              </div>
              <p className='text-sm text-gray-600'>Transaktionen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spar-Hinweis */}
      {sparenCategoryExpenses > 0 && (
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-green-600 text-xl'>💡</span>
                <span className='font-medium text-green-800'>Spar-Tipp</span>
              </div>
              <p className='text-green-700 text-sm'>
                Super! Du hast diesen Monat aktiv €
                {sparenCategoryExpenses.toFixed(2)} gespart. Diese Beträge
                werden bei der Spar-Rate berücksichtigt, da sie echtes Sparen
                darstellen.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entwicklungshinweis */}
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center text-gray-500'>
            <p className='font-medium mb-2'>🚧 Charts in Entwicklung</p>
            <p className='text-sm'>
              Die Diagramme werden mit echten Daten gefüllt, sobald mehr
              historische Daten verfügbar sind. Die Platzhalter zeigen die
              geplante Struktur der Analytics-Seite.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
