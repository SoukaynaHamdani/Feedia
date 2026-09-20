import React from 'react';
import Navbar from './Navbar';
import useAppStore from '../../store/useAppStore';

export default function AppLayout({ children }) {
  const currentView = useAppStore((state) => state.currentView);
  const isHome = currentView === 'home';

  return (
    <div className="min-h-screen bg-agricultural-wheat font-sans flex flex-col selection:bg-agricultural-green/30 selection:text-agricultural-green-dark pb-16 sm:pb-0">
      <Navbar />
      <main className={`flex-1 w-full flex flex-col ${isHome ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'}`}>
        {children}
      </main>
    </div>
  );
}
