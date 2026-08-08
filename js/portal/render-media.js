/**
 * Mídia — lançamento, discografia, videografia
 */
function capaAlbum(d) {
  const ytid = youtubeId(d?.youtube);
  if (ytid && typeof VideoService !== 'undefined') return VideoService.thumbUrl(ytid);
  return asset(d?.capa || d?.capaFallback || 'assets/images/hero-bg.png');
}

function renderLancamento() {
  const el = document.getElementById('lancamento-featured');
  if (!el) return;

  const m = getLatestMusica();
  if (!m) return;

  const ytid = youtubeId(m.youtube);
  const capa = capaAlbum(m);

  el.innerHTML = `
    <div class="lancamento" style="--lancamento-bg:url('${capa}')">
      <div class="lancamento__blur" style="background-image:url('${capa}')"></div>
      <div class="lancamento__inner container">
        <div class="lancamento__thumb">
          <img src="${capa}" alt="Capa do álbum ${m.titulo}" loading="eager">
          ${m.isNovo ? '<span class="lancamento__badge">Novo Lançamento</span>' : ''}
        </div>
        <div class="lancamento__info">
          <span class="section__label">Últimos Lançamentos</span>
          <h2 class="lancamento__title">${m.titulo}</h2>
          <p class="lancamento__year">${m.ano} · ${m.tipo || 'Lançamento'}</p>
          <div class="lancamento__streams">
            ${m.youtube ? `<a href="https://youtube.com/watch?v=${ytid}" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>` : ''}
            ${isExternalUrl(m.spotify) ? `<a href="${m.spotify}" target="_blank" rel="noopener" aria-label="Spotify"><i class="fab fa-spotify"></i></a>` : ''}
            ${isExternalUrl(m.deezer) ? `<a href="${m.deezer}" target="_blank" rel="noopener" aria-label="Deezer"><i class="fas fa-music"></i></a>` : ''}
            ${isExternalUrl(m.apple) ? `<a href="${m.apple}" target="_blank" rel="noopener" aria-label="Apple Music"><i class="fab fa-apple"></i></a>` : ''}
          </div>
          <div class="lancamento__actions">
            ${ytid ? `<button class="btn btn--primary btn--lg lancamento__watch" data-youtube="${ytid}"><i class="fas fa-play"></i> Assistir</button>` : ''}
            ${m.audio ? `<button class="btn btn--outline" data-play-audio="${asset(m.audio)}" data-play-title="${m.titulo}"><i class="fas fa-headphones"></i> Ouvir</button>` : ''}
          </div>
        </div>
      </div>
    </div>`;

  el.querySelector('.lancamento__watch')?.addEventListener('click', () => {
    openYoutube(ytid, m.youtube ? { title: m.titulo, descricao: m.letra || '' } : {});
  });
  bindPlayButtons(el);
}

function renderDiscografia() {
  const el = document.getElementById('discografia-grid');
  if (!el) return;

  const byYear = {};
  Portal.musicas.forEach(d => {
    if (!byYear[d.ano]) byYear[d.ano] = [];
    byYear[d.ano].push(d);
  });

  el.innerHTML = Object.keys(byYear).sort((a, b) => b - a).map(ano => `
    <div class="discografia-year">
      <h3 class="discografia-year__label">${ano}</h3>
      <div class="discografia-year__grid">
        ${byYear[ano].map(d => `
          <article class="disc-card">
            <div class="disc-card__cover">
              <img src="${capaAlbum(d)}" alt="Capa ${d.titulo}" loading="lazy">
            </div>
            <div class="disc-card__body">
              <h4 class="disc-card__title">${d.titulo}</h4>
              <hr class="disc-card__line">
              <div class="disc-card__links">
                ${d.youtube ? `<a href="https://youtube.com/watch?v=${youtubeId(d.youtube)}" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>` : ''}
                ${isExternalUrl(d.spotify) ? `<a href="${d.spotify}" target="_blank" rel="noopener" aria-label="Spotify"><i class="fab fa-spotify"></i></a>` : ''}
                ${isExternalUrl(d.deezer) ? `<a href="${d.deezer}" target="_blank" rel="noopener" aria-label="Deezer"><i class="fas fa-music"></i> Deezer</a>` : ''}
                ${isExternalUrl(d.apple) ? `<a href="${d.apple}" target="_blank" rel="noopener" aria-label="Apple Music"><i class="fab fa-apple"></i></a>` : ''}
              </div>
              ${d.audio ? `<button class="disc-card__play" data-play-audio="${asset(d.audio)}" data-play-title="${d.titulo}" aria-label="Ouvir ${d.titulo}"><i class="fas fa-play"></i></button>` : ''}
            </div>
          </article>`).join('')}
      </div>
    </div>`).join('');

  bindPlayButtons(el);
}

function renderAgenda() {
  const el = document.getElementById('agenda-list');
  if (!el) return;

  const upcoming = getAgendaEventos();
  if (!upcoming.length) {
    el.innerHTML = `<div class="agenda__empty"><p>Novas datas em preparação.</p><a href="#convite" class="btn btn--outline">Solicitar Agenda</a></div>`;
    return;
  }

  el.innerHTML = upcoming.map(ev => {
    const d = Ministry.parseDate(ev.data);
    const day = d ? String(d.getDate()).padStart(2, '0') : '—';
    const month = d ? d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') : 'breve';
    return `
      <article class="agenda__item">
        <div class="agenda__date"><span class="agenda__day">${day}</span><span class="agenda__month">${month}</span></div>
        <div class="agenda__info"><h3>${ev.cidade} — ${ev.estado}</h3><p>${ev.titulo} · ${ev.tipo || ''}</p></div>
        <span class="agenda__badge">Confirmado</span>
      </article>`;
  }).join('');
}

function renderTestemunhos() {
  const el = document.getElementById('testemunhos-grid');
  if (!el) return;
  el.innerHTML = Portal.testemunhos.map(t => {
    const inicial = (t.nome || '?').trim().charAt(0).toUpperCase();
    const foto = t.foto ? `<img class="testemunho-card__photo" src="${asset(t.foto)}" alt="Foto de ${t.nome}" loading="lazy">`
      : `<span class="testemunho-card__avatar" aria-hidden="true">${inicial}</span>`;
    return `
    <blockquote class="testemunho-card">
      ${foto}
      <p class="testemunho-card__text">"${t.texto}"</p>
      <footer><strong>${t.nome}</strong><span>${t.cargo}</span></footer>
    </blockquote>`;
  }).join('');
}
