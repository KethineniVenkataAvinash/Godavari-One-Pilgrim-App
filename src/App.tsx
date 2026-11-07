import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PilgrimApp } from './apps/PilgrimApp';
import { AppInterface } from './types';

const VALID_INTERFACES: AppInterface[] = [
  'pilgrim'
];

const AppContent: React.FC = () => {
  const { 
    currentInterface, 
    setCurrentInterface
  } = useApp();

  useEffect(() => {
    // The independent Android edition ALWAYS opens the Pilgrim app flow.
    setCurrentInterface('pilgrim');
  }, []); // Run once on initial mount

  const isPilgrimApp = currentInterface === 'pilgrim';

  return (
    <div className="min-h-screen flex flex-col bg-[#071917] text-gray-100 font-sans selection:bg-amber-400/20 selection:text-amber-300">
      <main className="flex-1">
        <PilgrimApp />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}


