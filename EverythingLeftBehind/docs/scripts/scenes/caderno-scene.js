export default class CadernoScene extends Phaser.Scene {
    constructor() {
        super('CadernoScene');
    }

    init(data) {
        // Recebe as referências importantes da cena principal
        this.parentScene = data.parent;
        this.mainInventory = data.inventory;
    }

    create() {
        // Configuração do background
        this.add.image(0, 0, 'bg-caderno')
            .setOrigin(0)
            .setDisplaySize(this.game.config.width, this.game.config.height);

        // Botão de voltar melhorado
        const backButton = this.add.text(20, 20, 'Voltar', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#FFFFFF',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.closeNotebook());

        // Aqui você adicionaria a lógica específica do caderno
        // ... seu código existente do caderno ...

        // Garante que o cursor volte ao normal
        this.input.on('gameout', () => {
            this.game.canvas.style.cursor = 'default';
        });
    }

    closeNotebook() {
        // Retorna para a cena principal de forma segura
        if (this.parentScene) {
            this.parentScene.scene.resume();
            this.mainInventory.setVisible(true);
        }
        this.scene.stop();
    }

    // ... outros métodos do caderno ...
}