// api/generate-subtasks.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { taskDescription } = req.body;

  if (!taskDescription) {
    return res.status(400).json({ error: 'Missing task description' });
  }

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

    res.status(200).json({ subtasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate subtasks' });
  }
}
