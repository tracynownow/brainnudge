import React from 'react';
import { useAppContext } from '../context/AppContext';
import { StickyNote } from 'lucide-react';

const StickyNotes: React.FC = () => {
  const { notes } = useAppContext();

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="h-5 w-5 text-amber-500" />
        <h2 className="text-xl font-semibold">Your Notes</h2>
      </div>
      
      <div className="space-y-4 mt-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-amber-50 p-4 rounded-lg border border-amber-100 transform transition-all duration-300 hover:-rotate-1 hover:shadow-md"
          >
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
            <p className="text-xs text-slate-500 mt-2">
              {new Date(note.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StickyNotes;