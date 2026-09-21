import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  GitCompareArrows,
  GraduationCap,
  Layers,
  Search,
  Workflow,
} from 'lucide-react';
import { lessons } from '../data/curriculum';
import { patterns } from '../data/patterns';
import { services } from '../data/services';
import { comparisons } from '../data/comparisons';
import { quizzes } from '../data/quizzes';
import { advancedQuizzes } from '../data/advancedQuizzes';
import { isLessonComplete, type CourseProgress } from '../data/learningProgress';
import type { View } from '../data/navigation';

export function HomePage({
  progress,
  warning,
  onNavigate,
  onLesson,
}: {
  progress: CourseProgress;
  warning: string;
  onNavigate: (view: View) => void;
  onLesson: (id: string) => void;
}) {
  const complete = lessons.filter((lesson) => isLessonComplete(lesson, progress[lesson.id])).length;
  const started = lessons.some(
    (lesson) =>
      progress[lesson.id]?.read || Object.keys(progress[lesson.id]?.answers ?? {}).length > 0,
  );
  const next = lessons.find((lesson) => !isLessonComplete(lesson, progress[lesson.id]));

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="home-intro">
          <div className="home-eyebrow">
            <span /> AWS DEA-C01 学習ガイド
          </div>
          <h1 id="home-heading">
            AWSのデータ基盤を、
            <br />
            <em>基礎から学ぶ。</em>
          </h1>
          <p className="home-description">
            AWS Certified Data Engineer –
            Associate（DEA-C01）に向けた学習サイトです。サービスの役割、データの流れ、要件に合う選び方を、解説・図・問題で学べます。
          </p>
          <div className="home-start">
            <span className="home-start-label">
              {started ? '学習を再開する方へ' : '初めての方は、ここから'}
            </span>
            <button
              className="primary-button home-primary"
              onClick={() => (next ? onLesson(next.id) : onNavigate('advanced'))}
            >
              {started
                ? next
                  ? '未完了の章から学習を続ける'
                  : '応用シナリオで理解を確かめる'
                : '第1章から学習を始める'}{' '}
              <ArrowRight size={19} />
            </button>
            <p>
              {started
                ? next
                  ? `次の未完了章：${next.title}`
                  : '全章の本文と確認問題を確認済みです。'
                : '専門用語がわからなくても大丈夫。まずはデータ基盤の言葉から。'}
            </p>
          </div>
          <div className="home-benefits">
            <span>
              <CheckCircle2 size={14} /> AWSアカウント不要
            </span>
            <span>
              <CheckCircle2 size={14} /> 自分のペースで学べる
            </span>
          </div>
        </div>
        <div className="home-outcomes">
          <span className="eyebrow">このサイトで身につけること</span>
          <h2>
            名前を知るところから、
            <br />
            選ぶ理由を話せるところまで。
          </h2>
          <ol>
            <li>
              <span className="home-outcome-icon">
                <Layers size={21} />
              </span>
              <div>
                <small>01 · 役割を知る</small>
                <strong>「何をするサービス？」がわかる</strong>
                <p>S3、Glue、Athenaなどの用途と違いを知る。</p>
              </div>
            </li>
            <li>
              <span className="home-outcome-icon">
                <Workflow size={21} />
              </span>
              <div>
                <small>02 · つながりをつかむ</small>
                <strong>データがどう流れるか、見える</strong>
                <p>保存・変換・分析の役割を構成図でたどる。</p>
              </div>
            </li>
            <li>
              <span className="home-outcome-icon">
                <Compass size={21} />
              </span>
              <div>
                <small>03 · 条件から判断する</small>
                <strong>「なぜこれを選ぶ？」に答える</strong>
                <p>要件と制約を読み、選択肢の理由を説明する。</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {started && (
        <section className="home-progress" aria-label="学習の進捗">
          <div>
            <BookOpen size={20} />
            <span>
              学習コースの確認状況
              <strong>
                {complete}
                <small> / {lessons.length} 章</small>
              </strong>
            </span>
          </div>
          <div className="home-progress-meter">
            <progress value={complete} max={lessons.length} aria-label="確認済みの章数" />
            <p>既読＋章末の全問正解で確認済みになります。試験の習得率ではありません。</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('learn')}>
            章一覧と進捗を見る <ArrowRight size={15} />
          </button>
        </section>
      )}
      {warning && (
        <p className="home-storage-warning" role="status">
          {warning}
        </p>
      )}

      <section className="home-paths" aria-labelledby="home-paths-heading">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">目的に合う入口を選ぶ</span>
            <h2 id="home-paths-heading">今日は、どう学びますか？</h2>
          </div>
          <p>迷ったら「順番に学ぶ」がおすすめです。</p>
        </div>
        <div className="home-path-grid">
          <article className="home-path-card home-path-recommended">
            <div className="home-path-top">
              <BookOpen size={23} />
              <span className="home-recommendation">初めての方におすすめ</span>
            </div>
            <h3>基礎から順番に学びたい</h3>
            <p>
              読む順番に迷わず、用語から設計の判断まで。本文と具体例を読み、章末の問題で確かめます。
            </p>
            <div className="home-course-preview">
              <span>基礎の言葉</span>
              <ArrowRight size={13} />
              <span>4つの学習分野</span>
              <ArrowRight size={13} />
              <span>理解の確認</span>
            </div>
            <div className="home-path-links">
              <button onClick={() => onNavigate('learn')}>
                <span>
                  <strong>順番に学ぶ</strong>
                  <small>全{lessons.length}章の学習コース・用語辞典</small>
                </span>
                <ArrowRight size={18} />
              </button>
            </div>
          </article>
          <article className="home-path-card">
            <div className="home-path-top">
              <Search size={23} />
              <span>疑問を解消したい方へ</span>
            </div>
            <h3>気になることを調べたい</h3>
            <p>サービスの役割、組み合わせ、似たサービスの違い。知りたいことに合わせて選べます。</p>
            <div className="home-path-links">
              <button onClick={() => onNavigate('services')}>
                <BookOpen size={17} />
                <span>
                  <strong>サービスの役割を調べる</strong>
                  <small>{services.length}サービスの用途・得意なこと・制約</small>
                </span>
                <ArrowRight size={17} />
              </button>
              <button onClick={() => onNavigate('patterns')}>
                <Workflow size={17} />
                <span>
                  <strong>構成図で全体像を見る</strong>
                  <small>{patterns.length}構成のデータの流れをたどる</small>
                </span>
                <ArrowRight size={17} />
              </button>
              <button onClick={() => onNavigate('compare')}>
                <GitCompareArrows size={17} />
                <span>
                  <strong>似たサービスの違いを比べる</strong>
                  <small>{comparisons.length}組を用途・コスト・運用で比較</small>
                </span>
                <ArrowRight size={17} />
              </button>
            </div>
          </article>
          <article className="home-path-card">
            <div className="home-path-top">
              <GraduationCap size={23} />
              <span>学んだことを試したい方へ</span>
            </div>
            <h3>理解できたか確かめたい</h3>
            <p>
              問題文の条件から答えを選びます。解答後は、正解・不正解それぞれの理由を確認できます。
            </p>
            <div className="home-path-links">
              <button onClick={() => onNavigate('quiz')}>
                <span className="home-level">基礎</span>
                <span>
                  <strong>サービス選びを練習する</strong>
                  <small>{quizzes.length}問 · 役割と用途を確認</small>
                </span>
                <ArrowRight size={17} />
              </button>
              <button onClick={() => onNavigate('advanced')}>
                <span className="home-level">応用</span>
                <span>
                  <strong>運用・設計の判断を試す</strong>
                  <small>{advancedQuizzes.length}問 · 複数選択も含むシナリオ</small>
                </span>
                <ArrowRight size={17} />
              </button>
            </div>
            <p className="home-practice-tip">
              まだ答えが浮かばなくても、解説から関連サービスや構成図へ戻れます。
            </p>
          </article>
        </div>
      </section>

      <section className="home-howto" aria-labelledby="home-howto-heading">
        <h2 id="home-howto-heading">学び方は、この3ステップ。</h2>
        <ol>
          <li>
            <span>1</span>
            <div>
              <h3>本文で理解する</h3>
              <p>用語と具体例を読み、到達目標を自分の言葉で説明する。</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <h3>図と比較でつなげる</h3>
              <p>サービス単体の知識を、データの流れや使い分けへ広げる。</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <h3>問題で確かめる</h3>
              <p>選ばない理由まで確認し、迷ったところを本文で読み直す。</p>
            </div>
          </li>
        </ol>
      </section>
      <div className="home-about">
        <span className="course-badge">DEA Flow Lab</span>
        <p>
          AWS非公式の独自教材です。AWSリソースを作成せずに学習できます。進捗はこのブラウザに保存されます。教材の範囲と到達基準は、学習コースで確認できます。
        </p>
      </div>
    </div>
  );
}
