import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  advancedQuizzes,
  isAdvancedAnswerCorrect,
  type AdvancedQuiz,
} from '../src/data/advancedQuizzes';
import { serviceMap, services } from '../src/data/services';
import { patterns } from '../src/data/patterns';
import { serviceIcons } from '../src/data/serviceIcons';

test('all twenty applied topics have valid study links and complete answer explanations', () => {
  assert.deepEqual(
    advancedQuizzes.map((q) => q.id),
    Array.from({ length: 20 }, (_, i) => `review-${String(i + 1).padStart(2, '0')}`),
  );
  for (const q of advancedQuizzes) {
    assert.ok(q.title && q.scenario && q.takeaway, q.id);
    assert.ok(q.options.length >= 4);
    assert.equal(new Set(q.options.map((o) => o.id)).size, q.options.length);
    const correct = q.options.filter((o) => o.correct);
    assert.ok(correct.length > 0 && correct.length < q.options.length);
    assert.equal(q.multiple, correct.length > 1, `${q.id}: input mode must match answer set`);
    assert.ok(q.options.every((o) => o.label && o.reason.length > 20));
    assert.ok(q.serviceIds.length > 0);
    for (const id of q.serviceIds) assert.ok(serviceMap[id], `${q.id}: ${id}`);
    if (q.pattern)
      assert.ok(
        patterns.some((p) => p.id === q.pattern),
        `${q.id}: ${q.pattern}`,
      );
    assert.ok(q.sources.length > 0);
    for (const source of q.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(['docs.aws.amazon.com', 'kubernetes.io'].includes(url.hostname));
      assert.ok(source.title);
    }
  }
});

const fixture: AdvancedQuiz = {
  id: 'test',
  title: '複数選択の採点',
  scenario: '採点のみを確認',
  serviceIds: [],
  multiple: true,
  options: [
    { id: 'read', label: '受信', correct: false, reason: '' },
    { id: 'delete', label: '削除', correct: true, reason: '' },
    { id: 'purge', label: '全削除', correct: true, reason: '' },
    { id: 'timeout', label: '再表示', correct: false, reason: '' },
  ],
  takeaway: '',
  sources: [],
};

test('multiple selection accepts the entire answer set in either order', () => {
  assert.equal(isAdvancedAnswerCorrect(fixture, ['delete', 'purge']), true);
  assert.equal(isAdvancedAnswerCorrect(fixture, ['purge', 'delete']), true);
});

test('multiple selection rejects omissions, extras, unknown choices and duplicates', () => {
  for (const attempt of [
    [],
    ['delete'],
    ['delete', 'purge', 'read'],
    ['read', 'timeout'],
    ['delete', 'unknown'],
    ['delete', 'purge', 'purge'],
  ]) {
    assert.equal(isAdvancedAnswerCorrect(fixture, attempt), false, JSON.stringify(attempt));
  }
});

test('single selection cannot be correct with an additional selected choice', () => {
  const single = {
    ...fixture,
    multiple: false,
    options: fixture.options.map((o) => ({ ...o, correct: o.id === 'delete' })),
  };
  assert.equal(isAdvancedAnswerCorrect(single, ['delete']), true);
  assert.equal(isAdvancedAnswerCorrect(single, ['delete', 'purge']), false);
  assert.equal(isAdvancedAnswerCorrect(single, ['purge']), false);
});

test('new diagrams preserve important data versus control boundaries', () => {
  const scheduled = patterns.find((p) => p.id === 'scheduled-ingestion')!;
  assert.ok(
    scheduled.edges.some((e) => e.from === 'clock' && e.to === 'collect' && e.kind === 'event'),
  );
  assert.ok(
    scheduled.edges.some((e) => e.from === 'api' && e.to === 'collect' && e.kind === 'data'),
  );
  const conversion = patterns.find((p) => p.id === 'firehose-conversion')!;
  assert.ok(
    conversion.edges.some(
      (e) => e.from === 'schema' && e.to === 'convert' && e.kind === 'metadata',
    ),
  );
  assert.equal(conversion.nodes.find((n) => n.id === 'convert')?.service, 'firehose');
  const pii = patterns.find((p) => p.id === 'pii-remediation')!;
  assert.ok(pii.edges.some((e) => e.from === 'route' && e.to === 'mask' && e.kind === 'event'));
  assert.ok(pii.edges.some((e) => e.from === 'raw' && e.to === 'mask' && e.kind === 'data'));
});

test('service artwork exists locally and remains byte-identical to the documented assets', () => {
  for (const [id, icon] of Object.entries(serviceIcons)) {
    assert.ok(serviceMap[id]);
    assert.ok(existsSync(new URL(`../public/aws-icons/${icon.file}`, import.meta.url)), id);
  }
  assert.deepEqual(
    services.filter((s) => !serviceIcons[s.id]).map((s) => s.id),
    ['quicksight'],
  );
  const manifest = JSON.parse(
    readFileSync(new URL('../public/aws-icons/manifest.json', import.meta.url), 'utf8'),
  );
  for (const entry of manifest) {
    const data = readFileSync(new URL(`../public/aws-icons/${entry.file}`, import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'), entry.sha256, entry.file);
  }
});
