/**
 * Modo TV — slideshow para projeção em igrejas
 */
const PortalTV = {
  slides: [],
  index: 0,
  timer: null,

  async init() {
    await ContentService.init('');
    const d = ContentService.getSnapshot();
    this.slides = [];

    (await ContentService.getAgenda()).slice(0, 3).forEach(ev => {
      this.slides.push({
        type: 'agenda',
        duration: 8000,
        html: `<div class="tv-slide tv-slide--agenda"><p class="tv-slide__label">Próximo evento</p><h2>${ev.cidade} — ${ev.estado}</h2><p>${ev.titulo}</p><p>${Ministry.formatDate(ev.data)}</p></div>`
      });
    });

    (d.versiculos || []).forEach(v => {
      this.slides.push({
        type: 'versiculo',
        duration: 12000,
        html: `<div class="tv-slide tv-slide--verse"><p class="tv-slide__text">"${v.texto}"</p><p class="tv-slide__ref">${v.ref}</p></div>`
      });
    });

    const memorial = await ContentService.getRecentMemorial();
    (memorial?.galeria || []).slice(0, 15).forEach(img => {
      this.slides.push({
        type: 'foto',
        duration: 6000,
        html: `<div class="tv-slide tv-slide--photo" style="background-image:url('${asset(img.imagemFull || img.imagem)}')"><span>${memorial.cidade} — ${memorial.titulo}</span></div>`
      });
    });

    d.videos.slice(0, 3).forEach(v => {
      this.slides.push({
        type: 'video',
        duration: 10000,
        html: `<div class="tv-slide tv-slide--video"><i class="fas fa-play-circle"></i><h2>${v.titulo}</h2><p>${v.ano}</p></div>`
      });
    });

    if (!this.slides.length) {
      document.getElementById('tv-root').innerHTML = '<p>Conteúdo insuficiente para Modo TV.</p>';
      return;
    }

    this.render();
    this.next();
  },

  render() {
    document.getElementById('tv-root').innerHTML = '<div id="tv-stage"></div>';
  },

  next() {
    clearTimeout(this.timer);
    const stage = document.getElementById('tv-stage');
    if (!stage) return;
    const slide = this.slides[this.index % this.slides.length];
    stage.innerHTML = slide.html;
    stage.classList.remove('tv-fade');
    void stage.offsetWidth;
    stage.classList.add('tv-fade');
    this.index++;
    this.timer = setTimeout(() => this.next(), slide.duration);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'tv') PortalTV.init();
});
