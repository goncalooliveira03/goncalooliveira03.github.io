document.addEventListener('DOMContentLoaded', function() {
  // Chama a função que vai carregar os produtos
  carregarProdutos(produtos);
});

// Função para carregar os produtos
function carregarProdutos(produtos) {
  // Imprime todos os produtos na consola
  produtos.forEach(produto => {
    console.log(produto.id, produto.title);
  });

  // Aqui, vamos criar os elementos para exibir os produtos na página
  const listaProdutos = document.getElementById('lista-produtos');
  
  produtos.forEach(produto => {
    // Chama a função que cria o <article> para cada produto
    const artigo = criarProduto(produto);

    // Adiciona o <article> à lista de produtos
    listaProdutos.appendChild(artigo);
  });
}

// Função que cria o <article> para cada produto
function criarProduto(produto) {
  // Cria o <article>
  const artigo = document.createElement('article');

  // Cria o título do produto
  const titulo = document.createElement('h3');
  titulo.textContent = produto.title;

  // Cria a imagem do produto
  const imagem = document.createElement('img');
  imagem.src = produto.image;
  imagem.alt = produto.title;

  // Cria a descrição do produto
  const descricao = document.createElement('p');
  descricao.textContent = produto.description;

  // Cria o preço do produto
  const preco = document.createElement('p');
  preco.textContent = `Preço: €${produto.price}`;

  artigo.appendChild(titulo);
  artigo.appendChild(imagem);
  artigo.appendChild(descricao);
  artigo.appendChild(preco);

  return artigo;
}