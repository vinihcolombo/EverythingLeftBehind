// Este arquivo define a classe que gerencia o puzzle das pedras.

// Dados do puzzle: quais imagens usar.
const STONE_KEYS = [
    'rockteste1',
    'rockteste2',
    'rockteste3'
];

export default class StonePuzzle {
    /**
     * @param {Phaser.Scene} scene A cena principal que está criando este puzzle.
     */
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.overlay = null;
        this.closeButton = null;
    }

    // Método para mostrar o puzzle na tela
    show() {
        // Prepara a cena principal (desativa interações, etc.)
        this.scene.setInteractionsEnabled(false);
        if (this.scene.inventory.isVisible) this.scene.inventory.toggleInventory();

        // Cria a UI do puzzle
        this.createOverlay();
        this.createStones();
        this.createCloseButton();
    }

    createOverlay() {
        this.overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.8)
            .setOrigin(0, 0).setDepth(3000).setInteractive();
        
        // Adiciona evento para fechar ao clicar no fundo
        this.overlay.on('pointerdown', () => this.hide());
    }
    
    createCloseButton() {
        this.closeButton = this.scene.add.text(this.scene.scale.width - 20, 20, 'X', { fontSize: '24px', color: '#ff0000'})
            .setOrigin(1, 0).setDepth(3002).setInteractive({ useHandCursor: true });
        
        this.closeButton.on('pointerdown', () => this.hide());
    }

    createStones() {
        // Cria um Container para posicionar as pedras facilmente
        this.container = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2).setDepth(3001);

        const spacing = 70; // Espaçamento entre as pedras
        const startX = -((STONE_KEYS.length - 1) * spacing) / 2; // Posição X inicial para centralizar

        STONE_KEYS.forEach((stoneKey, index) => {
            const x = startX + index * spacing;
            const y = 0;

            const stoneSprite = this.scene.add.image(x, y, stoneKey)
                .setInteractive({ useHandCursor: true });
            
            // Adiciona uma interação para cada pedra individual
            stoneSprite.on('pointerdown', (pointer, localX, localY, event) => {
                event.stopPropagation(); // Impede que o clique feche o puzzle
                console.log(`Clicou na pedra: ${stoneKey}`);
                
                // Exemplo de feedback visual
                stoneSprite.setAlpha(stoneSprite.alpha === 1 ? 0.5 : 1); 
            });

            this.container.add(stoneSprite);
        });
    }

    // Método para esconder e destruir todos os elementos do puzzle
    hide() {
        // Destrói todos os elementos criados
        this.overlay.destroy();
        this.closeButton.destroy();
        this.container.destroy(); // Destruir o container já destrói todas as pedras dentro dele

        // Reativa as interações da cena principal
        this.scene.setInteractionsEnabled(true);
    }
}