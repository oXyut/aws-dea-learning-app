import { useEffect, useState } from 'react';
import {
  Workflow,
  ListChecks,
  BookOpen,
  GitCompareArrows,
  GraduationCap,
  ArrowUpRight,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Info,
  Lightbulb,
  Menu,
  X,
  ExternalLink,
  House,
} from 'lucide-react';
import { AdvancedPractice } from './components/AdvancedPractice';
import { categories, serviceMap } from './data/services';
import { patterns } from './data/patterns';
import { Curriculum } from './components/Curriculum';
import { readRoute, type View } from './data/navigation';
import { useStoredState } from './hooks/useStoredState';
import { parseBasicAnswers } from './data/practiceProgress';
import { lessons } from './data/curriculum';
import { HomePage } from './components/HomePage';
import {
  courseStorageKey,
  parseCourseProgress,
  type CourseProgress,
} from './data/learningProgress';

import { ServiceExplorer, ServiceDialog, CompareView, QuizView } from './components/LearningViews';

import { Diagram, ServiceIcon, colorFor, icons } from './components/Diagram';

export default function App() {
  const [initialRoute] = useState(() => readRoute(window.location.hash));
  const [view, setView] = useState<View>(initialRoute.view);
  const [courseProgress, setCourseProgress, courseWarning] = useStoredState<CourseProgress>(
    courseStorageKey,
    {},
    parseCourseProgress,
  );
  const [lessonId, setLessonId] = useState(
    initialRoute.view === 'learn' ? initialRoute.id! : 'foundations',
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers, practiceWarning] = useStoredState<Record<string, string>>(
    'dea-flow-lab:basic:v1',
    {},
    parseBasicAnswers,
  );
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [comparisonId, setComparisonId] = useState(
    initialRoute.view === 'compare' ? initialRoute.id! : 'athena-redshift',
  );
  const [patternId, setPatternId] = useState(
    initialRoute.view === 'patterns' ? initialRoute.id! : 'serverless-lake',
  );
  const [nodeId, setNodeId] = useState('raw');
  const [playing, setPlaying] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const pattern = patterns.find((p) => p.id === patternId)!;
  const node = pattern.nodes.find((n) => n.id === nodeId) || pattern.nodes[0];
  const service = node.service ? serviceMap[node.service] : undefined;
  useEffect(() => {
    function restoreRoute() {
      // The skip link is an in-page anchor, not an application route.
      if (window.location.hash === '#main-content') return;
      const route = readRoute(window.location.hash);
      setView(route.view);
      if (route.view === 'learn') setLessonId(route.id!);
      if (route.view === 'patterns') {
        setPatternId(route.id!);
        setNodeId(patterns.find((entry) => entry.id === route.id)!.nodes[0].id);
      }
      if (route.view === 'compare') setComparisonId(route.id!);
      setServiceId(null);
      setMobileMenu(false);
    }
    window.addEventListener('hashchange', restoreRoute);
    return () => window.removeEventListener('hashchange', restoreRoute);
  }, []);
  function navigate(next: View, id?: string) {
    setView(next);
    setMobileMenu(false);
    const targetId =
      id ??
      (next === 'learn'
        ? lessonId
        : next === 'patterns'
          ? patternId
          : next === 'compare'
            ? comparisonId
            : undefined);
    window.location.hash = `${next}${targetId ? `/${targetId}` : ''}`;
    window.scrollTo({ top: 0 });
  }
  function openLesson(id: string) {
    setLessonId(id);
    setServiceId(null);
    navigate('learn', id);
    requestAnimationFrame(() => {
      const heading = document.getElementById('lesson-heading');
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: 'start' });
    });
  }
  function openPattern(id: string) {
    const next = patterns.find((p) => p.id === id)!;
    setPatternId(id);
    setNodeId(next.nodes[0].id);
    navigate('patterns', id);
    window.scrollTo({ top: 0 });
  }
  function openComparison(id: string) {
    setComparisonId(id);
    navigate('compare', id);
    window.scrollTo({ top: 0 });
  }
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        本文へスキップ
      </a>
      <aside id="primary-sidebar" className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <a
          className="brand"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            navigate('home');
          }}
        >
          <span className="brand-mark">
            <Workflow size={24} />
          </span>
          <span>
            DEA <b>Flow Lab</b>
            <small>AWS DATA ENGINEERING</small>
          </span>
        </a>
        <div className="course-label">LEARNING WORKSPACE</div>
        <nav>
          {(
            [
              { id: 'home', label: 'トップページ', en: 'Start here', icon: House },
              { id: 'learn', label: '体系的に学ぶ', en: 'Learning path', icon: BookOpen },
              {
                id: 'patterns',
                label: 'アーキテクチャ',
                en: 'Architecture patterns',
                icon: Workflow,
              },
              { id: 'services', label: 'サービスを知る', en: 'Service explorer', icon: BookOpen },
              {
                id: 'compare',
                label: 'サービスを比較',
                en: 'Compare services',
                icon: GitCompareArrows,
              },
              {
                id: 'quiz',
                label: '基礎シナリオ',
                en: 'Scenario practice',
                icon: GraduationCap,
              },
              { id: 'advanced', label: '応用シナリオ', en: 'Applied practice', icon: ListChecks },
            ] as const
          ).map((item) => (
            <button
              aria-current={view === item.id ? 'page' : undefined}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              key={item.id}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={19} />
              <span>
                {item.label}
                <small>{item.en}</small>
              </span>
              {view === item.id && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-course">
          <span className="course-badge">DEA-C01</span>
          <h3>つながりから、理解する。</h3>
          <p>
            サービスの名前から、
            <br />
            サービスを選ぶ理由へ。
          </p>
          <div className="course-route">
            <span>理解</span>
            <i />
            <span>比較</span>
            <i />
            <span>判断</span>
          </div>
        </div>
        <div className="sidebar-footer">
          <span className="local-status" />
          DEA-C01 学習ワークスペース<small>独自教材 · AWS非公式</small>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="menu-overlay"
          aria-label="メニューを閉じる"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-toggle icon-button"
            aria-label={mobileMenu ? 'メニューを閉じる' : 'メニューを開く'}
            aria-controls="primary-sidebar"
            aria-expanded={mobileMenu}
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={13} />
            <span>
              {view === 'home'
                ? 'トップページ'
                : view === 'learn'
                  ? 'Learning path'
                  : view === 'patterns'
                    ? 'Architecture patterns'
                    : view === 'services'
                      ? 'Service explorer'
                      : view === 'compare'
                        ? 'Compare services'
                        : view === 'advanced'
                          ? 'Applied practice'
                          : 'Scenario practice'}
            </span>
          </div>
          <span className="exam-badge">
            <GraduationCap size={15} /> AWS Certified Data Engineer <b>ASSOCIATE</b>
          </span>
        </header>
        <main id="main-content" tabIndex={-1}>
          {view === 'home' ? (
            <HomePage
              progress={courseProgress}
              warning={courseWarning}
              onNavigate={navigate}
              onLesson={openLesson}
            />
          ) : (
            <div className="page-heading">
              <div className="eyebrow">LEARN THE CONNECTIONS</div>
              <div className="heading-line">
                <h1>
                  {view === 'learn'
                    ? '基礎から、判断できる知識へ。'
                    : view === 'patterns'
                      ? 'データの流れから、理解する。'
                      : view === 'services'
                        ? 'サービスを知る。役割が見える。'
                        : view === 'compare'
                          ? '似ているサービス、選ぶ理由は違う。'
                          : view === 'advanced'
                            ? '条件を見抜き、判断を深める。'
                            : '要件を読んで、構成を選ぶ。'}
                </h1>
                <span className="edition">DEA-C01 LEARNING GUIDE</span>
              </div>
              <p>
                {view === 'learn'
                  ? `${lessons.length}章の本文・具体例・確認問題で、DEA-C01の4分野を順に学びます。`
                  : view === 'patterns'
                    ? 'どこに保存し、どこで変換し、どう分析するのか。構成をたどって、サービスを選ぶ理由を学びましょう。'
                    : view === 'services'
                      ? 'できることだけでなく、向いていない用途まで。データ基盤の中での役割を確かめましょう。'
                      : view === 'compare'
                        ? 'キーワードを丸暗記せず、利用頻度・処理方式・運用負荷から判断しましょう。'
                        : view === 'advanced'
                          ? '運用・権限・データの寿命まで。20のオリジナルシナリオで、選ぶ理由と選ばない理由を確かめましょう。'
                          : '実際の試験問題ではなく、サービスの選択理由を考えるためのオリジナルシナリオです。'}
              </p>
            </div>
          )}
          {view !== 'learn' && view !== 'home' && (
            <div className="category-strip">
              {categories.map((c) => {
                const Icon = icons[c.id];
                return (
                  <div key={c.id} style={{ '--accent': c.color } as React.CSSProperties}>
                    <Icon size={15} />
                    <span>{c.name}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div hidden={view !== 'learn'}>
            <Curriculum
              progress={courseProgress}
              setProgress={setCourseProgress}
              warning={courseWarning}
              lessonId={lessonId}
              onLesson={openLesson}
              onOpen={setServiceId}
              onPattern={openPattern}
              onPractice={() => navigate('advanced')}
            />
          </div>
          {view === 'patterns' ? (
            <>
              <div className="applied-banner">
                <div>
                  <span className="eyebrow">TAKE THE NEXT STEP</span>
                  <strong>つながりを理解したら、運用と設計の判断へ。</strong>
                  <p>
                    データの保持、処理の遅延、細かな権限。条件が変わったときの選び方を学びます。
                  </p>
                </div>
                <button className="secondary-button" onClick={() => navigate('advanced')}>
                  応用20シナリオへ <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="section-heading">
                <h2>
                  <Workflow size={18} />
                  アーキテクチャを探索
                </h2>
                <span>
                  {patterns.length} patterns <i /> ノードを選んで役割を確認
                </span>
              </div>
              <div className="workspace">
                <section className="pattern-list" aria-label="アーキテクチャパターン">
                  <div className="list-heading">
                    PATTERNS <span>{String(patterns.length).padStart(2, '0')}</span>
                  </div>
                  {patterns.map((p, i) => (
                    <button
                      aria-pressed={p.id === patternId}
                      key={p.id}
                      className={`pattern-option ${p.id === patternId ? 'active' : ''}`}
                      onClick={() => {
                        openPattern(p.id);
                      }}
                    >
                      <span className="pattern-index">{String(i + 1).padStart(2, '0')}</span>
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.ja}</small>
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                  <div className="list-tip">
                    <Lightbulb size={16} />
                    <p>
                      実データとメタデータ。
                      <br />
                      線の違いにも注目しよう。
                    </p>
                  </div>
                </section>
                <div className="pattern-main">
                  <section className="canvas-card">
                    <div className="canvas-header">
                      <div>
                        <span className="overline">
                          PATTERN {String(patterns.indexOf(pattern) + 1).padStart(2, '0')}
                        </span>
                        <h2>
                          {pattern.name}
                          <span className="subtle-tag">{pattern.tag}</span>
                        </h2>
                      </div>
                      <div className="canvas-actions">
                        <button
                          className="icon-button"
                          aria-label={playing ? 'アニメーションを停止' : 'アニメーションを再生'}
                          title={playing ? 'アニメーションを停止' : 'アニメーションを再生'}
                          onClick={() => setPlaying(!playing)}
                        >
                          {playing ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                          className="icon-button"
                          aria-label="最初のステップへ"
                          title="最初のステップへ"
                          onClick={() => setNodeId(pattern.nodes[0].id)}
                        >
                          <RotateCcw size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="pattern-description">{pattern.description}</p>
                    <Diagram
                      pattern={pattern}
                      selected={node.id}
                      onSelect={setNodeId}
                      playing={playing}
                    />
                    <div className="canvas-footer">
                      <div className="legend">
                        <span>
                          <i className="data" />
                          実データ
                        </span>
                        <span>
                          <i className="metadata" />
                          メタデータ
                        </span>
                        <span>
                          <i className="event" />
                          制御・イベント
                        </span>
                      </div>
                      <span className="canvas-hint">
                        <Info size={13} />
                        ノードをクリックして詳しく
                      </span>
                    </div>
                  </section>
                  <div className="detail-grid">
                    <section
                      className="role-card"
                      style={{ '--accent': colorFor(service) } as React.CSSProperties}
                    >
                      <div className="role-title">
                        <span className="service-icon">
                          <ServiceIcon service={service} />
                        </span>
                        <div>
                          <span className="overline">SELECTED SERVICE</span>
                          <h3>{service?.name || node.label}</h3>
                        </div>
                      </div>
                      <span className="detail-caption">この構成での役割</span>
                      <p>{node.role}</p>
                      {service && (
                        <button className="text-button" onClick={() => setServiceId(service.id)}>
                          サービスを詳しく見る <ArrowUpRight size={16} />
                        </button>
                      )}
                    </section>
                    <section className="reason-card">
                      <span className="eyebrow">
                        <Lightbulb size={14} />
                        WHY THIS ARCHITECTURE?
                      </span>
                      <h3>なぜ、この組み合わせなのか。</h3>
                      <p>{pattern.why}</p>
                      <div className="keyword-row">
                        {pattern.keywords.map((k) => (
                          <span key={k}>{k}</span>
                        ))}
                      </div>
                    </section>
                  </div>
                  <section className="walkthrough">
                    <div className="section-heading">
                      <h2>データの旅をたどる</h2>
                      <span>STEP BY STEP</span>
                    </div>
                    <div className="steps">
                      {pattern.steps.map((step, i) => (
                        <button
                          className={node.id === step.node ? 'active' : ''}
                          key={step.node}
                          onClick={() => setNodeId(step.node)}
                        >
                          <span>{String(i + 1).padStart(2, '0')}</span>
                          <div>
                            <strong>{step.title}</strong>
                            <p>{step.text}</p>
                          </div>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    </div>
                  </section>
                  <div className="detail-grid">
                    <section className="note-card">
                      <h3>
                        <GitCompareArrows size={18} />
                        他の構成では？
                      </h3>
                      <p>{pattern.alternative}</p>
                    </section>
                    <section className="note-card exam-tip">
                      <h3>
                        <GraduationCap size={18} />
                        試験では、こう見える
                      </h3>
                      <p>{pattern.exam}</p>
                    </section>
                  </div>
                  {pattern.sources && (
                    <div className="lesson-sources">
                      <span>この構成の公式資料</span>
                      {pattern.sources.map((source) => (
                        <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                          {source.title}
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : view === 'services' ? (
            <ServiceExplorer onOpen={setServiceId} />
          ) : view === 'compare' ? (
            <CompareView
              comparisonId={comparisonId}
              onSelect={openComparison}
              onOpen={setServiceId}
            />
          ) : view === 'quiz' ? (
            <QuizView
              index={quizIndex}
              setIndex={setQuizIndex}
              answers={answers}
              setAnswers={setAnswers}
              onPattern={openPattern}
              onOpen={setServiceId}
            />
          ) : null}
          <div hidden={view !== 'advanced'}>
            <AdvancedPractice onOpen={setServiceId} onPattern={openPattern} />
          </div>
          {view === 'quiz' && (
            <p className="course-storage-note" role="status">
              {practiceWarning || '確定した回答はこのブラウザに自動保存します。'}
            </p>
          )}
          <footer className="page-footer">
            <span>
              DEA Flow Lab <i /> サービスを覚える。その先へ。
            </span>
            <a
              href="https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html"
              target="_blank"
              rel="noreferrer"
            >
              AWS公式 試験ガイド <ExternalLink size={12} />
            </a>
          </footer>
        </main>
      </div>
      <ServiceDialog
        serviceId={serviceId}
        onClose={() => setServiceId(null)}
        onOpen={setServiceId}
        onPattern={openPattern}
        onCompare={openComparison}
        onLesson={openLesson}
      />
    </div>
  );
}
