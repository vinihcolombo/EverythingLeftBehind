// Define as dimensões da tela do jogo
const sizes = {
    width: 426,
    height: 240,
};

//Sons
const clickSound = new Audio('./assets/SFX/Button.wav');
const inventorySound = new Audio('./assets/SFX/Inventory_Button.wav');

//=========================================================================================================
//=========================================================================================================
//=========================================================================================================

// Gerenciador de Quartos
class RoomManager {
    constructor(scene) {
        this.scene = scene;
        this.currentRoom = 1;
        this.maxRooms = 4;
        this.interactiveZones = []; // Armazena todas as zonas interativas
    }

//=========================================================================================================

    loadRoom(roomNumber) {
        if (this.scene.currentMapKey && this.scene.bg.texture) {
        this.scene.navigationHistory.push({
            mapKey: this.scene.currentMapKey,
            bgKey: this.scene.bg.texture.key,
            isRoom: true,
            roomNumber: this.currentRoom
        });
    }

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

//=========================================================================================================

    playSound(){
        clickSound.currentTime = 0;
        clickSound.play();
    }

//=========================================================================================================

    clearPreviousZones() {
        this.interactiveZones.forEach(zone => zone.destroy());
        this.interactiveZones = [];
    }

//=========================================================================================================

    nextRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom((this.currentRoom % totalRooms) + 1);
        clickSound.currentTime = 0;
        clickSound.play();
    }

//=========================================================================================================

    prevRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom(((this.currentRoom - 2 + totalRooms) % totalRooms) + 1);
        clickSound.currentTime = 0;
        clickSound.play();
    }
}

//=========================================================================================================
//=========================================================================================================
//=========================================================================================================

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

        //teste zoom
        this.zoomView = {
            active: false,
            currentItem: null,
            overlay: null,
            blurBg: null,
            closeButton: null,
            zoomedItem: null
        };
    }

//=========================================================================================================

    preload() {
        // Carrega todos os fundos
        this.load.image('bg1', './assets/images/paredeNorte_0.png');
        this.load.image('bg2', './assets/images/paredeOeste_0.png');
        this.load.image('bg3', './assets/images/paredeSul_0.png');
        this.load.image('bg4', './assets/images/paredeLeste_0.png');
        this.load.image('caixaclara', './assets/images/CaixaClara.png');
        this.load.image('paredeComCaixa', './assets/images/ParedecomCaixa.png');
        this.load.image('retrato', './assets/images/retratoPlaceholder.png');
        this.load.image('gaveta', './assets/images/gavetaTrancada.png');
        this.load.image('caixa', './assets/images/Caixa.png');
        this.load.image('mapa', './assets/images/mapaMundi.png');

        // Carrega os mapas
        this.load.json('mapa1', './maps/ParedeNorteDefinitiva.json');
        this.load.json('mapa2', './maps/paredeSulDefinitiva.json');
        this.load.json('mapa3', './maps/paredeLesteDefinitiva.json');
        this.load.json('mapa4', './maps/paredeOesteDefinitiva.json');
        this.load.json('caixaclara', './maps/caixaClara.json');
        this.load.json('caixahelena', './maps/caixaHelena.json');
        this.load.json('caixarafael', "./maps/caixaRafael.json");
        this.load.json('paredeComCaixa', './maps/SemQuadroFotoRasgada.json');
        this.load.json('retrato', './maps/retrato.json');
        this.load.json('gaveta', './maps/gavetaComCamera.json');
        this.load.json('mapa', './maps/mapaMundi.json');

        // Carrega ícone de seta
        this.load.image('seta', './/assets/ui/seta.png');

        //Itens de Inventários
        this.load.image('notebookOpen', './assets/images/objects/notebookOpen.png');


        //Inventário
        this.load.image('backpack', './assets/images/backpack.png');
        this.load.image('slot', './assets/images/Slot.png');
        this.load.image('inventory', './assets/images/InventoryOverlay.png');
        this.load.image('iconInventory', './assets/images/inventoryicon.png');
    }

//=========================================================================================================

    create() {
        this.lastClickedObject = null;
        this.navigationHistory = [];
        // Inicializa o gerenciador de quartos
        this.roomManager = new RoomManager(this);

        // Configura o fundo
        this.bg = this.add.image(0, 0, 'bg1').setOrigin(0, 0);
        this.bg.displayWidth = this.scale.width;
        this.bg.displayHeight = this.scale.height;

        // Cria as setas de navegação
        this.createNavigationArrows();

        this.inventory = new Inventory(this);

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

//=========================================================================================================
//              HITBOXES
//=========================================================================================================

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
                if (this.lastClickedObject) {
                    if (this.lastClickedObject.name === "caixaClara") {
                        this.loadCustomMap('caixaclara', 'caixa');
                    }
                    else if (this.lastClickedObject.name === "Caixa sobre Helena") {
                        this.loadCustomMap('caixahelena', 'caixa');
                    }
                    else if (this.lastClickedObject.name === "Caixa do Rafael") {
                        this.loadCustomMap('caixarafael', 'caixa');
                    }
                    else if (this.lastClickedObject.name === "QuadroBanana") {
                        this.loadCustomMap('paredeComCaixa', 'paredeComCaixa');
                    }
                    else if (this.lastClickedObject.name === "PrateleiraArmario") {
                        this.loadCustomMap('retrato', 'retrato');
                    }
                    else if (this.lastClickedObject.name === "gavetaGrande") {
                        this.loadCustomMap('gaveta', 'gaveta');
                    }
                    else if (this.lastClickedObject.name === "Quadro") {
                        this.loadCustomMap('mapa', 'mapa');
                    }
                }
                this.hideTextBox();
            })
            .setDepth(101)
            .setVisible(false);

