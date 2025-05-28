import express from 'express';
import { OpenAI } from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({ error: 'Missing goal input' });
  }

  try {
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that breaks down goals into small, actionable tasks for someone with ADHD. Be encouraging, clear, and specific.',
        },
        {
          role: 'user',
          content: `Break this goal into 5–7 clear, tiny subtasks: "${goal}"`,
        },
      ],
    });

    const text = chatResponse.choices[0].message.content;

    const steps = text
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((line) => line.length > 0);

    res.json({ steps });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate tasks' });
  }
});

export default router;
