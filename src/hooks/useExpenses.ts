import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// TypeScript Interface für Expense
interface Expense {
  id: number;
  user_id: string;
  category_id: number;
  amount: number;
  description: string | null;
  expense_date: string; // ISO Date string
  created_at: string;
  updated_at: string;
}

// Erweiterte Ansicht mit Kategorie-Info
interface ExpenseWithCategory extends Expense {
  category_name: string;
  category_color: string | null;
}

// Hook Return Interface
interface UseExpensesReturn {
  expenses: ExpenseWithCategory[];
  loading: boolean;
  error: string | null;
  createExpense: (
    categoryId: number,
    amount: number,
    description?: string,
    date?: string
  ) => Promise<void>;
  updateExpense: (
    expenseId: number,
    categoryId: number,
    amount: number,
    description?: string,
    date?: string
  ) => Promise<void>; // NEU
  deleteExpense: (expenseId: number) => Promise<void>;
  getExpensesForMonth: (month: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const { user } = useAuth();

  // State
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hilfsfunktion: Aktueller Monat im Format "YYYY-MM"
  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  // Ausgaben für einen bestimmten Monat laden
  const getExpensesForMonth = useCallback(
    async (month: string) => {
      if (!user) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Korrekte Berechnung von Monatsanfang und -ende
        const [year, monthNum] = month.split('-').map(Number); // "2025-06" → [2025, 6]

        // Ersten Tag des Monats
        const startDate = new Date(year, monthNum - 1, 1); // Monat ist 0-basiert

        // Ersten Tag des NÄCHSTEN Monats
        const endDate = new Date(year, monthNum, 1); // Automatisch korrektes Ende

        // Als ISO-Strings für Supabase
        const startDateString = startDate.toISOString().split('T')[0]; // "2025-06-01"
        const endDateString = endDate.toISOString().split('T')[0]; // "2025-07-01"

        // Supabase Query mit JOIN zu categories
        const { data, error: fetchError } = await supabase
          .from('expenses')
          .select(
            `
        *,
        categories!inner(name, color)
      `
          )
          .eq('user_id', user.id) // Nur vom aktuellen User
          .gte('expense_date', startDateString) // >= Monatsanfang
          .lt('expense_date', endDateString) // < Nächster Monat (nicht <=!)
          .order('expense_date', { ascending: false }); // Neueste zuerst

        if (fetchError) {
          throw fetchError;
        }

        // Rest der Funktion bleibt gleich...
        interface SupabaseExpenseResponse {
          id: number;
          user_id: string;
          category_id: number;
          amount: number;
          description: string | null;
          expense_date: string;
          created_at: string;
          updated_at: string;
          categories: {
            name: string;
            color: string | null;
          };
        }

        const expensesWithCategories: ExpenseWithCategory[] = (
          (data as SupabaseExpenseResponse[]) || []
        ).map((expense) => ({
          id: expense.id,
          user_id: expense.user_id,
          category_id: expense.category_id,
          amount: expense.amount,
          description: expense.description,
          expense_date: expense.expense_date,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
          category_name: expense.categories.name,
          category_color: expense.categories.color,
        }));

        setExpenses(expensesWithCategories);
      } catch (err) {
        console.error('❌ Fehler beim Laden der Ausgaben:', err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Neue Ausgabe erstellen
  const createExpense = useCallback(
    async (
      categoryId: number,
      amount: number,
      description?: string,
      date?: string
    ) => {
      if (!user) {
        throw new Error('Nicht eingeloggt');
      }

      try {
        // Falls kein Datum angegeben, nutze heute
        const expenseDate = date || new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

        const { error } = await supabase.from('expenses').insert([
          {
            category_id: categoryId,
            amount,
            description: description || null,
            expense_date: expenseDate,
            // user_id wird automatisch durch auth.uid() gesetzt
          },
        ]);

        if (error) {
          throw error;
        }

        console.log('✅ Ausgabe erstellt');

        // Ausgaben für aktuellen Monat neu laden
        const currentMonth = getCurrentMonth();
        await getExpensesForMonth(currentMonth);
      } catch (err) {
        console.error('❌ Fehler beim Erstellen der Ausgabe:', err);
        throw err;
      }
    },
    [user, getExpensesForMonth]
  );

  // Ausgabe löschen
  const deleteExpense = useCallback(
    async (expenseId: number) => {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', expenseId);

        if (error) {
          throw error;
        }

        console.log('✅ Ausgabe gelöscht');

        // Ausgaben neu laden
        const currentMonth = getCurrentMonth();
        await getExpensesForMonth(currentMonth);
      } catch (err) {
        console.error('❌ Fehler beim Löschen der Ausgabe:', err);
        throw err;
      }
    },
    [getExpensesForMonth]
  );

  // Ausgabe aktualisieren
  const updateExpense = useCallback(
    async (
      expenseId: number,
      categoryId: number,
      amount: number,
      description?: string,
      date?: string
    ) => {
      if (!user) {
        throw new Error('Nicht eingeloggt');
      }

      try {
        const { error } = await supabase
          .from('expenses')
          .update({
            category_id: categoryId,
            amount,
            description: description || null,
            expense_date: date || new Date().toISOString().split('T')[0],
          })
          .eq('id', expenseId);

        if (error) {
          throw error;
        }

        console.log('✅ Ausgabe aktualisiert');

        // Ausgaben für aktuellen Monat neu laden
        const currentMonth = getCurrentMonth();
        await getExpensesForMonth(currentMonth);
      } catch (err) {
        console.error('❌ Fehler beim Aktualisieren der Ausgabe:', err);
        throw err;
      }
    },
    [user, getExpensesForMonth]
  );

  // Beim ersten Laden: Ausgaben für aktuellen Monat
  useEffect(() => {
    const month = getCurrentMonth();
    getExpensesForMonth(month);
  }, [getExpensesForMonth]);

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense, // NEU
    deleteExpense,
    getExpensesForMonth,
    refetch: () => getExpensesForMonth(getCurrentMonth()),
  };
}
