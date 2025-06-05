import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useMonthlyBudgets } from '../hooks/useMonthlyBudgets';
import { useCategories } from '../hooks/useCategories';
import { useExpenses } from '../hooks/useExpenses';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function Dashboard() {
  // Hooks für Daten
  const { currentBudget, budgetItems, getCurrentMonthBudget } =
    useMonthlyBudgets();
  const { categories } = useCategories();
  const { expenses, getExpensesForMonth } = useExpenses();

  // State für Monatsnavigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Hilfsfunktionen
  const getCurrentMonth = useCallback((): string => {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }, [currentDate]); // currentDate als Dependency

  const getMonthName = (): string => {
    return currentDate.toLocaleDateString('de-DE', {
      month: 'long',
      year: 'numeric',
    });
  };

  const navigateMonth = async (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Effect: Daten neu laden wenn Monat sich ändert
  useEffect(() => {
    const monthString = getCurrentMonth();
    console.log('📅 Lade Daten für Monat:', monthString); // Debug

    // Budget und Ausgaben für den gewählten Monat laden
    getCurrentMonthBudget(monthString);
    getExpensesForMonth(monthString);
  }, [getCurrentMonth, getCurrentMonthBudget, getExpensesForMonth]); // getCurrentMonth hinzugefügt, currentDate entfernt

  // Berechnungen für Dashboard (Rest bleibt gleich)
  const totalPlanned = budgetItems.reduce(
    (sum, item) => sum + item.planned_amount,
    0
  );
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = totalPlanned - totalSpent;
  const income = currentBudget?.income || 0;
  const unplanned = income - totalPlanned;

  // Ausgaben pro Kategorie berechnen
  const getSpentForCategory = (categoryId: number): number => {
    return expenses
      .filter((expense) => expense.category_id === categoryId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getPlannedForCategory = (categoryId: number): number => {
    const item = budgetItems.find((item) => item.category_id === categoryId);
    return item ? item.planned_amount : 0;
  };

  // Daten für Kreisdiagramm aufbereiten - Ausgegeben vs. Verbleibend
  const prepareChartData = () => {
    const totalPlanned = budgetItems.reduce(
      (sum, item) => sum + item.planned_amount,
      0
    );
    const totalSpent = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const remaining = Math.max(0, totalPlanned - totalSpent); // Nicht negative Werte
    const overspent = Math.max(0, totalSpent - totalPlanned); // Überzogener Betrag

    const data = [];

    // Ausgegeben (aber nicht überzogen)
    if (totalSpent > 0 && totalSpent <= totalPlanned) {
      data.push({
        name: 'Ausgegeben',
        value: totalSpent,
        color: '#ef4444', // Rot
      });
    }

    // Verbleibendes Budget
    if (remaining > 0) {
      data.push({
        name: 'Verbleibendes Budget',
        value: remaining,
        color: '#10b981', // Grün
      });
    }

    // Überzogen (falls Budget überschritten)
    if (overspent > 0) {
      data.push({
        name: 'Ausgegeben',
        value: totalPlanned > 0 ? totalPlanned : totalSpent, // Geplanter Teil
        color: '#ef4444', // Rot
      });
      data.push({
        name: 'Überzogen',
        value: overspent,
        color: '#dc2626', // Dunkelrot
      });
    }

    return data;
  };

  return (
    <div className='space-y-6'>
      {/* Monatsnavigation */}
      <div className='flex items-center justify-between bg-slate-50 p-4 rounded-lg'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigateMonth('prev')}
          >
            ←
          </Button>
          <h2 className='text-xl font-bold'>{getMonthName()}</h2>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigateMonth('next')}
          >
            →
          </Button>
        </div>

        <div className='text-sm'>
          <span className='text-gray-600'>Gehalt: </span>
          <span className='font-semibold text-green-600'>
            €{income.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Info über aktuell geladenen Monat */}
      <div className='text-center text-sm text-gray-600 bg-blue-50 p-2 rounded'>
        Zeige Daten für: {getCurrentMonth()}
        {currentBudget
          ? ' (Budget vorhanden)'
          : ' (Kein Budget für diesen Monat)'}
      </div>

      {/* Rest des Dashboards bleibt gleich... */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Monatsübersicht */}
        <Card>
          <CardHeader>
            <CardTitle>Monatsübersicht</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between items-center py-2 border-b'>
              <span>Geplantes Budget:</span>
              <span className='font-semibold'>
                €
                {totalPlanned.toLocaleString('de-DE', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className='flex justify-between items-center py-2 border-b'>
              <span>Bereits ausgegeben:</span>
              <span className='font-semibold text-red-600'>
                €
                {totalSpent.toLocaleString('de-DE', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className='flex justify-between items-center py-2 border-b'>
              <span>Verbleibendes Budget:</span>
              <span
                className={`font-semibold ${
                  remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                €
                {remainingBudget.toLocaleString('de-DE', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className='flex justify-between items-center py-2'>
              <span>Nicht verplant:</span>
              <span
                className={`font-semibold ${
                  unplanned >= 0 ? 'text-green-600' : 'text-orange-600'
                }`}
              >
                €
                {unplanned.toLocaleString('de-DE', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Budget-Verteilung mit echtem Kreisdiagramm */}
        <Card>
          <CardHeader>
            <CardTitle>Budget-Status</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetItems.length === 0 || expenses.length === 0 ? (
              <div className='h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
                <div className='text-center text-gray-500'>
                  <div className='text-4xl mb-2'>📊</div>
                  <div className='font-medium'>Budget-Status</div>
                  <div className='text-sm'>Erstelle Budget und Ausgaben</div>
                  <div className='text-sm'>um den Status zu sehen</div>
                </div>
              </div>
            ) : (
              <div className='h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={prepareChartData()}
                      cx='50%'
                      cy='50%'
                      innerRadius={20}
                      outerRadius={60}
                      paddingAngle={1}
                      dataKey='value'
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`} // Prozent-Labels hinzufügen
                      labelLine={false} // Keine Verbindungslinien
                    >
                      {prepareChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `€${value.toFixed(2)}`,
                        'Betrag',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Untere Legende bleibt gleich... */}
                <div className='mt-4 text-center text-sm'>
                  <div className='flex justify-center gap-4'>
                    <div className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                      <span>
                        €
                        {expenses
                          .reduce((sum, expense) => sum + expense.amount, 0)
                          .toFixed(2)}{' '}
                        ausgegeben
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                      <span>
                        €
                        {Math.max(
                          0,
                          budgetItems.reduce(
                            (sum, item) => sum + item.planned_amount,
                            0
                          ) -
                            expenses.reduce(
                              (sum, expense) => sum + expense.amount,
                              0
                            )
                        ).toFixed(2)}{' '}
                        übrig
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kategorien-Status */}
      <Card>
        <CardHeader>
          <CardTitle>Kategorien-Status</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <div className='text-4xl mb-2'>📂</div>
              <p>Noch keine Kategorien vorhanden.</p>
              <p className='text-sm'>
                Erstelle zuerst Kategorien in der Kategorien-Verwaltung.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {categories.map((category) => {
                const planned = getPlannedForCategory(category.id);
                const spent = getSpentForCategory(category.id);
                const remaining = planned - spent;
                const percentage =
                  planned > 0 ? Math.min((spent / planned) * 100, 100) : 0;

                return (
                  <div
                    key={category.id}
                    className='flex items-center justify-between py-3 border-b last:border-b-0'
                  >
                    {/* Kategorie Info */}
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{
                            backgroundColor: category.color || '#3b82f6',
                          }}
                        />
                        <strong className='font-semibold'>
                          {category.name}
                        </strong>
                      </div>
                      <div className='text-sm text-gray-600 mb-2'>
                        €{spent.toFixed(2)} von €{planned.toFixed(2)}
                      </div>

                      {/* Progress Bar */}
                      <div className='flex-1 mx-5'>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              percentage >= 100
                                ? 'bg-red-500'
                                : percentage >= 80
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Verbleibendes Budget */}
                    <div className='text-right min-w-20'>
                      <span
                        className={`font-semibold ${
                          remaining >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {remaining >= 0 ? '€' : '-€'}
                        {Math.abs(remaining).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
