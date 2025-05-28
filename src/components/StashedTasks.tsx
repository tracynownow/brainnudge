import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Split, Trash2, ArrowUpRight, Plus, Sparkles, Briefcase } from 'lucide-react';
import { generateTasks } from '../services/openai';

const StashedTasks: React.FC = () => {
  const { tasks, setTasks, deleteTask, unstashTask } = useAppContext();
  const [newStashItem, setNewStashItem] = useState('');
  const stashedTasks = tasks.filter(task => task.stashed);

  const handleBreakIntoSteps = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const generatedTasks = await generateTasks(task.description);
      const newTasks = generatedTasks.map(t => ({ ...t, stashed: true }));
      setTasks(prev => [
        ...prev.filter(t => t.id !== taskId),
        ...newTasks
      ]);
    } catch (error) {
      console.error('Failed to break task into steps:', error);
    }
  };

  const handleAddStashItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStashItem.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      description: newStashItem,
      completed: false,
      inProgress: false,
      subtasks: [],
      isExpanded: false,
      stashed: true
    };

    setTasks(prev => [...prev, newTask]);
    setNewStashItem('');
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-medium text-slate-800">Stash for Later</h2>
      </div>
      
      <p className="text-sm text-slate-600 mb-4">
        Not for now. Still important.
      </p>

      <form onSubmit={handleAddStashItem} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newStashItem}
            onChange={(e) => setNewStashItem(e.target.value)}
            placeholder="Add something to your stash... future you will thank you! ✨"
            className="flex-grow px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all duration-200 outline-none text-sm placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!newStashItem.trim()}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Stash It</span>
            <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {stashedTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">Your stash is empty! Add items you want to tackle later.</p>
          </div>
        ) : (
          stashedTasks.map((task) => (
            <div 
              key={task.id}
              className="bg-blue-50/50 rounded-lg px-4 py-2 border border-blue-100 transition-all duration-200 hover:border-blue-200 hover:shadow-sm group flex items-center justify-between gap-4"
            >
              <p className="text-sm text-slate-700 truncate flex-grow">{task.description}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleBreakIntoSteps(task.id)}
                  className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded flex items-center gap-1.5 transition-colors duration-200 hover:bg-emerald-100 whitespace-nowrap"
                >
                  <Split className="h-3.5 w-3.5" />
                  <span>Break Into Steps</span>
                </button>
                <button
                  onClick={() => unstashTask(task.id)}
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded flex items-center gap-1.5 transition-colors duration-200 hover:bg-blue-100 whitespace-nowrap"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Move to Active</span>
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StashedTasks;