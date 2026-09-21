import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { lessons } from '../data/curriculum';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GitCompareArrows,
  GraduationCap,
  Info,
  Lightbulb,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { categories, coreServices, serviceMap, services } from '../data/services';
import { patterns } from '../data/patterns';
import { comparisons, comparisonDimensions } from '../data/comparisons';
import { quizzes } from '../data/quizzes';
import { ServiceIcon } from './Diagram';

export function ServiceExplorer({ onOpen }: { onOpen: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const query = search.trim().toLocaleLowerCase();
  const filtered = services.filter(
    (s) =>
      (category === 'all' || s.category === category) &&
      [
        s.name,
        s.short,
        s.what,
        s.use,
        s.cannot,
        s.alternatives,
        s.exam,
        s.trap,
        s.keywords.join(' '),
        ...(s.deep || []).map((d) => `${d.title} ${d.text}`),
      ]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query),
  );
  return (
    <section className="service-explorer">
      <div className="explorer-tools">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="サービスを検索"
            placeholder="サービス・機能・判断のキーワードで探す"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button aria-label="検索をクリア" onClick={() => setSearch('')}>
              <X size={16} />
            </button>
          )}
        </label>
        <label className="select-field">
          カテゴリ
          <select
            aria-label="カテゴリで絞り込み"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">すべてのカテゴリ</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} / {c.ja}
              </option>
            ))}
          </select>
        </label>
        <span className="result-count" aria-live="polite">
          {filtered.length} / {services.length} services
        </span>
      </div>
      <div className="core-note">
        <BookOpen size={16} />
        <span>
          <b>CORE</b> は最初に押さえたい9サービス。構成での役割と選択の判断軸まで詳しく学べます。
        </span>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Search size={28} />
          <h2>一致するサービスがありません</h2>
          <p>別のサービス名やキーワードで検索してください。</p>
          <button
            className="primary-button"
            onClick={() => {
              setSearch('');
              setCategory('all');
            }}
          >
            絞り込みをリセット
          </button>
        </div>
      ) : (
        <div className="service-grid">
          {filtered.map((s) => {
            const cat = categories.find((c) => c.id === s.category)!;
            return (
              <button
                className="service-card"
                key={s.id}
                onClick={() => onOpen(s.id)}
                style={{ '--accent': cat.color } as React.CSSProperties}
              >
                <span className="card-category">
                  <i />
                  {cat.name}
                  {coreServices.includes(s.id) && <b>CORE</b>}
                </span>
                <h2>
                  <span className="service-card-title">
                    <ServiceIcon service={s} size={36} />
                    {s.short}
                  </span>
                  <ArrowUpRight size={18} />
                </h2>
                <span className="service-fullname">{s.name}</span>
                <p>{s.what}</p>
                <span className="card-bottom">
                  <span>{s.keywords.slice(0, 2).join(' · ')}</span>
                  <ChevronRight size={16} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function ServiceDialog({
  serviceId,
  onClose,
  onOpen,
  onPattern,
  onCompare,
  onLesson,
}: {
  serviceId: string | null;
  onClose: () => void;
  onOpen: (id: string) => void;
  onPattern: (id: string) => void;
  onCompare: (id: string) => void;
  onLesson: (id: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (serviceId) {
      ref.current?.showModal();
      scroller.current?.scrollTo(0, 0);
    } else if (ref.current?.open) ref.current.close();
  }, [serviceId]);
  useEffect(() => {
    if (!serviceId) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [serviceId]);
  const service = serviceId ? serviceMap[serviceId] : undefined;
  return (
    <dialog
      ref={ref}
      className="service-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="service-dialog-title"
    >
      {service && (
        <>
          <div className="dialog-header">
            <span className="eyebrow">
              SERVICE EXPLORER / {categories.find((c) => c.id === service.category)?.name}
            </span>
            <button className="icon-button" aria-label="サービス詳細を閉じる" onClick={onClose}>
              <X size={19} />
            </button>
          </div>
          <div ref={scroller} className="dialog-content">
            <h2 id="service-dialog-title">
              <ServiceIcon service={service} size={48} />
              <span>{service.name}</span>
            </h2>
            <div className="keyword-row">
              {service.keywords.map((k) => (
                <span key={k}>{k}</span>
              ))}
            </div>
            <div className="service-definition">
              <span className="detail-label">WHAT / どんなサービス？</span>
              <p>{service.what}</p>
            </div>
            <div className="capability-grid">
              <section>
                <h3>
                  <CheckCircle2 size={18} />
                  できること
                </h3>
                <ul>
                  {service.can.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>
              <section className="cannot-panel">
                <h3>
                  <ShieldAlert size={18} />
                  向いていないこと
                </h3>
                <p>{service.cannot}</p>
              </section>
            </div>
            <section className="dialog-section">
              <h3>どんなときに使う？</h3>
              <p>{service.use}</p>
            </section>
            {service.deep?.map((d) => (
              <section className="dialog-section" key={d.title}>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
                {d.source && (
                  <a className="lesson-source" href={d.source} target="_blank" rel="noreferrer">
                    この解説の公式資料 <ExternalLink size={12} />
                  </a>
                )}
              </section>
            ))}
            <section className="dialog-section">
              <h3>よく組み合わせるサービス</h3>
              <p className="muted-caption">
                一緒に使うサービスです。矢印の順序を表すものではありません。
              </p>
              <div className="integration-list">
                {service.integrations.map((id) => (
                  <button onClick={() => onOpen(id)} key={id}>
                    {serviceMap[id].short}
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            </section>
            <section className="dialog-section">
              <h3>本文で基礎から学ぶ</h3>
              <div className="integration-list">
                {lessons
                  .filter((lesson) => lesson.services.includes(service.id))
                  .map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        onClose();
                        onLesson(lesson.id);
                      }}
                    >
                      <BookOpen size={15} />
                      {lesson.title}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
              </div>
            </section>
            <section className="dialog-section">
              <h3>似たサービスとの違い</h3>
              <p>{service.alternatives}</p>
              <div className="integration-list">
                {comparisons
                  .filter((c) => c.a === service.id || c.b === service.id)
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onClose();
                        onCompare(c.id);
                      }}
                    >
                      <GitCompareArrows size={15} />
                      {serviceMap[c.a].short} vs {serviceMap[c.b].short}
                    </button>
                  ))}
              </div>
            </section>
            <section className="callout exam-callout">
              <h3>
                <GraduationCap size={18} />
                DEA Exam Point
              </h3>
              <p>{service.exam}</p>
            </section>
            <section className="callout trap-callout">
              <h3>
                <Lightbulb size={18} />
                Common Trap
              </h3>
              <p>{service.trap}</p>
            </section>
            <section className="dialog-section">
              <h3>構成の中で確かめる</h3>
              {patterns.filter((p) => p.nodes.some((n) => n.service === service.id)).length ? (
                patterns
                  .filter((p) => p.nodes.some((n) => n.service === service.id))
                  .map((p) => (
                    <button
                      className="related-pattern"
                      key={p.id}
                      onClick={() => {
                        onClose();
                        onPattern(p.id);
                      }}
                    >
                      <span>
                        {p.name}
                        <small>{p.ja}</small>
                      </span>
                      <ArrowRight size={17} />
                    </button>
                  ))
              ) : (
                <p>
                  基盤を支える横断的な役割です。連携先のサービスと合わせて、権限・監視・データの扱いを確認しましょう。
                </p>
              )}
            </section>
            <a className="source-link" href={service.source} target="_blank" rel="noreferrer">
              AWS公式ドキュメントで確認する
              <ExternalLink size={15} />
            </a>
          </div>
        </>
      )}
    </dialog>
  );
}

export function CompareView({
  comparisonId,
  onSelect,
  onOpen,
}: {
  comparisonId: string;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const comparison = comparisons.find((c) => c.id === comparisonId) || comparisons[0];
  const a = serviceMap[comparison.a],
    b = serviceMap[comparison.b];
  return (
    <section className="compare-view">
      <div className="comparison-tabs" aria-label="サービス比較の組み合わせ">
        {comparisons.map((c) => (
          <button
            key={c.id}
            aria-pressed={c.id === comparison.id}
            className={c.id === comparison.id ? 'active' : ''}
            onClick={() => onSelect(c.id)}
          >
            {serviceMap[c.a].short}
            <span>vs</span>
            {serviceMap[c.b].short}
          </button>
        ))}
      </div>
      <div className="comparison-intro">
        <span className="eyebrow">THE DECIDING FACTOR</span>
        <h2>{comparison.title}</h2>
        <p>{comparison.decision}</p>
      </div>
      <div className="table-scroll" role="region" aria-label="サービス比較表" tabIndex={0}>
        <table className="comparison-table">
          <thead>
            <tr>
              <th scope="col">比較の観点</th>
              {[a, b].map((s) => (
                <th scope="col" key={s.id}>
                  <button onClick={() => onOpen(s.id)}>
                    {s.name}
                    <ArrowUpRight size={16} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonDimensions.map((d, i) => (
              <tr key={d}>
                <th scope="row">{d}</th>
                <td>{comparison.aValues[i]}</td>
                <td>{comparison.bValues[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="callout trap-callout">
        <h3>
          <Lightbulb size={18} />
          覚えるのは「選択の条件」
        </h3>
        <p>{comparison.trap}</p>
      </div>
      <div className="comparison-sources">
        <span>詳細と公式資料</span>
        <button onClick={() => onOpen(a.id)}>
          {a.short}
          <ArrowUpRight size={15} />
        </button>
        <button onClick={() => onOpen(b.id)}>
          {b.short}
          <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  );
}

export function QuizView({
  index,
  setIndex,
  answers,
  setAnswers,
  onPattern,
  onOpen,
}: {
  index: number;
  setIndex: (index: number) => void;
  answers: Record<string, string>;
  setAnswers: Dispatch<SetStateAction<Record<string, string>>>;
  onPattern: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const quiz = quizzes[index];
  const submitted = answers[quiz.id];
  const answered = Object.keys(answers).length;
  const correct = quizzes.filter((q) => answers[q.id] === q.answer).length;
  const pattern = patterns.find((p) => p.id === quiz.pattern)!;
  const blankNode = pattern.nodes.find((n) => n.id === quiz.blank);
  function selectQuestion(i: number) {
    setIndex(i);
    setChoice(null);
    document.querySelector('.quiz-main')?.scrollIntoView({ block: 'start' });
  }
  return (
    <section className="quiz-layout">
      <aside className="quiz-list">
        <div className="quiz-progress">
          <span className="eyebrow">SCENARIO PRACTICE</span>
          <strong>
            {answered}
            <small> / {quizzes.length} 問を確認</small>
          </strong>
          <div className="progress-track">
            <i style={{ width: `${(answered / quizzes.length) * 100}%` }} />
          </div>
          <p>正解 {correct} 問 · 理由まで確認しよう</p>
        </div>
        {quizzes.map((q, i) => (
          <button
            key={q.id}
            className={index === i ? 'active' : ''}
            onClick={() => selectQuestion(i)}
          >
            <span>
              {answers[q.id] ? (
                answers[q.id] === q.answer ? (
                  <Check size={15} />
                ) : (
                  <Info size={15} />
                )
              ) : (
                String(i + 1).padStart(2, '0')
              )}
            </span>
            <span>{q.title}</span>
            <ChevronRight size={13} />
          </button>
        ))}
      </aside>
      <div className="quiz-main">
        <section className="scenario-card">
          <div className="scenario-meta">
            <span className="eyebrow">SCENARIO {String(index + 1).padStart(2, '0')}</span>
            <span>単一選択 · オリジナル問題</span>
          </div>
          <h2>{quiz.title}</h2>
          <p>{quiz.scenario}</p>
          <div className="keyword-row">
            {quiz.keywords.map((k) => (
              <span key={k}>{k}</span>
            ))}
          </div>
          {blankNode && (
            <div className="mini-flow" aria-label="構成の空欄問題">
              {pattern.nodes.map((n) => (
                <div key={n.id} className={n.id === quiz.blank ? 'blank-node' : ''}>
                  <span>
                    {n.id === quiz.blank ? '?' : n.service ? serviceMap[n.service].short : n.label}
                  </span>
                  <small>{n.subtitle}</small>
                </div>
              ))}
            </div>
          )}
          <p className="quiz-diagram-note">
            {blankNode
              ? '図はサービスの役割を並べたものです。実際の接続・分岐は解説後の構成図で確認できます。'
              : '問題文の「データの種類」と「必要な操作」に注目してください。'}
          </p>
          <fieldset className="answer-options" disabled={!!submitted}>
            <legend>最も要件に合うサービスは？</legend>
            {quiz.options.map((o, i) => (
              <label
                key={o.service}
                className={`${(submitted || choice) === o.service ? 'chosen' : ''} ${submitted && o.service === quiz.answer ? 'correct' : ''} ${submitted === o.service && submitted !== quiz.answer ? 'incorrect' : ''}`}
              >
                <input
                  type="radio"
                  name={`answer-${quiz.id}`}
                  value={o.service}
                  checked={(submitted || choice) === o.service}
                  onChange={() => setChoice(o.service)}
                />
                <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
                <span>{serviceMap[o.service].name}</span>
                {submitted && o.service === quiz.answer && <CheckCircle2 size={19} />}
              </label>
            ))}
          </fieldset>
          {!submitted && (
            <button
              className="primary-button"
              disabled={!choice}
              onClick={() => {
                if (choice) setAnswers((prev) => ({ ...prev, [quiz.id]: choice }));
              }}
            >
              理由を確認する
              <ArrowRight size={16} />
            </button>
          )}
        </section>
        {submitted && (
          <section className="answer-explanation" aria-live="polite">
            <div className={`answer-status ${submitted === quiz.answer ? 'success' : 'review'}`}>
              <GraduationCap size={22} />
              <div>
                <h3>
                  {submitted === quiz.answer
                    ? '正解です。選ぶ理由を確かめよう。'
                    : '選択の条件を、もう一度確認しよう。'}
                </h3>
                <p>このシナリオの候補：{serviceMap[quiz.answer].name}</p>
              </div>
            </div>
            {quiz.options.map((o) => (
              <div className="option-reason" key={o.service}>
                <h4>
                  {o.service === quiz.answer ? <CheckCircle2 size={17} /> : <Info size={17} />}
                  <button onClick={() => onOpen(o.service)}>
                    {serviceMap[o.service].short}
                    <ArrowUpRight size={14} />
                  </button>
                  <span>{o.service === quiz.answer ? '選ぶ理由' : 'この条件で優先しない理由'}</span>
                </h4>
                <p>{o.reason}</p>
              </div>
            ))}
            <div className="quiz-actions">
              <button className="secondary-button" onClick={() => onPattern(quiz.pattern)}>
                構成図で確かめる
                <ArrowUpRight size={16} />
              </button>
              {index < quizzes.length - 1 ? (
                <button className="primary-button" onClick={() => selectQuestion(index + 1)}>
                  次のシナリオ
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button className="secondary-button" onClick={() => selectQuestion(0)}>
                  最初のシナリオへ
                </button>
              )}
            </div>
          </section>
        )}
        {answered === quizzes.length && (
          <div className="callout exam-callout">
            <h3>すべてのシナリオを確認しました</h3>
            <p>
              正解 {correct} / {quizzes.length}{' '}
              問。迷ったサービスは比較画面で、判断の条件を振り返りましょう。
            </p>
            <button
              className="text-button"
              onClick={() => {
                setAnswers({});
                selectQuestion(0);
              }}
            >
              もう一度取り組む
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
