import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, Trash2, Pin, MoreVertical, Edit2, Archive, ChevronDown, ChevronUp } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  isEditing?: boolean;
}

const CapturePad: React.FC = () => {
  const { tempNote, setTempNote, addNote, convertNoteToTask, focusMode } = useAppContext();
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showList, setShowList] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempNote.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      content: tempNote,
      timestamp: new Date(),
    };

    setLocalNotes(prev => [newNote, ...prev]);
    addNote(tempNote, 'thoughts');
    setTempNote('');
    
    // Show toast message
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleDelete = (id: string) => {
    setLocalNotes(prev => prev.filter(note => note.id !== id));
    setActiveDropdown(null);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
    setActiveDropdown(null);
  };

  const handleSaveEdit = (id: string) => {
    setLocalNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, content: editContent }
        : note
    ));
    setEditingNote(null);
    setEditContent('');
  };

  const handleStashAsTask = (note: Note) => {
    convertNoteToTask(note.id);
    handleDelete(note.id);
    setActiveDropdown(null);
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.note-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-lavender-200">
      <div className="flex items-center gap-2 mb-4">
        <Pin className="h-5 w-5 text-lavender-500" />
        <h2 className="text-lg font-medium text-slate-800">Brain Overflow Bin</h2>
      </div>
      
      <p className="text-sm text-slate-600 mb-4">
        Dump thoughts here so you can keep moving.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={tempNote}
          onChange={(e) => setTempNote(e.target.value)}
          className="w-full p-3 bg-lavender-50 border border-lavender-200 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all duration-200 outline-none resize-none h-24"
          placeholder="Quick! Write it down before it slips away..."
        />

        <button
          type="submit"
          disabled={!tempNote.trim()}
          className="w-full py-2 px-4 bg-lavender-500 hover:bg-lavender-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          <span>Save Thought</span>
        </button>
      </form>

      {/* Toast Message */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-lavender-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          💭 Thought saved!
        </div>
      )}

      {/* Thought Counter and Toggle */}
      {localNotes.length > 0 && (
        <div className={`mt-4 flex items-center justify-between text-sm text-slate-600 ${focusMode ? 'border-t border-lavender-100 pt-4' : ''}`}>
          <span>{localNotes.length} thought{localNotes.length !== 1 ? 's' : ''} saved</span>
          <button
            onClick={() => setShowList(!showList)}
            className="flex items-center gap-1 text-lavender-600 hover:text-lavender-700 transition-colors duration-200"
          >
            {showList ? (
              <>
                <span>Hide List</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>See List</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Collapsible Notes List */}
      {showList && localNotes.length > 0 && (
        <div className={`mt-4 space-y-3 max-h-[400px] overflow-y-auto transition-all duration-300 ${focusMode ? 'opacity-75 hover:opacity-100' : ''}`}>
          {localNotes.map((note) => (
            <div
              key={note.id}
              className="group bg-lavender-50 p-3 rounded-lg border border-lavender-100 hover:border-lavender-200 transition-all duration-200"
            >
              {editingNote === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 bg-white border border-lavender-200 rounded focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingNote(null)}
                      className="text-xs px-2 py-1 text-slate-600 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="text-xs px-2 py-1 bg-lavender-100 text-lavender-700 rounded hover:bg-lavender-200"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap flex-grow">
                    {note.content}
                  </p>
                  <div className="relative note-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-lavender-100 rounded"
                    >
                      <MoreVertical className="h-4 w-4 text-slate-500" />
                    </button>
                    
                    {activeDropdown === note.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-lavender-100 py-1 z-10">
                        <button
                          onClick={() => handleEdit(note)}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-lavender-50 flex items-center gap-2"
                        >
                          <Edit2 className="h-4 w-4 text-lavender-500" />
                          Edit Note
                        </button>
                        <button
                          onClick={() => handleStashAsTask(note)}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-lavender-50 flex items-center gap-2"
                        >
                          <Archive className="h-4 w-4 text-lavender-500" />
                          Stash as Task
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-2">
                {new Date(note.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CapturePad;