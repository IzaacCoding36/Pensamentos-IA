import { aleatorio, nome } from './aleatorio.js';
import { perguntas } from './perguntas.js';

// DOM elements
const caixaPrincipal = document.querySelector(".caixa-principal");
const caixaPerguntas = document.querySelector(".caixa-perguntas");
const caixaAlternativas = document.querySelector(".caixa-alternativas");
const caixaResultado = document.querySelector(".caixa-resultado");
const textoResultado = document.querySelector(".texto-resultado");
const botaoJogarNovamente = document.querySelector(".novamente-btn");
const botaoIniciar = document.querySelector(".iniciar-btn");
const telaInicial = document.querySelector(".tela-inicial");
const quizContainer = document.querySelector(".quiz-container");
const progressBar = document.querySelector(".progress-fill");
const progressBarContainer = document.querySelector(".progress-bar");
const themeToggle = document.querySelector(".theme-toggle");
const compartilharBtn = document.querySelector(".compartilhar-btn");

// Game state
let atual = 0;
let perguntaAtual;
let historiaFinal = "";
const totalPerguntas = perguntas.length;

// Event listeners
botaoIniciar.addEventListener('click', iniciaJogo);
botaoJogarNovamente.addEventListener('click', jogaNovamente);
themeToggle.addEventListener('click', toggleTheme);
compartilharBtn.addEventListener('click', compartilharResultado);

// Add keyboard navigation
document.addEventListener('keydown', handleKeyboard);

// Initialize the app
init();

function init() {
    // Replace names in questions
    substituiNome();
    
    // Initialize theme
    initializeTheme();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    // Add service worker for offline support if available
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, but app still works
        });
    }
}

function iniciaJogo() {
    try {
        atual = 0;
        historiaFinal = "";
        
        // Hide initial screen with animation
        telaInicial.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        telaInicial.style.opacity = '0';
        telaInicial.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            telaInicial.style.display = 'none';
            quizContainer.style.display = 'block';
            quizContainer.classList.add('ativo');
            
            // Reset other sections
            caixaPerguntas.classList.remove("mostrar");
            caixaAlternativas.classList.remove("mostrar");
            caixaResultado.classList.remove("mostrar");
            
            // Show quiz with animation
            setTimeout(() => {
                mostraPergunta();
            }, 100);
        }, 300);
        
    } catch (error) {
        console.error('Erro ao iniciar o jogo:', error);
        showError('Erro ao iniciar o quiz. Tente novamente.');
    }
}

function mostraPergunta() {
    try {
        if (atual >= perguntas.length) {
            mostraResultado();
            return;
        }
        
        perguntaAtual = perguntas[atual];
        
        // Update progress bar
        updateProgress();
        
        // Show question with animation
        caixaPerguntas.style.opacity = '0';
        caixaPerguntas.textContent = perguntaAtual.enunciado;
        caixaPerguntas.setAttribute('id', 'current-question');
        
        // Animate question appearance
        setTimeout(() => {
            caixaPerguntas.style.transition = 'opacity 0.5s ease';
            caixaPerguntas.style.opacity = '1';
        }, 50);
        
        // Clear and show alternatives
        caixaAlternativas.innerHTML = "";
        mostraAlternativas();
        
        // Announce to screen readers
        announceToScreenReader(`Pergunta ${atual + 1} de ${totalPerguntas}: ${perguntaAtual.enunciado}`);
        
    } catch (error) {
        console.error('Erro ao mostrar pergunta:', error);
        showError('Erro ao carregar a pergunta. Tente novamente.');
    }
}

