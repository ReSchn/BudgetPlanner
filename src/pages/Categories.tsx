import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useCategories } from '../hooks/useCategories';
import { ColorPicker } from '../components/ui/ColorPicker';

interface Category {
  id: number;
  user_id: string;
  name: string;
  default_budget: number;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function Categories() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  // Form State für neue Kategorie
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Neuer State für Farbe
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [editColor, setEditColor] = useState('');

  // Edit State
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Neue Kategorie erstellen
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      setCreateError('Kategorie-Name ist erforderlich');
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

      await createCategory(newCategoryName.trim(), budget, newCategoryColor); // Farbe hinzufügen

      // Form zurücksetzen
      setNewCategoryName('');
      setNewCategoryBudget('');
      setNewCategoryColor('#3b82f6'); // NEU: Farbe zurücksetzen
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Fehler beim Erstellen'
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Bearbeitung starten
  const startEdit = (category: Category) => {
    setEditingCategory(category.id);
    setEditName(category.name);
    setEditBudget(category.default_budget.toString());
    setEditColor(category.color || '#3b82f6'); // NEU: Farbe setzen
  };

  // Bearbeitung abbrechen
  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditBudget('');
  };

  // Kategorie aktualisieren
  const handleUpdateCategory = async (categoryId: number) => {
    if (!editName.trim()) return;

    const budget = parseFloat(editBudget) || 0;
    if (budget < 0) return;

    try {
      setIsUpdating(true);
      await updateCategory(categoryId, editName.trim(), budget, editColor); // Farbe hinzufügen
      setEditingCategory(null);
    } catch (err) {
      console.error('Fehler beim Aktualisieren:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Kategorie löschen
  const handleDeleteCategory = async (
    categoryId: number,
    categoryName: string
  ) => {
    if (
      !confirm(
        `Kategorie "${categoryName}" wirklich löschen?\n\nDies wird auch alle zugehörigen Budget-Einträge und Ausgaben betreffen.`
      )
    ) {
      return;
    }

    try {
      await deleteCategory(categoryId);
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
      alert('Fehler beim Löschen der Kategorie');
    }
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Kategorien verwalten
        </h1>
        <p className='text-gray-600 mt-1'>
          Erstelle und verwalte deine Ausgabenkategorien
        </p>
      </div>

      {/* Grid Layout wie im Mockup */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Neue Kategorie erstellen */}
        <Card>
          <CardHeader>
            <CardTitle>Neue Kategorie erstellen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCategory} className='space-y-4'>
              <div>
                <label
                  htmlFor='categoryName'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Kategorie-Name
                </label>
                <Input
                  id='categoryName'
                  type='text'
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder='z.B. Lebensmittel'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='categoryBudget'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Standard-Budget (optional)
                </label>
                <Input
                  id='categoryBudget'
                  type='number'
                  min='0'
                  step='0.01'
                  value={newCategoryBudget}
                  onChange={(e) => setNewCategoryBudget(e.target.value)}
                  placeholder='0,00 €'
                />
              </div>

              {/* NEU: Farb-Picker hinzufügen */}
              <ColorPicker
                value={newCategoryColor}
                onChange={setNewCategoryColor}
              />

              {createError && (
                <div className='text-red-600 text-sm'>❌ {createError}</div>
              )}

              <Button type='submit' className='w-full' disabled={isCreating}>
                {isCreating ? '⏳ Erstelle...' : '+ Kategorie hinzufügen'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bestehende Kategorien */}
        <Card>
          <CardHeader>
            <CardTitle>Bestehende Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className='text-center py-8 text-gray-500'>
                🔄 Lade Kategorien...
              </div>
            )}

            {error && (
              <div className='text-center py-8 text-red-600'>
                ❌ Fehler: {error}
              </div>
            )}

            {!loading && !error && categories.length === 0 && (
              <div className='text-center py-8 text-gray-500'>
                <div className='text-4xl mb-2'>📂</div>
                <p className='font-medium'>Noch keine Kategorien</p>
                <p className='text-sm'>Erstelle deine erste Kategorie links</p>
              </div>
            )}

            {!loading && !error && categories.length > 0 && (
              <div className='space-y-3'>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className='p-3 border border-gray-200 rounded-lg hover:bg-gray-50'
                  >
                    {editingCategory === category.id ? (
                      // Edit Mode
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3'>
                          <div
                            className='w-4 h-4 rounded-full'
                            style={{
                              backgroundColor: category.color || '#3b82f6',
                            }}
                          />
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className='flex-1'
                            placeholder='Kategorie-Name'
                          />
                        </div>

                        <div className='flex items-center gap-2'>
                          <span className='text-sm text-gray-600'>
                            Standard-Budget:
                          </span>
                          <Input
                            type='number'
                            min='0'
                            step='0.01'
                            value={editBudget}
                            onChange={(e) => setEditBudget(e.target.value)}
                            className='w-32'
                          />
                          <span className='text-sm text-gray-600'>€</span>
                        </div>

                        {/* NEU: Farb-Picker für Edit Mode */}
                        <ColorPicker
                          value={editColor}
                          onChange={setEditColor}
                        />

                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => handleUpdateCategory(category.id)}
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
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div
                            className='w-4 h-4 rounded-full'
                            style={{
                              backgroundColor: category.color || '#3b82f6',
                            }}
                          />
                          <div>
                            <h4 className='font-medium text-gray-900'>
                              {category.name}
                            </h4>
                            <p className='text-sm text-gray-500'>
                              Standard: €{category.default_budget.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => startEdit(category)}
                          >
                            Bearbeiten
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-red-600 border-red-200 hover:bg-red-50'
                            onClick={() =>
                              handleDeleteCategory(category.id, category.name)
                            }
                          >
                            Löschen
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiken */}
      <Card>
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {categories.length}
              </div>
              <div className='text-sm text-blue-800'>Kategorien gesamt</div>
            </div>

            <div className='p-4 bg-green-50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                €
                {categories
                  .reduce((sum, cat) => sum + cat.default_budget, 0)
                  .toFixed(2)}
              </div>
              <div className='text-sm text-green-800'>
                Standard-Budget gesamt
              </div>
            </div>

            <div className='p-4 bg-purple-50 rounded-lg'>
              <div className='text-2xl font-bold text-purple-600'>
                €
                {categories.length > 0
                  ? (
                      categories.reduce(
                        (sum, cat) => sum + cat.default_budget,
                        0
                      ) / categories.length
                    ).toFixed(2)
                  : '0.00'}
              </div>
              <div className='text-sm text-purple-800'>
                Durchschnitt pro Kategorie
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
