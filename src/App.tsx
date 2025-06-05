import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';

function App() {
  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-2xl mx-auto space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Budgettracker Setup Test</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-muted-foreground'>shadcn/ui Komponenten Test:</p>

            <div className='flex gap-2'>
              <Button>Primär</Button>
              <Button variant='secondary'>Sekundär</Button>
              <Button variant='outline'>Outline</Button>
            </div>

            <Input placeholder='Test Input...' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <p className='text-center text-green-600 font-medium'>
              ✅ Setup komplett! Bereit für die Entwicklung.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
