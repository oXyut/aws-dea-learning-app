import { quizzes } from './quizzes';
import { advancedQuizzes } from './advancedQuizzes';

export function parseBasicAnswers(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const saved = value as Record<string, unknown>;
  return Object.fromEntries(
    quizzes.flatMap((quiz) => {
      const answer = saved[quiz.id];
      return typeof answer === 'string' && quiz.options.some((option) => option.service === answer)
        ? [[quiz.id, answer]]
        : [];
    }),
  );
}

export function parseAdvancedAnswers(value: unknown): Record<string, string[]> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const saved = value as Record<string, unknown>;
  return Object.fromEntries(
    advancedQuizzes.flatMap((quiz) => {
      const answer = saved[quiz.id];
      return Array.isArray(answer) &&
        answer.length > 0 &&
        new Set(answer).size === answer.length &&
        answer.every(
          (id) => typeof id === 'string' && quiz.options.some((option) => option.id === id),
        )
        ? [[quiz.id, answer]]
        : [];
    }),
  );
}
