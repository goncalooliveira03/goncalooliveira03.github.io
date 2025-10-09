
function entra() {
  const area = document.getElementById("hoverArea");
  area.textContent = "Eiii!👋";
  area.style.backgroundColor = "#f1fc8eff";
}

function sai() {
  const area = document.getElementById("hoverArea");
  area.textContent = "Adeus! 👋";
  area.style.backgroundColor = "#fc8e8eff";
}

function mudaCor(cor) {
  const h2 = document.querySelector('#mudaCor h2');
  h2.style.color = cor;
}

function mudaCorTexto() {
  const input = document.getElementById('textoInput');

  const colors = ['#ae5f5fff', '#d4b556ff', '#66ea66ff', '#5289f8ff', '#cf77ffff'];
  const len = input.value.length;
  if (len === 0) {
    input.style.backgroundColor = '';
    return;
  }
  const ciclo = len % colors.length;
  input.style.backgroundColor = colors[ciclo];

}

function mudaCorInput() {
  const cor = document.getElementById("corInput").value.trim().toLowerCase();
  document.body.style.backgroundColor = cor;
}

let contador = 0;
function conta() {
  contador++;
  document.getElementById("valor").textContent = contador;
}
