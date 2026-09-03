/**

 * Render Home — portal de legado (Home Viva)

 */

async function renderSite() {

  await ContentService.init('');

  if (typeof SearchService !== 'undefined') SearchService.clearCache();



  if (!ContentService.getSnapshot().videos?.length) {
    showContentError('Alguns vídeos não carregaram. Recarregue com Ctrl+F5 ou limpe o cache do navegador.');
  }



  if (typeof AnalyticsService !== 'undefined') AnalyticsService.trackPage('home');

  if (typeof PortalSEO !== 'undefined') PortalSEO.forHome();



  renderLancamentoFeaturedOnly();

  renderProximaMinistracao();

  renderAgendaSection();

  renderHojeNaHistoria();

  renderLinhaTempoHorizontal();

  renderMemorialDestaque();

  renderDiscografiaTeaser();

  renderVideotecaTeaser();

  renderFraseFinal();

  updateConviteWhatsApp();

  updateFooterSocial();

  initVideoModalClose();

}



function showContentError(msg) {

  const el = document.getElementById('lancamentos') || document.getElementById('portal-content');

  if (!el || el.querySelector('.portal-load-error')) return;

  el.insertAdjacentHTML('afterbegin',

    `<div class="portal-load-error container" role="alert"><p>${msg}</p></div>`);

}



function showFileProtocolNotice() {

  const content = document.querySelector('.home-opening__content');

  if (!content || content.querySelector('.home-opening__file-hint')) return;



  content.insertAdjacentHTML('beforeend', `

    <div class="home-opening__file-hint" role="alert">
      <p><strong>Servidor local necessário.</strong></p>
      <p>Duplo clique em <strong>ABRIR-SITE.bat</strong> na pasta do site — ou clique em <strong>Entrar no Portal</strong> abaixo se o servidor já estiver ativo.</p>
    </div>`);



  showContentError('Conteúdo indisponível em file:// — use ABRIR-SITE.bat para abrir corretamente.');

}



document.addEventListener('DOMContentLoaded', () => {

  if (document.body.dataset.page !== 'home') return;



  initHomeOpening();



  if (location.protocol === 'file:') {

    showFileProtocolNotice();

    return;

  }



  ContentService.init('').then(() => renderSite()).catch(() => {

    showContentError('Erro ao carregar o portal. Verifique sua conexão e recarregue.');

    updateConviteWhatsApp();

  });

});


