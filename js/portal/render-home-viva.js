/**
 * Home Viva — portal de legado (experiência narrativa)
 */

const MINISTRY_PHOTO = 'assets/images/hero-bg.png';

/** Capítulos da linha do tempo — fotos de Dourados só no capítulo do memorial */
const HOME_CAPITULOS = [
  {
    ano: 1959,
    titulo: 'Nascimento',
    descricao: 'Elias Ferreira da Silva nasce em 5 de janeiro de 1959, em Rondonópolis, Mato Grosso — início de uma vida dedicada ao Evangelho.',
    imagem: MINISTRY_PHOTO
  },
  {
    ano: 1986,
    titulo: 'Vida Feliz',
    descricao: 'Lançamento do primeiro álbum — marco que inaugurou mais de quatro décadas de música gospel no Brasil.',
    imagem: MINISTRY_PHOTO,
    link: 'discografia.html'
  },
  {
    ano: 2005,
    titulo: 'Deus de Israel',
    descricao: 'Lançado em 21 de abril de 2005 — hino de Elias Silva sobre o Deus de Israel.',
    youtube: '4yO0AYzKCOg',
    link: 'discografia.html'
  },
  {
    ano: 2025,
    titulo: 'Elias & Léia Silva',
    descricao: 'Casamento com Léia Silva e formação da dupla — nova fase do ministério, lado a lado no palco e no altar.',
    imagem: MINISTRY_PHOTO
  },
  {
    ano: 2026,
    titulo: 'Memoriais & Portal',
    descricao: 'Memoriais preservados — o portal oficial registra cada culto para as próximas gerações.',
    imagemMemorial: 'assets/images/eventos/dourados/hero-dourados.jpg',
    link: 'memorial.html?evento=dourados-ms'
  }
];

function imagemCapitulo(c) {
  if (c.imagemMemorial) return asset(c.imagemMemorial);
  const ytid = youtubeId(c.youtube);
  if (ytid && typeof VideoService !== 'undefined') return VideoService.thumbUrl(ytid);
  return asset(c.imagem || MINISTRY_PHOTO);
}

function capaMusica(m) {
  const ytid = youtubeId(m?.youtube);
  if (ytid) {
    return typeof VideoService !== 'undefined'
      ? VideoService.thumbUrl(ytid)
      : `https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`;
  }
  return asset(m?.capa || m?.capaFallback || MINISTRY_PHOTO);
}

function dismissHomeOpening({ animated = true } = {}) {
  const opening = document.getElementById('home-opening');
  if (!opening || opening.classList.contains('is-dismissed')) return false;

  if (location.protocol === 'file:') {
    window.location.href = `${location.protocol === 'file:' ? 'http://localhost:5500' : location.origin}/`;
    return true;
  }

  document.body.classList.add('portal-active');
  document.body.classList.remove('home-opening-active');
  sessionStorage.setItem('portal-entered', '1');
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;

  opening.classList.add('is-leaving');
  if (animated) {
    setTimeout(() => {
      opening.classList.add('is-dismissed');
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    }, 700);
  } else {
    opening.classList.add('is-dismissed');
  }

  return true;
}

function initHomeOpening() {
  const opening = document.getElementById('home-opening');
  const btn = document.getElementById('home-enter');
  if (!opening) return;

  if (sessionStorage.getItem('portal-entered')) {
    opening.classList.add('is-dismissed');
    document.body.classList.add('portal-active');
    document.body.classList.remove('home-opening-active');
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    });
    return;
  }

  document.body.classList.add('home-opening-active');

  const delay = location.protocol === 'file:' ? 800 : 2000;
  setTimeout(() => btn?.classList.add('is-visible'), delay);

  const enter = () => {
    if (dismissHomeOpening({ animated: true })) {
      if (typeof BackgroundMusic !== 'undefined') BackgroundMusic.startOnGesture();
    }
  };

  btn?.addEventListener('click', enter);
  opening.addEventListener('click', e => {
    if (e.target.closest('.home-opening__file-hint')) return;
    enter();
  });
}