//=========================================================================================================
//=========================================================================================================
//=========================================================================================================

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

        //TESTE ITEM DE INVENTÁRIO
        this.inventory.addItem('notebookOpen', () => {
            this.showItemZoom('notebookOpen');
        });

        this.setInteractionsEnabled(true);

    }

//=========================================================================================================

    setInteractionsEnabled(state) {
    // Se estiver em zoom, sempre desativa interações normais
    if (this.zoomView.active) state = false;
    
    // Ativa/desativa todas as zonas interativas
    this.roomManager.interactiveZones.forEach(zone => {
        zone.input.enabled = state;
    });
    
    // Ativa/desativa as setas
    this.arrows.left.setInteractive({ enabled: state });
    this.arrows.right.setInteractive({ enabled: state });
    
    // Tooltip só aparece se interações estiverem ativas
    this.tooltip.setVisible(false);
    
    // Ativa/desativa o inventário (exceto se estiver em zoom)
    if (this.inventory) {
        this.inventory.toggleButton.setInteractive({ enabled: !this.zoomView.active });
    }
}

//=========================================================================================================

    loadCustomMap(mapKey, bgKey) {

        if (this.currentMapKey && this.bg.texture) {
            this.navigationHistory.push({
                mapKey: this.currentMapKey,
                bgKey: this.bg.texture.key
            });
        }
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

//=========================================================================================================

    goBackToPreviousMap() {
    if (this.navigationHistory.length > 0) {
        const previous = this.navigationHistory.pop();
        this.loadCustomMap(previous.mapKey, previous.bgKey);
    } else {
        // Se não houver histórico, volta para o mapa1 como fallback
        this.loadCustomMap('mapa1', 'bg1');
    }
    this.updateArrowsVisibility();
}

//=========================================================================================================

    isStandardRoom() { // Verificação se é um quarto padrão para as setas aparecerem 
        return this.standardRooms.includes(this.currentMapKey);
    }

//=========================================================================================================

    createNavigationArrows() {
        // Seta esquerda
        this.arrows.left = this.add.image(20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setAngle(180)
            .setInteractive({ useHandCursor: true })
            .setDepth(1002)
            .on('pointerdown', () => {
                if (this.inventory.isVisible == false) {
                    this.roomManager.prevRoom(); // Comportamento normal
                }
            });

        // Seta direita
        this.arrows.right = this.add.image(this.scale.width - 20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setInteractive({ useHandCursor: true })
            .setDepth(1002)
            .on('pointerdown', () => {
                if (this.inventory.isVisible == false) {
                    this.roomManager.nextRoom(); // Comportamento normal
                }
            });
    }

//=========================================================================================================

    updateArrowsVisibility() {
        this.arrows.left.setVisible(true);
        this.arrows.right.setVisible(true);
    }

//=========================================================================================================

    updateBackground(bgKey) {
        this.bg.setTexture(bgKey);
    }

//=========================================================================================================

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

//=========================================================================================================

    showTooltip(obj) {
        if (this.inventory.isVisible) return;

        this.tooltip.setText(obj.name);

        let posX = obj.x + 10;
        let posY = obj.y - 20;

        if (posY < 0) posY = obj.y + 20;
        if (posX + this.tooltip.width > this.scale.width) posX = this.scale.width - this.tooltip.width - 10;
        if (posX < 0) posX = 10;

        this.tooltip.setPosition(posX, posY).setVisible(true);
    }

//=========================================================================================================

    handleObjectClick(obj) {
        //         if (obj.name === "caixa pequena") {
        //     this.loadCustomMap('caixaclara', 'caixaclara');
        //     this.showTextBox("Você abriu a caixa pequena.");
        // }

        this.lastClickedObject = obj;

        if (this.inventory.isVisible) return;

//=========================================================================================================
//          HITBOXES 
//=========================================================================================================

        if (obj.name === "caixaClara") {
            this.showTextBoxWithChoices("Nossa.. tantas memórias da Clara por aqui..");
            return;
        }

        if (obj.name === "QuadroBanana") {
            this.showTextBoxWithChoices("Placeholder...");
            return;
        }

        if (obj.name === "PrateleiraArmario") {
            this.showTextBoxWithChoices("Teste 123");
            return;
        }

        if (obj.name === "gavetaGrande") {
            this.showTextBoxWithChoices("Uma gaveta");
            return;
        }

        if (obj.name === "Caixa sobre Helena") {
            this.showTextBoxWithChoices("Irmã");
            return;
        }

        if (obj.name === "Caixa do Rafael") {
            this.showTextBoxWithChoices("aaaaaaa");
            return;
        }

        if (obj.name === "Quadro") {
            this.showTextBoxWithChoices("Mapa-mundi");
            return;
        }

        if (obj.name === "voltar") {
            this.goBackToPreviousMap();
            return;
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

//=========================================================================================================
//=========================================================================================================
//=========================================================================================================

    showTextBoxWithChoices(message) {
        this.textBox.setText(message).setVisible(true);
        this.textBoxBackground.setVisible(true);
        this.buttonOpen.setVisible(true);
        this.buttonClose.setVisible(true);
    }

//=========================================================================================================

    hideTextBox() {
        this.textBox.setVisible(false);
        this.textBoxBackground.setVisible(false);
        this.buttonOpen.setVisible(false);
        this.buttonClose.setVisible(false);
    }

//=========================================================================================================

    showItemZoom(itemKey) {
    // Se já estiver mostrando algo, ignore
    if (this.zoomView.active) return;

    this.arrows.left.setVisible(false);
    this.arrows.right.setVisible(false);
    this.inventory.toggleInventory();

    // Ativa o estado de zoom
    this.zoomView.active = true;
    this.zoomView.currentItem = itemKey;

    // Cria um overlay escuro semi-transparente
    this.zoomView.overlay = this.add.rectangle(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.8
    ).setDepth(1000).setInteractive();

    // Cria uma cópia borrada do fundo atual (efeito de desfoque)
    this.zoomView.blurBg = this.add.image(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        this.bg.texture.key
    )
    .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
    .setAlpha(0.1)
    .setDepth(1001)
    .setBlendMode(Phaser.BlendModes.OVERLAY);

    // Adiciona o item em grande escala (60% da altura da tela)
    const itemHeight = this.cameras.main.height * 0.6;
    this.zoomView.zoomedItem = this.add.image(
        this.cameras.main.centerX - 100,
        this.cameras.main.centerY,
        itemKey
    )
    .setDisplaySize(itemHeight * 0.7, itemHeight) // Mantém proporção
    .setDepth(1002);

    // Botão de fechar (X no canto superior direito)
    
    this.zoomView.closeButton = this.add.text(
    )

    .setDepth(1003)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
        this.closeItemZoom();
    });

    // Fecha ao clicar no overlay (fora do item)
    this.zoomView.overlay.on('pointerdown', () => {
        this.closeItemZoom();
    });

    // Desativa interações com o jogo principal
    this.setInteractionsEnabled(false);
}

//=========================================================================================================

    closeItemZoom() {
    if (!this.zoomView.active) return;

    // Remove todos os elementos do zoom
    this.zoomView.overlay.destroy();
    this.zoomView.blurBg.destroy();
    this.zoomView.closeButton.destroy();
    
    // Limpa a referência
    if (this.zoomView.zoomedItem) {
        this.zoomView.zoomedItem.destroy();
    }

    this.zoomView = {
        active: false,
        currentItem: null,
        overlay: null,
        blurBg: null,
        closeButton: null,
        zoomedItem: null
    };

    this.arrows.left.setVisible(true);
    this.arrows.right.setVisible(true);

    // Reativa interações com o jogo principal
    this.setInteractionsEnabled(true);
}

}

//=========================================================================================================
//=========================================================================================================
//=========================================================================================================

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
 
//=========================================================================================================

    isInventoryActive() {
        return this.inventory.isVisible;
    }

//=========================================================================================================

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
    
//=========================================================================================================

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
  
//=========================================================================================================

    calculateMaxScroll() {
        const slotHeight = 60 + 10;
        const visibleHeight = this.scene.cameras.main.height - 120;
        const totalHeight = this.maxSlots * slotHeight;
        
        this.maxScroll = Math.max(0, totalHeight - visibleHeight);
    }
   
//=========================================================================================================    

    setupMouseScroll() {
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (this.isVisible) {
                this.scrollY += deltaY * 0.5;
                
                this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScroll);
                
                this.slotsContainer.y = 60 - this.scrollY;
            }
        });
    }
 
//=========================================================================================================

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
   
//=========================================================================================================

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

//=========================================================================================================

    executeItemAction(itemKey) {
        if (this.itemActions[itemKey]) {
            this.itemActions[itemKey]();
        } else {
            console.log(`Item ${itemKey} clicado, mas nenhuma ação definida`);
            // Ação padrão para itens sem função específica
            this.scene.showTooltip({ name: `Usando ${itemKey}...` });
        }
    }
    
//=========================================================================================================

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
        mode: Phaser.Scale.NONE // Evita scaling automático
    },
    render: {
        antialias: false, // Para pixel art
        roundPixels: true // Melhora clareza
    }
};

// Inicia o jogo
const game = new Phaser.Game(config);