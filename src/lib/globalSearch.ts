import { sb } from './supabase';

const $ = (s: string) => document.querySelector(s) as HTMLElement;

const escapeHtml = (t = '') => t.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m as keyof typeof m]));

const debounce = (fn: (...a: any[]) => any, ms = 350) => {
  let t: any;
  return (...a: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

function render(rows: any[] = []) {
  const drop = $('#searchDrop');
  if (!drop) return;
  
  if (!rows.length) {
    drop.innerHTML = '';
    drop.classList.add('hidden');
    return;
  }
  
  drop.innerHTML = rows.map(r => `
    <div class="search-item" data-type="${r.type}" data-id="${r.id}">
      <div><span class="t">${escapeHtml(r.title || '')}</span><span class="tag">${escapeHtml(r.type)}</span></div>
      <div class="s">${escapeHtml(r.subtitle || '')}</div>
    </div>`).join('');
  drop.classList.remove('hidden');
}

async function doSearch(term: string) {
  term = term.trim();
  if (!term) {
    render([]);
    return;
  }
  
  try {
    const { data, error } = await sb.rpc('search_inventory', { q: term });
    if (error) {
      console.warn('Search RPC not available:', error.message);
      render([]);
      return;
    }
    render(data || []);
  } catch (err) {
    console.warn('Search failed, RPC may not be available:', err);
    render([]);
  }
}

export function initGlobalSearch() {
  const input = $('#globalSearch') as HTMLInputElement;
  const drop = $('#searchDrop');
  
  if (!input || !drop) {
    console.warn('Global search elements not found');
    return;
  }

  input.addEventListener('input', debounce((e: Event) => {
    const target = e.target as HTMLInputElement;
    doSearch(target.value);
  }));

  document.addEventListener('click', (e) => {
    if (!drop.contains(e.target as Node) && e.target !== input) {
      drop.classList.add('hidden');
    }
  });

  drop.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.search-item') as HTMLElement;
    if (!item) return;
    
    const type = item.dataset.type;
    const id = item.dataset.id;
    console.log('open', type, id); // TODO: ניתוב למסך המתאים
    drop.classList.add('hidden');
  });
}