function mostraAlternativas() {
    perguntaAtual.alternativas.forEach((alternativa, index) => {
        const botaoAlternativas = document.createElement("button");
        botaoAlternativas.textContent = alternativa.texto;
        botaoAlternativas.className = 'alternativa-btn';
        botaoAlternativas.setAttribute('data-index', index);
        botaoAlternativas.setAttribute('aria-label', `Opção ${index + 1}: ${alternativa.texto}`);
        
        // Add click handler with loading state
        botaoAlternativas.addEventListener("click", () => {
            handleAlternativeClick(botaoAlternativas, alternativa);
        });
        
        // Add animation delay
        botaoAlternativas.style.opacity = '0';
        botaoAlternativas.style.transform = 'translateY(20px)';
        
        caixaAlternativas.appendChild(botaoAlternativas);
        
        // Animate appearance
        setTimeout(() => {
            botaoAlternativas.style.transition = 'all 0.3s ease';
            botaoAlternativas.style.opacity = '1';
            botaoAlternativas.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
}

function handleAlternativeClick(botao, opcaoSelecionada) {
    try {
        // Disable all buttons to prevent multiple clicks
        const allButtons = document.querySelectorAll('.alternativa-btn');
        allButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
        
        // Highlight selected button
        botao.style.background = 'linear-gradient(135deg, var(--cor-acento), var(--cor-destaque))';
        botao.style.transform = 'scale(1.05)';
        
        // Add loading animation
        botao.innerHTML = `
            <span style="display: inline-block; animation: spin 1s linear infinite;">⟳</span>
            ${opcaoSelecionada.texto}
        `;
        
        setTimeout(() => {
            respostaSelecionada(opcaoSelecionada);
        }, 800);
        
    } catch (error) {
        console.error('Erro ao processar alternativa:', error);
        showError('Erro ao processar sua resposta. Tente novamente.');
    }
}

function respostaSelecionada(opcaoSelecionada) {
    const afirmacoes = aleatorio(opcaoSelecionada.afirmacao);
    historiaFinal += afirmacoes + " ";
    
    if (opcaoSelecionada.proxima !== undefined) {
        atual = opcaoSelecionada.proxima;
    } else {
        mostraResultado();
        return;
    }
    
    mostraPergunta();
}

function mostraResultado() {
    try {
        // Hide quiz container
        quizContainer.style.transition = 'opacity 0.3s ease';
        quizContainer.style.opacity = '0';
        
        setTimeout(() => {
            quizContainer.style.display = 'none';
            
            // Show result
            caixaPerguntas.textContent = `Em 2049, ${nome}`;
            textoResultado.textContent = historiaFinal;
            caixaAlternativas.innerHTML = "";
            
            // Add result animation
            caixaResultado.style.display = 'block';
            caixaResultado.style.opacity = '0';
            caixaResultado.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                caixaResultado.style.transition = 'all 0.5s ease';
                caixaResultado.style.opacity = '1';
                caixaResultado.style.transform = 'scale(1)';
                caixaResultado.classList.add("mostrar");
            }, 100);
            
            // Announce result to screen readers
            announceToScreenReader(`Resultado: Em 2049, ${nome} ${historiaFinal}`);
            
            // Focus on result for accessibility
            caixaResultado.focus();
            
        }, 300);
        
    } catch (error) {
        console.error('Erro ao mostrar resultado:', error);
        showError('Erro ao mostrar o resultado. Tente novamente.');
    }
}

function jogaNovamente() {
    try {
        atual = 0;
        historiaFinal = "";
        
        // Hide result with animation
        caixaResultado.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        caixaResultado.style.opacity = '0';
        caixaResultado.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            caixaResultado.classList.remove("mostrar");
            caixaResultado.style.display = 'none';
            
            // Show quiz container
            quizContainer.style.display = 'block';
            quizContainer.style.opacity = '0';
            
            setTimeout(() => {
                quizContainer.style.transition = 'opacity 0.3s ease';
                quizContainer.style.opacity = '1';
                mostraPergunta();
            }, 100);
        }, 300);
        
    } catch (error) {
        console.error('Erro ao reiniciar o jogo:', error);
        showError('Erro ao reiniciar o quiz. Recarregue a página.');
    }
}

function updateProgress() {
    const progress = (atual / totalPerguntas) * 100;
    progressBar.style.width = `${progress}%`;
    progressBarContainer.setAttribute('aria-valuenow', progress);
}

function substituiNome() {
    for (const pergunta of perguntas) {
        pergunta.enunciado = pergunta.enunciado.replace(/você/g, nome);
    }
}

function handleKeyboard(event) {
    // Handle keyboard navigation for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
        if (document.activeElement.tagName === 'BUTTON') {
            event.preventDefault();
            document.activeElement.click();
        }
    }
    
    // Number key shortcuts for alternatives
    if (event.key >= '1' && event.key <= '9') {
        const index = parseInt(event.key) - 1;
        const alternativeBtn = document.querySelector(`[data-index="${index}"]`);
        if (alternativeBtn && !alternativeBtn.disabled) {
            alternativeBtn.click();
        }
    }
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--cor-erro);
        color: white;
        padding: 1rem;
        border-radius: var(--raio-botao);
        box-shadow: var(--sombra-card);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 300);
    }, 3000);
}

// Add CSS for error animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .modal-content {
        background: var(--cor-principal);
        padding: 2rem;
        border-radius: var(--raio-borda);
        border: 1px solid rgba(43, 222, 253, 0.3);
        max-width: 400px;
        width: 90%;
    }
    
    .modal-content h3 {
        color: var(--cor-destaque);
        margin-bottom: 1rem;
        font-family: var(--fonte-titulo);
    }
    
    .modal-content textarea {
        width: 100%;
        height: 120px;
        background: var(--cor-secundaria);
        color: var(--cor-texto);
        border: 1px solid rgba(43, 222, 253, 0.3);
        border-radius: var(--raio-botao);
        padding: 1rem;
        font-family: var(--fonte-principal);
        resize: none;
        margin-bottom: 1rem;
    }
    
    .modal-actions {
        text-align: center;
    }
    
    .close-btn {
        background: var(--cor-secundaria);
        color: var(--cor-texto);
        border: 1px solid rgba(43, 222, 253, 0.3);
        border-radius: var(--raio-botao);
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        transition: all var(--transicao-media);
    }
    
    .close-btn:hover {
        background: var(--cor-destaque);
        color: var(--cor-principal);
    }
`;
document.head.appendChild(style);

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    const icon = themeToggle.querySelector('.theme-icon');
    icon.style.transform = 'scale(0)';
    
    setTimeout(() => {
        icon.style.transform = 'scale(1)';
    }, 150);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', defaultTheme);
}

function compartilharResultado() {
    try {
        const resultText = `🤖 Minha Jornada da IA: Em 2049, ${nome} ${historiaFinal}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Pensamentos IA - Minha Jornada',
                text: resultText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(resultText).then(() => {
                showNotification('Resultado copiado para a área de transferência! 📋');
            }).catch(() => {
                // Fallback: show modal with text
                showShareModal(resultText);
            });
        }
    } catch (error) {
        console.error('Erro ao compartilhar:', error);
        showError('Erro ao compartilhar resultado.');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--cor-acento);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--raio-botao);
        box-shadow: var(--sombra-card);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showShareModal(text) {
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Compartilhar Resultado</h3>
            <textarea readonly>${text}</textarea>
            <div class="modal-actions">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">Fechar</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
}