import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content - mit left margin für die Sidebar */}
      <main className='ml-64 min-h-screen'>
        <div className='p-6'>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
