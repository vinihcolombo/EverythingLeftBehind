// Configuração inicial
let currentScreen = 0;
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
    if (!activeRoom || document.querySelector('.game-container').classList.contains('hidden ')) return;

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
            // Container mais largo que a imagem (margens laterais)
            renderedHeight = containerHeight;
            renderedWidth = containerHeight * imgRatio;
            offsetX = (containerWidth - renderedWidth) / 2;
            offsetY = 0;
        } else {
            // Container mais alto que a imagem (margens verticais)
            renderedWidth = containerWidth;
            renderedHeight = containerWidth / imgRatio;
            offsetX = 0;
            offsetY = (containerHeight - renderedHeight) / 2;
        }

        // Posiciona setas
        document.getElementById('arrow-left').style.left = `${offsetX + 25}px`;
        document.getElementById('arrow-right').style.right = `${offsetX + 25}px`;

        // Posiciona o botão do inventário
        const toggleBtn = document.getElementById('inventory-toggle');
        if (toggleBtn) {
            toggleBtn.style.right = `${offsetX + 20}px`;
            toggleBtn.style.top = `${offsetY + 20}px`;
        }

        // Posiciona o inventário
        const inventory = document.getElementById('inventory');
        if (inventory) {
            inventory.style.right = inventoryOpen ? `${offsetX}px` : `${offsetX - inventory.offsetWidth}px`;
            inventory.style.top = `${offsetY}px`;
            inventory.style.height = `${renderedHeight}px`;
        }
        document.getElementById('arrow-left').style.left = `${offsetX + 25}px`;
        document.getElementById('arrow-right').style.right = `${offsetX + 25}px`;
        document.getElementById('arrow-left').style.display = 'block';
        document.getElementById('arrow-right').style.display = 'block';
    };
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
    document.querySelectorAll('.object-hitbox').forEach(hitbox => {
        hitbox.remove();
    });

    document.querySelectorAll('.room').forEach(room => {
        room.classList.remove('active');
    });
    document.getElementById(`room${currentScreen}`).classList.add('active');

    // Adiciona hitboxes da nova sala
    const currentRoom = screens[currentScreen];
    
    // Hitboxes normais (resetam ao reentrar)
    currentRoom.hitboxes.forEach(hitbox => {
        if (hitbox.dataset.collected !== "true") {
            document.querySelector('.scene-container').appendChild(hitbox);
        }
    });
    
    // Hitboxes persistentes (mantêm estado)
    currentRoom.persistentHitboxes.forEach(hitbox => {
        document.querySelector('.scene-container').appendChild(hitbox);
    });

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
    
    if (options.persistent) {
        screens[roomIndex].persistentHitboxes.push(hitbox);
    } else {
        screens[roomIndex].hitboxes.push(hitbox);
    }
    
    if (currentScreen === roomIndex) {
        document.querySelector('.scene-container').appendChild(hitbox);
    }
    
    return hitbox;
}

function createHitboxElement({ x, y, width, height, message, id, collectable }) {
    const hitbox = document.createElement('div');
    hitbox.className = 'object-hitbox';
    hitbox.style.left = `${x}px`;
    hitbox.style.top = `${y}px`;
    hitbox.style.width = `${width}px`;
    hitbox.style.height = `${height}px`;
    hitbox.dataset.notification = message;
    hitbox.dataset.id = id || `hitbox-${Math.random().toString(36).substr(2, 9)}`;
    
    if (collectable) {
        hitbox.dataset.collected = "false";
        hitbox.classList.add('collectable');
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
    addHitboxToRoom(0, {
        x: 100,
        y: 150,
        width: 50,
        height: 50,
        message: "Peguei uma chave",
        id: "key-1",
        collectable: true
    });
    
    addHitboxToRoom(1, {
        x: 200,
        y: 300,
        width: 80,
        height: 40,
        message: "Uma pintura antiga na parede...",
        persistent: true
    });

    window.addEventListener('resize', positionElements);
}

// Inicia o jogo
init();
