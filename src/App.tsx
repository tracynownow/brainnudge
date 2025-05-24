import React from 'react';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-white text-slate-800 font-sans">
        <MainLayout />
      </div>
    </AppProvider>
  );
}

export default App;