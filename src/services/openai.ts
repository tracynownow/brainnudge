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
      stashed: false
    }));
  } catch (err) {
    console.error('Client-side error calling API route:', err);
    return [{
      description: '⚠️ Error generating tasks. Please try again later.',
      completed: false,
      inProgress: false,
      subtasks: [],
      isExpanded: false,
      stashed: false
    }];
  }
}

export const generateSubtasks = async (taskDescription: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that breaks down tasks into smaller, manageable subtasks. Be specific and actionable."
        },
        {
          role: "user",
          content: `Break this task into 3-4 smaller subtasks: "${taskDescription}"`
        }
      ]
    });

    const subtasks = completion.choices[0].message.content?.split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0)
      .map(description => ({
        description,
        completed: false
      })) || [];

    return subtasks;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate subtasks');
  }
};

export const analyzeNote = async (content: string): Promise<'thoughts' | 'future' | 'sort-later'> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that categorizes notes. Respond with exactly one word: 'thoughts', 'future', or 'sort-later'."
        },
        {
          role: "user",
          content: `Categorize this note as either 'thoughts' (for current thoughts and ideas), 'future' (for future tasks and plans), or 'sort-later' (for unclear or mixed content): "${content}"`
        }
      ]
    });

    const category = completion.choices[0].message.content?.toLowerCase().trim();
    
    if (category === 'thoughts' || category === 'future' || category === 'sort-later') {
      return category;
    }
    
    return 'sort-later';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'sort-later';
  }
};
