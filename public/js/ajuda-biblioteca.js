
(function () {
  'use strict';

  const perguntas = [
    {
      pergunta: 'Como pesquisar um livro?',
      resposta: 'Digite o título, autor ou assunto no campo de pesquisa. A Busca Ampliada consulta primeiro o catálogo da Biblioteca UNEF e pode complementar a pesquisa com fontes externas.'
    },
    {
      pergunta: 'Como encontrar uma estante?',
      resposta: 'Pesquise o assunto desejado e consulte a localização indicada. Você também pode abrir a planta interativa e selecionar uma das 18 estantes.'
    },
    {
      pergunta: 'O que significa a classificação?',
      resposta: 'É o código numérico utilizado para organizar os livros. Ele ajuda a identificar a faixa de classificação e a possível localização do material.'
    },
    {
      pergunta: 'O que são as fontes externas?',
      resposta: 'São catálogos de outras plataformas, como Google Books e Open Library. Os resultados externos não significam necessariamente que o livro esteja disponível na Biblioteca UNEF.'
    },
    {
      pergunta: 'Como utilizar a planta interativa?',
      resposta: 'Abra a planta da biblioteca e selecione uma estante para consultar os assuntos e materiais relacionados àquela localização.'
    },
    {
      pergunta: 'Posso acessar o conteúdo completo dos livros externos?',
      resposta: 'Depende dos direitos e das opções de acesso de cada publicação. Alguns livros oferecem texto completo, outros apenas prévia ou registro bibliográfico.'
    }
  ];

  function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto) elemento.textContent = texto;

    return elemento;
  }

  function abrirAjuda() {
    const existente = document.getElementById('unefHelpPanel');

    if (existente) {
      existente.remove();
      return;
    }

    const painel = criar('section', 'unef-help-panel');
    painel.id = 'unefHelpPanel';

    const cabecalho = criar('div', 'unef-help-header');

    const titulo = criar('strong', '', '📚 Ajuda da Biblioteca UNEF');

    const fechar = criar('button', 'unef-help-close', '×');
    fechar.type = 'button';
    fechar.setAttribute('aria-label', 'Fechar ajuda');
    fechar.addEventListener('click', () => painel.remove());

    cabecalho.append(titulo, fechar);
    painel.append(cabecalho);

    painel.append(
      criar(
        'p',
        'unef-help-intro',
        'Encontre orientações rápidas para utilizar o catálogo e a planta interativa.'
      )
    );

    perguntas.forEach((item, indice) => {
      const grupo = criar('div', 'unef-help-item');

      const botao = criar(
        'button',
        'unef-help-question',
        item.pergunta
      );

      botao.type = 'button';
      botao.setAttribute('aria-expanded', 'false');

      const resposta = criar(
        'div',
        'unef-help-answer',
        item.resposta
      );

      resposta.hidden = true;

      botao.addEventListener('click', () => {
        const aberto = !resposta.hidden;

        resposta.hidden = aberto;
        botao.setAttribute(
          'aria-expanded',
          String(!aberto)
        );
      });

      grupo.append(botao, resposta);
      painel.append(grupo);
    });

    document.body.append(painel);
  }

  
function inicializar() {
  window.UNEFAjudaBiblioteca = {
    abrir: abrirAjuda
  };

  if (document.getElementById('unefHelpLauncher')) return;

  const botao = criar(
    'button',
    'unef-help-launcher',
    '💬 Ajuda da Biblioteca'
  );

  botao.id = 'unefHelpLauncher';
  botao.type = 'button';
  botao.setAttribute('aria-label', 'Abrir ajuda da Biblioteca UNEF');

  botao.addEventListener('click', abrirAjuda);

  document.body.append(botao);
}


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }

})();
