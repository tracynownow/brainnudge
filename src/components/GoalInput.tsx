import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowRight, Loader2, Rocket, Sparkles, Archive, Trash2 } from 'lucide-react';
import { generateTasks } from '../services/openai';

const GoalInput: React.FC = () => {
  const { 
    goal, 
    setGoal, 
    setTasks, 
    tasks,
    loading, 
    setLoading,
    currentTimerId,
    setCurrentTimerId,
    setFocusMode 
  } = useAppContext();
  
  const [error, setError] = useState('');
  const [showStashToast, setShowStashToast] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const activeTask = tasks.find(task => task.inProgress || task.id === currentTimerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goal.trim()) {
      setError('Please enter a goal');
      return;
    }

    if (activeTask) {
      setShowConfirmModal(true);
      return;
    }

    await generateNewGroupedTask();
  };

  const generateNewGroupedTask = async () => {
    setError('');
    setLoading(true);
    
    try {
      const generatedSubtasks = await generateTasks(goal);
      const newTask = {
        id: `task-${Date.now()}`,
        description: goal,
        completed: false,
        inProgress: false,
        isExpanded: true,
        stashed: false,
        subtasks: generatedSubtasks.map((t, idx) => ({
          id: `subtask-${Date.now()}-${idx}`,
          description: t.description,
          completed: false,
          parentId: `task-${Date.now()}`,
        })),
      };

      setTasks(prevTasks => [...prevTasks, newTask]);
      setCurrentTimerId(null);
      setFocusMode(false);
      setGoal('');
    } catch (err) {
      setError('Failed to generate tasks. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStashCurrent = async () => {
    setTasks(prevTasks => prevTasks.map(task => {
      const isActive = task.inProgress || task.id === currentTimerId;
      return isActive
        ? { ...task, inProgress: false, stashed: true }
        : task;
    }));
    
    setShowConfirmModal(false);
    setShowStashToast(true);
    setTimeout(() => setShowStashToast(false), 3000);
    
    await generateNewGroupedTask();
  };

  const handleDeleteCurrent = async () => {
    setTasks(prevTasks => prevTasks.filter(task => 
      !(task.inProgress || task.id === currentTimerId)
    ));
    
    setShowConfirmModal(false);
    await generateNewGroupedTask();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border-2 border-orange-300 relative">
      <div className="flex items-center gap-3 mb-2">
        <Rocket className="h-6 w-6 text-emerald-600" />
        <h2 className="text-xl font-semibold text-slate-800">What's one thing you'd love to feel done with?</h2>
      </div>
      <p className="text-slate-700 mb-4 text-sm flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        No pressure! We'll break it down into tiny, manageable steps together.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className={`w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 outline-none resize-none h-24 bg-white text-slate-700 ${activeTask ? 'opacity-50' : ''}`}
            placeholder="Maybe writing that email you've been putting off, or organizing your workspace..."
            disabled={loading}
          />
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md"
          disabled={loading || !goal.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Breaking it down for you...</span>
            </>
          ) : (
            <>
              <span>Let's make this manageable</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Looks like you're already in the middle of something
            </h3>
            <p className="text-slate-600 mb-6">
              What would you like to do with your current task?
            </p>
            <div className="space-y-3">
              <button
                onClick={handleStashCurrent}
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <Archive className="h-5 w-5" />
                <span>✨ Save it for later</span>
              </button>
              <button
                onClick={handleDeleteCurrent}
                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <Trash2 className="h-5 w-5" />
                <span>🔥 Start fresh instead</span>
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stash Toast Notification */}
      {showStashToast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          <span>Previous mission saved for later. Stay focused.</span>
        </div>
      )}
    </div>
  );
};

export default GoalInput;
