/**

 * Render helpers — áudio, modal, contatos

 */

function bindPlayButtons(container) {

  container?.querySelectorAll('[data-play-audio]').forEach(btn => {

    btn.addEventListener('click', e => {

      e.stopPropagation();

      if (typeof NowPlaying !== 'undefined') {

        NowPlaying.play(btn.dataset.playAudio, btn.dataset.playTitle);

        AnalyticsService.trackMusica(btn.dataset.playTitle);

      }

    });

  });

}



function initVideoModalClose() {

  const modal = document.getElementById('video-modal');

  const close = () => {

    if (typeof VideoModal !== 'undefined') VideoModal.close();

    else {

      modal?.classList.remove('active');

      modal?.setAttribute('aria-hidden', 'true');

      document.documentElement.classList.remove('scroll-locked');

      document.body.classList.remove('scroll-locked');

    }

  };

  modal?.querySelector('.video-modal__close')?.addEventListener('click', close);

  modal?.addEventListener('click', e => {

    const panel = modal.querySelector('.video-modal__content');

    if (panel && !panel.contains(e.target)) close();

  });

  document.addEventListener('keydown', e => {

    if (e.key === 'Escape' && modal?.classList.contains('active')) close();

  });

}



function updateConviteWhatsApp() {

  const btn = document.getElementById('convite-whatsapp');

  if (!btn) return;

  const msg = encodeURIComponent('Olá! Gostaria de solicitar a agenda do Ministério Elias Silva.');

  const phone = ContentService.getSnapshot()?.config?.whatsapp || '5511970472292';

  btn.href = `https://wa.me/${phone}?text=${msg}`;

}



function updateFooterSocial() {

  const redes = ContentService.getSnapshot()?.config?.redes || {};

  const links = {

    youtube: redes.youtube || 'https://www.youtube.com/@cantoreliassilvaoficial',

    instagram: redes.instagram || 'https://www.instagram.com/cantoreliassilvaoficial/',

    facebook: redes.facebook || 'https://www.facebook.com/CANTORELIASSILVAOFICIAL',

    tiktok: redes.tiktok || 'https://www.tiktok.com/@cantoreliassilvaoficial'

  };

  document.querySelectorAll('.footer__social a, .footer-legacy__social a').forEach(a => {

    const label = (a.getAttribute('aria-label') || '').toLowerCase();

    if (label.includes('youtube')) {

      a.href = links.youtube;

      a.target = '_blank';

      a.rel = 'noopener noreferrer';

    } else if (label.includes('instagram')) {

      a.href = links.instagram;

      a.target = '_blank';

      a.rel = 'noopener noreferrer';

    } else if (label.includes('facebook')) {

      a.href = links.facebook;

      a.target = '_blank';

      a.rel = 'noopener noreferrer';

    } else if (label.includes('tiktok')) {

      a.href = links.tiktok;

      a.target = '_blank';

      a.rel = 'noopener noreferrer';

    }

  });

}



function finishPremiumLoad() {

  if (typeof SkeletonUI !== 'undefined') SkeletonUI.doneAll();

}



function isExternalUrl(url) {

  return Boolean(url && url !== '#' && !url.startsWith('#'));

}


