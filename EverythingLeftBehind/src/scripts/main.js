// Configurações globais do jogo
const GAME_CONFIG = {
    screens: [
        { 
            image: "url('assets/images/paredeNorte_0.png')", 
            left: 3, 
            right: 1,
            hitboxes: [],
            persistentHitboxes: []
        },
        { 
            image: "url('assets/images/paredeLest_0.png')", 
            left: 0, 
            right: 2,
            hitboxes: [],
            persistentHitboxes: []
        },
        { 
            image: "url('assets/images/paredeSul_0.png')", 
            left: 1, 
            right: 3,
            hitboxes: [],
            persistentHitboxes: []
        },
        { 
            image: "url('assets/images/paredeOeste_0.png')", 
            left: 2, 
            right: 0,
            hitboxes: [],
            persistentHitboxes: []
        }
    ],
    
    puzzleScreens: {
        'pintura': {
            image: "url('assets/images/CaixaPOV.png')",
            hitboxes: []
        }
    },
    
    soundEffects: {
        button: new Audio('assets/SFX/Button.wav'),
        inventory: new Audio('assets/SFX/Inventory_Button.wav')
    }
};

// Estado global do jogo
const GAME_STATE = {
    currentScreen: 0,
    navigationHistory: [],
    isInPuzzleView: false,
    inventoryOpen: false
};

// Inicialização do jogo
function initGame() {
    preloadImages();
    setupGameRooms();
    setupControls();
    setupInventory();
    setupHitboxes();
    setupMenu();
    
    window.addEventListener('resize', positionElements);
    positionElements();
}

// Pré-carregar imagens
function preloadImages() {
    GAME_CONFIG.screens.forEach(screen => {
        const img = new Image();
        img.src = screen.image.replace("url('", "").replace("')", "");
    });
    
    Object.values(GAME_CONFIG.puzzleScreens).forEach(puzzle => {
        const img = new Image();
        img.src = puzzle.image.replace("url('", "").replace("')", "");
    });
}

// Configurar salas do jogo
function setupGameRooms() {
    GAME_CONFIG.screens.forEach((screen, index) => {
        const room = document.getElementById(`room${index}`);
        if (room) {
            room.style.backgroundImage = screen.image;
        }
    });
}

// Iniciar o jogo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});