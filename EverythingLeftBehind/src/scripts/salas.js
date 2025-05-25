// Configuração inicial
let currentScreen = 0;
let navigationHistory = [];
let isInPuzzleView = false;

const puzzleScreens = {
    'pintura': {
        image: "url('assets/images/CaixaPOV.png')",
        hitboxes: []
    }
};

const screens = [
    { 
        image: "url('assets/images/paredeNorte_0.png')", 
        left: 3, 
        right: 1,
        hitboxes: [], // Hitboxes normais
        persistentHitboxes: [] // Hitboxes que persistem entre visitas
    },
    { 
        image: "url('assets/images/paredeLest_0.png')", 
        left: 0, 
        right: 2,
        hitboxes: [], // Hitboxes normais
        persistentHitboxes: [] // Hitboxes que persistem entre visitas
    },
    { 
        image: "url('assets/images/paredeSul_0.png')", 
        left: 1, 
        right: 3,
        hitboxes: [], // Hitboxes normais
        persistentHitboxes: [] // Hitboxes que persistem entre visitas
    },
    { 
        image: "url('assets/images/paredeOeste_0.png')", 
        left: 2, 
        right: 0,
        hitboxes: [], // Hitboxes normais
        persistentHitboxes: [] // Hitboxes que persistem entre visitas
    }
];

const clickSound = new Audio('assets/SFX/Button.wav');

// Estado do inventário
let inventoryOpen = false;

// Pré-carrega imagens para evitar flickering
function preloadImages() {
    screens.forEach(screen => {
        const img = new Image();
        img.src = screen.image.replace("url('", "").replace("')", "");
    });
}

function createObject(x, y, message) {
    const obj = document.createElement('div');
    obj.className = 'object-hitbox interactive-object';
    obj.style.left = `${x}px`;
    obj.style.top = `${y}px`;
    obj.setAttribute('data-notification', message);
    
    document.querySelector('.scene-container').appendChild(obj);
}

// Posiciona todos os elementos de UI relativos à imagem
function positionElements() {
    const activeRoom = document.querySelector('.room.active');
    if (!activeRoom || document.querySelector('.game-container').classList.contains('hidden')) return;

    const img = new Image();
    img.src = window.getComputedStyle(activeRoom).backgroundImage.slice(5, -2);

    img.onload = function() {
        const container = activeRoom.parentElement;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Calcula proporções
        const imgRatio = this.width / this.height;
        const containerRatio = containerWidth / containerHeight;

        let renderedWidth, renderedHeight, offsetX, offsetY;

        if (containerRatio > imgRatio) {
            renderedHeight = containerHeight;
            renderedWidth = containerHeight * imgRatio;
            offsetX = (containerWidth - renderedWidth) / 2;
            offsetY = 0;
        } else {
            renderedWidth = containerWidth;
            renderedHeight = containerWidth / imgRatio;
            offsetX = 0;
            offsetY = (containerHeight - renderedHeight) / 2;
        }

        // Posiciona setas nas bordas da imagem
        document.getElementById('arrow-left').style.left = `${offsetX + 10}px`; // 10px da borda esquerda
        document.getElementById('arrow-right').style.right = `${offsetX + 10}px`; // 10px da borda direita
        document.getElementById('arrow-left').style.top = document.getElementById('arrow-right').style.top = `${offsetY + (renderedHeight / 2) - 25}px`; // Centralizado verticalmente

        // Armazena informações de posição para as hitboxes
        activeRoom._imagePosition = {
            originalWidth: this.width,
            originalHeight: this.height,
            renderedWidth,
            renderedHeight,
            offsetX,
            offsetY
        };

        updateHitboxesPosition();
    };
}

