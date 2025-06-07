import PuzzleGame from '../puzzles/foto-rasgada.js';
import RoomManager from '../managers/RoomManager.js';
import Inventory from '../ui/Inventory.js';
import { sizes } from '../constants.js';

export default class GameScene extends Phaser.Scene {
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
        this.load.image('keychain', './assets/images/objects/keychain.png');
        this.load.image('rockCollection', './assets/images/objects/rockCollection.png');
        this.load.image('Notebook_Item', './assets/images/objects/Notebook_Item.png');
        this.load.image('camera', './assets/images/objects/camera.png');
        this.load.image('book', './assets/images/objects/Book.png');


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
        this.buttonOpen = this.add.text(0, sizes.height - 25, '[Abrir]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
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

        this.buttonClose = this.add.text(60, sizes.height - 25, '[Fechar]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
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

        this.buttonCloseDialogue = this.add.text(0, sizes.height - 25, '[Fechar]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
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
        this.clearItemSprites();

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
    console.log(`Carregando objetos do mapa: ${mapKey}`); // Debug
    
    const mapData = this.cache.json.get(mapKey);
    if (!mapData) {
        console.error(`Mapa ${mapKey} não encontrado no cache!`);
        return;
    }

    mapData.layers.forEach(layer => {
        console.log(`Camada: ${layer.name} (${layer.type})`); // Debug
        
        if (layer.type === 'objectgroup') {
            layer.objects.forEach(obj => {
                console.log(`- Objeto: ${obj.name} em (${obj.x},${obj.y})`); // Debug
                
                if (obj.name === 'Chave de Apartamento') { // Modifiquei a condição
                    this.createChave(obj);
                }
                else if (obj.name === 'Coleção de Pedras') {
                    this.createPedra(obj);
                } 
                else if (obj.name === 'Caderno de Escrita') {
                    this.createNotebook(obj);
                }
                else if (obj.name === 'gavetaCamera') {
                    this.createCamera(obj);
                }
                else {
                    this.createStandardInteractiveZone(obj);
                }
            });
        }
    });
}

    // <--- MÉTODO MODIFICADO para gerenciar this.notebookSprite
    createChave(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.ChaveSprite) {
            this.ChaveSprite.destroy();
            this.ChaveSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.ChaveSprite = this.add.image( // "ChaveSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'keychain'
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
            .on('pointerover', () => this.showTooltip({ name: 'Chave de Apartamento', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }
    createPedra(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.PedraSprite) {
            this.PedraSprite.destroy();
            this.PedraSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.PedraSprite = this.add.image( // "PedraSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'rockCollection'
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
            .on('pointerover', () => this.showTooltip({ name: 'Coleção de Pedras', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }
    createNotebook(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.NotebookSprite) {
            this.NotebookSprite.destroy();
            this.NotebookSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.NotebookSprite = this.add.image( // "NotebookSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'Notebook_Item'
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
            .on('pointerover', () => this.showTooltip({ name: 'Caderno de Escrita', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }
    createCamera(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.CameraSprite) {
            this.CameraSprite.destroy();
            this.CameraSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.CameraSprite = this.add.image( // "CameraSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'camera'
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
            .on('pointerover', () => this.showTooltip({ name: 'Câmera Fotográfica', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
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

        // const debugRect = this.add.rectangle(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width, obj.height)
        // .setStrokeStyle(1, 0x00ff00)
        // .setDepth(99);
        // this.roomManager.interactiveZones.push(debugRect);
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

        if (obj.name === "Chave de Apartamento") {
            this.inventory.addItem('keychain', () => {
                this.showItemZoom('keychain');
            });
            this.removeHitboxForObject(obj);
            this.ChaveSprite.destroy(); // REMOVER OBJETO QUANDO CLICA
            return;
        }

        if (obj.name === "Coleção de Pedras") {
            this.inventory.addItem('rockCollection', () => {
                ;
            });
            this.removeHitboxForObject(obj);
            this.PedraSprite.destroy();
            return;
        }
        if (obj.name === "Caderno de Escrita") {
            this.inventory.addItem('notebookOpen', () => {
                this.showItemZoom('notebookOpen');
            });
            this.removeHitboxForObject(obj);
            this.NotebookSprite.destroy();
            return;
        }

        if (obj.name === "gavetaCamera") {
            this.inventory.addItem('camera', () => {
                this.showItemZoom('camera');
            });
            this.removeHitboxForObject(obj);
            this.CameraSprite.destroy();
            return;
        }

        if (obj.name === "caixaSemQuadro") { // Ou qualquer outro nome que você definir
        this.startPuzzle();
        return;
        }

        

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

startPuzzle() {
    // Desativa interações normais
    this.setInteractionsEnabled(false);
    
    // Cria o puzzle centralizado na tela
    this.puzzleGame = new PuzzleGame(this, 'bg1', this.inventory); // Use a textura apropriada
    
    // Posiciona no centro da tela
    const x = (sizes.width - 600) / 2; // 600 é o puzzleWidth padrão
    const y = (sizes.height - 600) / 2; // 600 é o puzzleHeight padrão
    
    this.puzzleGame.create(x, y);
    
    // Configura o callback quando o puzzle for completado
    this.puzzleGame.setOnComplete(() => {

        this.inventory.addItem('book', () => {
            this.showItemZoom('book');
        })
        // Adiciona lógica para quando o puzzle for completado
        this.time.delayedCall(2000, () => {
            this.puzzleGame.destroy();
            this.puzzleGame = null;
            this.setInteractionsEnabled(true);
        });
    });
}

    clearItemSprites() {
        if (this.ChaveSprite) {
            this.ChaveSprite.destroy();
            this.ChaveSprite = null;
        }
        if (this.PedraSprite) {
            this.PedraSprite.destroy();
            this.PedraSprite = null;
        }
        if (this.NotebookSprite) {
            this.NotebookSprite.destroy();
            this.NotebookSprite = null;
        }
        if (this.CameraSprite) {
            this.CameraSprite.destroy();
            this.CameraSprite = null;
        }
    }

    removeHitboxForObject(obj) {
        // Encontra a zona correspondente ao objeto clicado
        const zoneIndex = this.roomManager.interactiveZones.findIndex(zone =>
            Math.abs(zone.x - obj.x) < 5 && // Margem de erro para posição
            Math.abs(zone.y - obj.y) < 5 &&
            zone.width === obj.width &&
            zone.height === obj.height
        );

        if (zoneIndex !== -1) {
            const zone = this.roomManager.interactiveZones[zoneIndex];

            // 1. Remove a interatividade
            zone.disableInteractive();

            // 2. Remove da lista de zonas
            this.roomManager.interactiveZones.splice(zoneIndex, 1);

            // 4. Destrói completamente após animação
            zone.destroy();

            // 5. Marca como coletado no mapa (opcional)
            const mapData = this.cache.json.get(this.currentMapKey);
            mapData.layers.forEach(layer => {
                if (layer.type === 'objectgroup') {
                    layer.objects = layer.objects.filter(mapObj =>
                        mapObj.name !== obj.name ||
                        mapObj.x !== obj.x ||
                        mapObj.y !== obj.y
                    );
                }
            });
        }
    }

    showTextBoxWithChoices(message) {
        this.textBox.setText(message).setVisible(true);
        this.textBoxBackground.setVisible(true);
        this.buttonOpen.setVisible(true);
        this.buttonClose.setVisible(true);
    }

    showTextBoxDialogue(message) {
        this.textBox.setText(message).setVisible(true);
        this.textBoxBackground.setVisible(true);
        this.buttonCloseDialogue.setVisible(true);
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