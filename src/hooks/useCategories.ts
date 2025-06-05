import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// TypeScript Interface für Kategorie
interface Category {
  id: number; // war: string
  user_id: string;
  name: string;
  default_budget: number;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Was der Hook zurückgibt
interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  createCategory: (
    name: string,
    defaultBudget: number,
    color?: string
  ) => Promise<void>;
  updateCategory: (
    categoryId: number,
    name: string,
    defaultBudget: number,
    color?: string
  ) => Promise<void>; // NEU
  deleteCategory: (categoryId: number) => Promise<void>; // NEU
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const { user } = useAuth(); // Aktueller User

  // State für Kategorien-Daten
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kategorien vom Server laden - useCallback verhindert endlose Schleifen
  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Supabase Query: Hole alle aktiven Kategorien des Users
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*') // Alle Spalten
        .eq('user_id', user.id) // Nur vom aktuellen User
        .eq('is_active', true) // Nur aktive Kategorien
        .order('created_at', { ascending: true }); // Älteste zuerst

      if (fetchError) {
        throw fetchError;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('❌ Fehler beim Laden der Kategorien:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }, [user]); // useCallback Dependencies: Nur neu erstellen wenn user sich ändert

  // Neue Kategorie erstellen
  const createCategory = useCallback(
    async (name: string, defaultBudget: number, color?: string) => {
      if (!user) {
        throw new Error('Nicht eingeloggt');
      }

      try {
        // Supabase Insert: Erstelle neue Kategorie
        const { data, error: insertError } = await supabase
          .from('categories')
          .insert([
            {
              name: name.trim(), // Leerzeichen entfernen
              default_budget: defaultBudget,
              color: color || '#3b82f6', // Standard-Blau falls keine Farbe
              is_active: true,
              // user_id wird automatisch durch auth.uid() gesetzt
            },
          ])
          .select(); // Gib die erstellte Kategorie zurück

        if (insertError) {
          throw insertError;
        }

        console.log('✅ Kategorie erstellt:', data);

        // Kategorien neu laden um UI zu aktualisieren
        await fetchCategories();
      } catch (err) {
        console.error('❌ Fehler beim Erstellen der Kategorie:', err);
        throw err; // Fehler weiterwerfen für UI-Handling
      }
    },
    [user, fetchCategories]
  ); // Dependencies: user und fetchCategories

  // Kategorie aktualisieren
  const updateCategory = useCallback(
    async (
      categoryId: number,
      name: string,
      defaultBudget: number,
      color?: string
    ) => {
      if (!user) {
        throw new Error('Nicht eingeloggt');
      }

      try {
        const { error } = await supabase
          .from('categories')
          .update({
            name: name.trim(),
            default_budget: defaultBudget,
            color: color || '#3b82f6',
          })
          .eq('id', categoryId);

        if (error) {
          throw error;
        }

        console.log('✅ Kategorie aktualisiert');

        // Kategorien neu laden
        await fetchCategories();
      } catch (err) {
        console.error('❌ Fehler beim Aktualisieren der Kategorie:', err);
        throw err;
      }
    },
    [user, fetchCategories]
  );

  // Kategorie löschen (Soft Delete)
  const deleteCategory = useCallback(
    async (categoryId: number) => {
      if (!user) {
        throw new Error('Nicht eingeloggt');
      }

      try {
        // Soft Delete: is_active auf false setzen
        const { error } = await supabase
          .from('categories')
          .update({ is_active: false })
          .eq('id', categoryId);

        if (error) {
          throw error;
        }

        console.log('✅ Kategorie gelöscht');

        // Kategorien neu laden
        await fetchCategories();
      } catch (err) {
        console.error('❌ Fehler beim Löschen der Kategorie:', err);
        throw err;
      }
    },
    [user, fetchCategories]
  );

  // Beim ersten Laden: Kategorien abrufen
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // Jetzt korrekte Dependency

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory, // NEU
    deleteCategory, // NEU
    refetch: fetchCategories,
  };
}
