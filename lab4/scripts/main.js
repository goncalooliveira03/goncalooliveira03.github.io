
function entra() {
  const area = document.getElementById("hoverArea");
  area.textContent = "Não te preocupes, o JavaScript raramente explode. 💥";
  area.style.backgroundColor = "#f1fc8eff";
}

function sai() {
  const area = document.getElementById("hoverArea");
  area.textContent = "BOOOM!💥";
  area.style.backgroundColor = "red";
}

function mudaCor(cor) {
  document.body.style.backgroundColor = cor;
}

function mudaImagem() {
  const gato = document.getElementById("gato");
  gato.src = "https://placekittens.com/200/300";
  gato.alt = "Outro gato 🐱";
}

function voltaImagem() {
  const gato = document.getElementById("gato");
  gato.src = "https://placecats.com/neo_banana/300/200";
  gato.alt = "Gatinho fofo";
}

let contador = 0;
function conta() {
  contador++;
  document.getElementById("valor").textContent = contador;
}

document.addEventListener("mousemove", segueRato);

function segueRato(e) {
  const coords = document.getElementById("coords");
  coords.textContent = `x: ${e.clientX}, y: ${e.clientY}`;
}