function renderHojeNaHistoria() {
  const el = document.getElementById('hoje-historia');
  if (!el) return;

  const now = new Date();
  const diaLabel = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const hoje = ContentService.getHistoriaDoDia(now) || ContentService.getHistoriaFallback(now);

  if (!hoje) {
    el.innerHTML = '';
    return;
  }

  const tipoIcon = { memorial: 'fa-church', lancamento: 'fa-compact-disc', biografia: 'fa-book-open' }[hoje.tipo] || 'fa-calendar-day';
  const rotativo = hoje.rotativo ? '<span class="home-hoje__note">Memória do acervo</span>' : '';

  el.innerHTML = `
    <div class="home-hoje">
      <div class="container">
        <article class="home-hoje__card">
          <div class="home-hoje__icon" aria-hidden="true"><i class="fas ${tipoIcon}"></i></div>
          <div class="home-hoje__content">
            <header class="home-hoje__head">
              <span class="home-hoje__label">Hoje na História</span>
              <time class="home-hoje__date" datetime="${now.toISOString().slice(0, 10)}">${diaLabel}</time>
              ${rotativo}
            </header>
            ${hoje.ano ? `<p class="home-hoje__year">Em ${hoje.ano}</p>` : ''}
            <p class="home-hoje__text">${hoje.texto}</p>
            ${hoje.link ? `<a href="${hoje.link}" class="home-hoje__link">${hoje.linkLabel || 'Saiba mais'} <i class="fas fa-arrow-right"></i></a>` : ''}
          </div>
        </article>
      </div>
    </div>`;
}

function renderProximaMinistracao() {
  const el = document.getElementById('proxima-ministracao');
  if (!el) return;

  const ev = getAgendaEventos().find(e => e.data) || null;
  const config = ContentService.getSnapshot()?.config || {};
  const numero = Ministry.telefoneExibicao(config);
  const waMsg = `Olá! Gostaria de informações sobre a ministração${ev?.cidade ? ` em ${ev.cidade}` : ''}.`;
  const waHref = Ministry.whatsappHref(config, waMsg);

  if (!ev?.data) {
    el.innerHTML = `
      <div class="home-evento">
        <div class="container">
          <article class="home-evento__card home-evento__card--empty">
            <div class="home-evento__icon" aria-hidden="true"><i class="fas fa-calendar-alt"></i></div>
            <div class="home-evento__body">
              <span class="home-section__label">Próxima Ministração</span>
              <p class="home-evento__empty">Novas agendas serão divulgadas em breve.</p>
              <p class="home-evento__hint">Deseja receber o ministério em sua igreja ou evento?</p>
              <a href="${waHref}" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                <i class="fab fa-whatsapp"></i> ${numero}
              </a>
            </div>
          </article>
        </div>
      </div>`;
    return;
  }

  const d = Ministry.parseDate(ev.data);
  const { day, weekday, month } = Ministry.agendaDateParts(ev.data);
  const monthLong = d.toLocaleDateString('pt-BR', { month: 'long' });
  const year = d.getFullYear();

  el.innerHTML = `
    <div class="home-evento">
      <div class="container">
        <article class="home-evento__card">
          <div class="home-evento__date-block">
            <span class="home-evento__day">${day}</span>
            <span class="home-evento__weekday">${weekday}</span>
            <span class="home-evento__month">${monthLong}</span>
            <span class="home-evento__year">${year}</span>
          </div>
          <div class="home-evento__body">
            <span class="home-section__label">Próxima Ministração</span>
            <h2 class="home-evento__city">${ev.cidade}/${ev.estado}</h2>
            <p class="home-evento__title">${ev.titulo}${ev.tipo ? ` · ${ev.tipo}` : ''}</p>
            <a href="${waHref}" class="btn btn--primary" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-whatsapp"></i> ${numero}
            </a>
            <a href="#agenda" class="home-evento__more">Ver agenda completa →</a>
          </div>
        </article>
      </div>
    </div>`;
}

