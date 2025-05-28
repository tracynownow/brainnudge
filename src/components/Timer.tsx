import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { getRandomMotivationalMessage } from '../utils/motivationalMessages';
import { Loader2 } from 'lucide-react';

interface TimerProps {
  taskId: string;
}

const Timer: React.FC<TimerProps> = ({ taskId }) => {
  const { completeTask, tasks, updateTaskTimerState } = useAppContext();
  const task = tasks.find(t => t.id === taskId);
  
  const [timeLeft, setTimeLeft] = useState(() => 
    task?.timerState?.timeLeft ?? 10 * 60
  );
  const [motivationalMessage, setMotivationalMessage] = useState(() =>
    task?.timerState?.motivationalMessage ?? getRandomMotivationalMessage()
  );
  const [isComplete, setIsComplete] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsComplete(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        updateTaskTimerState(taskId, newTime, motivationalMessage);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [taskId, timeLeft, motivationalMessage, updateTaskTimerState]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      const newMessage = getRandomMotivationalMessage();
      setMotivationalMessage(newMessage);
      updateTaskTimerState(taskId, timeLeft, newMessage);
    }, 30000);
    
    return () => clearInterval(messageInterval);
  }, [taskId, timeLeft, updateTaskTimerState]);

  const progressPercentage = ((10 * 60 - timeLeft) / (10 * 60)) * 100;

  const handleComplete = () => {
    setIsComplete(true);
    completeTask(taskId);
  };

  return (
    <div className="space-y-3">
      <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all duration-500 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center text-sm text-slate-700">
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 text-emerald-500 mr-2 animate-spin" />
          <span className="font-semibold">{formatTime(timeLeft)}</span>
        </div>
        
        {isComplete ? (
          <button 
            onClick={handleComplete}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs py-1 px-3 rounded-full transition-colors duration-200"
          >
            Mark Complete
          </button>
        ) : (
          <button 
            onClick={handleComplete}
            className="text-slate-500 hover:text-slate-700 text-xs transition-colors duration-200"
          >
            Skip
          </button>
        )}
      </div>

      <p className="text-xs text-emerald-700 animate-pulse italic">
        "{motivationalMessage}"
      </p>
    </div>
  );
};

export default Timer;