// Define as dimensões da tela do jogo
const sizes = {
    width: 426,
    height: 240,
};

// Gerenciador de Quartos
class RoomManager {
    constructor(scene) {
        this.scene = scene;
        this.currentRoom = 1;
        this.maxRooms = 4;
        this.interactiveZones = []; // Armazena todas as zonas interativas
    }

    loadRoom(roomNumber) {
        this.currentRoom = roomNumber;

        // Limpa as zonas interativas anteriores
        this.clearPreviousZones();

        // Atualiza a cena
        const mapKey = `mapa${roomNumber}`;
        this.scene.updateBackground(`bg${roomNumber}`);
        this.scene.loadMapObjects(`mapa${roomNumber}`);
        this.scene.currentMapKey = mapKey;
        this.scene.updateArrowsVisibility();
    }

    clearPreviousZones() {
        this.interactiveZones.forEach(zone => zone.destroy());
        this.interactiveZones = [];
    }

    nextRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom((this.currentRoom % totalRooms) + 1);
    }

    prevRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom(((this.currentRoom - 2 + totalRooms) % totalRooms) + 1);
    }
}

// Cena Principal do Jogo
class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        this.roomManager = null;
        this.bg = null;
        this.tooltip = null;
        this.arrows = {
            left: null,
            right: null
        };
        this.standardRooms = ['mapa1', 'mapa2', 'mapa3', 'mapa4'];
        this.currentMapKey = null;
    }

    preload() {
        // Carrega todos os fundos
        this.load.image('bg1', '/assets/images/parede1.png');
        this.load.image('bg2', '/assets/images/parede2.png');
        this.load.image('bg3', '/assets/images/parede3.png');
        this.load.image('bg4', '/assets/images/parede4.png');
        this.load.image('caixaclara', '/assets/images/CaixaClara.png');

        // Carrega os mapas
        this.load.json('mapa1', './maps/mapa1.json');
        this.load.json('mapa2', './maps/mapa2.json');
        this.load.json('mapa3', './maps/mapa3.json');
        this.load.json('mapa4', './maps/mapa4.json');
        this.load.json('caixaclara', './maps/caixaclara.json');

        // Carrega ícone de seta
        this.load.image('seta', '/assets/ui/seta.png');
    }

    create() {
        // Inicializa o gerenciador de quartos
        this.roomManager = new RoomManager(this);

        // Configura o fundo
        this.bg = this.add.image(0, 0, 'bg1').setOrigin(0, 0);
        this.bg.displayWidth = this.scale.width;
        this.bg.displayHeight = this.scale.height;

        // Cria as setas de navegação
        this.createNavigationArrows();

        // Configura o tooltip
        this.tooltip = this.add.text(0, 0, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#fff',
            padding: { x: 5, y: 2 },
            resolution: 3, // Dobra a resolução do texto
        }).setDepth(100).setVisible(false);
        // Carrega o primeiro quarto (com pequeno delay para garantir inicialização)
        this.time.delayedCall(100, () => {
            this.roomManager.loadRoom(1);
        });

        // Caixa de diálogo inferior
        this.textBoxBackground = this.add.rectangle(0, sizes.height - 60, sizes.width, 60, 0x000000, 0.8)
            .setOrigin(0, 0)
            .setDepth(100)
            .setVisible(false);

        this.textBox = this.add.text(10, sizes.height - 55, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            resolution: 3,
            color: '#ffffff',
            wordWrap: { width: sizes.width - 20 }
        })
            .setDepth(101)
            .setVisible(true);


        // Botões na ESQUERDA
        this.buttonOpen = this.add.text(10, sizes.height - 25, '[Abrir]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#00ff00',
            padding: { x: 6, y: 2 },
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            resolution: 2,
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.loadCustomMap('caixaclara', 'caixaclara');
                this.hideTextBox();
            })
            .setDepth(101)
            .setVisible(false);

        this.buttonClose = this.add.text(90, sizes.height - 25, '[Fechar]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ff0000',
            padding: { x: 6, y: 2 },
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            resolution: 2,
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.hideTextBox();
            })
            .setDepth(101)
            .setVisible(false);

    }

    loadCustomMap(mapKey, bgKey) {
        // Limpa zonas interativas anteriores
        this.roomManager.clearPreviousZones();

        // Atualiza o fundo, se quiser um fundo específico para o POV
        if (bgKey) {
            this.updateBackground(bgKey);
        }

        // Carrega objetos do mapa customizado
        this.loadMapObjects(mapKey);

        this.currentMapKey = mapKey;

        // Esconde setas (se não quiser navegar no POV)
        this.arrows.left.setVisible(false);
        this.arrows.right.setVisible(false);
    }

    isStandardRoom() { // Verificação se é um quarto padrão para as setas aparecerem 
        return this.standardRooms.includes(this.currentMapKey);
    }

    createNavigationArrows() {
        // Seta esquerda
        this.arrows.left = this.add.image(20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setAngle(180)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.roomManager.prevRoom())
            .setVisible(false);

        // Seta direita
        this.arrows.right = this.add.image(this.scale.width - 20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.roomManager.nextRoom());
    }

    updateArrowsVisibility() {
        this.arrows.left.setVisible(true);
        this.arrows.right.setVisible(true);
    }

    updateBackground(bgKey) {
        this.bg.setTexture(bgKey);
    }

    loadMapObjects(mapKey) {
        // Carrega os objetos do mapa
        const mapData = this.cache.json.get(mapKey);
        const objetos = mapData.layers.filter(layer => layer.type === 'objectgroup');

        objetos.forEach(group => {
            group.objects.forEach(obj => {
                // Cria zona interativa
                const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height)
                    .setOrigin(0)
                    .setInteractive({ useHandCursor: true })
                    .on('pointerover', () => this.showTooltip(obj))
                    .on('pointerout', () => this.tooltip.setVisible(false))
                    .on('pointerdown', () => this.handleObjectClick(obj));

                // Armazena a zona para limpeza posterior
                this.roomManager.interactiveZones.push(zone);

                // Debug visual (opcional)
                // const debugRect = this.add.rectangle(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width, obj.height)
                //     .setStrokeStyle(1, 0x00ff00)
                //     .setDepth(99);

                // this.roomManager.interactiveZones.push(debugRect);
            });
        });
    }

    showTooltip(obj) {
        this.tooltip.setText(obj.name);

        let posX = obj.x + 10;
        let posY = obj.y - 20;

        if (posY < 0) posY = obj.y + 20;
        if (posX + this.tooltip.width > this.scale.width) posX = this.scale.width - this.tooltip.width - 10;
        if (posX < 0) posX = 10;

        this.tooltip.setPosition(posX, posY).setVisible(true);
    }

    handleObjectClick(obj) {
        //         if (obj.name === "caixa pequena") {
        //     this.loadCustomMap('caixaclara', 'caixaclara');
        //     this.showTextBox("Você abriu a caixa pequena.");
        // }
        console.log(`Clicou em: ${obj.name}`);

        if (obj.name === "caixa pequena") {
            this.showTextBoxWithChoices("Nossa.. tantas memórias da Clara por aqui..");
            return;
        }

        if (obj.name === "voltar") {
            this.loadCustomMap('mapa1', 'bg1'); // Ex: mapa POV + fundo opcional
        }

        if (this.isStandardRoom()) {
            this.arrows.left.setVisible(true);
            this.arrows.right.setVisible(true);
        } else {
            this.arrows.left.setVisible(false);
            this.arrows.right.setVisible(false);
        }

        // Adicione aqui lógica para interação com objetos específicos
    }

    showTextBoxWithChoices(message) {
        this.textBox.setText(message).setVisible(true);
        this.textBoxBackground.setVisible(true);
        this.buttonOpen.setVisible(true);
        this.buttonClose.setVisible(true);
    }

    hideTextBox() {
        this.textBox.setVisible(false);
        this.textBoxBackground.setVisible(false);
        this.buttonOpen.setVisible(false);
        this.buttonClose.setVisible(false);
    }

}

// Configuração do Phaser
const config = {
    type: Phaser.AUTO,
    width: sizes.width,
    height: sizes.height,
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.NONE // Evita scaling automático
    },
    render: {
        antialias: false, // Para pixel art
        roundPixels: true // Melhora clareza
    }
};

// Inicia o jogo
const game = new Phaser.Game(config);