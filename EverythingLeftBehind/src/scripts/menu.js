// Adicione no início do arquivo, antes do init()
window.setupMenu = function() {
    const menuContainer = document.getElementById('menu-container');
    const startButton = document.getElementById('start-game');
    const settingsButton = document.getElementById('settings');
    const settingsMenu = document.getElementById('settings-menu');
    const backToMenuButton = document.getElementById('back-to-menu');
    
    // Mostrar menu de configurações
    settingsButton.addEventListener('click', () => {
        document.querySelector('.menu').style.display = 'none';
        settingsMenu.style.display = 'block';
    });
    
    // Voltar ao menu principal
    backToMenuButton.addEventListener('click', () => {
        settingsMenu.style.display = 'none';
        document.querySelector('.menu').style.display = 'block';
    });
    
    // Iniciar o jogo
    startButton.addEventListener('click', () => {
        menuContainer.classList.add('hidden');
        document.querySelector('.game-container').classList.remove('hidden');

        setTimeout(() =>{
            positionElements();
        }, 50);
    });
    
    // Configurações de volume
    const volumeControl = document.getElementById('volume');
    volumeControl.addEventListener('input', (e) => {
        // Aqui você pode adicionar código para controlar o volume do jogo
        console.log('Volume:', e.target.value);
    });
    
    // Configurações de tela cheia
    const fullscreenControl = document.getElementById('fullscreen');
    fullscreenControl.addEventListener('change', (e) => {
        if (e.target.checked) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
}