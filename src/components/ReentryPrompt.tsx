import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Battery, Coffee } from 'lucide-react';

const ReentryPrompt: React.FC = () => {
  const { setTasksVisible } = useAppContext();

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-md">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
        <Coffee className="h-8 w-8 text-emerald-500" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Taking a break?</h2>
      
      <p className="text-slate-600 mb-6 max-w-md">
        It's important to recharge. Your tasks are saved and waiting for you when you're ready to continue.
      </p>
      
      <div className="flex items-center gap-2 text-emerald-600 text-sm mb-6">
        <Battery className="h-4 w-4" />
        <span>Breaks boost productivity and creativity</span>
      </div>
      
      <button
        onClick={() => setTasksVisible(true)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Tasks</span>
      </button>
    </div>
  );
};

export default ReentryPrompt;