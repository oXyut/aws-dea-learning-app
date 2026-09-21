import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, examTasks, domains } from '../src/data/curriculum';
import {
  isCheckpointCorrect,
  isLessonComplete,
  lessonStatus,
  parseCourseProgress,
  lessonMatches,
} from '../src/data/learningProgress';
import { parseBasicAnswers, parseAdvancedAnswers } from '../src/data/practiceProgress';
import { readRoute } from '../src/data/navigation';
import { serviceMap } from '../src/data/services';
import { patterns } from '../src/data/patterns';
import { quizzes } from '../src/data/quizzes';
import { advancedQuizzes } from '../src/data/advancedQuizzes';
import { glossary } from '../src/data/glossary';

test('every published task has an actual lesson, example, checkpoint and valid local references', () => {
  for (const [term, definition, id] of glossary) {
    assert.ok(term && definition);
    assert.ok(
      lessons.some((lesson) => lesson.id === id),
      `glossary: ${term}`,
    );
  }
  assert.equal(examTasks.length, 17);
  assert.equal(
    domains.reduce((sum, domain) => sum + domain.weight, 0),
    100,
  );
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, lessons.length);
  for (const [task] of examTasks)
    assert.ok(
      lessons.some((lesson) => lesson.tasks.includes(task)),
      task,
    );
  for (const lesson of lessons) {
    assert.ok(domains.some((domain) => domain.id === lesson.domain));
    for (const task of lesson.tasks) assert.ok(examTasks.some(([id]) => task === id));
    assert.ok(
      lesson.objectives.length > 0 && lesson.sections.length > 0 && lesson.pitfalls.length > 0,
    );
    assert.ok(lesson.example.input && lesson.example.output && lesson.example.explanation);
    assert.ok(lesson.checks.length > 0 && lesson.sources.length > 0);
    assert.equal(new Set(lesson.checks.map((check) => check.id)).size, lesson.checks.length);
    for (const check of lesson.checks) {
      assert.ok(check.options.some((option) => option.correct));
      assert.ok(check.options.some((option) => !option.correct));
      assert.ok(check.options.every((option) => option.reason && option.text));
      assert.equal(new Set(check.options.map((option) => option.id)).size, check.options.length);
    }
    for (const id of lesson.services) assert.ok(serviceMap[id], `${lesson.id}: ${id}`);
    if (lesson.pattern) assert.ok(patterns.some((pattern) => pattern.id === lesson.pattern));
    for (const source of lesson.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(['docs.aws.amazon.com', 'github.com'].includes(url.hostname));
    }
  }
});

test('chapter grading rejects omissions, extra answers, unknown IDs and duplicates', () => {
  const check = lessons.find((lesson) => lesson.id === 'ingestion')!.checks[0];
  assert.equal(isCheckpointCorrect(check, ['a', 'b']), true);
  assert.equal(isCheckpointCorrect(check, ['b', 'a']), true);
  for (const choice of [[], ['a'], ['a', 'b', 'c'], ['a', 'unknown'], ['a', 'b', 'b']]) {
    assert.equal(isCheckpointCorrect(check, choice), false, JSON.stringify(choice));
  }
});

test('reading alone or a correct answer alone never completes a chapter; retry revokes completion', () => {
  const lesson = lessons[0];
  const answers = { roles: ['b'] };
  assert.equal(isLessonComplete(lesson), false);
  assert.equal(isLessonComplete(lesson, { read: true, answers: {} }), false);
  assert.equal(isLessonComplete(lesson, { read: false, answers }), false);
  assert.equal(isLessonComplete(lesson, { read: true, answers }), true);
  assert.equal(lessonStatus(lesson, { read: true, answers: { roles: ['a'] } }), '要復習');
  assert.equal(lessonStatus(lesson, { read: true, answers: {} }), '既読・確認待ち');
});

test('multi-question chapter requires every checkpoint and retains saved wrong answers for review', () => {
  const lesson = lessons.find((item) => item.id === 'sql')!;
  assert.equal(isLessonComplete(lesson, { read: true, answers: { count: ['b'] } }), false);
  assert.equal(
    isLessonComplete(lesson, { read: true, answers: { count: ['b'], window: ['b'] } }),
    true,
  );
  const roundtrip = parseCourseProgress(
    JSON.parse(JSON.stringify({ sql: { read: true, answers: { count: ['a'], window: ['b'] } } })),
  )!;
  assert.equal(lessonStatus(lesson, roundtrip.sql), '要復習');
});

test('saved data is validated and unknown or malformed fields cannot inflate progress', () => {
  for (const invalid of [null, true, 'text', []]) assert.equal(parseCourseProgress(invalid), null);
  const sanitized = parseCourseProgress({
    unknown: { read: true, answers: { fake: ['a'] } },
    foundations: { read: 'yes', answers: { roles: ['b', 'b'], unknown: ['x'] } },
    ingestion: { read: true, answers: { replay: ['a', 'removed'] } },
  })!;
  assert.equal(sanitized.unknown, undefined);
  assert.deepEqual(sanitized.foundations, { read: false, answers: {} });
  assert.equal(isLessonComplete(lessons[1], sanitized.ingestion), false);
});

test('search includes body text, normalizes fullwidth input, and finds revised exam topics', () => {
  for (const [query, id] of [
    ['ＨＮＳＷ', 'vectors'],
    ['Iceberg', 'iceberg'],
    ['SageMaker Catalog', 'catalogs'],
    ['LLM', 'llm-processing'],
    ['NULL', 'sql'],
  ]) {
    assert.ok(
      lessonMatches(
        lessons.find((lesson) => lesson.id === id)!,
        query,
      ),
      query,
    );
  }
  assert.equal(lessonMatches(lessons[0], 'nonexistent-query-12345'), false);
});

test('deep links preserve valid learning and diagram targets; invalid links safely fall back', () => {
  assert.deepEqual(readRoute('#learn/sql'), { view: 'learn', id: 'sql' });
  assert.deepEqual(readRoute('#patterns/cdc'), { view: 'patterns', id: 'cdc' });
  assert.deepEqual(readRoute('#advanced'), { view: 'advanced' });
  for (const hash of ['', '#', '#home', '#nonsense']) {
    assert.deepEqual(readRoute(hash), { view: 'home' });
  }
  for (const hash of ['#learn/missing', '#learn/%invalid']) {
    assert.deepEqual(readRoute(hash), { view: 'learn', id: 'foundations' });
  }
});

test('existing practice answers survive roundtrip but unknown choices are discarded', () => {
  const basic = quizzes[0];
  assert.deepEqual(parseBasicAnswers({ [basic.id]: basic.answer, unknown: 's3' }), {
    [basic.id]: basic.answer,
  });
  assert.deepEqual(parseBasicAnswers({ [basic.id]: 'removed' }), {});
  const advanced = advancedQuizzes[0];
  const choice = advanced.options.filter((option) => option.correct).map((option) => option.id);
  assert.deepEqual(parseAdvancedAnswers({ [advanced.id]: choice }), { [advanced.id]: choice });
  assert.deepEqual(parseAdvancedAnswers({ [advanced.id]: [...choice, 'invalid'] }), {});
});
