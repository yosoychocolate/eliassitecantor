/**
 * Hero dinâmico — slides com Ken Burns (CSS)
 */
function heroSlides() {
  const slides = [];
  const musica = getLatestMusica();
  const nextEv = getNextEvento();
  const memorial = getRecentMemorial();

  if (musica) {
    slides.push({
      src: asset(musica.capa || musica.capaFallback),
      alt: musica.titulo,
      label: musica.isNovo ? 'Novo lançamento' : 'Lançamento',
      link: '#lancamentos'
    });
  }
  if (nextEv?.heroImage || nextEv) {
    slides.push({
      src: asset(nextEv.heroImage || memorial?.heroImage || 'assets/images/hero-bg.png'),
      alt: `${nextEv.cidade} — ${nextEv.titulo}`,
      label: 'Próximo evento',
      link: '#agenda'
    });
  }
  if (memorial) {
    slides.push({
      src: asset(memorial.heroImage || memorial.galeria?.[0]?.imagemFull),
      alt: `${memorial.cidade} — ${memorial.titulo}`,
      label: 'Memorial recente',
      link: memorialHref(memorial.slug)
    });
  }

  if (!slides.length) {
    slides.push({ src: asset('assets/images/hero-bg.png'), alt: 'Ministério Elias Silva', label: null, link: '#home' });
  }

  return slides;
}

function renderHeroDynamic() {
  const wrap = document.getElementById('hero-slides');
  if (!wrap) return;

  const slides = heroSlides();
  wrap.innerHTML = slides.map((s, i) => `
    <a href="${s.link || '#'}" class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image:url('${s.src}')" aria-label="${s.alt}">
      ${s.label ? `<span class="hero-slide__label">${s.label}</span>` : ''}
    </a>
  `).join('');

  if (slides[0]?.src) {
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = slides[0].src;
    document.head.appendChild(preload);
  }

  let current = 0;
  setInterval(() => {
    const els = wrap.querySelectorAll('.hero-slide');
    if (els.length < 2) return;
    els[current].classList.remove('active');
    current = (current + 1) % els.length;
    els[current].classList.add('active');
  }, 8000);
}
