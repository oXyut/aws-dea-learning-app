import { lessons } from './curriculum';
import { patterns } from './patterns';
import { comparisons } from './comparisons';

export type View = 'home' | 'learn' | 'patterns' | 'services' | 'compare' | 'quiz' | 'advanced';
export function readRoute(hash: string): { view: View; id?: string } {
  const [view, id] = hash.replace(/^#/, '').split('/');
  if (!view || view === 'home') return { view: 'home' };
  if (view === 'learn')
    return { view, id: lessons.some((lesson) => lesson.id === id) ? id : lessons[0].id };
  if (view === 'patterns')
    return { view, id: patterns.some((pattern) => pattern.id === id) ? id : patterns[0].id };
  if (view === 'compare')
    return {
      view,
      id: comparisons.some((comparison) => comparison.id === id) ? id : comparisons[0].id,
    };
  if (view === 'services' || view === 'quiz' || view === 'advanced') return { view };
  return { view: 'home' };
}
