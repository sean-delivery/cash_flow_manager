export type FavId = string;

const LS = (e: string) => `favorites:${(e || 'guest').toLowerCase()}`;

async function ping(u: string) {
  try {
    const r = await fetch(u, { method: 'GET' });
    return r.ok;
  } catch {
    return false;
  }
}

export async function detectStore() {
  // 1) עמודת starred בטבלת leads
  if (await ping('/rest/v1/leads?select=id,starred&limit=1')) {
    return { mode: 'column' as const, base: '/rest/v1/leads' };
  }
  
  // 2) טבלאות קישור נפוצות
  for (const t of ['favorites', 'leads_favorites', 'watchlist', 'tracked_leads']) {
    if (await ping(`/rest/v1/${t}?select=lead_id&limit=0`)) {
      return { mode: 'table' as const, base: `/rest/v1/${t}` };
    }
  }
  
  return null; // DB לא זמין/לא קיים אחסון – נשתמש בלוקאלי בלבד
}

export function getLocal(email: string) {
  try {
    return new Set<FavId>(JSON.parse(localStorage.getItem(LS(email)) || '[]'));
  } catch {
    return new Set();
  }
}

export function setLocal(email: string, s: Set<FavId>) {
  localStorage.setItem(LS(email), JSON.stringify([...s]));
}

export async function getDb() {
  const d = await detectStore();
  if (!d) return new Set<FavId>();
  
  try {
    if (d.mode === 'column') {
      const rows = await (await fetch(`${d.base}?select=id,starred&starred=eq.true&limit=1000`)).json();
      return new Set(rows.map((r: any) => String(r.id)));
    } else {
      const rows = await (await fetch(`${d.base}?select=lead_id&limit=1000`)).json();
      return new Set(rows.map((r: any) => String(r.lead_id)));
    }
  } catch {
    return new Set<FavId>();
  }
}

export async function setDb(id: FavId, on: boolean) {
  const d = await detectStore();
  if (!d) return;
  
  try {
    if (d.mode === 'column') {
      await fetch(`${d.base}?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ starred: on })
      });
    } else {
      const base = d.base;
      if (on) {
        await fetch(base, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
          body: JSON.stringify([{ lead_id: id }])
        });
      } else {
        await fetch(`${base}?lead_id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 'Prefer': 'return=minimal' }
        });
      }
    }
  } catch (error) {
    console.warn('Failed to sync favorite to DB:', error);
  }
}

export async function syncFavorites(email: string) {
  // מיזוג: לוקאלי → DB (בלי מחיקות), ואז שליפה עדכנית
  const local = getLocal(email);
  const db = await getDb();
  
  // העלה מועדפים מקומיים ל-DB
  for (const id of local) {
    if (!db.has(id)) {
      await setDb(id, true);
    }
  }
  
  // קבל מצב עדכני מ-DB
  const merged = await getDb();
  const union = new Set<FavId>([...merged, ...local]);
  setLocal(email, union);
  return union;
}

export async function toggleFavorite(email: string, id: FavId, on: boolean) {
  // עדכן DB
  await setDb(id, on);
  
  // עדכן לוקאלי
  const s = getLocal(email);
  on ? s.add(id) : s.delete(id);
  setLocal(email, s);
  return s;
}

// Back-compat for old imports
export async function loadFavorites(email: string) {
  const merged = await syncFavorites(email);
  return merged.size ? merged : getLocal(email);
}

// Back-compat: some code imports `saveFavorite`
export async function saveFavorite(a: any, b?: any, c?: any) {
  // supports both: saveFavorite(email, id, on)  and  saveFavorite(id, on)
  let email = '', id: string, on: boolean;
  if (typeof c === 'boolean') { email = String(a||''); id = String(b); on = c; }
  else { id = String(a); on = Boolean(b); }
  return toggleFavorite(email, id, on);
}