import { sizes } from '../constants.js';
import MusicManager from '../managers/MusicManager.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("scene-menu");
        this.musicManager = null;
        this.muteButton = null;
    }

    preload() {
        // Carrega o sprite sheet da animação de fundo
        this.load.spritesheet('capa', './assets/images/capa.png', {
            frameWidth: 426,
            frameHeight: 240,
            endFrame: 30
        });
        this.load.image('icon-sound', './assets/icons/sound.png');
        this.load.image('icon-mute', './assets/icons/mute.png');
    }

    create() {
        // Cria textura branca para o 
        this.musicManager = new MusicManager(this);
        this._createWhiteTexture();

        // Cria a animação de fundo
        this.anims.create({
            key: 'menu-loop',
            frames: this.anims.generateFrameNumbers('capa', { start: 0, end: 29 }),
            frameRate: 15,
            repeat: -1
        });

        // Adiciona o fundo animado
        const bg = this.add.sprite(sizes.width / 2, sizes.height / 2, 'capa')
            .setDisplaySize(sizes.width, sizes.height)
            .setOrigin(0.5)
            .play('menu-loop');

            

        // Adiciona o botão de iniciar
        const startButton = this.add.image(109, 182)
            .setInteractive()
            .setScale(2.1)
            .on('pointerover', () => startButton.setScale(2))
            .on('pointerout', () => startButton.setScale(2.1))
            .on('pointerdown', () => {
                startButton.disableInteractive();

                // Cria o retângulo branco para o fade (com textura gerada)
                const whiteFade = this.add.image(0, 0, 'white-rect')
                    .setOrigin(0)
                    .setDisplaySize(sizes.width, sizes.height)
                    .setAlpha(0)
                    .setDepth(100000);

                // Animação de fade
                this.tweens.add({
                    targets: whiteFade,
                    alpha: 1,
                    duration: 2000,
                    ease: 'Linear',
                    onComplete: () => {
                        this.scene.start("scene-game");
                    }
                });
            });
    }

    // Gera dinamicamente uma textura branca
    _createWhiteTexture() {
        const gfx = this.make.graphics({ x: 0, y: 0, add: false });
        gfx.fillStyle(0xffffff, 1);
        gfx.fillRect(0, 0, 32, 32);
        gfx.generateTexture('white-rect', 32, 32);
        gfx.destroy();
    }
}
