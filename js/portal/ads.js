/**
 * AdService — preparação para Google AdSense (desligado por padrão)
 *
 * Ativar em content/config.json:
 *   adsense.enabled = true
 *   adsense.clientId = "ca-pub-XXXXXXXX"
 *   adsense.slots.<nome>.slotId = "1234567890"
 */
const AdService = {
  init() {
    if (location.protocol === 'file:') {
      this._hideAll();
      return;
    }

    const cfg = ContentService.getSnapshot()?.config?.adsense;
    if (!cfg?.enabled || !cfg.clientId) {
      this._hideAll();
      return;
    }

    const page = document.body.dataset.page || '';
    if ((cfg.excludePages || []).includes(page)) {
      this._hideAll();
      return;
    }

    this._loadScript(cfg.clientId);
    this._mountSlots(cfg);
  },

  _hideAll() {
    document.querySelectorAll('.ad-slot').forEach(el => {
      el.hidden = true;
    });
  },

  _loadScript(clientId) {
    if (document.querySelector('script[data-adsense-client]')) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = 'anonymous';
    script.dataset.adsenseClient = clientId;
    document.head.appendChild(script);
  },

  _mountSlots(cfg) {
    document.querySelectorAll('.ad-slot[data-ad-slot]').forEach(host => {
      const key = host.dataset.adSlot;
      const slot = cfg.slots?.[key];

      if (!slot?.slotId) {
        host.hidden = true;
        return;
      }

      host.hidden = false;
      host.innerHTML = '';

      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.dataset.adClient = cfg.clientId;
      ins.dataset.adSlot = slot.slotId;

      if (slot.format) ins.dataset.adFormat = slot.format;
      if (slot.fullWidthResponsive) ins.dataset.fullWidthResponsive = 'true';

      host.appendChild(ins);

      const run = () => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          /* script ainda carregando */
        }
      };

      if (window.adsbygoogle) {
        run();
      } else {
        document.querySelector('script[data-adsense-client]')?.addEventListener('load', run, { once: true });
      }
    });
  }
};

function initAdsWhenReady() {
  if (typeof ContentService === 'undefined' || typeof AdService === 'undefined') return;

  ContentService.init('')
    .then(() => AdService.init())
    .catch(() => AdService._hideAll?.());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdsWhenReady);
} else {
  initAdsWhenReady();
}