function updateHitboxesPosition() {
    const activeRoom = document.querySelector('.room.active');
    if (!activeRoom || !activeRoom._imagePosition) return;

    const pos = activeRoom._imagePosition;
    const scaleX = pos.renderedWidth / pos.originalWidth;
    const scaleY = pos.renderedHeight / pos.originalHeight;

    const currentRoom = screens[currentScreen];
    const allHitboxes = [...currentRoom.hitboxes, ...currentRoom.persistentHitboxes];

    allHitboxes.forEach(hitbox => {
        const originalX = parseFloat(hitbox.dataset.originalX);
        const originalY = parseFloat(hitbox.dataset.originalY);
        const originalWidth = parseFloat(hitbox.dataset.originalWidth);
        const originalHeight = parseFloat(hitbox.dataset.originalHeight);

        const newX = pos.offsetX + (originalX * scaleX);
        const newY = pos.offsetY + (originalY * scaleY);
        const newWidth = originalWidth * scaleX;
        const newHeight = originalHeight * scaleY;

        hitbox.style.left = `${newX}px`;
        hitbox.style.top = `${newY}px`;
        hitbox.style.width = `${newWidth}px`;
        hitbox.style.height = `${newHeight}px`;
        hitbox.style.display = hitbox.dataset.collected === "true" ? "none" : "block";
    });
}

// Controle do inventário
function setupInventory() {
    const inventoryToggle = document.getElementById('inventory-toggle');
    const inventory = document.getElementById('inventory');

    const inventorySound = new Audio('assets/SFX/Inventory_Button.wav');
    
    if (inventoryToggle && inventory) {
        inventoryToggle.addEventListener('click', () => {
            inventorySound.currentTime = 0;
            inventorySound.play();

            inventoryOpen = !inventoryOpen;
            inventory.classList.toggle('open', inventoryOpen);
            positionElements(); // Atualiza posição ao abrir/fechar
        });
    }
}

// Atualiza a tela atual
function updateScreen() {
    // Esconde todas as salas
    document.querySelectorAll('.room').forEach(room => {
        room.classList.remove('active');
        room.style.display = 'none';
    });
    
    // Mostra a sala atual
    const activeRoom = document.getElementById(`room${currentScreen}`);
    activeRoom.classList.add('active');
    activeRoom.style.display = 'block';
    
    // Remove hitboxes antigas
    document.querySelectorAll('.object-hitbox').forEach(hb => hb.remove());
    
    // Adiciona novas hitboxes
    const currentRoom = screens[currentScreen];
    currentRoom.hitboxes.forEach(hb => {
        if (hb.dataset.collected !== "true") {
            document.querySelector('.scene-container').appendChild(hb);
        }
    });
    currentRoom.persistentHitboxes.forEach(hb => {
        document.querySelector('.scene-container').appendChild(hb);
    });
    
    isInPuzzleView = false;
    positionElements();
}

// Controles de navegação
function setupControls() {
    document.getElementById('arrow-right').addEventListener('click', () => {
        clickSound.currentTime = 0; 
        clickSound.play();
        currentScreen = screens[currentScreen].right;
        updateScreen();
    });

    document.getElementById('arrow-left').addEventListener('click', () => {
        clickSound.currentTime = 0; 
        clickSound.play();
        currentScreen = screens[currentScreen].left;
        updateScreen();
    });
}

function initGameObjects() {
    // Sala 0 - Objeto na posição x:100, y:150, tamanho 50x50
    addHitboxToRoom(0, 100, 150, 50, 50, "Você encontrou uma chave!");
    
    // Sala 1 - Objeto diferente
    addHitboxToRoom(1, 200, 300, 60, 40, "Tem um livro empoeirado aqui...");
    
    // Configura os eventos de clique uma única vez
    setupHitboxes();
}

