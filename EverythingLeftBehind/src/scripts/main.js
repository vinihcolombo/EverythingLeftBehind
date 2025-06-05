// Define as dimensões da tela do jogo
const sizes = {
    width: 426,
    height: 240,
};

//Sons
const clickSound = new Audio('./assets/SFX/Button.wav');
const inventorySound = new Audio('./assets/SFX/Inventory_Button.wav');

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

        // Limpa as zonas interativas e objetos customizados anteriores
        this.clearPreviousZones();

        // Atualiza a cena
        const mapKey = `mapa${roomNumber}`;
        this.scene.updateBackground(`bg${roomNumber}`);
        this.scene.loadMapObjects(`mapa${roomNumber}`);
        this.scene.currentMapKey = mapKey;
        this.scene.updateArrowsVisibility();
    }

    playSound() {
        clickSound.currentTime = 0;
        clickSound.play();
    }

    clearPreviousZones() {
        this.interactiveZones.forEach(zone => zone.destroy());
        this.interactiveZones = [];
        // Chama o método da cena para limpar objetos visuais específicos de mapas customizados
        if (this.scene && typeof this.scene.clearCustomMapObjects === 'function') {
            this.scene.clearCustomMapObjects();
        }
    }

    nextRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom((this.currentRoom % totalRooms) + 1);
        clickSound.currentTime = 0;
        clickSound.play();
    }

    prevRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom(((this.currentRoom - 2 + totalRooms) % totalRooms) + 1);
        clickSound.currentTime = 0;
        clickSound.play();
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
        this.inspectionScreen = null;
        this.notebookSprite = null; // <--- ADICIONADO: Referência para o sprite do caderno
    }

    preload() {
        // Carrega todos os fundos
        this.load.image('bg1', './assets/images/parede1.png');
        this.load.image('bg2', './assets/images/parede2.png');
        this.load.image('bg3', './assets/images/parede3.png');
        this.load.image('bg4', './assets/images/parede4.png');
        this.load.image('caixaclara', './assets/images/CaixaClara.png');

        // Carrega os mapas
        this.load.json('mapa1', './maps/mapa1.json');
        this.load.json('mapa2', './maps/mapa2.json');
        this.load.json('mapa3', './maps/mapa3.json');
        this.load.json('mapa4', './maps/mapa4.json');
        this.load.json('caixaclara', './maps/caixaclara.json');

        // Carrega ícone de seta
        this.load.image('seta', './assets/ui/seta.png'); // Corrigido o caminho (removido .//)

        //Itens de Inventários
        this.load.image('notebookOpen', './assets/images/objects/notebookOpen.png');
        this.load.image('caderno', './assets/images/objects/Notebook_Item.png');


        //Inventário
        this.load.image('backpack', './assets/images/backpack.png');
        this.load.image('slot', './assets/images/Slot.png');
        this.load.image('inventory', './assets/images/InventoryOverlay.png');
        this.load.image('iconInventory', './assets/images/inventoryicon.png');
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

        this.inventory = new Inventory(this); // Mantido como no seu código original

        // Configura o tooltip
        this.tooltip = this.add.text(0, 0, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#fff',
            padding: { x: 5, y: 2 },
            resolution: 3,
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
            .setVisible(true); // Mantido como no seu código original


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

        this.setInteractionsEnabled(true);
    }

    setInteractionsEnabled(state) {
        this.roomManager.interactiveZones.forEach(zone => {
            if (zone && zone.input) { // Verificação para zona válida
                zone.input.enabled = state;
            }
        });

        // No Phaser 3, a interatividade é habilitada/desabilitada diretamente no objeto de input
        if (this.arrows.left) this.arrows.left.input.enabled = state;
        if (this.arrows.right) this.arrows.right.input.enabled = state;

        this.tooltip.setVisible(false);
    }

    // <--- ADICIONADO: Método para limpar objetos específicos de mapas customizados
    clearCustomMapObjects() {
        if (this.notebookSprite) {
            this.notebookSprite.destroy();
            this.notebookSprite = null;
        }
        // Adicione aqui a destruição de outros objetos visuais específicos, se necessário.
    }

    loadCustomMap(mapKey, bgKey) {
        // Limpa zonas interativas anteriores e objetos customizados (como o caderno)
        this.roomManager.clearPreviousZones(); // Esta chamada agora também limpa o notebookSprite

        if (bgKey) {
            this.updateBackground(bgKey);
        }

        this.loadMapObjects(mapKey); // Isso recriará o caderno se mapKey for 'caixaclara'
        this.currentMapKey = mapKey;

        // Esconde setas (se não quiser navegar no POV)
        // A visibilidade das setas também é tratada em updateArrowsVisibility,
        // mas aqui garantimos que em mapas customizados elas iniciem escondidas se necessário.
        if (this.isStandardRoom()) {
            this.updateArrowsVisibility();
        } else {
            this.arrows.left.setVisible(false);
            this.arrows.right.setVisible(false);
        }
    }

    isStandardRoom() {
        return this.standardRooms.includes(this.currentMapKey);
    }

    createNavigationArrows() {
        this.arrows.left = this.add.image(20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setAngle(180)
            .setInteractive({ useHandCursor: true })
            .setDepth(1002)
            .on('pointerdown', () => {
                if (this.inventory.isVisible == false) {
                    this.roomManager.prevRoom();
                }
            });

        this.arrows.right = this.add.image(this.scale.width - 20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setInteractive({ useHandCursor: true })
            .setDepth(1002)
            .on('pointerdown', () => {
                if (this.inventory.isVisible == false) {
                    this.roomManager.nextRoom();
                }
            });
    }

    updateArrowsVisibility() {
        // As setas só devem ser visíveis em quartos padrão
        const standard = this.isStandardRoom();
        this.arrows.left.setVisible(standard);
        this.arrows.right.setVisible(standard);
    }

    updateBackground(bgKey) {
        this.bg.setTexture(bgKey);
        // É bom redefinir o displaySize caso os BGs tenham tamanhos diferentes da tela
        this.bg.displayWidth = this.scale.width;
        this.bg.displayHeight = this.scale.height;
    }

    loadMapObjects(mapKey) {
        const mapData = this.cache.json.get(mapKey);
        if (!mapData || !mapData.layers) { // Adicionada verificação de segurança
            console.warn(`Dados do mapa ${mapKey} não encontrados ou inválidos.`);
            return;
        }
        const objetos = mapData.layers.filter(layer => layer.type === 'objectgroup');

        objetos.forEach(group => {
            if (group.name === 'notebook') {
                group.objects.forEach(obj => {
                    if (mapKey === 'caixaclara' && obj.name === 'caderno' && obj.type === 'item') {
                        this.createNotebookObject(obj);
                    }
                });
            } else {
                group.objects.forEach(obj => {
                    this.createStandardInteractiveZone(obj);
                });
            }
        });
    }

    // <--- MÉTODO MODIFICADO para gerenciar this.notebookSprite
    createNotebookObject(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.notebookSprite) {
            this.notebookSprite.destroy();
            this.notebookSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.notebookSprite = this.add.image(
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'caderno'
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        const zone = this.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip({ name: 'Caderno da Clara', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }

    createStandardInteractiveZone(obj) {
        const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip(obj))
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj));

        this.roomManager.interactiveZones.push(zone);
    }

    showTooltip(obj) { // obj aqui deve ter x, y, width, height, name
        if (this.inventory.isVisible) return;

        this.tooltip.setText(obj.name);

        // Posição do tooltip baseada no objeto Tiled (obj)
        let tooltipPosX = obj.x + (obj.width / 2); // Centro horizontal do objeto Tiled
        let tooltipPosY = obj.y - 5; // Um pouco acima do objeto Tiled

        // Ajustes para manter o tooltip na tela (simplificado)
        if (tooltipPosY - this.tooltip.height < 0) { // Se for sair por cima
            tooltipPosY = obj.y + obj.height + 5 + this.tooltip.height; // Posiciona abaixo
        }

        // Centraliza o tooltip horizontalmente em relação a tooltipPosX
        this.tooltip.setOrigin(0.5, 1); // ancora no centro horizontal, base vertical

        // Garante que não saia pelas laterais
        const halfWidth = this.tooltip.width / 2;
        if (tooltipPosX - halfWidth < 0) tooltipPosX = halfWidth;
        if (tooltipPosX + halfWidth > this.scale.width) tooltipPosX = this.scale.width - halfWidth;

        this.tooltip.setPosition(tooltipPosX, tooltipPosY).setVisible(true);
    }

    handleObjectClick(obj) {
        if (this.inventory.isVisible) return;

        if (obj.name === "caixa pequena") {
            this.showTextBoxWithChoices("Nossa.. tantas memórias da Clara por aqui..");
            return;
        }

        if (obj.name === "voltar") {
            this.loadCustomMap('mapa1', 'bg1'); // Mantido como no seu código original
            // Garante que setas reapareçam se mapa1 for standard room
            this.time.delayedCall(50, () => this.updateArrowsVisibility());
        }

        // A visibilidade das setas é principalmente gerenciada por updateArrowsVisibility
        // chamada após loadRoom ou loadCustomMap.
        // A lógica abaixo pode ser redundante ou causar chamadas desnecessárias a setVisible.
        /*
        if (this.isStandardRoom()) {
            this.arrows.left.setVisible(true);
            this.arrows.right.setVisible(true);
        } else {
            this.arrows.left.setVisible(false);
            this.arrows.right.setVisible(false);
        }
        */
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

class Inventory {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = false;
        this.slots = [];
        this.maxSlots = 10;
        this.scrollY = 0;
        this.maxScroll = 0;

        // Posições e dimensões
        this.inventoryWidth = 150;
        this.hiddenX = scene.cameras.main.width + 10;
        this.visibleX = scene.cameras.main.width - this.inventoryWidth;

        this.createToggleButton();
        this.createInventoryOverlay();

        this.isAnimating = false;

        this.itemActions = {};
    }

    isInventoryActive() {
        return this.inventory.isVisible;
    }

    createToggleButton() {
        const rightPosition = this.scene.cameras.main.width - 40;
        const topPosition = 20;

        this.toggleButton = this.scene.add.image(rightPosition, topPosition, 'iconInventory')
            .setDisplaySize(40, 40) // Tamanho fixo
            .setInteractive({ useHandCursor: true })
            .setDepth(1005);

        // Efeitos de hover - agora mais sutis
        this.toggleButton.on('pointerover', () => {
            this.scene.tweens.add({
                targets: this.toggleButton,
                scaleX: 0.4,
                scaleY: 0.4,
                duration: 100,
                ease: 'Sine.easeOut'
            });
        });

        this.toggleButton.on('pointerout', () => {
            this.scene.tweens.add({
                targets: this.toggleButton,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 100,
                ease: 'Sine.easeIn'
            });
        });

        this.toggleButton.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: this.toggleButton,
                scaleX: 0.03,
                scaleY: 0.03,
                duration: 50,
                yoyo: true
            });
            this.toggleInventory();
        });
    }

    createInventoryOverlay() {
        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;

        const x = gameWidth - this.inventoryWidth;

        this.inventoryBg = this.scene.add.image(
            this.hiddenX,
            gameHeight / 2,
            'inventory'
        )
            .setOrigin(1.2, 0.5)
            .setDisplaySize(this.inventoryWidth - x - 25, gameHeight)
            .setDepth(1003);

        const rightPadding = 30;
        this.slotsContainer = this.scene.add.container(
            this.hiddenX + rightPadding,
            60
        )
            .setDepth(1004);

        const slotSize = 60;
        const padding = 5;

        for (let i = 0; i < this.maxSlots; i++) {
            const x = slotSize / 0.7;
            const y = i * (slotSize + padding) + slotSize / 2;

            const slotBg = this.scene.add.image(
                x, y,
                'slot'
            )
                .setDisplaySize(slotSize, slotSize);

            this.slots.push({
                background: slotBg,
                item: null,
                x: x,
                y: y
            });

            this.slotsContainer.add(slotBg);
        }

        // Calcular scroll máximo
        this.calculateMaxScroll();

        // Configurar scroll do mouse
        this.setupMouseScroll();
    }

    calculateMaxScroll() {
        const slotHeight = 60 + 10;
        const visibleHeight = this.scene.cameras.main.height - 120;
        const totalHeight = this.maxSlots * slotHeight;

        this.maxScroll = Math.max(0, totalHeight - visibleHeight);
    }

    setupMouseScroll() {
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (this.isVisible) {
                this.scrollY += deltaY * 0.5;

                this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScroll);

                this.slotsContainer.y = 60 - this.scrollY;
            }
        });
    }

    toggleInventory() {
        inventorySound.play();
        if (this.isAnimating) return;

        this.isVisible = !this.isVisible;
        this.isAnimating = true;

        this.scene.setInteractionsEnabled(!this.isVisible);

        if (this.isVisible) {
            this.scrollY = 0;
            this.slotsContainer.y = 60;

            // Animação de entrada
            this.scene.tweens.add({
                targets: [this.inventoryBg, this.slotsContainer],
                x: this.visibleX,
                duration: 300,
                onComplete: () => {
                    this.isAnimating = false;
                    this.slots.forEach(slot => {
                        if (slot.item) slot.item.setVisible(true);
                    });
                }
            });
        } else {
            // Animação de saída
            this.scene.tweens.add({
                targets: [this.inventoryBg, this.slotsContainer],
                x: this.hiddenX,
                duration: 300,
                onComplete: () => {
                    this.isAnimating = false;
                    this.slots.forEach(slot => {
                        if (slot.item) slot.item.setVisible(false);
                    });
                }
            });
            this.scene.setInteractionsEnabled(true);
        }
    }

    addItem(itemKey, action = null) {
        const emptySlot = this.slots.find(slot => slot.item === null);
        if (emptySlot) {
            const item = this.scene.add.image(
                emptySlot.x,
                emptySlot.y,
                itemKey
            )
                .setDisplaySize(50, 50)
                .setInteractive()
                .on('pointerdown', () => {
                    if (this.isVisible) {
                        this.executeItemAction(itemKey);
                    }
                })
                .setVisible(this.isVisible)
                .setDepth(53);

            emptySlot.item = item;
            this.slotsContainer.add(item);

            // Registra a ação se fornecida
            if (action) {
                this.itemActions[itemKey] = action;
            }

            return true;
        }
        return false;
    }

    executeItemAction(itemKey) {
        if (this.itemActions[itemKey]) {
            this.itemActions[itemKey]();
        } else {
            console.log(`Item ${itemKey} clicado, mas nenhuma ação definida`);
            // Ação padrão para itens sem função específica
            this.scene.showTooltip({ name: `Usando ${itemKey}...` });
        }
    }

    removeItem(itemKey) {
        const slotIndex = this.slots.findIndex(slot =>
            slot.item && slot.item.texture.key === itemKey
        );

        if (slotIndex !== -1) {
            this.slots[slotIndex].item.destroy();
            this.slots[slotIndex].item = null;
            return true;
        }
        return false; // Item não encontrado
    }
}

// Configuração do Phaser
const config = {
    type: Phaser.AUTO,
    width: sizes.width,
    height: sizes.height,
    scene: [GameScene],
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