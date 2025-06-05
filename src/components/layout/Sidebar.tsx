import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/categories', label: 'Kategorien', icon: '📂' },
  { path: '/budget', label: 'Budget', icon: '💰' },
  { path: '/expenses', label: 'Ausgaben', icon: '🧾' },
  { path: '/analytics', label: 'Auswertungen', icon: '📈' },
];

export function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className='w-64 bg-slate-800 text-white h-screen fixed left-0 top-0 p-6 flex flex-col z-10'>
      {/* Logo/Title */}
      <div className='mb-8'>
        <h2 className='text-xl font-bold'>BudgetPlanner</h2>
        <p className='text-slate-400 text-sm mt-1'>{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className='flex-1 space-y-2'>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              <span className='text-lg'>{item.icon}</span>
              <span className='font-medium'>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className='mt-8 pt-6 border-t border-slate-700'>
        <Button
          onClick={signOut}
          variant='outline'
          className='w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
        >
          🚪 Ausloggen
        </Button>
      </div>
    </div>
  );
}