function renderAgendaSection() {
  const el = document.getElementById('agenda-list');
  if (!el) return;

  const config = ContentService.getSnapshot()?.config || {};
  const numero = Ministry.telefoneExibicao(config);
  const waHref = Ministry.whatsappHref(config, 'Olá! Gostaria de solicitar a agenda do Ministério Elias Silva.');
  const phoneBanner = `
    <div class="agenda-phone-banner">
      <span class="agenda-phone-banner__label">Agenda — fale direto com a equipe</span>
      <a href="${waHref}" class="agenda-phone-banner__link" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-whatsapp" aria-hidden="true"></i>
        <span class="agenda-phone-banner__number">${numero}</span>
      </a>
      <p class="agenda-phone-banner__hint">Toque no número para abrir o WhatsApp</p>
    </div>`;

  const upcoming = getAgendaEventos();

  if (!upcoming.length) {
    el.innerHTML = `${phoneBanner}
      <div class="agenda__empty">
        <p>Novas datas em preparação.</p>
        <a href="${waHref}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-whatsapp"></i> ${numero}
        </a>
      </div>`;
    return;
  }

  el.innerHTML = phoneBanner + upcoming.map(ev => {
    const { day, weekday, month } = Ministry.agendaDateParts(ev.data);
    return `
      <article class="agenda__item">
        <div class="agenda__date">
          <span class="agenda__day">${day}</span>
          <span class="agenda__weekday">${weekday}</span>
          <span class="agenda__month">${month}</span>
        </div>
        <div class="agenda__info"><h3>${ev.cidade} — ${ev.estado}</h3><p>${ev.titulo}${ev.tipo ? ` · ${ev.tipo}` : ''}</p></div>
        <span class="agenda__badge">Confirmado</span>
      </article>`;
  }).join('') + `
    <p class="home-agenda__cta">
      <a href="${waHref}" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-whatsapp"></i> ${numero}
      </a>
    </p>`;
}

function renderLinhaTempoHorizontal() {
  const el = document.getElementById('linha-tempo');
  if (!el) return;

  el.innerHTML = `
    <div class="home-timeline container">
      <span class="home-section__label">Linha do Tempo</span>
      <h2 class="home-section__title">Uma caminhada de décadas</h2>
      <div class="home-timeline__track" id="home-timeline-track">
        ${HOME_CAPITULOS.map((c, i) => `
          <button type="button" class="home-timeline__point" data-capitulo="${i}" aria-label="${c.ano} — ${c.titulo}">
            <span class="home-timeline__year">${c.ano}</span>
            ${i < HOME_CAPITULOS.length - 1 ? '<span class="home-timeline__line" aria-hidden="true"></span>' : ''}
          </button>`).join('')}
      </div>
      <div class="home-timeline__chapter" id="home-timeline-chapter" hidden></div>
    </div>`;

  el.querySelectorAll('[data-capitulo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = HOME_CAPITULOS[Number(btn.dataset.capitulo)];
      const panel = document.getElementById('home-timeline-chapter');
      if (!panel || !c) return;

      el.querySelectorAll('.home-timeline__point').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      panel.hidden = false;
      panel.innerHTML = `
        <div class="home-timeline__card">
          <img src="${imagemCapitulo(c)}" alt="${c.titulo}" loading="lazy">
          <div class="home-timeline__card-body">
            <span class="home-timeline__card-year">${c.ano}</span>
            <h3>${c.titulo}</h3>
            <p>${c.descricao}</p>
            ${c.link ? `<a href="${c.link}" class="home-timeline__card-link">Explorar capítulo →</a>` : ''}
          </div>
        </div>`;
    });
  });
}

