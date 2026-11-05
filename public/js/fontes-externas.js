
(function () {
  'use strict';

  const FONTES = {
    google: 'https://www.googleapis.com/books/v1/volumes',
    openLibrary: 'https://openlibrary.org/search.json'
  };

  const MAX_RESULTADOS = 8;

  function textoSeguro(valor) {
    return String(valor || '').trim();
  }

  function linkSeguro(url) {
    try {
      const endereco = new URL(url);
      const dominiosPermitidos = [
        'books.google.com',
        'play.google.com',
        'openlibrary.org'
      ];

      return endereco.protocol === 'https:' &&
        dominiosPermitidos.includes(endereco.hostname)
        ? endereco.href
        : '';
    } catch {
      return '';
    }
  }

  function converterGoogle(livro) {
    const info = livro.volumeInfo || {};
    const acesso = livro.accessInfo || {};
    const visualizacao = acesso.viewability || '';

    let disponibilidade = 'Consultar disponibilidade';

    if (acesso.publicDomain || visualizacao === 'ALL_PAGES') {
      disponibilidade = 'Texto completo disponível';
    } else if (visualizacao === 'PARTIAL') {
      disponibilidade = 'Prévia disponível';
    } else if (acesso.saleInfo?.saleability === 'FOR_SALE') {
      disponibilidade = 'Disponível para compra';
    }

    const link = linkSeguro(
      info.infoLink || info.canonicalVolumeLink ||
      `https://books.google.com/books?q=${encodeURIComponent(info.title || '')}`
    );

    return {
      origem: 'Google Books',
      titulo: textoSeguro(info.title) || 'Título não informado',
      autores: Array.isArray(info.authors) ? info.authors.join(', ') : '',
      ano: textoSeguro(info.publishedDate),
      assunto: Array.isArray(info.categories) ? info.categories.join(', ') : '',
      disponibilidade,
      link
    };
  }

  function converterOpenLibrary(livro) {
    const link = linkSeguro(
      livro.key ? `https://openlibrary.org${livro.key}` : ''
    );

    return {
      origem: 'Open Library',
      titulo: textoSeguro(livro.title) || 'Título não informado',
      autores: Array.isArray(livro.author_name)
        ? livro.author_name.join(', ')
        : '',
      ano: livro.first_publish_year || '',
      assunto: Array.isArray(livro.subject)
        ? livro.subject.slice(0, 3).join(', ')
        : '',
      disponibilidade: 'Registro em catálogo externo; acesso ao texto não garantido',
      link
    };
  }

  async function consultarGoogle(termo) {
    const url = new URL(FONTES.google);
    url.searchParams.set('q', termo);
    url.searchParams.set('maxResults', String(MAX_RESULTADOS));
    url.searchParams.set('printType', 'books');

    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error('Google Books indisponível');
    }

    const dados = await resposta.json();

    return (dados.items || [])
      .map(converterGoogle)
      .filter(livro => livro.titulo && livro.link);
  }

  async function consultarOpenLibrary(termo) {
    const url = new URL(FONTES.openLibrary);
    url.searchParams.set('q', termo);
    url.searchParams.set('limit', String(MAX_RESULTADOS));
    url.searchParams.set(
      'fields',
      'title,author_name,first_publish_year,subject,key'
    );

    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error('Open Library indisponível');
    }

    const dados = await resposta.json();

    return (dados.docs || [])
      .map(converterOpenLibrary)
      .filter(livro => livro.titulo && livro.link);
  }

  async function pesquisar(termo) {
    const busca = textoSeguro(termo);

    if (busca.length < 2) {
      return {
        resultados: [],
        fontesIndisponiveis: []
      };
    }

    const consultas = await Promise.allSettled([
      consultarGoogle(busca),
      consultarOpenLibrary(busca)
    ]);

    const resultados = [];
    const fontesIndisponiveis = [];

    consultas.forEach((resultado, indice) => {
      if (resultado.status === 'fulfilled') {
        resultados.push(...resultado.value);
      } else {
        fontesIndisponiveis.push(
          indice === 0 ? 'Google Books' : 'Open Library'
        );
      }
    });

    return {
      resultados,
      fontesIndisponiveis
    };
  }

  window.UNEFFontesExternas = {
    pesquisar
  };

})();
