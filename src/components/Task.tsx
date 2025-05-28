import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Play, Pause, CheckCircle2, ChevronRight, ChevronDown, Split, MessageSquare, Focus, Volume2, VolumeX, Archive, XCircle } from 'lucide-react';
import Timer from './Timer';
import { generateSubtasks } from '../services/openai';
import { getRandomCompletionMessage } from '../utils/completionMessages';

interface TaskProps {
  task: {
    id: string;
    description: string;
    completed: boolean;
    inProgress: boolean;
    subtasks: Array<{
      id: string;
      description: string;
      completed: boolean;
    }>;
    isExpanded: boolean;
    timerState?: {
      timeLeft: number;
      motivationalMessage: string;
    };
  };
}

const Task: React.FC<TaskProps> = ({ task }) => {
  const { startTask, completeTask, currentTimerId, toggleSubtask, addSubtasks, toggleTaskExpansion, notes, setFocusMode, stashTask } = useAppContext();
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const linkedNotes = notes.filter(note => note.linkedTaskId === task.id);

  useEffect(() => {
    if (task.completed) {
      setCompletionMessage(getRandomCompletionMessage());
      if (isFocused) {
        setIsFocused(false);
        setFocusMode(false);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    }
  }, [task.completed, isFocused, setFocusMode]);

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (audioRef.current) {
      if (!isSoundEnabled) {
        audioRef.current.play();
        audioRef.current.loop = true;
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleStartTimer = () => {
    setIsPaused(false);
    startTask(task.id);
    if (isSoundEnabled && audioRef.current) {
      audioRef.current.play();
    }
  };

  const handlePauseTask = () => {
    if (currentTimerId === task.id) {
      setIsPaused(true);
      setFocusMode(false);
      setIsFocused(false);
      startTask('');
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const handleCompleteTask = () => {
    completeTask(task.id);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleGenerateSubtasks = async () => {
    setIsGeneratingSubtasks(true);
    try {
      const subtasks = await generateSubtasks(task.description);
      addSubtasks(task.id, subtasks);
    } catch (error) {
      console.error('Failed to generate subtasks:', error);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const toggleFocus = () => {
    const newFocusState = !isFocused;
    setIsFocused(newFocusState);
    setFocusMode(newFocusState);
    if (!newFocusState && audioRef.current) {
      audioRef.current.pause();
      setIsSoundEnabled(false);
    }
  };

  const exitFocus = () => {
    setIsFocused(false);
    setFocusMode(false);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSoundEnabled(false);
    }
  };

  const subtaskProgress = task.subtasks.length > 0 
    ? Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)
    : 0;

  return (
    <div 
      className={`p-4 rounded-lg border transition-all duration-500 ${
        task.completed 
          ? 'bg-emerald-50 border-emerald-100' 
          : task.inProgress && isFocused
            ? 'bg-gradient-to-r from-emerald-50 via-mint-50 to-emerald-50 border-emerald-100 animate-gradient shadow-lg'
            : task.inProgress 
              ? 'bg-emerald-50/80 border-emerald-100' 
              : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=white-noise-6003.mp3" />
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-grow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-grow">
                <p className={`text-sm md:text-base ${task.completed ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                  {task.description}
                </p>
                {task.subtasks.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-grow h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${subtaskProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!task.completed && (
                  <>
                    <button
                      onClick={() => stashTask(task.id)}
                      className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-1 rounded flex items-center gap-1.5 transition-colors duration-200"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>Stash</span>
                    </button>
                    {isFocused && !task.inProgress ? (
                      <button
                        onClick={exitFocus}
                        className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded flex items-center gap-1.5 transition-colors duration-200"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Exit Focus Mode
                      </button>
                    ) : (
                      <button
                        onClick={toggleFocus}
                        className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 transition-all duration-200 ${
                          isFocused
                            ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Focus className="h-3.5 w-3.5" />
                        {isFocused ? 'Exit Focus' : 'Focus'}
                      </button>
                    )}
                    
                    {isFocused && (
                      <button
                        onClick={toggleSound}
                        className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 transition-all duration-200 ${
                          isSoundEnabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isSoundEnabled ? (
                          <Volume2 className="h-3.5 w-3.5" />
                        ) : (
                          <VolumeX className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </>
                )}
                
                {task.subtasks.length === 0 && !task.completed && (
                  <button
                    onClick={handleGenerateSubtasks}
                    disabled={isGeneratingSubtasks}
                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Split className="h-3.5 w-3.5" />
                    {isGeneratingSubtasks ? 'Breaking down...' : 'Break into subtasks'}
                  </button>
                )}
              </div>
            </div>
            
            {task.inProgress && currentTimerId === task.id && (
              <div className="mt-3">
                <Timer taskId={task.id} />
              </div>
            )}
            
            {!task.completed && (
              <div className="mt-3 flex gap-2">
                {!task.inProgress ? (
                  <button
                    onClick={handleStartTimer}
                    className={`text-xs ${
                      isPaused
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    } px-3 py-1.5 rounded flex items-center gap-1.5 transition-all duration-200 hover:scale-105`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    {isPaused ? "Ready to jump back in?" : "Start Task"}
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTask}
                    className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    Pause for Now
                  </button>
                )}
                <button
                  onClick={handleCompleteTask}
                  className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Complete
                </button>
              </div>
            )}
            
            {task.completed && (
              <div className="mt-3 text-xs text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="animate-fade-in">{completionMessage}</span>
              </div>
            )}

            {linkedNotes.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors duration-200"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{linkedNotes.length} linked note{linkedNotes.length > 1 ? 's' : ''}</span>
                </button>
                
                {showNotes && (
                  <div className="mt-2 space-y-2">
                    {linkedNotes.map((note) => (
                      <div
                        key={note.id}
                        className="text-sm bg-white/50 p-2 rounded border border-slate-200"
                      >
                        <p className="text-slate-600 whitespace-pre-wrap">{note.content}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(note.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {task.subtasks.length > 0 && (
          <div className="ml-4 space-y-2 border-l-2 border-emerald-100 pl-4">
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleSubtask(task.id, subtask.id)}
                  className="flex-shrink-0 transition-transform duration-200 hover:scale-110"
                >
                  {subtask.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-emerald-300 rounded-full" />
                  )}
                </button>
                <span className={`text-sm ${subtask.completed ? 'line-through text-slate-500' : 'text-slate-600'}`}>
                  {subtask.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Task;