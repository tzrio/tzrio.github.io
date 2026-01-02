function buatHrefFilterIndex(tipeFilter, nilaiFilter) {
  const type = String(tipeFilter || '').trim().toLowerCase();
  const value = String(nilaiFilter || '').trim();
  if (!type || !value) return 'index.html';
  return `index.html#${encodeURIComponent(type)}=${encodeURIComponent(value)}`;
}

function sinopsisKeBaris(text, maxLines = 6) {
  const raw = String(text || '').trim();
  if (!raw) return [];
  const cleaned = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .trim();

  const parts = cleaned
    .split(/\n+/)
    .flatMap((block) => block.split(/(?<=[.!?])\s+/));

  const lines = [];
  for (const part of parts) {
    const s = String(part || '').trim();
    if (!s) continue;
    lines.push(s);
    if (lines.length >= maxLines) break;
  }
  return lines;
}

async function cariIdAnimeJikanDariJudul(title) {
  const q = String(title || '').trim();
  if (!q) return null;

  const cacheKey = `jikanSearch:${normalisasiURIComponent(q)}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const num = Number(cached);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Yah, gagal nyari anime di MAL');
  const json = await res.json();
  const id = json?.data?.[0]?.mal_id;
  if (typeof id === 'number' && Number.isFinite(id) && id > 0) {
    sessionStorage.setItem(cacheKey, String(id));
    return id;
  }
  return null;
}

function normalisasiURIComponent(value) {
  return encodeURIComponent(String(value || '').trim().toLowerCase());
}

async function ambilAnimeDariJikan(malAnimeId) {
  const cacheKey = `jikanAnime:${malAnimeId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  const res = await fetch(`https://api.jikan.moe/v4/anime/${malAnimeId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Yah, gagal ngambil data dari MAL');
  const json = await res.json();
  const data = json?.data;
  const result = {
    score: data?.score,
    synopsis: data?.synopsis,
  };
  sessionStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}

function ambilIdAnime() {
  // 1) Query string: /anime.html?id=aot
  const params = new URLSearchParams(window.location.search);
  const fromQuery = (params.get('id') || '').trim().toLowerCase();
  if (fromQuery) return fromQuery;

  // 2) Hash: /anime.html#aot
  const fromHash = String(window.location.hash || '')
    .replace(/^#/, '')
    .trim()
    .toLowerCase();
  if (fromHash) return fromHash;

  // 3) Segmen path: /anime/aot (kepake kalau cleanUrls aktif)
  const parts = String(window.location.pathname || '')
    .split('/')
    .filter(Boolean);
  const last = (parts[parts.length - 1] || '').trim().toLowerCase();
  if (last && last !== 'anime' && last !== 'anime.html') return last;

  return '';
}

function setTeks(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '';
}

function setSampul(src, alt) {
  const img = document.getElementById('sampul-anime');
  if (!img) return;
  const s = String(src || '').trim();
  if (!s) {
    img.src = '';
    img.alt = '';
    img.style.display = 'none';
    return;
  }
  img.style.display = '';
  img.src = s;
  img.alt = alt || '';
}

function renderSinopsis(lines) {
  const tbody = document.getElementById('isi-sinopsis');
  if (!tbody) return;
  tbody.innerHTML = '';

  for (const line of lines || []) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = line;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

function renderInfo(info) {
  const tbody = document.getElementById('isi-info');
  if (!tbody) return;
  tbody.innerHTML = '';

  const statusRaw = info?.Status;
  const statusValue = (typeof statusRaw === 'object')
    ? String(statusRaw.value || statusRaw.text || '').trim().toLowerCase()
    : String(statusRaw || '').trim().toLowerCase();

  const entries = Object.entries(info || {});
  for (const [label, value] of entries) {
    if (String(label).trim().toLowerCase() === 'uploader') {
      continue;
    }

    const tr = document.createElement('tr');

    const labelNorm = String(label).trim().toLowerCase();
    const tdLabel = document.createElement('td');
    tdLabel.textContent = label;

    const tdValue = document.createElement('td');
    tdValue.textContent = ':';

    const tdContent = document.createElement('td');

    if (labelNorm === 'hari tayang' && statusValue === 'finished') {
      tdContent.textContent = 'Sudah tamat';
    } else if (labelNorm === 'musim') {
      tdContent.textContent = translateMusim(value);
    } else

    if (Array.isArray(value)) {
      // Lencana genre (bisa diklik untuk filter)
      for (const item of value) {
        const genre = String(item);
        const a = document.createElement('a');
        a.href = buatHrefFilterIndex('genre', genre);
        a.className = 'lencana-genre';
        a.textContent = genre;
        tdContent.appendChild(a);
        tdContent.appendChild(document.createTextNode(' '));
      }
    } else if (value && typeof value === 'object' && value.type === 'status') {
      const statusValue = String(value.value || value.text || '').trim();
      const statusText = String(value.text || value.value || '').trim() || '—';
      const a = document.createElement('a');
      a.href = buatHrefFilterIndex('status', statusValue);
      a.textContent = statusText;
      if (value.class) a.className = value.class;
      tdContent.appendChild(a);
    } else if (value && typeof value === 'object' && value.type === 'mal') {
      const span = document.createElement('span');
      span.textContent = 'Lagi ngambil...';
      tdContent.appendChild(span);

      const malId = parseIdAnimeMal(value);
      if (!malId) {
        span.textContent = '—';
      } else {
        ambilAnimeDariJikan(malId)
          .then((result) => {
            const score = result?.score;
            const formatted = (typeof score === 'number' && Number.isFinite(score)) ? formatRating(score) : '—';
            span.textContent = starText(formatted);
          })
          .catch(() => {
            span.textContent = '—';
          });
      }
    } else if (value && typeof value === 'object' && value.type === 'link') {
      const a = document.createElement('a');
      a.href = value.href || '#';
      a.textContent = value.text || '';
      if (value.target) a.target = value.target;
      if (a.target === '_blank') a.rel = 'noopener noreferrer';
      if (value.class) a.className = value.class;
      if (a.getAttribute('href') === '#') {
        a.addEventListener('click', (e) => e.preventDefault());
      }
      tdContent.appendChild(a);
    } else {
      tdContent.textContent = String(value ?? '');
    }

    tr.appendChild(tdLabel);
    tr.appendChild(tdValue);
    tr.appendChild(tdContent);
    tbody.appendChild(tr);
  }
}

function renderUnduhan(downloads) {
  const table = document.getElementById('tabel-unduh');
  const tbody = document.getElementById('isi-unduh');
  if (!table || !tbody) return;

  tbody.innerHTML = '';

  if (!downloads || downloads.length === 0) {
    table.style.display = 'none';
    return;
  }

  const isValidLink = (link) => {
    const text = String(link?.text ?? '').trim();
    const href = String(link?.href ?? '').trim();
    if (!text || !href) return false;
    if (text.toLowerCase() === 'x') return false;
    return true;
  };

  table.style.display = '';
  let anyValidRow = false;

  for (const group of downloads) {
    const trHeader = document.createElement('tr');
    trHeader.className = 'judul-tabel';

    const th = document.createElement('th');
    th.colSpan = 5;
    th.textContent = group.episode || '';

    trHeader.appendChild(th);
    tbody.appendChild(trHeader);

    for (const row of group.rows || []) {
      const tr = document.createElement('tr');

      const tdLabel = document.createElement('td');
      const b = document.createElement('b');
      b.textContent = row.label || '';
      tdLabel.appendChild(b);

      const tdLink1 = document.createElement('td');
      tdLink1.colSpan = 2;
      const tdLink2 = document.createElement('td');
      tdLink2.colSpan = 2;

      const links = row.links || [];
      const linkA = links[0];
      const linkB = links[1];

      const validA = isValidLink(linkA);
      const validB = isValidLink(linkB);

      if (!validA && !validB) {
        continue;
      }

      anyValidRow = true;

      if (validA) {
        const a1 = document.createElement('a');
        a1.href = linkA.href;
        a1.textContent = linkA.text;
        a1.className = 'tautan-unduh';
        tdLink1.appendChild(a1);
      }

      if (validB) {
        const a2 = document.createElement('a');
        a2.href = linkB.href;
        a2.textContent = linkB.text;
        a2.className = 'tautan-unduh';
        tdLink2.appendChild(a2);
      }

      tr.appendChild(tdLabel);
      tr.appendChild(tdLink1);
      tr.appendChild(tdLink2);
      tbody.appendChild(tr);
    }
  }

  if (!anyValidRow) {
    table.style.display = 'none';
  }
}

async function utama() {
  try {
    const animeId = ambilIdAnime();
    if (!animeId) {
      window.location.replace('index.html');
      return;
    }

    const allData = await muatDataAnime();
    const aliasId = {
      aot: 'aot-s4',
      tpn: 'tpn-s2',
      drs: 'drs-s2',
    };

    const resolvedId = allData[animeId] ? animeId : (aliasId[animeId] || animeId);
    const anime = allData[resolvedId];

    if (resolvedId !== animeId && anime) {
      // Biar bookmark lama tetap jalan, tapi tampilannya pindah ke ID baru.
      const hash = String(window.location.hash || '').trim();
      if (hash && hash.replace(/^#/, '').toLowerCase() === animeId) {
        history.replaceState(null, '', `#${encodeURIComponent(resolvedId)}`);
      }
    }

    if (!anime) {
      setTeks('judul-anime', 'Anime tidak ditemukan');
      setTeks('subjudul-anime', 'Buka dari Beranda untuk melihat daftar lengkap anime.');
      setSampul('', '');
      return;
    }

    document.title = anime.title || 'Anime';
    setTeks('judul-anime', anime.title || '');
    setTeks('subjudul-anime', '');
    setSampul(anime.cover || '', anime.title || '');

    renderSinopsis(anime.sinopsis || []);
    renderInfo(anime.info || {});
    renderUnduhan(anime.downloads || []);

    // Opsional: kalau ada internet, ambil bonus dari MAL (Jikan) tanpa ganggu flow
    const malMeta = anime?.mal;
    let malId = parseIdAnimeMal(malMeta) || parseIdAnimeMal(anime?.info?.Rating);

    const localSynopsis = Array.isArray(anime?.sinopsis) ? anime.sinopsis : [];
    const looksPlaceholderSynopsis =
      localSynopsis.length === 0 ||
      localSynopsis.some((l) => String(l || '').trim().toUpperCase() === 'X') ||
      (localSynopsis.length === 1 && normalisasiURIComponent(localSynopsis[0]).includes('masih%20dalam%20pengerjaan'));

    const allowSearchByTitle = !malId && Boolean(anime?.title);
    if (allowSearchByTitle) {
      try {
        const discoveredId = await cariIdAnimeJikanDariJudul(anime.title);
        if (discoveredId) {
          malId = discoveredId;
          if (!(anime?.info?.Rating && typeof anime.info.Rating === 'object' && anime.info.Rating.type === 'mal')) {
            anime.info = anime.info || {};
            anime.info.Rating = { type: 'mal', id: discoveredId };
            renderInfo(anime.info);
          }
        }
      } catch {
        // Kalau gagal nyari, yaudah skip
      }
    }

    // Sinopsis: kita utamain yang lokal (biar tetap Bahasa Indonesia).
    // Kalau sinopsis lokal masih placeholder, mending tampilkan itu aja daripada ngambil versi MAL yang biasanya Inggris.
  } catch (err) {
    setTeks('judul-anime', 'Waduh, error');
    setTeks('subjudul-anime', String(err?.message || err));
  }
}

document.addEventListener('DOMContentLoaded', utama);
