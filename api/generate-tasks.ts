// api/generate-tasks.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({ error: 'Goal is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that breaks down goals into small, actionable tasks. Be encouraging, clear, and specific.'
        },
        {
          role: 'user',
          content: `Break this goal into 4-5 clear, actionable tasks: "${goal}"`
        }
      ]
    });

    const steps = completion.choices[0].message.content?.split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    return res.status(200).json({ steps });
  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'Failed to generate tasks' });
  }
}

