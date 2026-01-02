function setTeks(el, value) {
  if (!el) return;
  el.textContent = value ?? '';
}

function bersihkan(el) {
  if (!el) return;
  el.innerHTML = '';
}

function normalisasi(value) {
  return String(value || '').trim().toLowerCase();
}

function ambilStatusLabel(anime) {
  const status = anime?.info?.Status;
  if (!status) return '';
  if (typeof status === 'string') return status;
  if (typeof status === 'object') {
    return String(status.text || status.value || '').trim();
  }
  return '';
}

function ambilHariTayang(anime) {
  const statusValue = normalisasi(ambilStatusAnime(anime));
  if (statusValue === 'finished') return '';
  const raw = anime?.info?.['Hari Tayang'];
  const s = String(raw || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function ambilStudio(anime) {
  const s = String(anime?.info?.Studio || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function ambilTahunSeason(anime) {
  const tahun = String(anime?.info?.Tahun || '').trim();
  const season = translateMusim(String(anime?.info?.Musim || '').trim());
  const left = tahun && tahun.toUpperCase() !== 'X' ? tahun : '';
  const right = season && season.toUpperCase() !== 'X' ? season : '';
  if (left && right) return `${left} ${right}`;
  return left || right || '';
}

function ambilSeason(anime) {
  const season = translateMusim(String(anime?.info?.Musim || '').trim());
  return season && season.toUpperCase() !== 'X' ? season : '';
}
function ambilTipe(anime) {
  const s = String(anime?.info?.Tipe || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}
function ambilDurasi(anime) {
  const s = String(anime?.info?.Durasi || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function ambilRilisLabel(anime) {
  return ambilTahunSeason(anime) || ambilHariTayang(anime) || '—';
}

function ambilTotalEpisode(anime) {
  const s = String(anime?.info?.['Total Ep'] || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function ambilRatingLokal(anime) {
  const r = anime?.info?.Rating;
  if (!r) return '—';
  if (typeof r === 'string') return r.trim() || '—';
  if (typeof r === 'number') return formatRating(r);
  // Kalau tipe MAL, nanti kita isi via fetch
  if (typeof r === 'object' && r.type === 'mal') return '—';
  return formatRating(r);
}

function gabungMeta(rilisText, ratingText) {
  const left = String(rilisText || '').trim() || '—';
  const right = starText(String(ratingText || '').trim() || '—');
  return `${left} • ${right}`;
}

function buatChip(text) {
  const span = document.createElement('span');
  span.className = 'chip-meta';
  span.textContent = text;
  return span;
}

function ambilTahun(anime) {
  const s = String(anime?.info?.Tahun || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function ambilMusim(anime) {
  const s = translateMusim(String(anime?.info?.Musim || '').trim());
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function ambilPeriodeTayang(anime) {
  const tahun = ambilTahun(anime);
  const musim = ambilMusim(anime);
  const hari = ambilHariTayang(anime);
  const statusValue = normalisasi(ambilStatusAnime(anime));
  const statusLabel = ambilStatusLabel(anime);

  // Film biasanya enaknya tampil tahun + musim (kalau ada)
  const base = [tahun, musim].filter(Boolean).join(' • ');
  if (base) {
    if (statusValue && statusValue !== 'finished' && hari) return `${base} • ${hari}`;
    return base;
  }

  if (statusValue === 'finished') return 'Sudah tamat';
  return statusLabel || '—';
}

function ambilBadgeTipe(anime) {
  // Di contoh tulisannya "WEBDL"; di web kita pake info.Tipe biar jelas Serial vs Film.
  const tipe = String(anime?.info?.Tipe || '').trim();
  if (!tipe) return 'SERIAL';
  return tipe.toUpperCase();
}

function bacaStateDariHash() {
  const raw = String(window.location.hash || '').replace(/^#/, '').trim();
  const params = new URLSearchParams(raw);
  return {
    q: (params.get('q') || '').trim(),
    genre: (params.get('genre') || '').trim(),
    tipe: (params.get('tipe') || '').trim(),
    status: (params.get('status') || '').trim(),
  };
}

function ambilStatusAnime(anime) {
  const status = anime?.info?.Status;
  if (!status) return '';
  if (typeof status === 'string') return status;
  if (typeof status === 'object') {
    return String(status.value || status.text || '').trim();
  }
  return '';
}

function animeCocokFilter(anime, state) {
  if (!anime) return false;

  const q = normalisasi(state?.q);
  if (q) {
    const title = normalisasi(anime?.title);
    if (!title.includes(q)) return false;
  }

  const wantedGenre = normalisasi(state?.genre);
  if (wantedGenre) {
    const genres = anime?.info?.Genre;
    if (!Array.isArray(genres)) return false;
    if (!genres.some((g) => normalisasi(g) === wantedGenre)) return false;
  }

  const wantedTipe = normalisasi(state?.tipe);
  if (wantedTipe) {
    const tipe = normalisasi(anime?.info?.Tipe);
    const iniFilm = tipe.includes('film') || tipe.includes('movie');
    if (wantedTipe === 'film' && !iniFilm) return false;
    if (wantedTipe === 'serial' && iniFilm) return false;
  }

  const wantedStatus = normalisasi(state?.status);
  if (wantedStatus) {
    if (normalisasi(ambilStatusAnime(anime)) !== wantedStatus) return false;
  }

  return true;
}

function setHashParams(next) {
  const currentRaw = String(window.location.hash || '').replace(/^#/, '').trim();
  const params = new URLSearchParams(currentRaw);
  for (const [key, value] of Object.entries(next || {})) {
    const v = String(value || '').trim();
    if (!v) params.delete(key);
    else params.set(key, v);
  }
  const out = params.toString();
  if (out) window.location.hash = out;
  else window.location.hash = '';
}

function isiOpsiSelect(selectEl, items) {
  if (!selectEl) return;
  // Sisain option pertama (Semua)
  while (selectEl.options.length > 1) {
    selectEl.remove(1);
  }
  for (const it of items || []) {
    const opt = document.createElement('option');
    opt.value = it.value;
    opt.textContent = it.label;
    selectEl.appendChild(opt);
  }
}

function kumpulinFilter(semuaData) {
  const genreSet = new Map();
  const statusSet = new Map();

  for (const [, anime] of Object.entries(semuaData || {})) {
    const genres = anime?.info?.Genre;
    if (Array.isArray(genres)) {
      for (const g of genres) {
        const label = String(g || '').trim();
        if (!label) continue;
        const key = normalisasi(label);
        if (!genreSet.has(key)) genreSet.set(key, label);
      }
    }

    const statusRaw = anime?.info?.Status;
    if (statusRaw) {
      let value = '';
      let label = '';
      if (typeof statusRaw === 'string') {
        value = normalisasi(statusRaw);
        label = statusRaw.trim();
      } else if (typeof statusRaw === 'object') {
        value = normalisasi(statusRaw.value || statusRaw.text);
        label = String(statusRaw.text || statusRaw.value || '').trim();
      }
      if (value && label && !statusSet.has(value)) statusSet.set(value, label);
    }
  }

  const genres = Array.from(genreSet.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([, label]) => ({ value: label, label }));

  const statuses = Array.from(statusSet.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ value, label }));

  return { genres, statuses };
}

function renderDaftar(semuaData, state) {
  const list = document.getElementById('daftar-anime');
  if (!list) return;
  bersihkan(list);

  const previewMode = !normalisasi(state?.q) && !normalisasi(state?.genre) && !normalisasi(state?.tipe) && !normalisasi(state?.status);
  list.dataset.preview = previewMode ? '1' : '0';

  const entries = Object.entries(semuaData || {}).filter(([, anime]) => animeCocokFilter(anime, state));

  const serial = [];
  const film = [];

  for (const entry of entries) {
    const anime = entry[1];
    const tipe = normalisasi(anime?.info?.Tipe);
    if (tipe.includes('film') || tipe.includes('movie')) film.push(entry);
    else serial.push(entry);
  }

  const hitungKolomGrid = (gridEl) => {
    if (!gridEl) return 1;
    const cols = window.getComputedStyle(gridEl).gridTemplateColumns;
    const parts = String(cols || '')
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean);
    return Math.max(1, parts.length);
  };

  const terapkanLimitBaris = (gridEl, lihatEl, maxRows = 3) => {
    if (!gridEl) return;
    const cards = Array.from(gridEl.children).filter((n) => n && n.classList && n.classList.contains('kartu-beranda'));

    if (!previewMode) {
      for (const el of cards) el.hidden = false;
      if (lihatEl) lihatEl.hidden = true;
      return;
    }

    const cols = hitungKolomGrid(gridEl);
    const maxVisible = cols * maxRows;
    for (let i = 0; i < cards.length; i++) {
      cards[i].hidden = i >= maxVisible;
    }

    const hasMore = cards.length > maxVisible;
    if (lihatEl) lihatEl.hidden = !hasMore;
  };

  const renderKartuKe = (targetList, [id, anime]) => {
    const li = document.createElement('li');
    li.className = 'kartu-beranda';

    const a = document.createElement('a');
    a.className = 'kartu-link';
    a.href = `anime.html#${encodeURIComponent(id)}`;

    const thumb = document.createElement('div');
    thumb.className = 'kartu-thumb';

    const badge = document.createElement('span');
    badge.className = 'kartu-badge';
    badge.textContent = ambilBadgeTipe(anime);
    thumb.appendChild(badge);

    const rating = document.createElement('span');
    rating.className = 'kartu-rating';
    const ratingLokal = ambilRatingLokal(anime);
    rating.textContent = starText(ratingLokal);
    thumb.appendChild(rating);

    const coverSrc = String(anime?.cover || '').trim();
    if (coverSrc) {
      const img = document.createElement('img');
      img.className = 'kartu-img';
      img.loading = 'lazy';
      img.src = coverSrc;
      img.alt = anime?.title || id;
      thumb.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'kartu-img kartu-img--placeholder';
      placeholder.textContent = anime?.title || id;
      thumb.appendChild(placeholder);
    }

    const body = document.createElement('div');
    body.className = 'kartu-body';

    const title = document.createElement('div');
    title.className = 'kartu-judul';
    title.textContent = anime?.title || id;

    const periode = document.createElement('div');
    periode.className = 'kartu-periode';
    periode.textContent = ambilPeriodeTayang(anime);

    body.appendChild(title);
    body.appendChild(periode);

    a.appendChild(thumb);
    a.appendChild(body);

    li.appendChild(a);
    targetList.appendChild(li);

    const malId = parseIdAnimeMal(anime?.mal) || parseIdAnimeMal(anime?.info?.Rating);
    if (malId) {
      ambilMetaDariJikan(malId)
        .then((meta) => {
          const ratingText = meta?.score ? formatRating(meta.score) : ratingLokal;
          if (rating.isConnected) rating.textContent = starText(ratingText);
        })
        .catch(() => {
          // offline? gapapa.
        });
    }
  };

  const renderBab = (label, entriesBab, lihatHref) => {
    const liBab = document.createElement('li');
    liBab.className = 'bab';

    const header = document.createElement('div');
    header.className = 'bab-header';

    const judul = document.createElement('div');
    judul.className = 'bab-judul';
    judul.textContent = label;

    const lihat = document.createElement('a');
    lihat.className = 'bab-lihat';
    lihat.textContent = 'Lihat lainnya';
    lihat.href = lihatHref;
    lihat.hidden = true;

    header.appendChild(judul);
    header.appendChild(lihat);

    const grid = document.createElement('ul');
    grid.className = 'bab-grid';
    grid.setAttribute('aria-label', `Daftar ${label}`);

    liBab.appendChild(header);
    liBab.appendChild(grid);
    list.appendChild(liBab);

    for (const entry of entriesBab) renderKartuKe(grid, entry);

    // Tunggu layout kebaca (auto-fill grid) baru kita hitung 3 baris.
    window.requestAnimationFrame(() => {
      terapkanLimitBaris(grid, lihat, 3);
    });
  };

  if (serial.length > 0) {
    renderBab('Serial', serial, 'index.html#tipe=serial');
  }

  if (film.length > 0) {
    renderBab('Film', film, 'index.html#tipe=film');
  }

  if (!window.__ANIWAVE_BERANDA_RESIZE_BOUND__) {
    window.__ANIWAVE_BERANDA_RESIZE_BOUND__ = true;
    let t = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const root = document.getElementById('daftar-anime');
        if (!root) return;
        if (root.dataset.preview !== '1') return;
        const grids = root.querySelectorAll('.bab-grid');
        for (const grid of grids) {
          const bab = grid.closest('.bab');
          const lihat = bab ? bab.querySelector('.bab-lihat') : null;
          // previewMode di sini pasti true karena dataset.preview=1
          const cols = (grid && window.getComputedStyle(grid).gridTemplateColumns)
            ? String(window.getComputedStyle(grid).gridTemplateColumns).split(' ').filter(Boolean).length
            : 1;
          const cards = Array.from(grid.children).filter((n) => n && n.classList && n.classList.contains('kartu-beranda'));
          const maxVisible = Math.max(1, cols) * 3;
          for (let i = 0; i < cards.length; i++) cards[i].hidden = i >= maxVisible;
          if (lihat) lihat.hidden = !(cards.length > maxVisible);
        }
      }, 120);
    });
  }
}

function buatElemenDetail(id, anime) {
  const detail = document.createElement('div');
  detail.className = 'detail-anime';
  detail.dataset.detailFor = id;

  const row = document.createElement('div');
  row.className = 'baris-detail';

  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'bungkus-thumbnail';

  const cover = document.createElement('img');
  cover.className = 'gambar-thumbnail';
  cover.loading = 'lazy';
  const coverSrc = String(anime?.cover || '').trim();
  cover.src = coverSrc;
  cover.alt = anime?.title || '';
  if (coverSrc) {
    thumbWrap.appendChild(cover);
    row.appendChild(thumbWrap);
  }

  const body = document.createElement('div');
  body.className = 'isi-detail';

  const sinopsis = document.createElement('div');
  sinopsis.className = 'sinopsis-detail';
  const semuaBaris = Array.isArray(anime?.sinopsis) ? anime.sinopsis : [];
  const pendek = semuaBaris.slice(0, 2);
  const p = document.createElement('p');
  p.className = 'baris-sinopsis';
  p.textContent = pendek.join(' ');
  sinopsis.appendChild(p);

  if (semuaBaris.length > 2) {
    const btnExpand = document.createElement('button');
    btnExpand.type = 'button';
    btnExpand.className = 'tombol-expand';
    btnExpand.textContent = 'Lihat selengkapnya';

    let expanded = false;
    btnExpand.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      expanded = !expanded;
      p.textContent = expanded ? semuaBaris.join(' ') : pendek.join(' ');
      btnExpand.textContent = expanded ? 'Tutup' : 'Lihat selengkapnya';
    });

    sinopsis.appendChild(btnExpand);
  }

  const meta = document.createElement('div');
  meta.className = 'meta-detail';
  const statusText = ambilStatusLabel(anime) || '—';
  meta.appendChild(buatChip(`Status: ${statusText}`));
  meta.appendChild(buatChip(`Tipe: ${ambilTipe(anime) || '—'}`));
  meta.appendChild(buatChip(`Studio: ${ambilStudio(anime) || '—'}`));
  meta.appendChild(buatChip(`Tahun/Musim: ${ambilTahunSeason(anime) || '—'}`));
  meta.appendChild(buatChip(`Total Ep: ${ambilTotalEpisode(anime) || '—'}`));
  const durasi = ambilDurasi(anime);
  if (durasi) meta.appendChild(buatChip(`Durasi: ${durasi}`));

  const genre = document.createElement('div');
  genre.className = 'genre-detail';
  const genreList = anime?.info?.Genre;
  if (Array.isArray(genreList)) {
    for (const g of genreList) {
      const a = document.createElement('a');
      a.href = `#genre=${encodeURIComponent(String(g))}`;
      a.className = 'lencana-genre';
      a.textContent = String(g);
      a.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.hash = `genre=${encodeURIComponent(String(g))}`;
      });
      genre.appendChild(a);
      genre.appendChild(document.createTextNode(' '));
    }
  }

  const actions = document.createElement('div');
  actions.className = 'aksi-detail';

  const open = document.createElement('a');
  open.className = 'tombol-buka';
  open.href = `anime.html#${encodeURIComponent(id)}`;
  open.textContent = 'Buka';
  actions.appendChild(open);

  body.appendChild(sinopsis);
  body.appendChild(meta);
  body.appendChild(genre);
  body.appendChild(actions);

  row.appendChild(thumbWrap);
  row.appendChild(body);
  detail.appendChild(row);

  return detail;
}

async function utama() {
  try {
    const semuaData = await muatDataAnime();
    const inputCari = document.getElementById('cari-anime');
    const selectGenre = document.getElementById('filter-genre');
    const selectTipe = document.getElementById('filter-tipe');
    const selectStatus = document.getElementById('filter-status');
    const tombolReset = document.getElementById('reset-filter');

    const { genres, statuses } = kumpulinFilter(semuaData);
    isiOpsiSelect(selectGenre, genres);
    isiOpsiSelect(selectStatus, statuses);

    const render = () => {
      const state = bacaStateDariHash();
      if (inputCari) inputCari.value = state.q || '';
      if (selectGenre) selectGenre.value = state.genre || '';
      if (selectTipe) selectTipe.value = normalisasi(state.tipe || '') || '';
      if (selectStatus) selectStatus.value = normalisasi(state.status || '') || '';

      renderDaftar(semuaData, state);
      // Abis render ulang, tutup detail yang lagi kebuka.
      const openDetails = document.querySelectorAll('.detail-anime');
      for (const d of openDetails) {
        if (d.parentElement) d.parentElement.removeChild(d);
      }
    };

    render();
    window.addEventListener('hashchange', render);

    let timerCari = 0;
    if (inputCari) {
      inputCari.addEventListener('input', () => {
        window.clearTimeout(timerCari);
        timerCari = window.setTimeout(() => {
          setHashParams({ q: inputCari.value });
        }, 150);
      });
    }

    if (selectGenre) {
      selectGenre.addEventListener('change', () => {
        setHashParams({ genre: selectGenre.value });
      });
    }

    if (selectTipe) {
      selectTipe.addEventListener('change', () => {
        setHashParams({ tipe: selectTipe.value });
      });
    }

    if (selectStatus) {
      selectStatus.addEventListener('change', () => {
        setHashParams({ status: selectStatus.value });
      });
    }

    if (tombolReset) {
      tombolReset.addEventListener('click', () => {
        setHashParams({ q: '', genre: '', tipe: '', status: '' });
      });
    }
  } catch (err) {
    const list = document.getElementById('daftar-anime');
    if (list) {
      list.innerHTML = `<li class="entri-anime">Yah, gagal muat data: ${String(err?.message || err)}</li>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', utama);
