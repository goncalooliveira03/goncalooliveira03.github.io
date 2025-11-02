let cesto = [];
let produtosCache = [];

const URL_PRODUTOS   = "https://deisishop.pythonanywhere.com/products/";
const URL_CATEGORIAS = "https://deisishop.pythonanywhere.com/categories/";
const URL_BUY        = "https://deisishop.pythonanywhere.com/buy/";

// ================== ARRANQUE ==================
document.addEventListener("DOMContentLoaded", async () => {
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  carregarCestoGuardado();

  const container = document.getElementById("lista-produtos");
  if (!container) {
    console.error("Falta o elemento #lista-produtos no HTML.");
    return;
  }

  // Estado a carregar
  const loading = document.createElement("p");
  loading.id = "estado-carregamento";
  loading.textContent = "A carregar produtos...";
  container.appendChild(loading);

  // 1) Produtos
  produtosCache = await buscarProdutos();
  loading.remove();

  if (!produtosCache.length) {
    const aviso = document.createElement("p");
    aviso.textContent = "Não foi possível obter produtos neste momento.";
    container.appendChild(aviso);
  } else {
    aplicarFiltrosEAtualizarUI(); // primeira renderização
  }

  // 2) Categorias
  let categorias = await buscarCategorias();
  if (!categorias.length) {
    const set = new Set(produtosCache.map(p => p.category).filter(Boolean));
    categorias = Array.from(set);
  }
  popularSelectCategorias(categorias);

  // 3) Listeners de filtro/sort/search
  const selCat   = document.getElementById("filtro-categoria");
  const selOrd   = document.getElementById("ordenar");
  const inpSearch= document.getElementById("pesquisa");

  if (selCat)    selCat.addEventListener("change", aplicarFiltrosEAtualizarUI);
  if (selOrd)    selOrd.addEventListener("change", aplicarFiltrosEAtualizarUI);
  if (inpSearch) inpSearch.addEventListener("input", aplicarFiltrosEAtualizarUI);

  // 4) Checkout (submit do formulário)
  const form = document.getElementById("form-checkout");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await efetuarCompra();
    });
  }

  // 5) Cesto (se já houver itens)
  mostrarCesto();
});

// ================== AJAX ==================
async function buscarProdutos() {
  try {
    const resp = await fetch(URL_PRODUTOS, { headers: { "Accept": "application/json" } });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!Array.isArray(data)) return [];
    return data.map(normalizarProduto);
  } catch (e) {
    console.warn("Erro em /products/:", e);
    return [];
  }
}

async function buscarCategorias() {
  try {
    const resp = await fetch(URL_CATEGORIAS, { headers: { "Accept": "application/json" } });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!Array.isArray(data)) return [];
    return data.map(String).filter(Boolean);
  } catch (e) {
    console.warn("Erro em /categories/:", e);
    return [];
  }
}

// ================== NORMALIZAÇÃO ==================
function normalizarProduto(p) {
  return {
    id: p.id,
    title: p.title,
    price: Number(p.price ?? 0),
    description: p.description ?? "",
    category: p.category ?? "",
    image: p.image || "https://via.placeholder.com/300x200?text=Sem+imagem",
    rating: p.rating || { rate: 0, count: 0 }
  };
}

// ================== FILTRO + SORT + SEARCH ==================
function aplicarFiltrosEAtualizarUI() {
  const cat = (document.getElementById("filtro-categoria")?.value || "").trim();
  const ordem = (document.getElementById("ordenar")?.value || "").trim(); // "", "asc", "desc"
  const q = (document.getElementById("pesquisa")?.value || "").trim().toLowerCase();

  let lista = !cat ? produtosCache.slice()
                   : produtosCache.filter(p => String(p.category).toLowerCase() === cat.toLowerCase());

  if (q) {
    lista = lista.filter(p => String(p.title).toLowerCase().includes(q));
  }

  if (ordem === "asc") {
    lista = lista.slice().sort((a, b) => a.price - b.price);
  } else if (ordem === "desc") {
    lista = lista.slice().sort((a, b) => b.price - a.price);
  }

  renderProdutos(lista);
}

// ================== RENDER PRODUTOS ==================
function encurta(txt, n = 180) {
  if (!txt) return "";
  return txt.length > n ? txt.slice(0, n - 1) + "…" : txt;
}

function renderProdutos(lista) {
  const container = document.getElementById("lista-produtos");
  container.textContent = "";

  if (!lista.length) {
    const vazio = document.createElement("p");
    vazio.textContent = "Sem produtos para apresentar.";
    container.appendChild(vazio);
    return;
  }

  lista.forEach(produto => {
    const art = document.createElement("article");

    const h3 = document.createElement("h3");
    h3.textContent = produto.title;

    const img = document.createElement("img");
    img.src = produto.image;
    img.alt = produto.title;

    const desc = document.createElement("p");
    desc.textContent = encurta(produto.description, 180);

    const preco = document.createElement("p");
    preco.textContent = "Preço: €" + produto.price.toFixed(2);

    const rating = document.createElement("p");
    rating.textContent = "⭐ " + (produto.rating?.rate ?? 0) + " (" + (produto.rating?.count ?? 0) + ")";

    const btn = document.createElement("button");
    btn.textContent = "Adicionar ao Cesto";
    btn.addEventListener("click", () => adicionarAoCesto(produto));

    art.appendChild(h3);
    art.appendChild(img);
    art.appendChild(desc);
    art.appendChild(preco);
    art.appendChild(rating);
    art.appendChild(btn);

    container.appendChild(art);
  });
}

