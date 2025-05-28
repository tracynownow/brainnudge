import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Trophy } from 'lucide-react';

const ProgressBar: React.FC = () => {
  const { tasks } = useAppContext();

  const { completedCount, totalTasks, progressPercentage } = useMemo(() => {
    const completedTasks = tasks.reduce((acc, task) => {
      if (task.completed) return acc + 1;
      
      if (task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter(st => st.completed).length;
        return acc + (completedSubtasks / task.subtasks.length);
      }
      
      return acc;
    }, 0);
    
    const totalTasks = tasks.reduce((acc, task) => {
      return acc + (task.subtasks.length > 0 ? 1 : 1);
    }, 0);
    
    const progressPercentage = totalTasks > 0 
      ? (completedTasks / totalTasks) * 100 
      : 0;
    
    return { 
      completedCount: Math.round(completedTasks * 10) / 10,
      totalTasks,
      progressPercentage 
    };
  }, [tasks]);

  if (totalTasks === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-slate-700">Your Progress</h3>
        <div className="text-sm font-medium text-slate-700">
          {completedCount} of {totalTasks} completed
        </div>
      </div>
      
      <div className="w-full bg-emerald-50 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-in-out ${
            progressPercentage === 100 
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
              : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {progressPercentage === 100 && (
        <div className="mt-3 flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium animate-bounce">
          <Trophy className="h-4 w-4" />
          <span>All tasks completed! Great job!</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;