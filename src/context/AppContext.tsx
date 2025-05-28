import React, { createContext, useContext, useState } from 'react';

type Subtask = {
  id: string;
  description: string;
  completed: boolean;
  parentId: string;
};

type Task = {
  id: string;
  description: string;
  completed: boolean;
  inProgress: boolean;
  subtasks: Subtask[];
  isExpanded: boolean;
  timerState?: {
    timeLeft: number;
    motivationalMessage: string;
  };
  convertedFromNoteId?: string;
  stashed?: boolean;
};

type Note = {
  id: string;
  content: string;
  timestamp: Date;
  type: TabType;
  convertedToTaskId?: string;
};

type TabType = 'thoughts' | 'future' | 'sort-later';

interface AppContextType {
  goal: string;
  setGoal: (goal: string) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  notes: Note[];
  addNote: (content: string, type: TabType) => void;
  tempNote: string;
  setTempNote: (note: string) => void;
  startTask: (id: string) => void;
  toggleTask: (id: string) => void;
  completeTask: (id: string) => void;
  tasksVisible: boolean;
  setTasksVisible: (visible: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  currentTimerId: string | null;
  setCurrentTimerId: (id: string | null) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtasks: (taskId: string, subtasks: Omit<Subtask, 'id' | 'parentId'>[]) => void;
  toggleTaskExpansion: (taskId: string) => void;
  focusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
  updateTaskTimerState: (taskId: string, timeLeft: number, motivationalMessage: string) => void;
  convertNoteToTask: (noteId: string) => void;
  getCompletedNoteConversions: () => number;
  stashTask: (taskId: string) => void;
  unstashTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goal, setGoal] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tempNote, setTempNote] = useState('');
  const [tasksVisible, setTasksVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentTimerId, setCurrentTimerId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const addNote = (content: string, type: TabType) => {
    if (content.trim() === '') return;
    
    const newNote = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      type,
    };
    
    setNotes((prevNotes) => [...prevNotes, newNote]);
    setTempNote('');
  };

  const convertNoteToTask = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const taskId = `task-${Date.now()}`;
    
    setNotes(prevNotes => prevNotes.map(n => 
      n.id === noteId 
        ? { ...n, convertedToTaskId: taskId }
        : n
    ));

    setTasks(prevTasks => [...prevTasks, {
      id: taskId,
      description: note.content,
      completed: false,
      inProgress: false,
      subtasks: [],
      isExpanded: false,
      convertedFromNoteId: noteId,
    }]);
  };

  const getCompletedNoteConversions = () => {
    return tasks.filter(task => 
      task.convertedFromNoteId && 
      task.completed
    ).length;
  };

  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          const newCompleted = !task.completed;
          return {
            ...task,
            completed: newCompleted,
            inProgress: newCompleted ? false : task.inProgress,
          };
        }
        return task;
      })
    );
    
    if (currentTimerId === id) {
      setCurrentTimerId(null);
    }
  };

  const startTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => ({
        ...task,
        inProgress: task.id === id,
      }))
    );
    setCurrentTimerId(id);
  };

  const completeTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            completed: true,
            inProgress: false,
            timerState: undefined,
          };
        }
        return task;
      })
    );
    
    if (currentTimerId === id) {
      setCurrentTimerId(null);
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map((subtask) =>
              subtask.id === subtaskId
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            ),
          };
        }
        return task;
      })
    );
  };

  const addSubtasks = (taskId: string, newSubtasks: Omit<Subtask, 'id' | 'parentId'>[]) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const subtasks = newSubtasks.map((subtask) => ({
            ...subtask,
            id: `${taskId}-subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            parentId: taskId,
          }));
          return {
            ...task,
            subtasks: [...(task.subtasks || []), ...subtasks],
            isExpanded: true,
          };
        }
        return task;
      })
    );
  };

  const toggleTaskExpansion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, isExpanded: !task.isExpanded }
          : task
      )
    );
  };

  const updateTaskTimerState = (taskId: string, timeLeft: number, motivationalMessage: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, timerState: { timeLeft, motivationalMessage } }
          : task
      )
    );
  };

  const stashTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, stashed: true, inProgress: false }
          : task
      )
    );
    if (currentTimerId === taskId) {
      setCurrentTimerId(null);
    }
  };

  const unstashTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, stashed: false }
          : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  return (
    <AppContext.Provider
      value={{
        goal,
        setGoal,
        tasks,
        setTasks,
        notes,
        addNote,
        tempNote,
        setTempNote,
        startTask,
        toggleTask,
        completeTask,
        tasksVisible,
        setTasksVisible,
        loading,
        setLoading,
        currentTimerId,
        setCurrentTimerId,
        toggleSubtask,
        addSubtasks,
        toggleTaskExpansion,
        focusMode,
        setFocusMode,
        updateTaskTimerState,
        convertNoteToTask,
        getCompletedNoteConversions,
        stashTask,
        unstashTask,
        deleteTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};