import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCategories } from '../hooks/useCategories';

export function CategoryTest() {
  // Hook nutzen - hole alle Kategorie-Funktionen
  const { categories, loading, error, createCategory } = useCategories();

  // Form State für neue Kategorie
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Handler für Kategorie-Erstellung
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newCategoryName.trim()) {
      setCreateError('Name ist erforderlich');
      return;
    }

    const budget = parseFloat(newCategoryBudget) || 0;
    if (budget < 0) {
      setCreateError('Budget muss positiv sein');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError('');

      // Hook-Funktion aufrufen
      await createCategory(newCategoryName, budget);

      // Form zurücksetzen bei Erfolg
      setNewCategoryName('');
      setNewCategoryBudget('');
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Fehler beim Erstellen'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Kategorien-Liste */}
      <Card>
        <CardHeader>
          <CardTitle>📂 Meine Kategorien</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {loading && (
            <p className='text-center text-gray-500'>🔄 Lade Kategorien...</p>
          )}

          {/* Error State */}
          {error && (
            <p className='text-center text-red-600'>❌ Fehler: {error}</p>
          )}

          {/* Erfolg aber keine Kategorien */}
          {!loading && !error && categories.length === 0 && (
            <p className='text-center text-gray-500'>
              Noch keine Kategorien vorhanden. Erstelle deine erste!
            </p>
          )}

          {/* Kategorien-Liste */}
          {!loading && !error && categories.length > 0 && (
            <div className='space-y-3'>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className='flex justify-between items-center p-3 border rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-4 h-4 rounded-full'
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    />
                    <div>
                      <h4 className='font-medium'>{category.name}</h4>
                      <p className='text-sm text-gray-500'>
                        Standard-Budget: {category.default_budget.toFixed(2)}€
                      </p>
                    </div>
                  </div>

                  <div className='text-xs text-gray-400'>ID: {category.id}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Neue Kategorie erstellen */}
      <Card>
        <CardHeader>
          <CardTitle>➕ Neue Kategorie erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCategory} className='space-y-4'>
            {/* Name Input */}
            <div>
              <label htmlFor='categoryName' className='text-sm font-medium'>
                Kategorie-Name
              </label>
              <Input
                id='categoryName'
                type='text'
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder='z.B. Auto, Haushalt, Sparen...'
                required
              />
            </div>

            {/* Budget Input */}
            <div>
              <label htmlFor='categoryBudget' className='text-sm font-medium'>
                Standard-Budget (€)
              </label>
              <Input
                id='categoryBudget'
                type='number'
                min='0'
                step='0.01'
                value={newCategoryBudget}
                onChange={(e) => setNewCategoryBudget(e.target.value)}
                placeholder='z.B. 500'
              />
            </div>

            {/* Error anzeigen */}
            {createError && (
              <p className='text-red-600 text-sm'>❌ {createError}</p>
            )}

            {/* Submit Button */}
            <Button type='submit' className='w-full' disabled={isCreating}>
              {isCreating ? '⏳ Erstelle...' : '✅ Kategorie erstellen'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Debug-Info */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-sm space-y-1'>
            <p>
              <strong>Anzahl Kategorien:</strong> {categories.length}
            </p>
            <p>
              <strong>Loading:</strong> {loading ? 'Ja' : 'Nein'}
            </p>
            <p>
              <strong>Error:</strong> {error || 'Keiner'}
            </p>
            <p>
              <strong>Hook funktioniert:</strong> ✅
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
