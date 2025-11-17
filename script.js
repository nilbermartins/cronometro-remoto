let interval;
let totalSegundos = 0;
let isRunning = false;
let isCountdown = true; // Começa no modo Regressivo

const display = document.getElementById('display');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const modeBtn = document.getElementById('modeBtn');
const setTimerBtn = document.getElementById('setTimerBtn');
const minutosInput = document.getElementById('minutosInput');
const segundosInput = document.getElementById('segundosInput');
const configPanel = document.getElementById('config-panel');

// --- Funções de Formatação e Atualização ---

/**
 * Formata um total de segundos para MM:SS:milis
 * @param {number} totalSegs - O número total de segundos.
 * @returns {string} O tempo formatado.
 */
function formatTime(totalSegs) {
    // Para um display mais simples no OBS (MM:SS)
    const minutos = String(Math.floor(totalSegs / 60)).padStart(2, '0');
    const segundos = String(Math.floor(totalSegs % 60)).padStart(2, '0');
    
    // Inclui milissegundos para um visual mais dinâmico
    const milis = String(Math.floor((totalSegs % 1) * 100)).padStart(2, '0');

    // Se quiser apenas MM:SS, use: return `${minutos}:${segundos}`;
    return `${minutos}:${segundos}:${milis}`; 
}

/** Atualiza o display do HTML. */
function updateDisplay() {
    display.textContent = formatTime(totalSegos);
}

// --- Funções de Controle ---

/** Inicia ou pausa o cronômetro/timer. */
function startStop() {
    if (isRunning) {
        // Pausar
        clearInterval(interval);
        startStopBtn.textContent = 'Continuar';
        startStopBtn.classList.remove('running');
    } else {
        // Iniciar
        if (totalSegos <= 0 && isCountdown) {
            // Se for Regressivo e estiver zerado, define o tempo inicial
            setTimer();
        }

        // Inicia o Intervalo
        interval = setInterval(() => {
            if (isCountdown) {
                // Modo Regressivo
                totalSegos -= 0.01; // Contagem a cada 10ms
                if (totalSegos <= 0) {
                    totalSegos = 0;
                    clearInterval(interval);
                    isRunning = false;
                    startStopBtn.textContent = 'Iniciar';
                    startStopBtn.classList.remove('running');
                    // Opcional: Efeito visual ou som de fim de tempo
                }
            } else {
                // Modo Cronômetro (Progressivo)
                totalSegos += 0.01;
            }
            updateDisplay();
            // *** CHAMADA PARA O FIREBASE (APENAS NA PÁGINA DE CONTROLE) ***
            // if (isControllerPage) { sendStateToFirebase(); } 
        }, 10); // Atualiza a cada 10 milissegundos

        startStopBtn.textContent = 'Pausar';
        startStopBtn.classList.add('running');
    }
    isRunning = !isRunning;
}

/** Reseta o cronômetro/timer. */
function reset() {
    clearInterval(interval);
    isRunning = false;
    startStopBtn.textContent = 'Iniciar';
    startStopBtn.classList.remove('running');

    if (isCountdown) {
        // No Regressivo, volta para o tempo configurado
        setTimer(false); 
    } else {
        // No Cronômetro, zera
        totalSegos = 0;
    }
    updateDisplay();
    // *** CHAMADA PARA O FIREBASE (APENAS NA PÁGINA DE CONTROLE) ***
    // if (isControllerPage) { sendStateToFirebase(); } 
}

/** Define o tempo inicial para o modo Regressivo. */
function setTimer(shouldUpdateDisplay = true) {
    const min = parseInt(minutosInput.value) || 0;
    const sec = parseInt(segundosInput.value) || 0;
    
    totalSegos = (min * 60) + sec;

    if (shouldUpdateDisplay) {
        updateDisplay();
    }
}

/** Alterna entre os modos Cronômetro e Regressivo. */
function toggleMode() {
    isCountdown = !isCountdown;
    reset(); // Reseta ao trocar de modo
    
    if (isCountdown) {
        modeBtn.textContent = 'Mudar para Cronômetro';
        configPanel.style.display = 'block'; // Mostra config
        totalSegos = 300; // Tempo inicial padrão (5 min)
    } else {
        modeBtn.textContent = 'Mudar para Regressivo';
        configPanel.style.display = 'none'; // Esconde config
        totalSegos = 0;
    }
    updateDisplay();
}

// --- Listeners de Eventos ---

startStopBtn.addEventListener('click', startStop);
resetBtn.addEventListener('click', reset);
modeBtn.addEventListener('click', toggleMode);
setTimerBtn.addEventListener('click', setTimer);

// Inicialização: começa no modo Regressivo com 5:00
toggleMode();
toggleMode(); // Chama 2x para garantir o Regressivo e o Reset correto
setTimer(); 
updateDisplay();


// =========================================================================
//                  🚀 ORIENTAÇÃO PARA SINCRONIZAÇÃO ONLINE (FIREBASE)
// =========================================================================

/* Para ter acesso ao **Controlador pelo celular** e a **Visualização pelo OBS**
sincronizados, você precisa de um banco de dados em tempo real.

1.  **Configure o Firebase:** Crie um projeto no Firebase e ative o Realtime Database.
2.  **Adicione os Scripts:** Descomente as tags `<script>` do Firebase no `index.html`.
3.  **Crie duas páginas:**
    * **Página de Controle (Celular):** Inclui o Firebase e tem a função `sendStateToFirebase()` 
        em `startStop` e `reset`. Ela envia o estado (`tempo`, `isRunning`, `isCountdown`) para o banco.
    * **Página de Display (OBS):** Inclui o Firebase e tem uma função `listenForFirebaseChanges()` 
        que **lê** o estado do banco e atualiza as variáveis **`totalSegos`** e **`isRunning`** localmente, 
        mantendo o display sincronizado.

**Exemplo Básico da Função de Envio (Apenas na página de Controle):**

function sendStateToFirebase() {
    const dbRef = firebase.database().ref('timerState');
    dbRef.set({
        time: totalSegos,
        running: isRunning,
        countdown: isCountdown,
        timestamp: new Date().getTime() // Para ajudar na correção do atraso
    });
}
*/
