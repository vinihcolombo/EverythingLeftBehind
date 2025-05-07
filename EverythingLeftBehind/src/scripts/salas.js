// Configuração inicial
let currentScreen = 0;
const screens = [
    { 
        image: "url('assets/images/idea.png')", 
        left: 3, 
        right: 1 
    },
    { 
        image: "url('assets/images/Sprite-0004.png')", 
        left: 0, 
        right: 2 
    },
    { 
        image: "url('assets/images/CapaNO.png')", 
        left: 1, 
        right: 3 
    },
    { 
        image: "url('assets/images/Sprite-02.png')", 
        left: 2, 
        right: 0 
    }
];

// Pré-carrega imagens para evitar flickering
function preloadImages() {
    screens.forEach(screen => {
        const img = new Image();
        img.src = screen.image.replace("url('", "").replace("')", "");
    });
}

// Inicialização
function init() {
    preloadImages();
    screens.forEach((screen, index) => {
        document.getElementById(`room${index}`).style.backgroundImage = screen.image;
    });
    updateScreen();
}

// Atualizar tela
function updateScreen() {
    document.querySelectorAll('.room').forEach(room => {
        room.classList.remove('active');
    });
    document.getElementById(`room${currentScreen}`).classList.add('active');
}

// Controles
document.getElementById('arrow-right').addEventListener('click', () => {
    currentScreen = screens[currentScreen].right;
    updateScreen();
});

document.getElementById('arrow-left').addEventListener('click', () => {
    currentScreen = screens[currentScreen].left;
    updateScreen();
});

// Iniciar o jogo
init();