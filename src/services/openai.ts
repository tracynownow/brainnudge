// src/services/openai.ts

export async function generateTasks(goal: string) {
  try {
    const response = await fetch('/api/generate-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal }),
    });

    const data = await response.json();

    if (!data.steps || !Array.isArray(data.steps)) {
      throw new Error('No valid steps returned from server');
    }

    return data.steps.map((step: string, index: number) => ({
      id: `task-${index}-${Date.now()}`,
      description: step,
      completed: false,
      inProgress: false,
      subtasks: [],
      isExpanded: false,
      stashed: false,
    }));
  } catch (err) {
    console.error('Client-side error calling /api/generate-tasks:', err);
    return [{
      id: `task-error-${Date.now()}`,
      description: '⚠️ Error generating tasks. Please try again later.',
      completed: false,
      inProgress: false,
      subtasks: [],
      isExpanded: false,
      stashed: false,
    }];
  }
}

export const generateSubtasks = async (taskDescription: string) => {
  try {
    const response = await fetch('/api/generate-subtasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskDescription }),
    });

    const data = await response.json();

    if (!data.subtasks || !Array.isArray(data.subtasks)) {
      throw new Error('No valid subtasks returned');
    }

    return data.subtasks;
  } catch (error) {
    console.error('Client-side error calling /api/generate-subtasks:', error);
    return [{
      description: '⚠️ Error generating subtasks. Please try again later.',
      completed: false
    }];
  }
};

export const analyzeNote = async (content: string): Promise<'thoughts' | 'future' | 'sort-later'> => {
  try {
    const response = await fetch('/api/analyze-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();
    const category = data.category?.toLowerCase().trim();

    if (category === 'thoughts' || category === 'future' || category === 'sort-later') {
      return category;
    }

    return 'sort-later';
  } catch (error) {
    console.error('Client-side error calling /api/analyze-note:', error);
    return 'sort-later';
  }
};
