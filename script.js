let timerInterval;
let tempoRestante = 0;
let rodando = false;

function atualizarDisplay() {
  const d = document.getElementById("display");
  if (!d) return;
  const m = String(Math.floor(tempoRestante / 60)).padStart(2, "0");
  const s = String(tempoRestante % 60).padStart(2, "0");
  d.innerText = `${m}:${s}`;
}

function tick() {
  if (tempoRestante > 0) {
    tempoRestante--;
    localStorage.setItem("timerData", JSON.stringify({ tempoRestante, rodando }));
    atualizarDisplay();
  } else {
    clearInterval(timerInterval);
  }
}

function setTempo() {
  const m = parseInt(document.getElementById("minutos").value || 0);
  const s = parseInt(document.getElementById("segundos").value || 0);
  tempoRestante = m * 60 + s;
  rodando = false;
  localStorage.setItem("timerData", JSON.stringify({ tempoRestante, rodando }));
}

function iniciar() {
  if (!rodando) {
    rodando = true;
    localStorage.setItem("timerData", JSON.stringify({ tempoRestante, rodando }));
    timerInterval = setInterval(tick, 1000);
  }
}

function pausar() {
  rodando = false;
  localStorage.setItem("timerData", JSON.stringify({ tempoRestante, rodando }));
  clearInterval(timerInterval);
}

function resetar() {
  rodando = false;
  tempoRestante = 0;
  localStorage.setItem("timerData", JSON.stringify({ tempoRestante, rodando }));
  atualizarDisplay();
}

window.addEventListener("storage", () => {
  const data = JSON.parse(localStorage.getItem("timerData"));
  if (data) {
    tempoRestante = data.tempoRestante;
    rodando = data.rodando;
    atualizarDisplay();
    if (rodando) {
      clearInterval(timerInterval);
      timerInterval = setInterval(tick, 1000);
    } else {
      clearInterval(timerInterval);
    }
  }
});

setTimeout(atualizarDisplay, 100);
