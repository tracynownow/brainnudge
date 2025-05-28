import React from 'react';
import { useAppContext } from '../context/AppContext';
import Task from './Task';
import { XCircle } from 'lucide-react';

const TaskList: React.FC = () => {
  const { tasks, setTasksVisible, focusMode, currentTimerId, setFocusMode } = useAppContext();

  // Filter out stashed and completed tasks
  const visibleTasks = tasks.filter(task => 
    !task.stashed && !task.completed && 
    (focusMode ? task.id === currentTimerId || task.inProgress : true)
  );

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-emerald-200">
      <div className="space-y-4">
        {visibleTasks.length > 0 ? (
          visibleTasks.map((task) => (
            <Task key={task.id} task={task} />
          ))
        ) : (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-slate-500">No active tasks. Select a task from your stash to get started!</p>
            {focusMode && (
              <button
                onClick={() => setFocusMode(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
              >
                <XCircle className="h-4 w-4" />
                Exit Focus Mode
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;