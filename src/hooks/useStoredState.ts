import { useEffect, useState } from 'react';

// A failed storage operation must not prevent studying (private mode, quota, corrupt JSON).
export function useStoredState<T>(key: string, empty: T, parse: (value: unknown) => T | null) {
  const [initial] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return { value: empty, warning: '' };
      const parsed = parse(JSON.parse(raw));
      if (parsed === null) throw new Error('Invalid saved data');
      return { value: parsed, warning: '' };
    } catch {
      return {
        value: empty,
        warning: '保存データを読み込めませんでした。この画面では学習を続けられます。',
      };
    }
  });
  const [state, setState] = useState(initial.value);
  const [warning, setWarning] = useState(initial.warning);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      setWarning(initial.warning);
    } catch {
      setWarning('このブラウザには進捗を保存できません。再読み込みすると今回の変更は失われます。');
    }
  }, [key, state, initial.warning]);
  return [state, setState, warning] as const;
}
