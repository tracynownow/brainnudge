const completionMessages = [
  "You're a task machine! 🚀",
  "You crushed it! 💪",
  "Boom. That's how it's done! ⚡",
  "Done and dusted! ✨",
  "One step closer — keep going! 🎯",
  "Nice work, keep that brain moving! 🧠",
  "Absolutely nailed it! 🎉"
];

export const getRandomCompletionMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * completionMessages.length);
  return completionMessages[randomIndex];
};