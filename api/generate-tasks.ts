import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({ error: 'Missing goal' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You break down goals into 4-5 specific, clear action steps.' },
        { role: 'user', content: `Break this goal into steps: "${goal}"` }
      ]
    });

    const steps = completion.choices[0].message.content?.split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    res.status(200).json({ steps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate tasks' });
  }
}
