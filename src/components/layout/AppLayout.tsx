import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      {/* Main content area */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '10px', fontFamily: 'inherit', fontSize: '14px' },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        }}
      />
    </div>
  )
}
