/**
 * SEO — meta tags dinâmicas a partir do JSON
 */
const PortalSEO = {
  set(title, description, image, type = 'website', canonical) {
    document.title = title;
    this.setMeta('description', description);
    this.setMeta('og:title', title, 'property');
    this.setMeta('og:description', description, 'property');
    this.setMeta('og:type', type, 'property');
    this.setMeta('twitter:card', 'summary_large_image');
    this.setMeta('twitter:title', title);
    this.setMeta('twitter:description', description);
    if (image) {
      const abs = image.startsWith('http') ? image : new URL(image, location.href).href;
      this.setMeta('og:image', abs, 'property');
      this.setMeta('twitter:image', abs);
    }
    const canon = canonical || location.href.split('#')[0].split('?')[0];
    this.setLink('canonical', canon);
  },

  setLink(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  },

  setMeta(name, content, attr = 'name') {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.content = content;
  },

  forEvent(ev, basePath) {
    const title = `${ev.cidade}/${ev.estado} — ${ev.titulo} | Memoriais | Ministério Elias Silva`;
    const desc = ev.testemunho || (ev.descricao || '').replace(/\n/g, ' ').slice(0, 160);
    const img = asset(ev.heroImage || ev.galeria?.[0]?.imagemFull || ev.galeria?.[0]?.imagem);
    this.set(title, desc, img, 'article');
  },

  forHome() {
    this.set(
      'Ministério Elias Silva | Portal Oficial',
      'Portal oficial do Ministério Elias Silva — música, agenda, memoriais e arquivo histórico do ministério.',
      asset('assets/images/hero-bg.png')
    );
  },

  forMemoriaisIndex() {
    this.set(
      'Memoriais do Ministério | Ministério Elias Silva',
      'Acervo permanente de cultos e eventos realizados — fotos, vídeos, louvores e relatos.',
      asset('assets/images/hero-bg.png')
    );
  }
};
