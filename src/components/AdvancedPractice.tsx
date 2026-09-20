import { useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Info,
  RotateCcw,
} from 'lucide-react';
import { advancedQuizzes, isAdvancedAnswerCorrect } from '../data/advancedQuizzes';
import { serviceMap } from '../data/services';

export function AdvancedPractice({
  onOpen,
  onPattern,
}: {
  onOpen: (id: string) => void;
  onPattern: (id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, string[]>>({});
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const quiz = advancedQuizzes[index];
  const submitted = answers[quiz.id];
  const selected = submitted ?? choices[quiz.id] ?? [];
  const answered = Object.keys(answers).length;
  const correct = advancedQuizzes.filter(
    (item) => answers[item.id] && isAdvancedAnswerCorrect(item, answers[item.id]),
  ).length;
  const isCorrect = submitted ? isAdvancedAnswerCorrect(quiz, submitted) : false;

  function selectQuestion(next: number) {
    setIndex(next);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }

  function selectOption(id: string) {
    setChoices((current) => {
      const previous = current[quiz.id] ?? [];
      const next = quiz.multiple
        ? previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
        : [id];
      return { ...current, [quiz.id]: next };
    });
  }

  function retryCurrent() {
    setAnswers((current) => {
      const next = { ...current };
      delete next[quiz.id];
      return next;
    });
    setChoices((current) => ({ ...current, [quiz.id]: [] }));
    selectQuestion(index);
  }

  function resetAll() {
    setChoices({});
    setAnswers({});
    selectQuestion(0);
  }

  return (
    <section className="quiz-layout advanced-practice">
      <aside className="quiz-list" aria-label="応用演習の問題一覧">
        <div className="quiz-progress">
          <span className="eyebrow">APPLIED PRACTICE</span>
          <strong>
            {answered}
            <small> / {advancedQuizzes.length} 問を確認</small>
          </strong>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="確認済みの問題数"
            aria-valuemin={0}
            aria-valuemax={advancedQuizzes.length}
            aria-valuenow={answered}
          >
            <i style={{ width: `${(answered / advancedQuizzes.length) * 100}%` }} />
          </div>
          <p>正解 {correct} 問 · 複数選択は完全一致で判定</p>
          <button
            className="text-button advanced-reset"
            onClick={resetAll}
            disabled={answered === 0 && Object.keys(choices).length === 0}
          >
            <RotateCcw size={14} />
            すべての回答をリセット
          </button>
        </div>
        {advancedQuizzes.map((item, i) => {
          const result = answers[item.id];
          const correctAnswer = result && isAdvancedAnswerCorrect(item, result);
          return (
            <button
              key={item.id}
              className={index === i ? 'active' : ''}
              aria-current={index === i ? 'step' : undefined}
              onClick={() => selectQuestion(i)}
            >
              <span aria-hidden="true">
                {result ? (
                  correctAnswer ? (
                    <Check size={15} />
                  ) : (
                    <Info size={15} />
                  )
                ) : (
                  String(i + 1).padStart(2, '0')
                )}
              </span>
              <span>
                {item.title}
                <span className="sr-only">
                  {result ? (correctAnswer ? '・正解済み' : '・要復習') : '・未回答'}
                </span>
              </span>
              <ChevronRight size={13} aria-hidden="true" />
            </button>
          );
        })}
      </aside>

      <div className="quiz-main">
        <section className="scenario-card">
          <div className="scenario-meta">
            <span className="eyebrow">
              REVIEW {String(index + 1).padStart(2, '0')} / {advancedQuizzes.length}
            </span>
            <span>{quiz.multiple ? '複数選択' : '単一選択'} · オリジナル問題</span>
          </div>
          <h2 ref={heading} tabIndex={-1} className="advanced-question-heading">
            {quiz.title}
          </h2>
          <p>{quiz.scenario}</p>
          <p className="quiz-diagram-note">
            {quiz.multiple
              ? '正しい選択肢をすべて選んでください。過不足のない組合せのみ正解になります。'
              : '最も要件に合う選択肢を1つ選んでください。'}
          </p>

          <fieldset className="answer-options" disabled={!!submitted}>
            <legend>
              {quiz.multiple
                ? '適切な説明・方針はどれですか？（複数選択）'
                : '最も適切な説明・方針はどれですか？'}
            </legend>
            {quiz.options.map((option, i) => (
              <label
                key={option.id}
                className={`${selected.includes(option.id) ? 'chosen' : ''} ${submitted && option.correct ? 'correct' : ''} ${submitted && selected.includes(option.id) && !option.correct ? 'incorrect' : ''}`}
              >
                <input
                  type={quiz.multiple ? 'checkbox' : 'radio'}
                  name={`advanced-${quiz.id}`}
                  value={option.id}
                  checked={selected.includes(option.id)}
                  onChange={() => selectOption(option.id)}
                />
                <span className="answer-letter" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option.label}</span>
                {submitted && option.correct && (
                  <CheckCircle2 size={19} aria-label="正しい選択肢" />
                )}
              </label>
            ))}
          </fieldset>
          {!submitted && (
            <button
              className="primary-button"
              disabled={selected.length === 0}
              onClick={() => setAnswers((current) => ({ ...current, [quiz.id]: [...selected] }))}
            >
              回答して理由を確認する
              <ArrowRight size={16} />
            </button>
          )}
        </section>

        {submitted && (
          <section className="answer-explanation">
            <div
              className={`answer-status ${isCorrect ? 'success' : 'review'}`}
              role="status"
              aria-live="polite"
            >
              <GraduationCap size={22} />
              <div>
                <h3>
                  {isCorrect
                    ? '正解です。判断の根拠を確認しよう。'
                    : '選択の条件を、もう一度確認しよう。'}
                </h3>
                <p>
                  正しい選択肢：
                  {quiz.options
                    .flatMap((option, i) => (option.correct ? [String.fromCharCode(65 + i)] : []))
                    .join('・')}
                  {quiz.multiple ? '（すべて選択で正解）' : ''}
                </p>
              </div>
            </div>
            {quiz.options.map((option, i) => (
              <div className="option-reason" key={option.id}>
                <h4>
                  {option.correct ? <CheckCircle2 size={17} /> : <Info size={17} />}
                  <span className="advanced-reason-label">
                    {String.fromCharCode(65 + i)}. {option.label}
                  </span>
                </h4>
                <p className="advanced-option-verdict">
                  {option.correct ? '正しい選択肢' : 'この条件では不適切'} ·{' '}
                  {submitted.includes(option.id) ? 'あなたが選択' : '未選択'}
                </p>
                <p>{option.reason}</p>
              </div>
            ))}
            <div className="callout advanced-takeaway">
              <h3>判断の軸</h3>
              <p>{quiz.takeaway}</p>
            </div>
            <div className="advanced-related">
              <h3>関連するサービスで復習する</h3>
              <div className="keyword-row">
                {quiz.serviceIds.map((id) => (
                  <button className="secondary-button" key={id} onClick={() => onOpen(id)}>
                    {serviceMap[id]?.short ?? id}
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            </div>
            <div className="advanced-sources">
              <h3>公式資料で確かめる</h3>
              {quiz.sources.map((source) => (
                <a
                  className="source-link"
                  href={source.url}
                  key={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.title}
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
            <div className="quiz-actions">
              {quiz.pattern && (
                <button className="secondary-button" onClick={() => onPattern(quiz.pattern!)}>
                  構成図で確かめる
                  <ArrowUpRight size={16} />
                </button>
              )}
              <button className="secondary-button" onClick={retryCurrent}>
                <RotateCcw size={15} />
                この問題をやり直す
              </button>
              {index < advancedQuizzes.length - 1 && (
                <button className="primary-button" onClick={() => selectQuestion(index + 1)}>
                  次の問題
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </section>
        )}

        {answered === advancedQuizzes.length && (
          <div className="callout exam-callout">
            <h3>20の判断軸を確認しました</h3>
            <p>
              正解 {correct} / {advancedQuizzes.length}{' '}
              問。これは教材の確認用演習です。試験の合格率を示すものではありません。各問題は単独でやり直せます。
            </p>
            <button className="text-button" onClick={resetAll}>
              すべての回答をリセットしてもう一度
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
