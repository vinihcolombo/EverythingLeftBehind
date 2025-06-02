// Navegar para um puzzle
function navigateToPuzzle(puzzleKey) {
    if (!GAME_CONFIG.puzzleScreens[puzzleKey]) return;
    
    // Salvar estado atual
    GAME_STATE.navigationHistory.push({
        type: 'puzzle',
        puzzleKey: puzzleKey,
        screenIndex: GAME_STATE.currentScreen
    });
    
    showPuzzleScreen(puzzleKey);
}

// Mostrar tela de puzzle
function showPuzzleScreen(puzzleKey) {
    const puzzle = GAME_CONFIG.puzzleScreens[puzzleKey];
    const container = document.querySelector('.scene-container');
    
    // Esconder salas
    document.querySelectorAll('.room').forEach(room => {
        room.classList.remove('active');
    });
    
    // Criar view do puzzle
    const puzzleView = document.createElement('div');
    puzzleView.className = 'puzzle-view active';
    puzzleView.style.backgroundImage = puzzle.image;
    container.appendChild(puzzleView);
    
    // Adicionar hitboxes do puzzle
    puzzle.hitboxes.forEach(hb => container.appendChild(hb));
    
    // Adicionar botão voltar
    addBackButton();
    
    GAME_STATE.isInPuzzleView = true;
    positionElements();
}

// Adicionar botão voltar
function addBackButton() {
    let backButton = document.querySelector('.back-button');
    
    if (!backButton) {
        backButton = document.createElement('div');
        backButton.className = 'back-button';
        backButton.textContent = 'Voltar';
        backButton.addEventListener('click', goBack);
        document.querySelector('.scene-container').appendChild(backButton);
    }
}

// Voltar à tela anterior
function goBack() {
    if (GAME_STATE.navigationHistory.length === 0) return;
    
    const previous = GAME_STATE.navigationHistory.pop();
    
    // Limpar elementos do puzzle
    document.querySelectorAll('.puzzle-view, .back-button').forEach(el => el.remove());
    
    if (previous.type === 'puzzle') {
        GAME_STATE.isInPuzzleView = false;
        GAME_STATE.currentScreen = previous.screenIndex;
        updateScreen();
    }
}