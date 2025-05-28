const motivationalMessages = [
  "Small steps lead to big achievements",
  "Stay focused, you've got this!",
  "One task at a time transforms the impossible into possible",
  "Progress is progress, no matter how small",
  "The secret of getting ahead is getting started",
  "Your future self will thank you for this focus time",
  "Consistency beats intensity every time",
  "This is your moment to make progress",
  "Keep going, breakthroughs often come right after resistance",
  "You're building momentum with every minute of focus",
  "Trust the process, results will follow",
  "The work you do now creates the results you want later",
  "Stay present with this task - it's your only job right now",
  "Focus is the bridge between wishing and accomplishing",
  "Your brain is rewiring for success with each focused session",
  "Every minute of concentration is strengthening your ability to focus",
  "Progress comes from consistent, focused action",
  "Deep work now means deep satisfaction later",
  "Distractions are temporary, but your progress is permanent",
  "This focused time is a gift to your future self"
];

export const getRandomMotivationalMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[randomIndex];
};