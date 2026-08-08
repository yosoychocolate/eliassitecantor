# Roadmap — Portal Ministério Elias Silva

**Versão atual:** 1.0 (Code Freeze · Produção)  
**Última atualização:** 7 de agosto de 2026

> Este documento planeja versões futuras. **Nada aqui deve ser implementado durante o Code Freeze da v1.0.**

---

## Política de versões

| Tipo de mudança | Versão |
|-----------------|--------|
| Bugfix, segurança, performance, conteúdo | **1.0.x** (permitido no Code Freeze) |
| Novas funcionalidades moderadas | **1.1** |
| Plataforma / ecossistema completo | **2.0** |

---

## v1.0 — Lançamento ✅

**Status:** Publicado · Code Freeze ativo

### Portal
- ✓ Portal Oficial completo
- ✓ Hero Premium (Ken Burns, partículas, animações)
- ✓ Microinterações e skeleton loading
- ✓ Transições de página e scroll premium
- ✓ Lightbox profissional (contador, zoom, swipe, teclado)

### Conteúdo e navegação
- ✓ Memoriais dinâmicos (template único)
- ✓ Agenda automática (futuro vs. realizado)
- ✓ Discografia e videografia
- ✓ Timeline narrativa
- ✓ Mapa do Brasil interativo
- ✓ Testemunhos e biografia
- ✓ Galeria Dourados (30 fotos curadas)

### Plataforma
- ✓ Busca global
- ✓ Favoritos (memoriais salvos)
- ✓ Compartilhamento social
- ✓ Modo TV
- ✓ PWA (manifest + service worker)
- ✓ Analytics local (admin stub)

### Qualidade
- ✓ SEO (Schema.org, sitemap, OG, Twitter)
- ✓ Acessibilidade (WCAG — skip link, ARIA, contraste)
- ✓ Segurança (CSP, headers)
- ✓ Deploy multi-plataforma (Netlify, Cloudflare, Vercel)

### Conteúdo pendente (não é código)
- [ ] URLs reais de YouTube, Spotify, Deezer, Apple Music
- [ ] Todos os álbuns da discografia
- [ ] Todos os clipes oficiais
- [ ] Memoriais de cada cidade visitada
- [ ] Fotos históricas do acervo
- [ ] Testemunhos adicionais
- [ ] Página «Legado» dedicada (linha do tempo narrativa — ver [`POLITICA-EDITORIAL.md`](docs/POLITICA-EDITORIAL.md))
- [ ] WhatsApp e redes sociais reais no footer

---

## v1.0.x — Manutenção (Code Freeze)

Alterações permitidas sem bump de versão minor:

| Tipo | Exemplos |
|------|----------|
| 🐛 Bugfix | Memorial não abre, filtro de galeria quebrado |
| 🔒 Segurança | Atualizar CSP, corrigir mixed content |
| ⚡ Performance | Comprimir imagem, ajustar cache, excluir originais do deploy |
| 📝 Conteúdo | Novos JSON, fotos, textos, links |

---

## v1.1 — CMS e gestão de conteúdo

**Objetivo:** Permitir que não-desenvolvedores atualizem o portal com segurança.

### Backend e dados
- [ ] Painel administrativo web
- [ ] Login e autenticação (roles: admin, editor)
- [ ] Banco de dados (Firebase, Supabase ou PostgreSQL)
- [ ] API REST ou GraphQL
- [ ] Substituir `JsonDataAdapter` por `ApiDataAdapter` em produção
- [ ] Validador de conteúdo antes de publicar
- [ ] Preview de memorial antes de ir ao ar

### Conteúdo e mídia
- [ ] Upload de imagens com geração automática de thumbs/display/WebP
- [ ] Editor WYSIWYG para descrições de cultos
- [ ] Gestão de galeria por categorias (drag-and-drop)
- [ ] Importação em lote de fotos

### Portal
- [ ] Área para igrejas (solicitar agenda online)
- [ ] Blog / notícias do ministério
- [ ] Newsletter (integração Mailchimp, Brevo ou similar)
- [ ] Paginação na listagem de memoriais
- [ ] Estado de erro amigável quando API falha

### Engenharia
- [ ] Bundler (Vite/esbuild) — reduzir requests JS
- [ ] ES modules
- [ ] Remoção de código legado (Swiper, contact form stub)
- [ ] CI/CD com testes smoke
- [ ] `.gitignore` / pipeline que exclui originais full-res do deploy
- [ ] Testes E2E básicos (home, memorial, memoriais)

**Estimativa de esforço:** 4–8 semanas (1 dev + conteúdo)

---

## v1.2 — Engajamento (opcional, pós-1.1)

- [ ] Comentários moderados em memoriais
- [ ] “Marque presença” em cultos passados
- [ ] Download de fotos (com permissão)
- [ ] Integração calendário (Google Calendar / iCal) para agenda
- [ ] Notificações PWA para novos memoriais
- [ ] Multilíngua (PT / EN) para alcance internacional

---

## v2.0 — Plataforma completa

**Objetivo:** Transformar o portal em ecossistema digital do ministério.

### Aplicativo
- [ ] App nativo ou React Native / Capacitor
- [ ] Push notifications
- [ ] Modo offline completo (acervo de memoriais)
- [ ] Player de música integrado

### Streaming e mídia
- [ ] Streaming de cultos ao vivo
- [ ] Biblioteca de vídeos com playlists
- [ ] Podcast / devocionais em áudio

### Parceiros e operação
- [ ] Área do parceiro (igrejas, eventos, contratos)
- [ ] Dashboard completo (analytics, audiência, cidades)
- [ ] CRM básico para agenda e follow-up
- [ ] Relatórios exportáveis (PDF, Excel)

### Escala
- [ ] CDN dedicada para mídia
- [ ] Busca full-text (Algolia ou similar)
- [ ] Arquivo histórico completo (milhares de fotos) com busca visual

**Estimativa de esforço:** 3–6 meses (equipe)

---

## Matriz de prioridade

```
Impacto no ministério
        ▲
        │  v2.0 App          v1.1 CMS
        │       ·                ·
        │  v1.2 Engajamento
        │       ·
        │  v1.0 Conteúdo ←── VOCÊ ESTÁ AQUI (maior ROI agora)
        └──────────────────────────────► Esforço técnico
```

---

## Princípio orientador

> Um portal como este ganha valor **pelo acervo**, não pela quantidade de funcionalidades.

Prioridade imediata (v1.0): **alimentar conteúdo** — memoriais, clipes, fotos, biografia, agenda.

Prioridade v1.1: **facilitar quem alimenta** — CMS, upload, preview.

Prioridade v2.0: **expandir o ecossistema** — app, streaming, parceiros.

---

## Como propor itens para o roadmap

1. Verificar se é bugfix/conteúdo (v1.0.x) ou feature (v1.1+).
2. Descrever o problema do usuário, não a solução técnica.
3. Estimar impacto no ministério vs. esforço de desenvolvimento.
4. Aguardar fim do Code Freeze ou abrir discussão para v1.1.

---

*Portal Oficial do Ministério Elias Silva — Versão 1.0*
