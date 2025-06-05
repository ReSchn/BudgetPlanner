import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
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

// Interface für Trend-Daten
interface TrendData {
  month: string;
  monthLabel: string;
  totalExpenses: number;
  realExpenses: number;
}

// Interface für Kategorie-Vergleich
interface CategoryComparisonData {
  categoryName: string;
  planned: number;
  actual: number;
  color: string;
  shortName: string; // Für bessere Darstellung bei langen Namen
}

// Interface für historische Daten
interface HistoricalData {
  month: string;
  monthLabel: string;
  [categoryName: string]: string | number; // Dynamische Kategorie-Felder
}

export function Analytics() {
  const {
    getAvailableBudgetMonths,
    getMonthlyExpenses,
    currentBudget,
    budgetItems,
  } = useMonthlyBudgets();
  const { categories } = useCategories();
  const { expenses } = useExpenses();

  // State für Trend-Daten und Diagramme
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [categoryComparisonData, setCategoryComparisonData] = useState<
    CategoryComparisonData[]
  >([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [historicalLoading, setHistoricalLoading] = useState(true);

  // Hilfsfunktion: Monatsnamen formatieren
  const formatMonthName = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('de-DE', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Historische Daten laden
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        setHistoricalLoading(true);

        const months = await getAvailableBudgetMonths();
        const last12Months = months.slice(0, 12); // Letzten 12 Monate

        if (last12Months.length === 0 || categories.length === 0) {
          setHistoricalData([]);
          return;
        }

        // Alle Kategorien sammeln die in den letzten 12 Monaten verwendet wurden
        const allUsedCategories = new Set<number>();

        // Erst alle verwendeten Kategorien finden
        for (const month of last12Months) {
          const monthlyExpenses = await getMonthlyExpenses(month);
          monthlyExpenses.forEach((expense) => {
            allUsedCategories.add(expense.category_id);
          });
        }

        // Kategorien-Mapping erstellen
        const categoryMapping = new Map<
          number,
          { name: string; color: string }
        >();
        categories.forEach((cat) => {
          if (allUsedCategories.has(cat.id)) {
            categoryMapping.set(cat.id, {
              name: cat.name,
              color: cat.color || '#3b82f6',
            });
          }
        });

        // Historische Daten für jeden Monat berechnen
        const historicalDataPromises = last12Months.map(async (month) => {
          const monthlyExpenses = await getMonthlyExpenses(month);

          // Ausgaben nach Kategorien gruppieren
          const categoryExpenses: Record<string, number> = {};

          // Initialisiere alle verwendeten Kategorien mit 0
          categoryMapping.forEach((catInfo) => {
            categoryExpenses[catInfo.name] = 0;
          });

          // Summiere tatsächliche Ausgaben
          monthlyExpenses.forEach((expense) => {
            const categoryInfo = categoryMapping.get(expense.category_id);
            if (categoryInfo) {
              categoryExpenses[categoryInfo.name] += expense.amount;
            }
          });

          return {
            month,
            monthLabel: formatMonthName(month),
            ...categoryExpenses,
          };
        });

        const resolvedHistoricalData = await Promise.all(
          historicalDataPromises
        );

        // Daten umkehren, damit ältester Monat links steht
        setHistoricalData(resolvedHistoricalData.reverse());
      } catch (error) {
        console.error('❌ Fehler beim Laden der historischen Daten:', error);
      } finally {
        setHistoricalLoading(false);
      }
    };

    if (categories.length > 0) {
      loadHistoricalData();
    }
  }, [getAvailableBudgetMonths, getMonthlyExpenses, categories]);
  // Kategorie-Vergleichsdaten laden
  useEffect(() => {
    if (currentBudget && budgetItems.length > 0 && categories.length > 0) {
      const comparisonData: CategoryComparisonData[] = budgetItems
        .map((budgetItem) => {
          // Tatsächliche Ausgaben für diese Kategorie berechnen
          const actualExpenses = expenses
            .filter((expense) => expense.category_id === budgetItem.category_id)
            .reduce((sum, expense) => sum + expense.amount, 0);

          // Kategorie-Details finden
          const category = categories.find(
            (cat) => cat.id === budgetItem.category_id
          );
          const categoryName = category?.name || 'Unbekannt';

          // Kurzen Namen für die Anzeige erstellen (max 12 Zeichen)
          const shortName =
            categoryName.length > 12
              ? categoryName.substring(0, 12) + '...'
              : categoryName;

          return {
            categoryName,
            planned: budgetItem.planned_amount,
            actual: actualExpenses,
            color: category?.color || '#3b82f6',
            shortName,
          };
        })
        .filter((item) => item.planned > 0); // Nur Kategorien mit geplanten Ausgaben

      setCategoryComparisonData(comparisonData);
    } else {
      setCategoryComparisonData([]);
    }
  }, [currentBudget, budgetItems, categories, expenses]);
  // Verfügbare Monate und Trend-Daten laden
  useEffect(() => {
    const loadTrendData = async () => {
      try {
        setChartLoading(true);

        const months = await getAvailableBudgetMonths();
        const last6Months = months.slice(0, 6);

        if (last6Months.length === 0) {
          setTrendData([]);
          return;
        }

        // Trend-Daten für die letzten 6 Monate berechnen
        const trendDataPromises = last6Months.map(async (month) => {
          const monthlyExpenses = await getMonthlyExpenses(month);

          // Gesamtausgaben für diesen Monat
          const totalExpenses = monthlyExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );

          // Sparen-Kategorien für diesen Monat finden
          const sparenExpenses = monthlyExpenses
            .filter((expense) => {
              const category = categories.find(
                (cat) => cat.id === expense.category_id
              );
              return category && category.name.toLowerCase().includes('spar');
            })
            .reduce((sum, expense) => sum + expense.amount, 0);

          // Echte Ausgaben = Alle Ausgaben - Sparen
          const realExpenses = totalExpenses - sparenExpenses;

          return {
            month,
            monthLabel: formatMonthName(month),
            totalExpenses,
            realExpenses,
          };
        });

        const resolvedTrendData = await Promise.all(trendDataPromises);
        // Daten umkehren, damit ältester Monat links steht
        setTrendData(resolvedTrendData.reverse());
      } catch (error) {
        console.error('❌ Fehler beim Laden der Trend-Daten:', error);
      } finally {
        setChartLoading(false);
      }
    };

    if (categories.length > 0) {
      loadTrendData();
    }
  }, [getAvailableBudgetMonths, getMonthlyExpenses, categories]);

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

  // TypeScript Interface für Tooltip Props
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      color: string;
      name: string;
      value: number;
      dataKey: string;
    }>;
    label?: string;
  }

  // Custom Tooltip für das Liniendiagramm
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-semibold text-gray-900 mb-2'>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className='text-sm'>
              {entry.name}: €{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip für Balkendiagramm
  const BarTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const planned = payload.find((p) => p.dataKey === 'planned')?.value || 0;
      const actual = payload.find((p) => p.dataKey === 'actual')?.value || 0;
      const difference = actual - planned;
      const percentage = planned > 0 ? (actual / planned) * 100 : 0;

      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-48'>
          <p className='font-semibold text-gray-900 mb-2'>{label}</p>
          <div className='space-y-1 text-sm'>
            <p className='text-blue-600'>Geplant: €{planned.toFixed(2)}</p>
            <p className='text-orange-600'>Tatsächlich: €{actual.toFixed(2)}</p>
            <div className='border-t pt-1 mt-2'>
              <p
                className={`font-medium ${
                  difference >= 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                Differenz: {difference >= 0 ? '+' : ''}€{difference.toFixed(2)}
              </p>
              <p className='text-gray-600'>
                Verbrauch: {percentage.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip für historisches Diagramm
  const HistoricalTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs'>
          <p className='font-semibold text-gray-900 mb-2'>{label}</p>
          <div className='space-y-1 text-sm max-h-48 overflow-y-auto'>
            {payload
              .filter((entry) => (entry.value || 0) > 0)
              .sort((a, b) => (b.value || 0) - (a.value || 0))
              .map((entry, index) => (
                <p
                  key={index}
                  style={{ color: entry.color }}
                  className='flex justify-between'
                >
                  <span>{entry.name}:</span>
                  <span className='font-medium'>
                    €{(entry.value || 0).toFixed(0)}
                  </span>
                </p>
              ))}
            <div className='border-t pt-1 mt-2'>
              <p className='font-semibold text-gray-900 flex justify-between'>
                <span>Gesamt:</span>
                <span>€{total.toFixed(0)}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Hilfsfunktion: Generiere verschiedene Farben für Kategorien
  const generateCategoryColors = (
    categories: Array<{ name: string; color: string }>
  ) => {
    const defaultColors = [
      '#ef4444',
      '#f97316',
      '#f59e0b',
      '#eab308',
      '#84cc16',
      '#22c55e',
      '#10b981',
      '#14b8a6',
      '#06b6d4',
      '#0ea5e9',
      '#3b82f6',
      '#6366f1',
      '#8b5cf6',
      '#a855f7',
      '#d946ef',
      '#ec4899',
      '#f43f5e',
    ];

    return categories.map((cat, index) => ({
      name: cat.name,
      color: cat.color || defaultColors[index % defaultColors.length],
    }));
  };

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
        {/* Ausgaben-Trend - IMPLEMENTIERT mit Recharts */}
        <Card>
          <CardHeader>
            <CardTitle>Ausgaben-Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className='h-64 flex items-center justify-center'>
                <div className='text-center text-gray-500'>
                  <div className='animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2'></div>
                  <p className='text-sm'>Lade Trend-Daten...</p>
                </div>
              </div>
            ) : trendData.length === 0 ? (
              <div className='h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
                <div className='text-center text-gray-500'>
                  <div className='text-4xl mb-2'>📈</div>
                  <p className='font-medium'>Noch keine Daten verfügbar</p>
                  <p className='text-sm'>
                    Erstelle Budgets und Ausgaben um Trends zu sehen
                  </p>
                </div>
              </div>
            ) : (
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={trendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis
                      dataKey='monthLabel'
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor='end'
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => `€${value.toLocaleString()}`}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Linie für Gesamtausgaben */}
                    <Line
                      type='monotone'
                      dataKey='totalExpenses'
                      stroke='#ef4444'
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#ef4444', strokeWidth: 2 }}
                      name='Gesamtausgaben'
                    />

                    {/* Linie für echte Ausgaben (ohne Sparen) */}
                    <Line
                      type='monotone'
                      dataKey='realExpenses'
                      stroke='#f97316'
                      strokeWidth={2}
                      strokeDasharray='5 5'
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                      name='Echte Ausgaben'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Trend-Statistiken */}
            {trendData.length > 1 && (
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='text-center'>
                    <p className='text-gray-600'>Durchschnitt/Monat</p>
                    <p className='font-semibold text-red-600'>
                      €
                      {(
                        trendData.reduce(
                          (sum, item) => sum + item.totalExpenses,
                          0
                        ) / trendData.length
                      ).toFixed(0)}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-gray-600'>Trend</p>
                    <p className='font-semibold'>
                      {trendData[trendData.length - 1]?.totalExpenses >
                      trendData[0]?.totalExpenses ? (
                        <span className='text-red-600'>↗ Steigend</span>
                      ) : (
                        <span className='text-green-600'>↘ Fallend</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kategorie-Vergleich - IMPLEMENTIERT mit Recharts */}
        <Card>
          <CardHeader>
            <CardTitle>Kategorie-Vergleich</CardTitle>
          </CardHeader>
          <CardContent>
            {!currentBudget ? (
              <div className='h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
                <div className='text-center text-gray-500'>
                  <div className='text-4xl mb-2'>📊</div>
                  <p className='font-medium'>Kein Budget vorhanden</p>
                  <p className='text-sm'>
                    Erstelle ein Budget für den aktuellen Monat
                  </p>
                </div>
              </div>
            ) : categoryComparisonData.length === 0 ? (
              <div className='h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
                <div className='text-center text-gray-500'>
                  <div className='text-4xl mb-2'>📊</div>
                  <p className='font-medium'>Keine Kategorien geplant</p>
                  <p className='text-sm'>Füge Budgets für Kategorien hinzu</p>
                </div>
              </div>
            ) : (
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={categoryComparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis
                      dataKey='shortName'
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor='end'
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => `€${value.toLocaleString()}`}
                    />
                    <Tooltip content={<BarTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType='rect'
                    />

                    {/* Geplante Ausgaben */}
                    <Bar
                      dataKey='planned'
                      name='Geplant'
                      fill='#3b82f6'
                      radius={[2, 2, 0, 0]}
                    />

                    {/* Tatsächliche Ausgaben */}
                    <Bar
                      dataKey='actual'
                      name='Tatsächlich'
                      fill='#f97316'
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Budget-Übersicht */}
            {categoryComparisonData.length > 0 && (
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <div className='grid grid-cols-3 gap-4 text-sm text-center'>
                  <div>
                    <p className='text-gray-600'>Geplant gesamt</p>
                    <p className='font-semibold text-blue-600'>
                      €
                      {categoryComparisonData
                        .reduce((sum, item) => sum + item.planned, 0)
                        .toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Ausgegeben</p>
                    <p className='font-semibold text-orange-600'>
                      €
                      {categoryComparisonData
                        .reduce((sum, item) => sum + item.actual, 0)
                        .toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Übrig</p>
                    <p
                      className={`font-semibold ${
                        categoryComparisonData.reduce(
                          (sum, item) => sum + (item.planned - item.actual),
                          0
                        ) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      €
                      {categoryComparisonData
                        .reduce(
                          (sum, item) => sum + (item.planned - item.actual),
                          0
                        )
                        .toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rest der Komponente bleibt gleich */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Spar-Rate */}
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

      {/* Historischer Vergleich - IMPLEMENTIERT mit Recharts */}
      <Card>
        <CardHeader>
          <CardTitle>Historischer Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          {historicalLoading ? (
            <div className='h-80 flex items-center justify-center'>
              <div className='text-center text-gray-500'>
                <div className='animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2'></div>
                <p className='text-sm'>Lade historische Daten...</p>
              </div>
            </div>
          ) : historicalData.length === 0 ? (
            <div className='h-80 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
              <div className='text-center text-gray-500'>
                <div className='text-4xl mb-2'>📊</div>
                <p className='font-medium'>Keine historischen Daten</p>
                <p className='text-sm'>Sammle Ausgaben über mehrere Monate</p>
              </div>
            </div>
          ) : (
            <>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={historicalData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis
                      dataKey='monthLabel'
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor='end'
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => `€${value.toLocaleString()}`}
                    />
                    <Tooltip content={<HistoricalTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                      iconType='rect'
                    />

                    {/* Dynamische Balken für jede Kategorie */}
                    {(() => {
                      // Kategorien aus den Daten extrahieren und sortieren
                      const categoryNames = new Set<string>();
                      historicalData.forEach((monthData) => {
                        Object.keys(monthData).forEach((key) => {
                          if (key !== 'month' && key !== 'monthLabel') {
                            categoryNames.add(key);
                          }
                        });
                      });

                      const sortedCategories = Array.from(categoryNames)
                        .map((name) => {
                          const category = categories.find(
                            (cat) => cat.name === name
                          );
                          return { name, color: category?.color || '#3b82f6' };
                        })
                        .sort((a, b) => {
                          // Sortiere nach Gesamtausgaben über alle Monate
                          const totalA = historicalData.reduce(
                            (sum, month) => sum + (Number(month[a.name]) || 0),
                            0
                          );
                          const totalB = historicalData.reduce(
                            (sum, month) => sum + (Number(month[b.name]) || 0),
                            0
                          );
                          return totalB - totalA;
                        });

                      const categoryColors =
                        generateCategoryColors(sortedCategories);

                      return categoryColors.map((cat) => (
                        <Bar
                          key={cat.name}
                          dataKey={cat.name}
                          stackId='categories'
                          fill={cat.color}
                          name={cat.name}
                        />
                      ));
                    })()}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Historische Statistiken */}
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-center'>
                  <div>
                    <p className='text-gray-600'>Monate</p>
                    <p className='font-semibold text-blue-600'>
                      {historicalData.length}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Ø pro Monat</p>
                    <p className='font-semibold text-gray-900'>
                      €
                      {(() => {
                        const totalExpenses = historicalData.reduce(
                          (sum, month) => {
                            const monthTotal = Object.keys(month)
                              .filter(
                                (key) => key !== 'month' && key !== 'monthLabel'
                              )
                              .reduce(
                                (monthSum, categoryName) =>
                                  monthSum + (Number(month[categoryName]) || 0),
                                0
                              );
                            return sum + monthTotal;
                          },
                          0
                        );
                        return (totalExpenses / historicalData.length).toFixed(
                          0
                        );
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Höchster Monat</p>
                    <p className='font-semibold text-red-600'>
                      €
                      {(() => {
                        const monthTotals = historicalData.map((month) => {
                          return Object.keys(month)
                            .filter(
                              (key) => key !== 'month' && key !== 'monthLabel'
                            )
                            .reduce(
                              (sum, categoryName) =>
                                sum + (Number(month[categoryName]) || 0),
                              0
                            );
                        });
                        return Math.max(...monthTotals).toFixed(0);
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Niedrigster Monat</p>
                    <p className='font-semibold text-green-600'>
                      €
                      {(() => {
                        const monthTotals = historicalData.map((month) => {
                          return Object.keys(month)
                            .filter(
                              (key) => key !== 'month' && key !== 'monthLabel'
                            )
                            .reduce(
                              (sum, categoryName) =>
                                sum + (Number(month[categoryName]) || 0),
                              0
                            );
                        });
                        return Math.min(...monthTotals).toFixed(0);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
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

      {/* Entwicklungshinweis - Aktualisiert */}
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center text-gray-500'>
            <p className='font-medium mb-2'>🎉 Alle Charts implementiert!</p>
            <p className='text-sm'>
              ✅ <strong>Ausgaben-Trend</strong> - Liniendiagramm
              <br />✅ <strong>Kategorie-Vergleich</strong> - Balkendiagramm
              <br />✅ <strong>Top-Kategorien</strong> - Bereits als Liste
              vorhanden
              <br />✅ <strong>Historischer Vergleich</strong> - Gestapeltes
              Balkendiagramm
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
