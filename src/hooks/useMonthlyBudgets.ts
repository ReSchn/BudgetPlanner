import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// TypeScript Interfaces basierend auf unserer Datenbank
interface MonthlyBudget {
  id: number;
  user_id: string;
  month: string; // Format: "2025-06"
  income: number;
  created_at: string;
  updated_at: string;
}

interface BudgetItem {
  id: number;
  monthly_budget_id: number;
  category_id: number;
  planned_amount: number;
  created_at: string;
  updated_at: string;
}

// Supabase JOIN Response Interface
interface SupabaseBudgetItemResponse {
  id: number;
  monthly_budget_id: number;
  category_id: number;
  planned_amount: number;
  created_at: string;
  updated_at: string;
  categories: {
    name: string;
    color: string | null;
  };
}

// Erweiterte Ansicht mit Kategorie-Namen
interface BudgetItemWithCategory extends BudgetItem {
  category_name: string;
  category_color: string | null;
}

// NEU: Interface für monatliche Ausgaben
interface MonthlyExpense {
  id: number;
  user_id: string;
  category_id: number;
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

// Hook Return Interface
interface UseMonthlyBudgetsReturn {
  currentBudget: MonthlyBudget | null;
  budgetItems: BudgetItemWithCategory[];
  loading: boolean;
  error: string | null;
  createMonthlyBudget: (
    month: string,
    income: number
  ) => Promise<MonthlyBudget>;
  updateIncome: (budgetId: number, income: number) => Promise<void>;
  setBudgetForCategory: (
    monthlyBudgetId: number,
    categoryId: number,
    amount: number
  ) => Promise<void>;
  getCurrentMonthBudget: (month: string) => Promise<void>;
  getAvailableBudgetMonths: () => Promise<string[]>;
  getMonthlyExpenses: (month: string) => Promise<MonthlyExpense[]>; // NEU
}

export function useMonthlyBudgets(): UseMonthlyBudgetsReturn {
  const { user } = useAuth();

  // State
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | null>(
    null
  );
  const [budgetItems, setBudgetItems] = useState<BudgetItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hilfsfunktion: Aktueller Monat im Format "YYYY-MM"
  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  // NEU: Ausgaben für einen bestimmten Monat laden
  const getMonthlyExpenses = useCallback(
    async (month: string): Promise<MonthlyExpense[]> => {
      if (!user) {
        return [];
      }

      try {
        // Korrekte Berechnung von Monatsanfang und -ende
        const [year, monthNum] = month.split('-').map(Number); // "2025-06" → [2025, 6]

        // Ersten Tag des Monats
        const startDate = new Date(year, monthNum - 1, 1); // Monat ist 0-basiert

        // Ersten Tag des NÄCHSTEN Monats
        const endDate = new Date(year, monthNum, 1); // Automatisch korrektes Ende

        // Als ISO-Strings für Supabase
        const startDateString = startDate.toISOString().split('T')[0]; // "2025-06-01"
        const endDateString = endDate.toISOString().split('T')[0]; // "2025-07-01"

        // Supabase Query
        const { data, error: fetchError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id) // Nur vom aktuellen User
          .gte('expense_date', startDateString) // >= Monatsanfang
          .lt('expense_date', endDateString) // < Nächster Monat
          .order('expense_date', { ascending: false }); // Neueste zuerst

        if (fetchError) {
          throw fetchError;
        }

        return data || [];
      } catch (err) {
        console.error('❌ Fehler beim Laden der monatlichen Ausgaben:', err);
        return [];
      }
    },
    [user]
  );

  // Budget für einen bestimmten Monat laden
  const getCurrentMonthBudget = useCallback(
    async (month: string) => {
      if (!user) {
        setCurrentBudget(null);
        setBudgetItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Monthly Budget für den Monat suchen
        const { data: budgetData, error: budgetError } = await supabase
          .from('monthly_budgets')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', month)
          .single(); // Erwarten genau einen Eintrag

        if (budgetError && budgetError.code !== 'PGRST116') {
          // PGRST116 = Not Found
          throw budgetError;
        }

        setCurrentBudget(budgetData || null);

        // 2. Budget Items für dieses Budget laden (falls Budget existiert)
        if (budgetData) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('budget_items')
            .select(
              `
            *,
            categories!inner(name, color)
          `
            )
            .eq('monthly_budget_id', budgetData.id);

          if (itemsError) {
            throw itemsError;
          }

          // Daten transformieren: Kategorie-Info direkt in das Objekt
          const itemsWithCategories: BudgetItemWithCategory[] = (
            (itemsData as SupabaseBudgetItemResponse[]) || []
          ).map((item) => ({
            id: item.id,
            monthly_budget_id: item.monthly_budget_id,
            category_id: item.category_id,
            planned_amount: item.planned_amount,
            created_at: item.created_at,
            updated_at: item.updated_at,
            category_name: item.categories.name,
            category_color: item.categories.color,
          }));

          setBudgetItems(itemsWithCategories);
        } else {
          setBudgetItems([]);
        }
      } catch (err) {
        console.error('❌ Fehler beim Laden des Monthly Budgets:', err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Neues Monthly Budget erstellen
  const createMonthlyBudget = useCallback(
    async (month: string, income: number): Promise<MonthlyBudget> => {
      if (!user) {
        throw new Error('Nicht eingeloggt');
      }

      try {
        const { data, error } = await supabase
          .from('monthly_budgets')
          .insert([
            {
              month,
              income,
              // user_id wird automatisch durch auth.uid() gesetzt
            },
          ])
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log('✅ Monthly Budget erstellt:', data);

        // UI aktualisieren
        setCurrentBudget(data);
        setBudgetItems([]); // Neues Budget hat noch keine Items

        return data;
      } catch (err) {
        console.error('❌ Fehler beim Erstellen des Monthly Budgets:', err);
        throw err;
      }
    },
    [user]
  );

  // Einkommen eines existierenden Budgets ändern
  const updateIncome = useCallback(async (budgetId: number, income: number) => {
    try {
      const { error } = await supabase
        .from('monthly_budgets')
        .update({ income })
        .eq('id', budgetId);

      if (error) {
        throw error;
      }

      // Lokalen State aktualisieren
      setCurrentBudget((prev) => (prev ? { ...prev, income } : null));
    } catch (err) {
      console.error('❌ Fehler beim Aktualisieren des Einkommens:', err);
      throw err;
    }
  }, []);

  // Budget für eine Kategorie setzen/ändern
  const setBudgetForCategory = useCallback(
    async (monthlyBudgetId: number, categoryId: number, amount: number) => {
      try {
        // Prüfen ob bereits ein Budget Item für diese Kategorie existiert
        const { data: existingItem, error: checkError } = await supabase
          .from('budget_items')
          .select('*')
          .eq('monthly_budget_id', monthlyBudgetId)
          .eq('category_id', categoryId)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingItem) {
          // Update existierendes Item
          const { error } = await supabase
            .from('budget_items')
            .update({ planned_amount: amount })
            .eq('id', existingItem.id);

          if (error) throw error;
        } else {
          // Neues Item erstellen
          const { error } = await supabase.from('budget_items').insert([
            {
              monthly_budget_id: monthlyBudgetId,
              category_id: categoryId,
              planned_amount: amount,
            },
          ]);

          if (error) throw error;
        }

        // Budget Items neu laden
        if (currentBudget) {
          await getCurrentMonthBudget(currentBudget.month);
        }
      } catch (err) {
        console.error('❌ Fehler beim Setzen des Kategorie-Budgets:', err);
        throw err;
      }
    },
    [currentBudget, getCurrentMonthBudget]
  );

  // Alle verfügbaren Budget-Monate laden
  const getAvailableBudgetMonths = useCallback(async (): Promise<string[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('month')
        .eq('user_id', user.id)
        .order('month', { ascending: false }); // Neueste zuerst

      if (error) throw error;

      return data?.map((item) => item.month) || [];
    } catch (err) {
      console.error('❌ Fehler beim Laden der verfügbaren Monate:', err);
      return [];
    }
  }, [user]);

  // Beim ersten Laden: Aktueller Monat
  useEffect(() => {
    const month = getCurrentMonth();
    getCurrentMonthBudget(month);
  }, [getCurrentMonthBudget]);

  return {
    currentBudget,
    budgetItems,
    loading,
    error,
    createMonthlyBudget,
    updateIncome,
    setBudgetForCategory,
    getCurrentMonthBudget,
    getAvailableBudgetMonths,
    getMonthlyExpenses, // NEU
  };
}