function renderMemorialDestaque() {
  const el = document.getElementById('memorial-destaque');
  if (!el) return;

  const ev = getRecentMemorial() || getEventoBySlug('dourados-ms');
  if (!ev) {
    el.innerHTML = '';
    return;
  }

  const img = asset(ev.heroImage || ev.galeria?.[0]?.imagemFull || 'assets/images/eventos/dourados/hero-dourados.jpg');

  el.innerHTML = `
    <div class="home-memorial container">
      <span class="home-section__label">Memorial em Destaque</span>
      <article class="home-memorial__card">
        <div class="home-memorial__visual">
          <img src="${img}" alt="${ev.cidade} — ${ev.titulo}" loading="lazy">
        </div>
        <div class="home-memorial__body">
          <p class="home-memorial__place">${ev.cidade}/${ev.estado}</p>
          <h2 class="home-memorial__church">${ev.titulo}</h2>
          ${ev.testemunho ? `<p class="home-memorial__quote">"${ev.testemunho}"</p>` : ''}
          <a href="${memorialHref(ev.slug)}" class="btn btn--primary">Ver Memorial</a>
        </div>
      </article>
      <p class="home-memorial__more"><a href="memoriais.html" class="text-link">Veja todos →</a></p>
    </div>`;
}

function renderDiscografiaTeaser() {
  const el = document.getElementById('discografia-teaser');
  if (!el) return;

  const m = getLatestMusica();
  if (!m) { el.innerHTML = ''; return; }

  const capa = capaMusica(m);
  const ytid = youtubeId(m.youtube);

  el.innerHTML = `
    <div class="home-disc container">
      <span class="home-section__label">Discografia</span>
      <div class="home-disc__card">
        <img src="${capa}" alt="Capa ${m.titulo}" loading="lazy">
        <div class="home-disc__info">
          <span class="home-disc__tag">Último álbum</span>
          <h2 class="home-disc__title">${m.titulo}</h2>
          <p class="home-disc__meta">${m.ano}${m.tipo ? ` · ${m.tipo}` : ''}</p>
          <div class="home-disc__actions">
            ${ytid ? `<button type="button" class="btn btn--primary" data-youtube-id="${ytid}"><i class="fas fa-play"></i> Ouvir</button>` : ''}
            ${m.audio ? `<button type="button" class="btn btn--outline" data-play-audio="${asset(m.audio)}" data-play-title="${m.titulo}"><i class="fas fa-headphones"></i></button>` : ''}
          </div>
        </div>
      </div>
      <a href="discografia.html" class="home-section__cta">Ver Discografia Completa →</a>
    </div>`;

  bindPlayButtons(el);
}

function renderVideotecaTeaser() {
  const el = document.getElementById('videoteca-teaser');
  if (!el) return;

  const items = VideoService.recent(3);
  if (!items.length) { el.innerHTML = ''; return; }

  el.innerHTML = `
    <div class="home-videos container">
      <span class="home-section__label">Videoteca</span>
      <div class="home-videos__grid">
        ${items.map(v => {
          const id = VideoService.id(v);
          return `
            <button type="button" class="home-videos__item" data-youtube-id="${id}" data-video-title="${v.titulo}">
              <img src="${VideoService.thumbFor(v)}" alt="${v.titulo}" loading="lazy">
              <span class="home-videos__play"><i class="fas fa-play"></i></span>
              <span class="home-videos__title">${v.titulo}</span>
            </button>`;
        }).join('')}
      </div>
      <a href="videoteca.html" class="btn btn--outline home-videos__cta">Explorar Videoteca</a>
    </div>`;

  bindVideoCards(el, Portal.videos);
}

function renderFraseFinal() {
  const el = document.getElementById('frase-final');
  if (!el) return;

  el.innerHTML = `
    <div class="home-legacy">
      <img class="home-legacy__photo" src="${asset(MINISTRY_PHOTO)}" alt="Ministério Elias Silva" loading="lazy">
      <blockquote class="home-legacy__quote">
        <p>Até aqui nos ajudou o Senhor.</p>
        <cite>1 Samuel 7:12</cite>
      </blockquote>
    </div>`;
}

function renderLancamentoFeaturedOnly() {
  renderVideoFeatured();
  renderVideotecaCarousel();
  initVideotecaCarousels();
}
