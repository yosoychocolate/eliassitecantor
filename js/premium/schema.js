const SchemaOrg = {
  inject(data) {
    document.getElementById('schema-org')?.remove();
    const s = document.createElement('script');
    s.id = 'schema-org';
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  },

  graph(items) {
    this.inject({ '@context': 'https://schema.org', '@graph': items });
  },

  async home() {
    const base = location.origin + location.pathname.replace(/[^/]*$/, '');
    const snap = typeof ContentService !== 'undefined' ? ContentService.getSnapshot?.() : null;
    const graph = [
      {
        '@type': 'Person',
        '@id': base + '#person',
        name: 'Elias Ferreira da Silva',
        alternateName: 'Elias Silva',
        jobTitle: 'Cantor Gospel',
        birthDate: '1959-01-05',
        nationality: { '@type': 'Country', name: 'Brasil' },
        sameAs: [
          'https://www.youtube.com/@cantoreliassilvaoficial',
          'https://www.instagram.com/cantoreliassilvaoficial/',
          'https://www.facebook.com/CANTORELIASSILVAOFICIAL',
          'https://www.tiktok.com/@cantoreliassilvaoficial'
        ]
      },
      {
        '@type': 'MusicGroup',
        name: 'Ministério Elias Silva',
        genre: 'Gospel',
        member: { '@type': 'Person', name: 'Elias Ferreira da Silva' }
      },
      {
        '@type': 'WebSite',
        name: 'Ministério Elias Silva',
        url: base,
        publisher: { '@id': base + '#person' }
      }
    ];

    snap?.videos?.slice(0, 3).forEach(v => {
      graph.push({
        '@type': 'VideoObject',
        name: v.titulo,
        uploadDate: v.ano ? `${v.ano}-01-01` : undefined,
        contentUrl: v.youtube ? `https://youtube.com/watch?v=${youtubeId(v.youtube)}` : undefined
      });
    });

    this.graph(graph);
  },

  memorial(ev) {
    const videos = (ev.videos || []).map(v => ({
      '@type': 'VideoObject',
      name: v.titulo,
      contentUrl: `https://youtube.com/watch?v=${youtubeId(v.youtube)}`
    }));

    this.graph([
      {
        '@type': 'Event',
        name: ev.titulo + ' — ' + ev.cidade,
        startDate: ev.data,
        location: { '@type': 'Place', name: ev.titulo, address: { '@type': 'PostalAddress', addressLocality: ev.cidade, addressRegion: ev.estado, addressCountry: 'BR' } },
        performer: { '@type': 'Person', name: 'Elias Ferreira da Silva' }
      },
      { '@type': 'ImageGallery', name: 'Galeria ' + ev.titulo, numberOfItems: ev.galeria?.length || 0 },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'index.html' },
          { '@type': 'ListItem', position: 2, name: 'Memoriais', item: 'memoriais.html' },
          { '@type': 'ListItem', position: 3, name: ev.cidade }
        ]
      }
    ].concat(videos));
  }
};