function addHitboxToRoom(roomIndex, options) {
    const hitbox = createHitboxElement(options);
    
    if (options.puzzleScreen) {
        hitbox.addEventListener('click', () => {
            // Remove todas as hitboxes antes de ir para o puzzle
            document.querySelectorAll('.object-hitbox').forEach(hb => hb.remove());
            clickSound.currentTime = 0;
            clickSound.play();
            navigateToPuzzle(options.puzzleScreen);
        });
    }
    
    if (options.persistent) {
        screens[roomIndex].persistentHitboxes.push(hitbox);
    } else {
        screens[roomIndex].hitboxes.push(hitbox);
    }
    
    if (currentScreen === roomIndex && !isInPuzzleView) {
        document.querySelector('.scene-container').appendChild(hitbox);
    }
    
    return hitbox;
}

function navigateToPuzzle(puzzleKey) {
    if (!puzzleScreens[puzzleKey]) return;
    
    // Salva o estado atual no histórico
    navigationHistory.push({
        type: 'puzzle',
        puzzleKey: puzzleKey,
        screenIndex: currentScreen
    });
    
    showPuzzleScreen(puzzleKey);
}


function showPuzzleScreen(puzzleKey) {
    const puzzle = puzzleScreens[puzzleKey];
    const container = document.querySelector('.scene-container');
    
    // Remove todas as hitboxes existentes
    document.querySelectorAll('.object-hitbox').forEach(hb => hb.remove());
    
    // Esconde todas as salas
    document.querySelectorAll('.room').forEach(room => {
        room.classList.remove('active');
        room.style.display = 'none';
    });
    
    // Cria a tela do puzzle
    const puzzleView = document.createElement('div');
    puzzleView.className = 'puzzle-view active';
    puzzleView.style.backgroundImage = puzzle.image;
    container.appendChild(puzzleView);
    
    // Adiciona hitboxes específicas do puzzle (se houver)
    puzzle.hitboxes.forEach(hb => container.appendChild(hb));
    
    // Adiciona botão de voltar
    addBackButton();
    
    isInPuzzleView = true;
    positionElements();
}

function addBackButton() {
    // Remove botão existente
    const existing = document.querySelector('.back-button');
    if (existing) existing.remove();
    
    const backButton = document.createElement('div');
    backButton.className = 'back-button';
    backButton.textContent = 'Voltar';
    backButton.addEventListener('click', goBack);
    document.querySelector('.scene-container').appendChild(backButton);
}

function goBack() {
    if (navigationHistory.length === 0) return;
    
    const previous = navigationHistory.pop();
    const container = document.querySelector('.scene-container');
    
    // Remove todos os elementos do puzzle
    container.querySelectorAll('.puzzle-view, .back-button').forEach(el => el.remove());
    
    // Remove quaisquer hitboxes remanescentes
    document.querySelectorAll('.object-hitbox').forEach(hb => hb.remove());
    
    if (previous.type === 'puzzle') {
        isInPuzzleView = false;
        currentScreen = previous.screenIndex;
        
        // Mostra a sala novamente
        const room = document.getElementById(`room${currentScreen}`);
        room.classList.add('active');
        room.style.display = 'block';
        
        // Restaura apenas as hitboxes da sala atual
        const currentRoom = screens[currentScreen];
        currentRoom.hitboxes.forEach(hb => {
            if (hb.dataset.collected !== "true") container.appendChild(hb);
        });
        currentRoom.persistentHitboxes.forEach(hb => container.appendChild(hb));
        
        positionElements();
    }
}

function createHitboxElement({ x, y, width, height, message, id, collectable, puzzleScreen }) {
    const hitbox = document.createElement('div');
    hitbox.className = 'object-hitbox';
    
    // Armazena as coordenadas originais (relativas à imagem)
    hitbox.dataset.originalX = x;
    hitbox.dataset.originalY = y;
    hitbox.dataset.originalWidth = width;
    hitbox.dataset.originalHeight = height;
    
    // Configuração inicial (será ajustada em updateHitboxesPosition)
    hitbox.style.position = 'absolute';
    hitbox.style.left = '0';
    hitbox.style.top = '0';
    hitbox.style.width = '0';
    hitbox.style.height = '0';
    
    hitbox.dataset.notification = message;
    hitbox.dataset.id = id || `hitbox-${Math.random().toString(36).substr(2, 9)}`;
    
    if (collectable) {
        hitbox.dataset.collected = "false";
        hitbox.classList.add('collectable');
    }
    
    if (puzzleScreen) {
        hitbox.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.play();
            navigateToPuzzle(puzzleScreen);
        });
    }
    
    return hitbox;
}

