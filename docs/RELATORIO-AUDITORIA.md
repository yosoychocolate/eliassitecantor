# Release Candidate v1.0 — Auditoria

> Gerado em: 7 de agosto de 2026  
> Portal Oficial do Ministério Elias Silva

---

## Resumo executivo

| Área | Status |
|------|--------|
| Assets (404) | ✅ Corrigido |
| Links quebrados | ✅ Corrigido |
| Arquivos legados | ✅ Removidos |
| Console.log em produção | ✅ Nenhum |
| Deploy (Netlify/Vercel/CF) | ✅ Configurado |
| SEO | ✅ Ver relatório SEO |
| Performance local | ⚠️ Ver nota abaixo |

---

## 1. Auditoria de assets

### Corrigido nesta RC

| Arquivo ausente | Ação |
|-----------------|------|
| `assets/images/lancamentos/deus-nao-falha.jpg` | Referência atualizada para `hero-dourados.jpg` em `content/videos.json` |
| `assets/music/*.mp3` (3 arquivos) | Campos `audio` removidos de `content/musicas.json` até os arquivos serem adicionados |

### Assets válidos

- **253 arquivos** em `assets/` (galeria Dourados: thumbs + display + hero)
- Favicons SVG em `assets/icons/`

---

## 2. Arquivos removidos (legado)

| Item | Motivo |
|------|--------|
| `data/*.json` (9 arquivos) | Duplicata de `/content` — fonte única é `content/` |
| `eventos/*.html` (4 páginas) | Substituídas por `memorial.html` + redirects |
| `_galeria-temp.json` | Arquivo temporário de curadoria |
| `js/gallery.js`, `js/music.js`, `js/portal/data.js` | Removidos na fase premium (sessão anterior) |

---

## 3. Links e navegação

| Verificação | Resultado |
|-------------|-----------|
| Navegação principal | OK |
| Memoriais → memorial dinâmico | OK (`memorial.html?evento=slug`) |
| URLs limpas | OK via `_redirects`, `netlify.toml`, `vercel.json` |
| Links `#` em redes sociais (footer) | Placeholder — atualizar quando URLs reais existirem |
| Spotify/Deezer/Apple `#` | Ocultos no render até URLs reais |

---

## 4. JavaScript

| Arquivo | Linhas | Status |
|---------|--------|--------|
| Todos os módulos `js/` | < 300 | ✅ |
| `initSwipers()` | — | Inativo (Swiper não carregado — CSS legado mantido) |
| `console.log` | — | Apenas em `scripts/generate-sitemap.js` (CLI, não produção) |

---

## 5. CSS

| Observação | Detalhe |
|------------|---------|
| Estilos Swiper (`.noticias-swiper`) | Não utilizados na UI atual — baixo impacto (~80 linhas) |
| Fontes Google | Cormorant Garamond + Montserrat — ambas em uso |
| Font Awesome | Ícones em todo o portal — necessário |

---

## 6. Erros de console / rede

| Erro | Status |
|------|--------|
| 404 em imagens | ✅ Corrigido |
| 404 em MP3 | ✅ Corrigido (campos removidos) |
| Mixed content | ✅ Nenhum (todos os recursos externos via HTTPS) |

---

## 7. Performance

| Otimização | Implementado |
|------------|--------------|
| Preload fontes | ✅ `index.html` |
| Preload Hero | ✅ `render-hero.js` |
| Lazy loading imagens | ✅ `loading="lazy"` + Intersection Observer na galeria |
| Cache estático | ✅ `_headers`, `.htaccess`, `netlify.toml`, `vercel.json` |
| Font Awesome async | ✅ `media="print" onload` |
| GSAP defer | ✅ |
| Service Worker | ✅ `sw.js` v1.0 |
| Compressão imagens | ✅ Thumbs ~34 KB; display otimizadas |

**Nota:** Lighthouse local (`npx serve`) não aplica cache headers — em produção a performance melhora significativamente. Meta: **< 2s em 4G** com CDN + cache.

---

## 8. Mobile e Safe Area

| Item | Status |
|------|--------|
| `viewport-fit=cover` | ✅ |
| `env(safe-area-inset-*)` | ✅ header, back-to-top, now-playing |
| Breakpoints 320–1920px | ✅ `responsive.css` + `premium.css` |

---

## 9. Segurança

| Item | Status |
|------|--------|
| Content-Security-Policy | ✅ |
| Referrer-Policy | ✅ |
| Permissions-Policy | ✅ |
| X-Content-Type-Options | ✅ |
| HTTPS | Automático em Netlify/Vercel/Cloudflare |

---

## 10. Deploy

| Plataforma | Arquivo de config |
|------------|-------------------|
| Netlify | `netlify.toml` + `_redirects` + `_headers` |
| Cloudflare Pages | `_redirects` + `_headers` |
| Vercel | `vercel.json` |
| Apache | `.htaccess` |

**Comando de build (opcional):**
```bash
node scripts/generate-sitemap.js https://ministerioeliassilva.com.br
```

---

## Próxima etapa (conteúdo, não código)

- Cadastrar álbuns e clipes reais do YouTube
- Adicionar fotos históricas aos memoriais
- Inserir URLs reais de Spotify/Deezer/Apple
- Adicionar arquivos MP3 quando disponíveis
- Enriquecer biografia e testemunhos

---

*Portal Oficial do Ministério Elias Silva — Versão 1.0*
