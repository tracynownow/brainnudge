import React from 'react';
import { Focus } from 'lucide-react';
import GoalInput from './GoalInput';
import TaskList from './TaskList';
import CapturePad from './CapturePad';
import Header from './Header';
import StashedTasks from './StashedTasks';
import { useAppContext } from '../context/AppContext';
import ReentryPrompt from './ReentryPrompt';

const MainLayout: React.FC = () => {
  const { tasksVisible, focusMode, currentTimerId } = useAppContext();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className={`transition-opacity duration-300 ${focusMode ? 'opacity-0 pointer-events-none absolute' : ''}`}>
        <Header />
      </div>

      {focusMode && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6 flex items-center justify-center gap-2 text-emerald-700">
          <Focus className="h-5 w-5" />
          <span>You're in Focus Mode - Stay present with this task</span>
        </div>
      )}

      <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className={`transition-all duration-300 ${
            focusMode ? 'opacity-0 pointer-events-none absolute' : ''
          }`}>
            <GoalInput />
          </div>
          {tasksVisible ? <TaskList /> : <ReentryPrompt />}
          <div className={`transition-all duration-300 ${
            focusMode ? 'opacity-0 pointer-events-none absolute' : ''
          }`}>
            <StashedTasks />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <CapturePad />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;