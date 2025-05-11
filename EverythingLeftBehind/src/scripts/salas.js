// Configuração inicial
let currentScreen = 0;
const screens = [
    { 
        image: "url('assets/images/paredeNorte_0.png')", 
        left: 3, 
        right: 1 
    },
    { 
        image: "url('assets/images/paredeLest_0.png')", 
        left: 0, 
        right: 2 
    },
    { 
        image: "url('assets/images/paredeSul_0.png')", 
        left: 1, 
        right: 3 
    },
    { 
        image: "url('assets/images/paredeOeste_0.png')", 
        left: 2, 
        right: 0 
    }
];

// Estado do inventário
let inventoryOpen = false;

// Pré-carrega imagens para evitar flickering
function preloadImages() {
    screens.forEach(screen => {
        const img = new Image();
        img.src = screen.image.replace("url('", "").replace("')", "");
    });
}

// Posiciona todos os elementos de UI relativos à imagem
function positionElements() {
    const activeRoom = document.querySelector('.room.active');
    if (!activeRoom) return;

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
    };
}

// Controle do inventário
function setupInventory() {
    const inventoryToggle = document.getElementById('inventory-toggle');
    const inventory = document.getElementById('inventory');
    
    if (inventoryToggle && inventory) {
        inventoryToggle.addEventListener('click', () => {
            inventoryOpen = !inventoryOpen;
            inventory.classList.toggle('open', inventoryOpen);
            positionElements(); // Atualiza posição ao abrir/fechar
        });
    }
}

// Atualiza a tela atual
function updateScreen() {
    document.querySelectorAll('.room').forEach(room => {
        room.classList.remove('active');
    });
    document.getElementById(`room${currentScreen}`).classList.add('active');
    positionElements();
}

// Controles de navegação
function setupControls() {
    document.getElementById('arrow-right').addEventListener('click', () => {
        currentScreen = screens[currentScreen].right;
        updateScreen();
    });

    document.getElementById('arrow-left').addEventListener('click', () => {
        currentScreen = screens[currentScreen].left;
        updateScreen();
    });
}

// Inicialização do jogo
function init() {
    preloadImages();
    screens.forEach((screen, index) => {
        document.getElementById(`room${index}`).style.backgroundImage = screen.image;
    });
    
    setupControls();
    setupInventory();
    updateScreen();
    
    // Redimensiona elementos quando a janela muda de tamanho
    window.addEventListener('resize', positionElements);
}

// Inicia o jogo
init();