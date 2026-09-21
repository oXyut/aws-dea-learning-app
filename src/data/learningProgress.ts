import { lessons, type Checkpoint, type Lesson } from './curriculum';

export const courseStorageKey = 'dea-flow-lab:course:v1';
export type LessonProgress = { read: boolean; answers: Record<string, string[]> };
export type CourseProgress = Record<string, LessonProgress>;

export function isCheckpointCorrect(check: Checkpoint, selected: readonly string[]) {
  const expected = check.options.filter((option) => option.correct).map((option) => option.id);
  return (
    new Set(selected).size === selected.length &&
    selected.length === expected.length &&
    expected.every((id) => selected.includes(id))
  );
}

export function isLessonComplete(lesson: Lesson, progress?: LessonProgress) {
  return (
    !!progress?.read &&
    lesson.checks.every((check) => isCheckpointCorrect(check, progress.answers[check.id] ?? []))
  );
}

export function lessonStatus(lesson: Lesson, progress?: LessonProgress) {
  if (isLessonComplete(lesson, progress)) return '確認済み';
  if (
    lesson.checks.some(
      (check) =>
        progress?.answers[check.id] && !isCheckpointCorrect(check, progress.answers[check.id]),
    )
  )
    return '要復習';
  if (progress?.read) return '既読・確認待ち';
  return '未完了';
}

export function parseCourseProgress(value: unknown): CourseProgress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result: CourseProgress = {};
  for (const lesson of lessons) {
    const item = (value as Record<string, unknown>)[lesson.id];
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const candidate = item as Record<string, unknown>;
    const answers: Record<string, string[]> = {};
    if (candidate.answers && typeof candidate.answers === 'object') {
      for (const check of lesson.checks) {
        const choice = (candidate.answers as Record<string, unknown>)[check.id];
        if (
          Array.isArray(choice) &&
          choice.length > 0 &&
          new Set(choice).size === choice.length &&
          choice.every(
            (id) => typeof id === 'string' && check.options.some((option) => option.id === id),
          )
        ) {
          answers[check.id] = choice;
        }
      }
    }
    result[lesson.id] = { read: candidate.read === true, answers };
  }
  return result;
}

export function lessonMatches(lesson: Lesson, query: string) {
  return JSON.stringify(lesson)
    .normalize('NFKC')
    .toLocaleLowerCase()
    .includes(query.normalize('NFKC').trim().toLocaleLowerCase());
}