//Notificação
function showNotification(text) {
    const notification = document.getElementById('game-notification');
    notification.textContent = text;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

//Hitboxes
function setupHitboxes() {
    document.querySelector('.scene-container').addEventListener('click', function(e) {
        const hitbox = e.target.closest('.object-hitbox');
        if (!hitbox) return;
        
        e.stopPropagation();
        
        // Se for coletável
        if (hitbox.classList.contains('collectable')) {
            if (hitbox.dataset.collected === "false") {
                hitbox.dataset.collected = "true";
                showNotification(hitbox.dataset.notification);
                //addToInventory(hitbox.dataset.id); - ADICIONAR DEPOIS UMA FUNÇÃO DE INVENTÁRIO
                hitbox.style.display = "none";
            }
        } else {
            showNotification(hitbox.dataset.notification);
        }
    });
}

// Reinicia todas as hitboxes de uma sala (exceto persistentes)
function resetRoomHitboxes(roomIndex) {
    screens[roomIndex].hitboxes.forEach(hitbox => {
        hitbox.style.display = "block";
        hitbox.dataset.collected = "false";
    });
}

// Encontra hitbox por ID
function getHitboxById(id) {
    for (const room of screens) {
        const allHitboxes = [...room.hitboxes, ...room.persistentHitboxes];
        const found = allHitboxes.find(hb => hb.dataset.id === id);
        if (found) return found;
    }
    return null;
}

// Inicialização do jogo
// Em salas.js, substitua a função init() por esta:
function init() {
    // Esconde o jogo inicialmente
    document.querySelector('.game-container').classList.add('hidden');
    
    preloadImages();
    screens.forEach((screen, index) => {
        document.getElementById(`room${index}`).style.backgroundImage = screen.image;
    });
    
    setupControls();
    setupInventory();
    setupMenu(); // Adiciona o menu
    updateScreen();
    setupHitboxes();

    //TESTE DE HITBOXES
    /*
    addHitboxToRoom(0, {
        x: 100,
        y: 150,
        width: 50,
        height: 50,
        message: "Peguei uma chave",
        id: "key-1",
        collectable: true
    });
    */
    
    addHitboxToRoom(0, {
        x: 300,
        y: 140,
        width: 60,
        height: 60,
        message: "Caixa da Helena",
        persistent: true
    })

    addHitboxToRoom(1, {
        x: 95,
        y: 40,
        width: 100,
        height: 60,
        message: "Mapa-mundi",
        persistent: true
    })

    addHitboxToRoom(1, {
        x: 35,
        y: 130,
        width: 150,
        height: 20,
        message: "Gaveta trancada",
        persistent: true
    });

    addHitboxToRoom(2, {
        x: 290,
        y: 85,
        width: 45,
        height: 60,
        message: "Uma pintura antiga na parede...",
        persistent: true,
        puzzleScreen: 'pintura'
    })

    addHitboxToRoom(2, {
        x: 40,
        y: 175,
        width: 55,
        height: 40,
        message: "Caixa do Rafael",
        persistent: true
    })

    addHitboxToRoom(3, {
        x: 60,
        y: 40,
        width: 120,
        height: 170,
        message: "Armário Velho",
        persistent: true
    })

    addHitboxToRoom(3, {
        x: 335,
        y: 140,
        width: 60,
        height: 60,
        message: "Caixa da Clara",
        persistent: true
    })

    window.addEventListener('resize', positionElements);
}

window.addEventListener('resize', () => {
    positionElements(); // Isso vai chamar updateHitboxesPosition() indiretamente
});

// Inicia o jogo
init();