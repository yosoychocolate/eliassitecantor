/**
 * Router — slug via ?evento= ou /memoriais/slug
 */
const PortalRouter = {
  getEventSlug() {
    const params = new URLSearchParams(location.search);
    if (params.get('evento')) return params.get('evento');

    if (location.hash?.length > 1) {
      return decodeURIComponent(location.hash.slice(1));
    }

    const patterns = [
      /\/memorial\/([^/.]+)\/?$/,
      /\/memoriais\/([^/.]+)\/?$/
    ];
    for (const re of patterns) {
      const m = location.pathname.match(re);
      if (m) return m[1];
    }
    return null;
  },

  resolveBasePath() {
    if (document.body.dataset.basePath !== undefined) {
      return document.body.dataset.basePath;
    }
    return location.pathname.includes('/memoriais/') ? '../' : '';
  }
};
