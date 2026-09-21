import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ExternalLink, Search } from 'lucide-react';
import {
  domains,
  examTasks,
  guideUrl,
  lessons,
  reviewedAt,
  type Checkpoint,
} from '../data/curriculum';
import {
  isCheckpointCorrect,
  isLessonComplete,
  lessonMatches,
  lessonStatus,
  type CourseProgress,
} from '../data/learningProgress';
import { serviceMap } from '../data/services';
import { glossary } from '../data/glossary';

export function Curriculum({
  lessonId,
  onLesson,
  onOpen,
  onPattern,
  onPractice,
  progress,
  setProgress,
  warning,
}: {
  lessonId: string;
  onLesson: (id: string) => void;
  onOpen: (id: string) => void;
  onPattern: (id: string) => void;
  onPractice: () => void;
  progress: CourseProgress;
  setProgress: Dispatch<SetStateAction<CourseProgress>>;
  warning: string;
}) {
  const [query, setQuery] = useState('');
  const [termQuery, setTermQuery] = useState('');
  const [domain, setDomain] = useState('all');
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0];
  const index = lessons.indexOf(lesson);
  const current = progress[lesson.id];
  const complete = lessons.filter((item) => isLessonComplete(item, progress[item.id])).length;
  const read = lessons.filter((item) => progress[item.id]?.read).length;
  const next = lessons.find((item) => !isLessonComplete(item, progress[item.id]));
  const filtered = lessons.filter(
    (item) =>
      (domain === 'all' || item.domain === Number(domain)) &&
      (!onlyIncomplete || !isLessonComplete(item, progress[item.id])) &&
      lessonMatches(item, query),
  );
  const choose = (id: string) => {
    onLesson(id);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start' });
    });
  };
  function record(checkId: string, answer?: string[]) {
    setProgress((previous) => {
      const saved = previous[lesson.id] ?? { read: false, answers: {} };
      const answers = { ...saved.answers };
      if (answer) answers[checkId] = answer;
      else delete answers[checkId];
      return { ...previous, [lesson.id]: { ...saved, answers } };
    });
  }
  return (
    <section className="curriculum">
      <div className="course-overview">
        <div>
          <span className="eyebrow">YOUR LEARNING PATH</span>
          <h2>読む。説明する。判断する。</h2>
          <p>
            初めての方は第1章から。各章の本文と具体例を読み、到達目標を説明してから確認問題へ進みます。関連する図とサービス解説も、このサイト内で参照できます。
          </p>
          <button
            className="primary-button"
            onClick={() => (next ? choose(next.id) : onPractice())}
          >
            {next ? `次の未完了章へ：${next.title}` : '全章を確認しました。応用シナリオへ'}{' '}
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="course-stats">
          <span>教材の確認状況</span>
          <strong>
            {complete}
            <small> / {lessons.length} 章</small>
          </strong>
          <progress
            aria-label="本文を既読にして確認問題に全問正解した章数"
            value={complete}
            max={lessons.length}
          />
          <p>
            既読 {read} 章 · 確認済み {Math.round((complete / lessons.length) * 100)}%
          </p>
          <small>
            確認済み＝既読＋章の全問正解。
            <br />
            試験の習得率・合格予測ではありません。
          </small>
        </div>
      </div>
      <p className="course-storage-note" role="status">
        {warning ||
          '進捗はこのブラウザ・配信元に自動保存します。別端末とは同期されません。ブラウザの保存データを消すとリセットされます。'}
      </p>
      <details className="course-scope">
        <summary>
          この教材の範囲と到達基準 <span>全17タスクの対応章 · 公式ガイド v1.1</span>
        </summary>
        <div className="scope-body">
          <p>
            公式ガイドを{reviewedAt}
            に確認。下表は各タスクの基礎説明への入口です。個別の全スキル・サービス機能を網羅したという意味ではありません。LLM、Iceberg、HNSW/IVF、SageMaker
            Catalog、Unified Studioの改訂項目も本文に含めています。
          </p>
          <p>
            ここでの目標は「要件から方式を選び、理由と失敗条件を説明できる」こと。AWSコンソールでの実機操作、IAMの実環境検証、負荷測定、全120スキルに対する独立した演習は未収録です。初学者はSQLとコードの例を手で追い、既存の基礎・応用シナリオにも取り組んでください。
          </p>
          <div className="scope-domains">
            {domains
              .filter((item) => item.id > 0)
              .map((item) => {
                const items = lessons.filter((entry) => entry.domain === item.id);
                return (
                  <div key={item.id}>
                    <strong>
                      D{item.id} · {item.weight}%
                    </strong>
                    <span>{item.title}</span>
                    <small>
                      確認{' '}
                      {items.filter((entry) => isLessonComplete(entry, progress[entry.id])).length}{' '}
                      / {items.length} 章
                    </small>
                  </div>
                );
              })}
          </div>
          <div
            className="course-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="試験タスクと章の対応表。横スクロールできます"
          >
            <table className="scope-table">
              <caption>タスクへの対応（重みは公式の出題比率）</caption>
              <thead>
                <tr>
                  <th scope="col">公式タスク</th>
                  <th scope="col">サイト内で読む章</th>
                </tr>
              </thead>
              <tbody>
                {examTasks.map(([id, title]) => (
                  <tr key={id}>
                    <th scope="row">
                      {id} {title}
                    </th>
                    <td>
                      {lessons
                        .filter((entry) => entry.tasks.some((task) => task === id))
                        .map((entry) => (
                          <button
                            className="text-button"
                            key={entry.id}
                            onClick={() => choose(entry.id)}
                          >
                            {entry.title} <ArrowRight size={13} />
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a
            className="lesson-source"
            href={`${guideUrl}dea-01-revisions.html`}
            target="_blank"
            rel="noreferrer"
          >
            公式試験ガイドの改訂履歴 <ExternalLink size={13} />
          </a>
        </div>
      </details>
      <details className="course-scope glossary">
        <summary>
          わからない言葉を引く <span>{glossary.length}項目の用語辞典 · 本文へのリンク付き</span>
        </summary>
        <div className="scope-body">
          <label className="course-search">
            <Search size={16} />
            <span className="sr-only">用語辞典を検索</span>
            <input
              type="search"
              value={termQuery}
              onChange={(event) => setTermQuery(event.target.value)}
              placeholder="例：WLM、冪等性、スキーマ"
            />
          </label>
          <dl>
            {glossary
              .filter(([term, definition]) =>
                `${term} ${definition}`
                  .normalize('NFKC')
                  .toLowerCase()
                  .includes(termQuery.normalize('NFKC').trim().toLowerCase()),
              )
              .map(([term, definition, id]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>
                    {definition}
                    <button className="text-button" onClick={() => choose(id)}>
                      本文で学ぶ <ArrowRight size={13} />
                    </button>
                  </dd>
                </div>
              ))}
          </dl>
          {!glossary.some(([term, definition]) =>
            `${term} ${definition}`
              .normalize('NFKC')
              .toLowerCase()
              .includes(termQuery.normalize('NFKC').trim().toLowerCase()),
          ) && <p role="status">一致する用語がありません。別の語句で検索してください。</p>}
        </div>
      </details>
      <div className="course-layout">
        <aside className="course-index" aria-label="学習章の一覧">
          <label className="course-search">
            <Search size={16} />
            <span className="sr-only">教材本文を検索</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="用語・本文を検索"
              type="search"
            />
          </label>
          <label className="course-filter">
            分野
            <select value={domain} onChange={(event) => setDomain(event.target.value)}>
              <option value="all">すべての分野</option>
              {domains.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.id ? `D${item.id} ` : ''}
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label className="course-incomplete">
            <input
              type="checkbox"
              checked={onlyIncomplete}
              onChange={(event) => setOnlyIncomplete(event.target.checked)}
            />
            未完了だけ表示
          </label>
          <p className="course-count" aria-live="polite">
            {filtered.length} / {lessons.length} 章
          </p>
          <div className="course-index-list">
            {filtered.map((entry) => (
              <button
                key={entry.id}
                className={`chapter-link ${lesson.id === entry.id ? 'active' : ''}`}
                aria-current={lesson.id === entry.id ? 'step' : undefined}
                onClick={() => choose(entry.id)}
              >
                <span className="chapter-number">
                  {String(lessons.indexOf(entry) + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong>{entry.title}</strong>
                  <small>
                    {entry.domain ? `D${entry.domain} · ` : '基礎 · '}
                    {lessonStatus(entry, progress[entry.id])}
                  </small>
                </span>
                {isLessonComplete(entry, progress[entry.id]) && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
          {!filtered.length && (
            <div className="course-empty">
              <p>条件に合う章がありません。</p>
              <button
                className="text-button"
                onClick={() => {
                  setQuery('');
                  setDomain('all');
                  setOnlyIncomplete(false);
                }}
              >
                検索条件をクリア
              </button>
            </div>
          )}
        </aside>
        <article className="lesson-reader" key={lesson.id} aria-labelledby="lesson-heading">
          <header className="lesson-header">
            <span className="eyebrow">
              CHAPTER {String(index + 1).padStart(2, '0')} / {lessons.length} ·{' '}
              {domains.find((item) => item.id === lesson.domain)?.title}
            </span>
            <h2 id="lesson-heading" ref={heading} tabIndex={-1}>
              {lesson.title}
            </h2>
            <p>{lesson.summary}</p>
            <div className="keyword-row">
              {lesson.tasks.map((id) => (
                <span key={id}>Task {id}</span>
              ))}
              <span>{lessonStatus(lesson, current)}</span>
            </div>
          </header>
          <section className="lesson-objectives">
            <h3>読み終えたら説明できること</h3>
            <ul>
              {lesson.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>
          {lesson.sections.map((section) => (
            <section className="lesson-section" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
            </section>
          ))}
          <section className="lesson-example">
            <span className="eyebrow">WORKED EXAMPLE</span>
            <h3>{lesson.example.title}</h3>
            <h4>入力・条件</h4>
            <p>{lesson.example.input}</p>
            {lesson.example.code && (
              <pre tabIndex={0} aria-label="コード例。横スクロールできます">
                <code>{lesson.example.code}</code>
              </pre>
            )}
            <h4>結果</h4>
            <p className="example-output">{lesson.example.output}</p>
            <h4>この結果になる理由</h4>
            <p>{lesson.example.explanation}</p>
          </section>
          <section className="lesson-pitfalls">
            <h3>間違えやすい境界</h3>
            <ul>
              {lesson.pitfalls.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
          <section className="lesson-connections">
            <h3>図とサービスで確かめる</h3>
            <div className="lesson-links">
              {lesson.services.map((id) => (
                <button className="secondary-button" key={id} onClick={() => onOpen(id)}>
                  {serviceMap[id].short} <BookOpen size={14} />
                </button>
              ))}
              {lesson.pattern && (
                <button className="secondary-button" onClick={() => onPattern(lesson.pattern!)}>
                  関連する構成図 <ArrowRight size={14} />
                </button>
              )}
            </div>
          </section>
          <label className="lesson-read">
            <input
              type="checkbox"
              checked={current?.read ?? false}
              onChange={(event) =>
                setProgress((previous) => ({
                  ...previous,
                  [lesson.id]: {
                    read: event.target.checked,
                    answers: previous[lesson.id]?.answers ?? {},
                  },
                }))
              }
            />
            <span>
              本文と具体例を読み、到達目標を自分の言葉で説明した
              <small>既読だけでは確認済みになりません。次の問題で判断を確かめます。</small>
            </span>
          </label>
          <section className="lesson-checks">
            <h3>理解を確認する</h3>
            <p>
              解答前に、他の選択肢を選ばない理由も考えてください。正解の選び漏れ・余分な選択は不正解です。
            </p>
            {lesson.checks.map((check) => (
              <CheckQuestion
                key={check.id}
                check={check}
                saved={current?.answers[check.id]}
                onSubmit={(answer) => record(check.id, answer)}
                onRetry={() => record(check.id)}
              />
            ))}
          </section>
          <div className="lesson-sources">
            <span>根拠・発展用の公式資料等 · 確認日 {reviewedAt}</span>
            {lesson.sources.map((item) => (
              <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
                {item.title} <ExternalLink size={12} />
              </a>
            ))}
          </div>
          <div className="lesson-navigation">
            <button
              className="secondary-button"
              disabled={index === 0}
              onClick={() => choose(lessons[index - 1].id)}
            >
              <ArrowLeft size={15} />
              前の章
            </button>
            <span role="status">
              {isLessonComplete(lesson, current)
                ? 'この章は確認済みです'
                : '未完了のまま次へ進むこともできます'}
            </span>
            {index < lessons.length - 1 ? (
              <button className="primary-button" onClick={() => choose(lessons[index + 1].id)}>
                次の章
                <ArrowRight size={15} />
              </button>
            ) : (
              <button className="primary-button" onClick={onPractice}>
                応用シナリオへ
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function CheckQuestion({
  check,
  saved,
  onSubmit,
  onRetry,
}: {
  check: Checkpoint;
  saved?: string[];
  onSubmit: (answer: string[]) => void;
  onRetry: () => void;
}) {
  const [choice, setChoice] = useState<string[]>([]);
  const multiple = check.options.filter((option) => option.correct).length > 1;
  const selected = saved ?? choice;
  const correct = saved ? isCheckpointCorrect(check, saved) : false;
  return (
    <div className="chapter-check">
      <fieldset disabled={!!saved}>
        <legend>
          {check.prompt} <small>{multiple ? '複数選択' : '単一選択'}</small>
        </legend>
        {check.options.map((option) => (
          <label key={option.id}>
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={`check-${check.id}`}
              checked={selected.includes(option.id)}
              onChange={() =>
                setChoice((previous) =>
                  multiple
                    ? previous.includes(option.id)
                      ? previous.filter((id) => id !== option.id)
                      : [...previous, option.id]
                    : [option.id],
                )
              }
            />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      {!saved ? (
        <button
          className="primary-button"
          disabled={choice.length === 0}
          onClick={() => onSubmit(choice)}
        >
          解答して理由を確認 <ArrowRight size={15} />
        </button>
      ) : (
        <div className="checkpoint-feedback" role="status">
          <strong className={correct ? 'checkpoint-correct' : 'checkpoint-review'}>
            {correct
              ? '正解です。理由も確認しましょう。'
              : '要復習です。本文の判断条件を見直しましょう。'}
          </strong>
          {check.options.map((option) => (
            <div key={option.id}>
              <h4>
                {option.correct ? '○ 選ぶ' : '× 選ばない'}：{option.text}
              </h4>
              <p>{option.reason}</p>
            </div>
          ))}
          <button
            className="secondary-button"
            onClick={() => {
              setChoice([]);
              onRetry();
            }}
          >
            この問題を解き直す
          </button>
        </div>
      )}
    </div>
  );
}
