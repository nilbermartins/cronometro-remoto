// ... resto do seu código script.js ...

// ----------------------------------------------------
// 4. INICIALIZAÇÃO E EVENT LISTENERS
// ----------------------------------------------------

function initialize() {
    // === NOVO CÓDIGO PARA GARANTIR A VISIBILIDADE CORRETA ===
    const hash = window.location.hash;
    const displayContainer = document.getElementById('display-container');
    const controlContainer = document.getElementById('control-container');

    if (hash === '#control') {
        controlContainer.style.display = 'block';
        displayContainer.style.display = 'none';
    } else if (hash === '#display') {
        controlContainer.style.display = 'none';
        displayContainer.style.display = 'block';
    } else {
        // Comportamento padrão: sem hash, mostra o DISPLAY
        controlContainer.style.display = 'none';
        displayContainer.style.display = 'block';
    }
    // =======================================================

    // Carrega o estado salvo no LocalStorage
    const savedState = JSON.parse(localStorage.getItem('stopwatchState'));

    if (savedState) {
        elapsedTime = savedState.elapsedTime;
        isCountdown = savedState.isCountdown;
        startTime = savedState.startTime;

        if (savedState.isRunning) {
            startTimer();
        } else {
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
            initialize();
        }
    });

    // Se estiver no modo display (OBS), garanta que ele esteja rodando se o estado for 'true'
    if (window.location.hash === '#display' && isRunning) {
        startTimer();
    }
}

initialize();
