function muatDataAnime() {
  return (async () => {
    try {
      const response = await fetch('data/anime.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Yah, gagal muat data anime.json');
      return response.json();
    } catch (err) {
      // Cadangan buat file:// (fetch suka diblok browser).
      const fallback = window.__DATA_ANIME__ || window.__ANIME_DATA__;
      if (fallback && typeof fallback === 'object') return fallback;
      throw err;
    }
  })();
}

function parseIdAnimeMal(value) {
  if (!value) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const num = Number(value.trim());
    if (Number.isFinite(num) && num > 0) return num;
  }
  if (typeof value === 'object') {
    const id = Number(value.id);
    if (Number.isFinite(id) && id > 0) return id;
    const url = String(value.url || value.href || '').trim();
    const idMatch = url.match(/\/anime\/(\d+)(?:\/|$)/i);
    if (idMatch) return Number(idMatch[1]);
  }
  return null;
}

function formatRating(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(2);
  const num = Number(String(value || '').trim());
  if (Number.isFinite(num) && num > 0) return num.toFixed(2);
  return '—';
}

function starText(ratingText) {
  const t = String(ratingText || '').trim();
  if (!t || t === '—') return '★ —';
  return `★ ${t}`;
}

function translateMusim(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const key = raw.toLowerCase();

  // Kalau udah Indonesia, biarin.
  if (key.startsWith('musim ')) return raw;

  if (key === 'winter') return 'Musim Dingin';
  if (key === 'spring') return 'Musim Semi';
  if (key === 'summer') return 'Musim Panas';
  if (key === 'fall' || key === 'autumn') return 'Musim Gugur';

  return raw;
}

async function ambilMetaDariJikan(malAnimeId) {
  const cacheKey = `jikanMeta:${malAnimeId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  const res = await fetch(`https://api.jikan.moe/v4/anime/${malAnimeId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Yah, gagal ambil meta dari MAL');
  const json = await res.json();
  const data = json?.data;

  const score = data?.score;
  const year =
    (typeof data?.year === 'number' && Number.isFinite(data.year))
      ? data.year
      : (data?.aired?.from ? new Date(data.aired.from).getFullYear() : null);

  const result = { score, year };
  sessionStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}
