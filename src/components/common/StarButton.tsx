import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  leadId: string;
  className?: string;
  title?: string;
};

const r = (k: string) => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(k) || '[]'));
  } catch {
    return new Set();
  }
};

const w = (k: string, s: Set<string>) => localStorage.setItem(k, JSON.stringify([...s]));

const keyFor = (email: string) => 
  localStorage.getItem('favorites') ? 'favorites' : `favorites:${(email || 'guest').toLowerCase()}`;

export default function StarButton({ leadId, className, title }: Props) {
  const { email } = useAuth();
  const key = useMemo(() => keyFor(email || ''), [email]);
  const [set, setSet] = useState<Set<string>>(new Set());
  const starred = set.has(leadId);

  useEffect(() => {
    setSet(r(key));
    const f = () => setSet(r(key));
    window.addEventListener('favorites:changed', f);
    return () => window.removeEventListener('favorites:changed', f);
  }, [key]);

  const toggle = () => {
    const next = new Set(set);
    next.has(leadId) ? next.delete(leadId) : next.add(leadId);
    w(key, next);
    setSet(next);
    window.dispatchEvent(new CustomEvent('favorites:changed'));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={title || (starred ? 'הסר ממעקב' : 'הוסף למעקב')}
      className={className || 'p-1'}
      aria-pressed={starred}
      data-testid="star-btn"
      style={{ color: starred ? '#f6c000' : '#bdbdbd' }}
    >
      {starred ? '★' : '☆'}
    </button>
  );
}