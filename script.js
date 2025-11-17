const display = document.getElementById('stopwatch-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const setTimeBtn = document.getElementById('set-time-btn');
const countdownInput = document.getElementById('countdown-input');
const statusMessage = document.getElementById('status-message');

let interval;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;
let isCountdown = false;

// ----------------------------------------------------
// 1. FUNÇÕES DE FORMATO E SALVAMENTO
// ----------------------------------------------------

// Formata o tempo em milissegundos para MM:SS:MMM
function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);

    const pad = (num, length = 2) => String(num).padStart(length, '0');

    // Milissegundos com 3 dígitos
    const formattedMs = pad(milliseconds, 3); 

    return `${pad(minutes)}:${pad(seconds)}:${formattedMs}`;
}

// Salva o estado atual no LocalStorage
function saveState() {
    localStorage.setItem('stopwatchState', JSON.stringify({
        elapsedTime: elapsedTime,
        isRunning: isRunning,
        isCountdown: isCountdown,
        startTime: startTime // Usado para calcular o tempo regressivo restante
    }));
}

// ----------------------------------------------------
// 2. LÓGICA DE ATUALIZAÇÃO DO CRONÔMETRO
// ----------------------------------------------------

function updateTime() {
    const now = Date.now();
    let timeToShow;

    if (isCountdown) {
        // Cálculo do tempo regressivo
        timeToShow = startTime - (now - localStorage.getItem('lastStart') || now);

        if (timeToShow <= 0) {
            timeToShow = 0;
            stopTimer();
            // Opcional: Adicionar um alarme visual ou sonoro
        }
    } else {
        // Cálculo do tempo progressivo
        elapsedTime = elapsedTime + (now - (localStorage.getItem('lastUpdate') || now));
        localStorage.setItem('lastUpdate', now);
        timeToShow = elapsedTime;
    }

    display.textContent = formatTime(timeToShow);
    saveState();
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    localStorage.setItem('lastStart', Date.now()); // Para cálculo de tempo progressivo/regressivo

    if (!isCountdown) {
        localStorage.setItem('lastUpdate', Date.now());
    }

    // Atualiza o status
    statusMessage.textContent = isCountdown ? "Modo Regressivo ATIVO" : "Modo Progressivo ATIVO";

    // Configura o intervalo para rodar a cada 10ms
    interval = setInterval(updateTime, 10);
    saveState();
}

function stopTimer() {
    isRunning = false;
    clearInterval(interval);
    statusMessage.textContent = isCountdown ? "Modo Regressivo PAUSADO" : "Modo Progressivo PAUSADO";
    saveState();
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    isCountdown = false;
    startTime = 0;
    display.textContent = formatTime(0);
    statusMessage.textContent = "Modo Progressivo (Resetado)";
    localStorage.removeItem('lastUpdate');
    localStorage.removeItem('lastStart');
    saveState();
}

// ----------------------------------------------------
// 3. FUNÇÃO DE CONTROLE REGRESSIVO
// ----------------------------------------------------

function setCountdownTime() {
    const input = countdownInput.value; // Ex: "05:30"

    // Regex simples para MM:SS
    const match = input.match(/^(\d{1,2}):(\d{2})$/); 

    if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);

        // Converte para milissegundos
        startTime = (minutes * 60 * 1000) + (seconds * 1000); 
        elapsedTime = 0;
        isCountdown = true;

        // Exibe o tempo inicial
        display.textContent = formatTime(startTime); 
        statusMessage.textContent = "Tempo Regressivo PRONTO";

        stopTimer();
        saveState();

    } else {
        alert("Formato inválido. Use MM:SS (Ex: 05:30)");
    }
}

// ----------------------------------------------------
// 4. INICIALIZAÇÃO E EVENT LISTENERS
// ----------------------------------------------------

function initialize() {
    // Carrega o estado salvo no LocalStorage
    const savedState = JSON.parse(localStorage.getItem('stopwatchState'));

    if (savedState) {
        elapsedTime = savedState.elapsedTime;
        isCountdown = savedState.isCountdown;
        startTime = savedState.startTime;

        if (savedState.isRunning) {
            // Se o cronômetro estava rodando, reinicie o intervalo
            startTimer(); 
        } else {
            // Se estava pausado, apenas carregue o display
            display.textContent = formatTime(isCountdown ? startTime : elapsedTime);
        }
    }

    // Event Listeners para os botões
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    setTimeBtn.addEventListener('click', setCountdownTime);

    // Adiciona listener para mudanças no LocalStorage de outras janelas
    window.addEventListener('storage', (e) => {
        if (e.key === 'stopwatchState') {
            // Ao detectar uma mudança (ex: o celular clicou em iniciar), recarrega o estado
            initialize(); 
        }
    });

    // Se estiver no modo display (OBS), garanta que ele esteja rodando se o estado for 'true'
    if (window.location.hash === '#display' && isRunning) {
        startTimer();
    }
}

initialize();