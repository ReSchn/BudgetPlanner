import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className='flex-1 overflow-auto'>
        <div className='p-6'>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
