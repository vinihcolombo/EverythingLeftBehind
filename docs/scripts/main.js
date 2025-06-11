import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import { sizes } from './constants.js';

const config = {
    type: Phaser.AUTO,
    width: sizes.width,
    height: sizes.height,
    scene: [MenuScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH // Corrigido para Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true
    }
    // parent: 'game-container', // Descomente e use se tiver um div no HTML
};

// Inicia o jogo
const game = new Phaser.Game(config);