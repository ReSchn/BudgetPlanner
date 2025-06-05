import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../context/AuthContext';

export function LoginForm() {
  // Form State - speichert Eingaben
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Login oder Registrierung?

  // Auth-Funktionen aus Context holen
  const { signIn, signUp } = useAuth();

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Verhindere Browser-Reload
    setIsLoading(true); // Zeige Loading
    setError(''); // Reset Fehler

    try {
      if (isSignUp) {
        // Registrierung
        const { error } = await signUp(email, password);
        if (error) throw error;
        alert('✅ Registrierung erfolgreich! Bitte bestätige deine E-Mail.');
      } else {
        // Login
        const { error } = await signIn(email, password);
        if (error) throw error;
        // Bei Erfolg wird automatisch der User im Context gesetzt
      }
    } catch (err: unknown) {
      // Sichere Typ-Prüfung für Error-Handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten');
      }
    } finally {
      setIsLoading(false); // Loading beenden
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>{isSignUp ? '📝 Registrierung' : '🔑 Anmeldung'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* E-Mail Input */}
          <div>
            <label htmlFor='email' className='text-sm font-medium'>
              E-Mail
            </label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='deine@email.de'
              required
            />
          </div>

          {/* Passwort Input */}
          <div>
            <label htmlFor='password' className='text-sm font-medium'>
              Passwort
            </label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Mindestens 6 Zeichen'
              required
              minLength={6}
            />
          </div>

          {/* Fehler anzeigen */}
          {error && <p className='text-red-600 text-sm'>❌ {error}</p>}

          {/* Submit Button */}
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading
              ? '⏳ Wird verarbeitet...'
              : isSignUp
              ? 'Registrieren'
              : 'Anmelden'}
          </Button>

          {/* Toggle zwischen Login/Register */}
          <div className='text-center'>
            <button
              type='button'
              onClick={() => setIsSignUp(!isSignUp)}
              className='text-blue-600 hover:underline text-sm'
            >
              {isSignUp
                ? 'Bereits ein Konto? Anmelden'
                : 'Noch kein Konto? Registrieren'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
