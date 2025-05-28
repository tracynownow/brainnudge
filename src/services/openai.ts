import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateTasks = async (goal: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that breaks down goals into small, actionable tasks. Be encouraging, clear, and specific."
        },
        {
          role: "user",
          content: `Break this goal into 4-5 clear, actionable tasks: "${goal}"`
        }
      ]
    });

    const tasks = completion.choices[0].message.content?.split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0)
      .map((description, index) => ({
        id: `task-${index}-${Date.now()}`,
        description,
        completed: false,
        inProgress: false,
        subtasks: [],
        isExpanded: false,
        stashed: false
      })) || [];

    return tasks;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate tasks');
  }
};

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
