# Relatório SEO — v1.0

> Gerado em: 7 de agosto de 2026

---

## Checklist

| Item | Status | Detalhe |
|------|--------|---------|
| **sitemap.xml** | ✅ | 6 URLs — home, memoriais, tv, 4 memoriais |
| **robots.txt** | ✅ | Allow all + Sitemap URL |
| **canonical** | ✅ | `index.html` + dinâmico via `PortalSEO` |
| **Open Graph** | ✅ | title, description, image, type, url |
| **Twitter Card** | ✅ | summary_large_image |
| **Schema.org** | ✅ | Person, MusicGroup, Event, ImageGallery, VideoObject, Breadcrumb |
| **meta description** | ✅ | Todas as páginas principais |
| **title** | ✅ | Dinâmico por página/memorial |
| **lang** | ✅ | `pt-BR` |
| **manifest.json** | ✅ | PWA configurado |
| **favicon** | ✅ | SVG + mask icon |

---

## URLs no sitemap

```
https://ministerioeliassilva.com.br/
https://ministerioeliassilva.com.br/memoriais.html
https://ministerioeliassilva.com.br/tv.html
https://ministerioeliassilva.com.br/memorial/dourados-ms
https://ministerioeliassilva.com.br/memorial/campo-grande-ms
https://ministerioeliassilva.com.br/memorial/guarulhos-sp
https://ministerioeliassilva.com.br/memorial/recife-pe
```

**Regenerar após novo memorial:**
```bash
node scripts/generate-sitemap.js https://ministerioeliassilva.com.br
```

---

## Schema.org por página

| Página | Tipos |
|--------|-------|
| Home | Person, MusicGroup, WebSite, VideoObject (top 3) |
| Memorial | Event, ImageGallery, BreadcrumbList, VideoObject |
| Memoriais | WebSite meta via PortalSEO |

---

## Ações pendentes (conteúdo)

1. Atualizar `siteUrl` em `content/config.json` com domínio final de produção
2. Substituir `@ministerioeliassilva` por handle real do Twitter/X
3. Adicionar URLs reais de Instagram/YouTube/Spotify no footer
4. Regenerar sitemap ao publicar novos memoriais

---

*Versão 1.0 — Ministério Elias Silva*
