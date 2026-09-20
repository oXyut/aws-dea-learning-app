import test from 'node:test';
import assert from 'node:assert/strict';
import { services, serviceMap, coreServices, categories } from '../src/data/services';
import { patterns } from '../src/data/patterns';
import { comparisons, comparisonDimensions } from '../src/data/comparisons';
import { quizzes } from '../src/data/quizzes';

test('required service coverage, unique identifiers and valid integrations', () => {
  const required = [
    's3',
    'glacier',
    'lakeformation',
    'glue',
    'catalog',
    'crawler',
    'glue-etl',
    'quality',
    'dms',
    'datasync',
    'athena',
    'redshift',
    'spectrum',
    'emr',
    'opensearch',
    'kinesis',
    'firehose',
    'msk',
    'sqs',
    'sns',
    'eventbridge',
    'rds',
    'aurora',
    'dynamodb',
    'lambda',
    'stepfunctions',
    'mwaa',
    'cloudwatch',
    'cloudtrail',
    'iam',
    'kms',
    'secrets',
    'macie',
  ];
  assert.equal(new Set(services.map((s) => s.id)).size, services.length);
  for (const id of required) assert.ok(serviceMap[id], id);
  for (const service of services) {
    assert.ok(categories.some((c) => c.id === service.category));
    for (const field of ['what', 'cannot', 'use', 'alternatives', 'exam', 'trap'] as const)
      assert.ok(service[field].trim(), `${service.id}: ${field}`);
    assert.ok(service.can.length > 0);
    assert.ok(service.keywords.length > 0);
    assert.equal(new URL(service.source).hostname, 'docs.aws.amazon.com');
    for (const id of service.integrations) assert.ok(serviceMap[id], `${service.id} → ${id}`);
  }
  for (const id of coreServices)
    assert.ok(serviceMap[id].deep?.length, `${id} should have detailed lessons`);
});

test('all architecture graphs are connected and reference existing services and steps', () => {
  assert.equal(patterns.length, 8);
  assert.equal(new Set(patterns.map((p) => p.id)).size, 8);
  for (const p of patterns) {
    const ids = new Set(p.nodes.map((n) => n.id));
    assert.equal(ids.size, p.nodes.length);
    for (const node of p.nodes) {
      if (node.service) assert.ok(serviceMap[node.service]);
      assert.ok(node.role);
      assert.ok(node.x >= 0 && node.x + 154 <= 1000);
      assert.ok(node.y >= 0 && node.y + 102 <= 445);
    }
    const visited = new Set([p.nodes[0].id]);
    for (const edge of p.edges) {
      assert.ok(ids.has(edge.from));
      assert.ok(ids.has(edge.to));
      assert.ok(edge.label);
    }
    for (let i = 0; i < p.nodes.length; i++)
      for (const edge of p.edges) {
        if (visited.has(edge.from)) visited.add(edge.to);
        if (visited.has(edge.to)) visited.add(edge.from);
      }
    assert.equal(visited.size, ids.size, `${p.name} has an unreachable node`);
    for (const step of p.steps) assert.ok(ids.has(step.node));
  }
});

test('catalog is metadata, Athena reads the actual S3 data in the serverless lake', () => {
  const lake = patterns.find((p) => p.id === 'serverless-lake')!;
  assert.ok(lake.edges.some((e) => e.from === 'raw' && e.to === 'query' && e.kind === 'data'));
  assert.ok(lake.edges.some((e) => e.from === 'meta' && e.to === 'query' && e.kind === 'metadata'));
  assert.ok(
    lake.edges
      .filter((e) => e.to === 'meta' || e.from === 'meta' || e.to === 'crawl')
      .every((e) => e.kind === 'metadata'),
  );
  const event = patterns.find((p) => p.id === 'event')!;
  assert.ok(event.edges.some((e) => e.from === 'file' && e.to === 'etl' && e.kind === 'data'));
  assert.ok(event.edges.some((e) => e.from === 'workflow' && e.to === 'etl' && e.kind === 'event'));
});

test('ten comparisons contain every dimension for both services', () => {
  assert.equal(comparisons.length, 10);
  assert.equal(new Set(comparisons.map((c) => c.id)).size, 10);
  for (const c of comparisons) {
    assert.ok(serviceMap[c.a]);
    assert.ok(serviceMap[c.b]);
    assert.notEqual(c.a, c.b);
    assert.equal(c.aValues.length, comparisonDimensions.length);
    assert.equal(c.bValues.length, comparisonDimensions.length);
    assert.ok([...c.aValues, ...c.bValues].every(Boolean));
  }
});

test('scenario choices, explanations, correct answers and architecture blanks are consistent', () => {
  assert.equal(quizzes.length, 10);
  assert.equal(new Set(quizzes.map((q) => q.id)).size, 10);
  for (const q of quizzes) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options.map((o) => o.service)).size, 4);
    assert.equal(q.options.filter((o) => o.service === q.answer).length, 1);
    for (const option of q.options) {
      assert.ok(serviceMap[option.service]);
      assert.ok(option.reason.length > 20);
    }
    const pattern = patterns.find((p) => p.id === q.pattern);
    assert.ok(pattern);
    if (q.blank) {
      const node = pattern.nodes.find((n) => n.id === q.blank);
      assert.ok(node);
      assert.equal(node.service, q.answer);
    }
  }
});