// ================== UI CATEGORIAS ==================
function popularSelectCategorias(categorias) {
  const sel = document.getElementById("filtro-categoria");
  if (!sel) return;

  sel.innerHTML = '<option value="">Todas as categorias</option>';
  categorias.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
  });
}

// ================== CESTO (localStorage) ==================
function guardarCesto() {
  try { localStorage.setItem("meuCesto", JSON.stringify(cesto)); } catch {}
}

function carregarCestoGuardado() {
  try {
    const raw = localStorage.getItem("meuCesto");
    cesto = raw ? JSON.parse(raw) : [];
  } catch {
    cesto = [];
  }
}

function adicionarAoCesto(produto) {
  const existe = cesto.find(i => i.id === produto.id);
  if (existe) {
    existe.quantidade += 1;
  } else {
    // Guardamos também a imagem para mostrar no checkout
    cesto.push({
      id: produto.id,
      title: produto.title,
      price: produto.price,
      image: produto.image,     // <- novo
      quantidade: 1
    });
  }

  guardarCesto();
  limparResultadoCompra();
  mostrarCesto();
}

function removerDoCesto(id) {
  cesto = cesto.filter(i => i.id !== id);
  guardarCesto();
  limparResultadoCompra();
  mostrarCesto();
}

function mostrarCesto() {
  const ul = document.getElementById("lista-cesto");
  const totalEl = document.getElementById("total");
  if (!ul || !totalEl) return;

  ul.textContent = "";
  let total = 0;

  cesto.forEach(item => {
    const li = document.createElement("li");
    li.className = "cesto-item";

    // Thumbnail da imagem (com fallback caso itens antigos no localStorage não tenham image)
    const thumb = document.createElement("img");
    thumb.className = "cesto-thumb";
    thumb.src = item.image || "https://via.placeholder.com/120x120?text=Produto";
    thumb.alt = item.title;

    const info = document.createElement("div");
    info.className = "cesto-info";
    info.textContent = `${item.title} — €${item.price.toFixed(2)} × ${item.quantidade}`;

    const btn = document.createElement("button");
    btn.textContent = "Remover";
    btn.addEventListener("click", () => removerDoCesto(item.id));

    li.appendChild(thumb);
    li.appendChild(info);
    li.appendChild(btn);
    ul.appendChild(li);

    total += item.price * item.quantidade;
  });

  totalEl.textContent = "€" + total.toFixed(2);
}

// ================== CHECKOUT ==================
function limparResultadoCompra() {
  const box = document.getElementById("resultado-compra");
  if (box) box.innerHTML = "";
}

async function efetuarCompra() {
  const box = document.getElementById("resultado-compra");
  const nome = (document.getElementById("input-name")?.value || "").trim();
  const isStudent = document.getElementById("chk-student")?.checked || false;
  const coupon = (document.getElementById("input-coupon")?.value || "").trim();

  if (!cesto.length) {
    box.innerHTML = `<p style="color:#b91c1c">O cesto está vazio.</p>`;
    return;
  }
  if (!nome) {
    box.innerHTML = `<p style="color:#b91c1c">Por favor, indique o seu nome.</p>`;
    return;
  }

  // Para quantidades >1, repetimos o id no array
  const productIds = [];
  cesto.forEach(item => {
    for (let i = 0; i < item.quantidade; i++) productIds.push(item.id);
  });

  const payload = {
    products: productIds,
    student: isStudent,
    coupon: coupon || undefined,
    name: nome
  };

  box.innerHTML = `<p>A processar compra...</p>`;

  try {
    const resp = await fetch(URL_BUY, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(() => ({}));

    if (resp.ok) {
      // A API devolve total e referência — mostramos ambos em destaque
      const total = data.totalCost ?? "—";
      const ref   = data.reference ?? "—";
      const msg   = data.message || data.example || "Pedido efetuado com sucesso.";

      box.innerHTML = `
        <div class="compra-ok">
          <p><strong>Referência para pagamento:</strong> ${ref}</p>
          <p><strong>Total a pagar:</strong> €${Number(total).toFixed ? Number(total).toFixed(2) : total}</p>
          <p>${msg}</p>
        </div>
      `;
    } else if (resp.status === 400) {
      box.innerHTML = `<p style="color:#b91c1c">Erro: ${data.error || "Dados inválidos"}</p>`;
    } else if (resp.status === 405) {
      box.innerHTML = `<p style="color:#b91c1c">Erro: método inválido. Use HTTP POST.</p>`;
    } else {
      box.innerHTML = `<p style="color:#b91c1c">Erro inesperado (${resp.status}).</p>`;
    }
  } catch (e) {
    box.innerHTML = `<p style="color:#b91c1c">Falha na ligação. Tenta novamente.</p>`;
    console.warn("Erro no checkout:", e);
  }
}