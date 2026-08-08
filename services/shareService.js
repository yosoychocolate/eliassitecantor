/**
 * ShareService — compartilhamento de memoriais
 */
const ShareService = {
  url(slug) {
    const config = ContentService.getSnapshot().config;
    if (config?.siteUrl) {
      return `${config.siteUrl.replace(/\/$/, '')}/memorial/${slug}`;
    }
    const base = ContentService._basePath || '';
    return `${location.origin}${location.pathname.replace(/[^/]*$/, '')}${base}memorial.html?evento=${slug}`;
  },

  async share(ev, platform) {
    const url = encodeURIComponent(this.url(ev.slug));
    const text = encodeURIComponent(`${ev.titulo} — ${ev.cidade}/${ev.estado} | Ministério Elias Silva`);
    const links = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    };
    if (platform === 'copy') {
      await navigator.clipboard.writeText(decodeURIComponent(url));
      return 'copied';
    }
    if (links[platform]) window.open(links[platform], '_blank', 'noopener,width=600,height=400');
  },

  renderBar(container, ev) {
    if (!container || !ev) return;
    container.innerHTML = `
      <div class="share-bar">
        <span class="share-bar__label">Compartilhar</span>
        <button type="button" class="share-bar__btn" data-share="whatsapp" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
        <button type="button" class="share-bar__btn" data-share="facebook" title="Facebook"><i class="fab fa-facebook-f"></i></button>
        <button type="button" class="share-bar__btn" data-share="x" title="X"><i class="fab fa-x-twitter"></i></button>
        <button type="button" class="share-bar__btn" data-share="copy" title="Copiar link"><i class="fas fa-link"></i></button>
        <button type="button" class="share-bar__btn share-bar__btn--fav" data-fav="${ev.slug}" title="Favoritar">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <p class="share-bar__url">${this.url(ev.slug)}</p>`;

    container.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const r = await this.share(ev, btn.dataset.share);
        if (r === 'copied') btn.innerHTML = '<i class="fas fa-check"></i>';
      });
    });

    FavoritesService.bindButton(container.querySelector('[data-fav]'), ev.slug);
  }
};
