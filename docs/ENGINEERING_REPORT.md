# Engineering Report — Portal Ministério Elias Silva

**Versão:** 1.0  
**Status:** Code Freeze · Produção  
**Data:** 7 de agosto de 2026  
**Escopo:** Análise técnica do estado atual — sem alterações de código

---

## Política de Code Freeze

A partir da v1.0, **nenhuma funcionalidade nova** entra no projeto. Alterações permitidas:

| Classificação | Exemplos |
|---------------|----------|
| 🐛 **Bugfix** | Link quebrado, erro de render, memorial não carrega |
| 🔒 **Segurança** | CSP, dependência vulnerável, mixed content |
| ⚡ **Performance** | Compressão de imagem, cache, lazy load |
| 📝 **Conteúdo** | JSON em `/content`, fotos, textos, URLs |

Qualquer feature nova aguarda **v1.1** — ver [`ROADMAP.md`](ROADMAP.md).

---

## 1. Visão geral da arquitetura

### 1.1 Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  Camada de apresentação                                     │
│  index.html · memoriais.html · memorial.html · tv.html      │
│  js/portal/* · js/premium/* · js/nav.js · js/main.js       │
└────────────────────────────┬────────────────────────────────┘
                             │ ContentService.init()
                             │ getSnapshot() / helpers globais
┌────────────────────────────▼────────────────────────────────┐
│  Camada de serviços                                         │
│  services/contentService.js  ← porta única de dados         │
│  services/imageService.js · searchService.js · etc.         │
│  services/adapters/jsonAdapter.js                           │
└────────────────────────────┬────────────────────────────────┘
                             │ fetch(content/*.json)
┌────────────────────────────▼────────────────────────────────┐
│  Camada de dados                                            │
│  content/*.json  ← única fonte editável                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Fluxo de dados

1. Página carrega scripts na ordem definida no HTML (sem bundler, sem ES modules).
2. `ContentService.init(basePath)` dispara `JsonDataAdapter.loadAll()` — 7 fetches paralelos para `/content/*.json`.
3. Dados normalizados ficam em `ContentService._data` (snapshot em memória).
4. Módulos `js/portal/render-*.js` montam o DOM a partir do snapshot.
5. Componentes reutilizáveis (`PortalGallery`, `SearchUI`, `FavoritesService`) operam sobre o snapshot ou DOM já renderizado.

### 1.3 Dependências entre módulos

| Módulo | Depende de |
|--------|------------|
| `render-home.js` | ContentService, render-*, PortalSEO, SchemaOrg, SkeletonUI |
| `memorial.js` | ContentService, PortalRouter, PortalGallery, ShareService |
| `gallery.js` | ImageService, GLightbox (CDN, só memorial) |
| `contentService.js` | Ministry, JsonDataAdapter, NarrativeService |
| `narrativeService.js` | Ministry, ContentService (snapshot) |
| `searchService.js` | ContentService (snapshot) |

**Dependências circulares:** nenhuma detectada. O grafo é unidirecional: `content → services → portal → DOM`.

### 1.4 Acoplamento

| Aspecto | Avaliação |
|---------|-----------|
| Dados vs. UI | ✅ Boa separação via ContentService |
| Acoplamento global | ⚠️ Funções e objetos no escopo global (`window`) |
| Ordem de scripts | ⚠️ Frágil — ordem errada quebra o site |
| Helpers legados | ⚠️ Duplicação sync/async em `contentService.js` |
| CDN externo | ⚠️ GSAP, Font Awesome, Google Fonts, GLightbox |

---

## 2. Organização de pastas

```
site cantor/
├── content/          ← EDITAR AQUI (dados)
├── services/         ← Lógica de negócio / dados
├── js/
│   ├── portal/       ← Render por página/feature
│   ├── premium/      ← Polish (skeleton, schema, experience)
│   ├── ministry.js   ← Helpers de domínio (datas, memorial vs agenda)
│   ├── main.js       ← Nav, scroll, PWA, utilitários globais
│   ├── animations.js ← GSAP scroll animations (home)
│   └── player.js     ← Now Playing (áudio)
├── css/              ← 7 folhas modulares por domínio visual
├── assets/           ← Imagens, ícones (ver §6 — atenção ao peso)
├── scripts/          ← CLI (sitemap, audit, thumbs) — não vai pro browser
├── docs/             ← Relatórios e documentação
└── admin/            ← Stub analytics local
```

**Pontos fortes:** estrutura previsível, `/content` como CMS manual, serviços isolados.  
**Pontos de atenção:** pasta `assets/images/eventos/dourados/` contém **originais full-res** (~3,9 GB) além das versões usadas pelo site (thumbs/display).

---

## 3. Análise de código

### 3.1 Métricas JavaScript

| Métrica | Valor |
|---------|-------|
| Arquivos JS (app + services) | 28 |
| Linhas totais (approx.) | ~2.400 |
| Peso total (não minificado) | **92 KB** |
| Maior arquivo | `main.js` (277 linhas) |
| Limite interno | 300 linhas/arquivo ✅ |

**Scripts carregados na home (`index.html`):** 22 arquivos locais + 2 CDN (GSAP).

### 3.2 Funções / código não utilizado

| Item | Local | Impacto | Ação sugerida (v1.1+) |
|------|-------|---------|------------------------|
| `getLatestVideo()` | `contentService.js` | Nunca chamada | Remover ou usar no hero/TV |
| `loadPortal()` | `contentService.js` | Alias morto | Remover |
| `initSwipers()` | `main.js` | Swiper CDN não carregado | Remover função + CSS Swiper |
| `initContactForm()` | `main.js` | `#contato-form` não existe no HTML | Remover ou restaurar formulário |
| CSS `.noticias-swiper` / `.depoimentos-swiper` | `style.css` | ~60 linhas sem markup | Remover na v1.1 |
| `content/agenda.json` | `/content` | Arquivo informativo apenas | Manter como doc ou remover |
| `ApiDataAdapter` | `jsonAdapter.js` | Stub para v1.1 | OK — documentado |

### 3.3 Duplicação de lógica

| Duplicação | Onde | Risco |
|------------|------|-------|
| `computeStats()` | Global sync vs `ContentService.computeStats()` async | Contagens de vídeos divergem levemente |
| Helpers `getMemoriais()`, `getAgendaEventos()` | Globais + métodos async no ContentService | Manutenção dupla |
| Modal de vídeo YouTube | `main.js` (`initVideoModal`) + `render-helpers.js` (`openYoutube`) | Dois caminhos para o mesmo modal |
| Parallax | `animations.js` (home) + `memorial.js` (event hero) | OK — contextos diferentes |
| Footer | `index.html` estático + `nav.js` (`renderSiteFooter`) | Textos duplicados manualmente |

### 3.4 Comentários e logs

| Tipo | Encontrado |
|------|------------|
| `console.log` em produção | ❌ Nenhum |
| `console.log` em CLI | ✅ `scripts/generate-sitemap.js`, `scripts/audit-rc.js` |
| `TODO` / `FIXME` | ❌ Nenhum |
| Comentários temporários | ❌ Nenhum |

---

## 4. JavaScript — runtime e memória

### 4.1 Timers ativos

| Timer | Arquivo | Limpeza | Risco |
|-------|---------|---------|-------|
| `setInterval` (hero slides, 8s) | `render-hero.js` | ❌ Nunca `clearInterval` | Baixo — MPA, página descarrega ao navegar |
| `setTimeout` (debounce busca) | `search-ui.js` | ✅ Sobrescreve `timer` | OK |
| `setTimeout` (TV slideshow) | `tv.js` | ⚠️ Sem `clearTimeout` ao sair | Baixo |
| `setTimeout` (preloader, page transition) | `main.js`, `experience.js` | One-shot | OK |

### 4.2 Event listeners

| Padrão | Avaliação |
|--------|-----------|
| `{ once: true }` em imagens | ✅ Usado em `gallery.js` |
| `{ passive: true }` em scroll | ✅ Usado em memorial, experience |
| `document.addEventListener('keydown')` | ⚠️ Registrado em `main.js` e `render-helpers.js` — possível duplicação do handler Escape |
| Listeners em DOM re-renderizado | ⚠️ Painéis de mapa recriam listeners a cada clique — OK pois DOM é substituído |

### 4.3 Promises e erros silenciosos

| Local | Comportamento | Risco |
|-------|---------------|-------|
| `JsonDataAdapter.fetch()` | `catch → return {}` | Falha de rede = site vazio sem mensagem |
| `ContentService.init().then(...)` | Sem `.catch()` em `render-home.js` | Erro não tratado no console |
| `navigator.serviceWorker.register()` | `.catch(() => {})` | Falha SW ignorada — aceitável |
| `ShareService` navigator.share | try/catch implícito via async | OK |

**Recomendação v1.1:** estado de erro visível quando JSON falha ao carregar.

---

## 5. CSS

| Folha | Peso | Função |
|-------|------|--------|
| `style.css` | ~28 KB | Base, layout, footer, hero |
| `experience.css` | ~22 KB | Lançamento, discografia, mapa |
| `memorials.css` | ~12 KB | Páginas de evento/memorial |
| `platform.css` | ~4 KB | Busca, favoritos, admin |
| `responsive.css` | ~3 KB | Breakpoints |
| `premium.css` | ~3 KB | Safe area, skeleton, cinema |
| `animations.css` | ~1 KB | Keyframes |
| **Total** | **~73 KB** | 7 requests |

**CSS morto estimado:** ~60–80 linhas (Swiper) + estilos de formulário de contato se nunca usado.

**Duplicação:** variáveis CSS centralizadas em `style.css` (`:root`) — boa prática. Alguns inline styles residuais em `index.html` (seção mapa) — baixo impacto.

---

## 6. Performance — métricas

### 6.1 Tamanho do projeto

| Categoria | Quantidade | Peso |
|-----------|------------|------|
| **Total no disco** | ~250 arquivos | **~3,95 GB** |
| Imagens (todas) | 241 | ~3,95 GB |
| — Thumbs (30) | 30 | ~1,0 MB |
| — Display (30) | 30 | ~6,1 MB |
| — Originais Dourados (178) | 178 | **~3,94 GB** ⚠️ |
| JavaScript (app) | 28 arquivos | 92 KB |
| CSS | 7 arquivos | 73 KB |
| HTML | 5 páginas | 26 KB |
| JSON `/content` | 8 arquivos | 16 KB |

> ⚠️ **Crítico para deploy:** o site usa apenas **30 thumbs + 30 display + hero (~286 KB)**. Os 178 originais full-res **não devem ir para produção** — manter apenas em arquivo local ou storage separado.

### 6.2 Payload estimado — primeira visita (home, 4G)

| Recurso | Peso estimado |
|---------|---------------|
| HTML + CSS local | ~100 KB |
| JS local (22 arquivos) | ~95 KB |
| JSON content (7 fetches) | ~16 KB |
| Hero image (preload) | ~286 KB |
| GSAP + ScrollTrigger (CDN) | ~110 KB gzip |
| Google Fonts (2 famílias) | ~80–120 KB |
| Font Awesome (async CDN) | ~75 KB gzip |
| **Total crítico** | **~750 KB – 900 KB** |

**Tempo estimado (4G, ~4 Mbps efetivo, sem cache):** **1,8 – 2,5 s** até conteúdo visível — dentro da meta de < 2 s em condições favoráveis.  
**Com cache/CDN/HTTP2:** **< 1 s**.

Memorial com galeria: +thumbs sob demanda (lazy) — ~34 KB/foto, apenas visíveis carregam.

### 6.3 Otimizações já implementadas

- Lazy load + Intersection Observer (`ImageService`, `PortalGallery`)
- Preload hero + fontes
- Font Awesome non-blocking
- GSAP defer
- Service Worker (`sw.js` v1.0)
- Cache headers (`_headers`, `netlify.toml`, `vercel.json`)
- Thumbnails gerados via script PowerShell

---

## 7. Pontos fortes

1. **Arquitetura CMS-ready** — trocar `JsonDataAdapter` por API sem reescrever UI.
2. **ContentService como porta única** — regra clara para novos devs.
3. **Template único de memorial** — escalável para N cidades.
4. **Classificação automática agenda/memorial** por data — zero lógica manual.
5. **Modularização JS** — arquivos pequenos, responsabilidades reconhecíveis.
6. **SEO/PWA/Segurança** — Schema.org, sitemap, CSP, manifest, SW.
7. **Deploy multi-plataforma** — Netlify, Cloudflare, Vercel, Apache.
8. **Documentação RC** — README, CHANGELOG, relatórios de auditoria e SEO.

---

## 8. Pontos de atenção

| # | Item | Severidade |
|---|------|------------|
| 1 | 3,9 GB de originais na pasta do projeto | 🔴 Deploy |
| 2 | Sem ES modules / bundler — 22 requests JS na home | 🟡 Performance |
| 3 | Erros de fetch silenciosos | 🟡 UX/Debug |
| 4 | Código legado morto (Swiper, contact form, helpers) | 🟢 Dívida leve |
| 5 | Footer duplicado (HTML estático vs nav.js) | 🟢 Manutenção |
| 6 | Placeholders YouTube (`dQw4w9WgXcQ`) e links `#` | 🟡 Conteúdo |
| 7 | WhatsApp/ redes sociais com URLs placeholder | 🟡 Conteúdo |

---

## 9. Dívida técnica

| Item | Esforço | Prioridade v1.1 |
|------|---------|-----------------|
| Remover JS/CSS morto | 2h | Média |
| Unificar helpers sync/async do ContentService | 4h | Média |
| Bundler (esbuild/vite) para reduzir requests | 1–2 dias | Alta |
| Excluir originais do deploy (`.gitignore` / CI) | 1h | **Alta** |
| Tratamento de erro global de carregamento | 4h | Alta |
| Unificar modal YouTube em um módulo | 2h | Baixa |
| Migrar para ES modules | 2–3 dias | Média |

**Dívida total estimada:** baixa a moderada — projeto saudável para v1.0.

---

## 10. Riscos futuros

| Risco | Mitigação |
|-------|-----------|
| Repo/deploy com 4 GB de fotos | Script de deploy que copia só thumbs/display |
| Edição manual de JSON com erro de sintaxe | Validador JSON no CI (v1.1) |
| Ordem de scripts quebrada por refactor | Bundler ou teste E2E smoke |
| CDN externo indisponível | Self-host Font Awesome/GSAP (v1.1) |
| Crescimento de memoriais sem paginação | Índice de memoriais paginado (v1.1+) |
| Conteúdo placeholder em produção | Checklist de conteúdo antes de go-live |

---

## 11. Melhorias sugeridas para v1.1

*(Não implementar na v1.0 — ver ROADMAP.md)*

- Painel admin com login
- API + banco de dados (substituir JSON)
- Bundler e code splitting
- Validador de conteúdo / preview antes de publicar
- Remoção de código legado
- Paginação na listagem de memoriais
- Upload de imagens com otimização automática
- Error boundary visual (“portal não carregou”)

---

## 12. Como assumir o projeto

1. Ler [`README.md`](../README.md) — arquitetura e fluxos de conteúdo.
2. Servir localmente: `npx serve . -l 3456`
3. Editar **apenas** `/content` para mudanças de conteúdo.
4. Respeitar **Code Freeze** — classificar toda mudança (bugfix/segurança/performance/conteúdo).
5. Consultar [`ROADMAP.md`](ROADMAP.md) antes de propor features.
6. Regenerar sitemap após novo memorial:  
   `node scripts/generate-sitemap.js https://seudominio.com.br`

---

## 13. Conclusão

O Portal Oficial do Ministério Elias Silva **v1.0** é um site estático profissional com arquitetura modular, separação dados/UI, base sólida para SEO/PWA e caminho claro para CMS na v1.1. A dívida técnica é **gerenciável**; o maior fator de sucesso daqui em diante é **conteúdo**, não código.

---

*Relatório gerado em Code Freeze — v1.0 · 7 de agosto de 2026*
