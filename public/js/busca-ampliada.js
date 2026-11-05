
(function () {
  'use strict';

  const CONFIG = {
    seletorResultados: '#catalogResults',
    seletorBusca: '#catalogSearch'
  };

  let ultimaBusca = '';
  let elementoResultados = null;

  function criarElemento(tag, classe, conteudo) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (conteudo) elemento.textContent = conteudo;

    return elemento;
  }

  function criarLinkExterno(url, texto) {
    const link = criarElemento(
      'a',
      'unef-external-link',
      texto
    );

    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    return link;
  }

  function criarCard(livro) {
    const card = criarElemento('article', 'unef-external-card');

    card.append(
      criarElemento(
        'span',
        'unef-source-label',
        '🌐 ' + livro.origem
      )
    );

    card.append(
      criarElemento('h4', '', livro.titulo)
    );

    if (livro.autores) {
      card.append(
        criarElemento('p', '', 'Autor: ' + livro.autores)
      );
    }

    if (livro.ano) {
      card.append(
        criarElemento('p', '', 'Publicação: ' + livro.ano)
      );
    }

    if (livro.assunto) {
      card.append(
        criarElemento('p', '', 'Assunto: ' + livro.assunto)
      );
    }

    card.append(
      criarElemento(
        'span',
        'unef-availability',
        livro.disponibilidade
      )
    );

    if (livro.link) {
      card.append(
        criarLinkExterno(livro.link, 'Consultar livro ↗')
      );
    }

    return card;
  }

  function criarAcoes(termo) {
    const acoes = criarElemento('div', 'unef-external-actions');

    const fontes = [
      {
        nome: 'Pesquisar no Google Books',
        url: 'https://books.google.com/books?q='
      },
      {
        nome: 'Pesquisar no Open Library',
        url: 'https://openlibrary.org/search?q='
      }
    ];

    fontes.forEach(fonte => {
      const link = criarLinkExterno(
        fonte.url + encodeURIComponent(termo),
        fonte.nome + ' ↗'
      );

      link.classList.add('unef-external-button');
      acoes.append(link);
    });

    return acoes;
  }

  function exibirResultados(termo, dados) {
    const antigo = document.getElementById('unefExternalResults');

    if (antigo) antigo.remove();

    const secao = criarElemento('section', 'unef-external-results');
    secao.id = 'unefExternalResults';

    secao.append(
      criarElemento(
        'h3',
        'unef-external-heading',
        '🌐 Pesquisa em fontes externas'
      )
    );

    if (dados.resultados.length) {
      dados.resultados.forEach(livro => {
        secao.append(criarCard(livro));
      });
    } else {
      secao.append(
        criarElemento(
          'div',
          'unef-external-empty',
          'Não encontramos resultados nas fontes externas consultadas. Você pode tentar diretamente nos catálogos abaixo.'
        )
      );
    }

    if (dados.fontesIndisponiveis.length) {
      secao.append(
        criarElemento(
          'p',
          'unef-external-error',
          'Fontes temporariamente indisponíveis: ' +
            dados.fontesIndisponiveis.join(', ')
        )
      );
    }

    secao.append(criarAcoes(termo));

    elementoResultados.append(secao);
  }

  async function pesquisar(termo, seletorAlvo) {
    const busca = String(termo || '').trim();

    if (busca.length < 2) return;

    if (!window.UNEFFontesExternas) {
      console.error('Módulo de fontes externas não carregado.');
      return;
    }

    elementoResultados = document.querySelector(
  seletorAlvo || CONFIG.seletorResultados
);

    if (!elementoResultados) {
      console.error('Área de resultados não encontrada.');
      return;
    }

    ultimaBusca = busca;

    const anterior = document.getElementById('unefExternalResults');
    if (anterior) anterior.remove();

    const secao = criarElemento(
      'section',
      'unef-external-results'
    );

    secao.id = 'unefExternalResults';

    secao.append(
      criarElemento(
        'div',
        'unef-external-loading',
        '🔎 Consultando Google Books e Open Library...'
      )
    );

    elementoResultados.append(secao);

    try {
      const dados = await window.UNEFFontesExternas.pesquisar(busca);

      if (busca !== ultimaBusca) return;

      exibirResultados(busca, dados);
    } catch (erro) {
      if (busca !== ultimaBusca) return;

      secao.replaceChildren(
        criarElemento(
          'div',
          'unef-external-error',
          'Não foi possível concluir a pesquisa externa. Tente novamente.'
        ),
        criarAcoes(busca)
      );

      console.error('Erro na busca ampliada:', erro);
    }
  }

  function inicializar() {
    window.UNEFBuscaAmpliada = {
      pesquisar
    };

    document.addEventListener('unef:buscar-externamente', evento => {
      pesquisar(evento.detail?.termo);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }

})();
