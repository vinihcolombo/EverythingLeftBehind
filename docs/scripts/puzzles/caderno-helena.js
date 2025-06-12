export default class CadernoPuzzle {
    constructor(scene, itemKey) {
        this.scene = scene;
        this.itemKey = itemKey;
        this.pieces = [];
        this.pageZones = [];
        this.placedPieces = new Map();
        this.snapThreshold = 60;
        this.snapDuration = 250;
        this.active = false;
        this.completed = false;

        this.correctPositions = new Map([
            ["Escrita rosa", 0],
            ["Escrita roxa", 1],
            ["Escrita vermelha", 2],
            ["Escrita azul", 3]
        ]);
    }

    

    create() {
        if (this.active) {
        console.warn('Tentativa de criar puzzle já ativo');
        this.closePuzzle();  // Fecha qualquer instância anterior
    }
    
    this.active = true; 

        this.active = true; // Já existe no seu código
        this.scene.setInteractionsEnabled(false);

        this.scene.arrows.left.setVisible(false);
        this.scene.arrows.right.setVisible(false);

        // Dark overlay with slight transparency
        this.overlay = this.scene.add.rectangle(0, 0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000, 0.6)
            .setOrigin(0)
            .setDepth(1000);

        this.scene.load.json('cadernoPuzzle', './maps/caderno.json');
        this.scene.load.once('complete', this.createPuzzleElements, this);
        this.scene.load.image('papelRasgado', './assets/images/objects/papelRasgado.png');
        this.scene.load.start();

        this.active = true;
    }

    createPuzzleElements() {
        const mapData = this.scene.cache.json.get('cadernoPuzzle');
        this.createPages(mapData);
        this.createPieces(mapData);
    }

    createPages(mapData) {
        const pagesLayer = mapData.layers.find(l => l.name === "Páginas");
        const screenCenterX = this.scene.cameras.main.centerX;
        const screenCenterY = this.scene.cameras.main.centerY;

        // Adjusted page positions with more separation
        const pagePositions = [
            // Page 1 - Top Left (moved further left)
            { x: screenCenterX - 150, y: screenCenterY - 40 },
            // Page 2 - Bottom Left (moved further left and down)
            { x: screenCenterX - 150, y: screenCenterY + 40 },
            // Page 3 - Top Right (moved further right)
            { x: screenCenterX - 50, y: screenCenterY - 40 },
            // Page 4 - Bottom Right (moved further right and down)
            { x: screenCenterX - 50, y: screenCenterY + 40 }
        ];
        this.createCloseButton();

        pagesLayer.objects.forEach((page, index) => {
            const pos = pagePositions[index];

            this.pageZones.push({
                index: index,
                x: pos.x - page.width / 2,
                y: pos.y - page.height / 2,
                width: page.width,
                height: page.height,
                centerX: pos.x,
                centerY: pos.y,
                visualElements: []
            });

            // Page background
            const pageBg = this.scene.add.rectangle(
                pos.x, pos.y,
                page.width, page.height,
                0xffffff, 0.9
            )
                .setDepth(1001)
                .setStrokeStyle(2, 0x000000);

            this.pageZones[index].visualElements.push(pageBg);

            // Page label
            const pageLabel = this.scene.add.text(
                pos.x, pos.y - 40,  // Moved label further above page
                `PÁGINA ${index + 1}`,
                {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '8px',
                    color: '#ffffff',
                    padding: { x: 20, y: 2 },
                    resolution: 3
                }
            ).setOrigin(0.5).setDepth(1002);

            this.pageZones[index].visualElements.push(pageLabel);
        });
    }
    createPieces(mapData) {
        const piecesLayer = mapData.layers.find(l => l.name === "Papéis");
        const screenWidth = this.scene.cameras.main.width;

        // Adjusted paper positions - azul and roxa moved down further
        const piecePositions = [
            // Escrita rosa
            { x: 250, y: 60 },
            // Escrita roxa (moved down)
            { x: 250, y: 150 },
            // Escrita vermelha
            { x: 350, y: 100 },
            // Escrita azul (moved down)
            { x: 350, y: 190 }
        ];

        piecesLayer.objects.forEach((piece, index) => {
            const pos = piecePositions[index];
            const imgKey = this.getPieceImageKey(piece.name);

            const sprite = this.scene.add.image(
                pos.x, pos.y,
                imgKey
            )
                .setDisplaySize(piece.width, piece.height)
                .setInteractive({ draggable: true })
                .setDepth(1003)
                .on('drag', (pointer, dragX, dragY) => {
                    sprite.x = dragX;
                    sprite.y = dragY;
                })
                .on('dragend', () => {
                    this.handlePieceDrop(sprite, piece.name);
                });

            // Color-coded label
            const colorInfo = this.getPieceColorInfo(piece.name);
            const label = this.scene.add.text(
                pos.x, pos.y - 50,  // Adjusted label position
                piece.name.toUpperCase(),
                {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '8px',
                    color: colorInfo.textColor,
                    backgroundColor: colorInfo.bgColor,
                    padding: { x: 5, y: 2 },
                    stroke: '#000000',
                    strokeThickness: 2,
                    resolution: 3
                }
            ).setOrigin(0.5).setDepth(1004);

            this.pieces.push({
                name: piece.name,
                sprite: sprite,
                label: label,
                originalX: pos.x,
                originalY: pos.y
            });
        });
        this.scene.inventory.hideAndDisable();
    }

    getPieceColorInfo(pieceName) {
        // Color settings for each writing piece only
        const colorMap = {
            "Escrita rosa": {
                bgColor: '#ffb6c1', // Light pink
                resolution: 3,
                textColor: '#ffffff'
            },
            "Escrita roxa": {
                bgColor: '#9370db', // Medium purple
                resolution: 3,
                textColor: '#ffffff'
            },
            "Escrita vermelha": {
                bgColor: '#dc143c', // Crimson red
                resolution: 3,
                textColor: '#ffffff'
            },
            "Escrita azul": {
                bgColor: '#4169e1', // Royal blue
                resolution: 3,
                textColor: '#ffffff'
            }
        };

        return colorMap[pieceName] || {
            bgColor: '#000000',
            textColor: '#ffffff'
        };
    }

    handlePieceDrop(sprite, pieceName) {
    const pieceData = this.pieces.find(p => p.name === pieceName);
    let closestZone = null;
    let minDistance = Infinity;

    // Encontrar a zona mais próxima dentro do limiar de snap
    for (const zone of this.pageZones) {
        const dx = zone.centerX - sprite.x;
        const dy = zone.centerY - sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance && distance <= this.snapThreshold) {
            minDistance = distance;
            closestZone = zone;
        }
    }

    if (closestZone) {
        // Se encontrou uma zona próxima, move para ela
        this.scene.tweens.add({
            targets: [sprite, pieceData.label],
            x: closestZone.centerX,
            y: closestZone.centerY,
            duration: this.snapDuration,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Armazena em qual página a peça foi colocada
                this.placedPieces.set(pieceName, closestZone.index);
                // Verifica automaticamente se todos os papéis foram colocados
                this.checkOrder();
            }
        });
    } else {
        // Se não encontrou zona próxima, volta para a posição original
        this.scene.tweens.add({
            targets: [sprite, pieceData.label],
            x: pieceData.originalX,
            y: pieceData.originalY,
            duration: this.snapDuration,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Remove da lista de peças colocadas se estava em alguma página
                this.placedPieces.delete(pieceName);
            }
        });
    }
}

checkOrder() {
    // Verifica se todos os 4 papéis foram colocados
    if (this.placedPieces.size === this.correctPositions.size) {
        let isCorrect = true;
        
        // Verifica se cada peça está na posição correta
        for (const [pieceName, correctPageIndex] of this.correctPositions) {
            if (this.placedPieces.get(pieceName) !== correctPageIndex) {
                isCorrect = false;
                break;
            }
        }

        if (isCorrect) {
            console.log("Ordem CORRETA! Todos os papéis estão nas posições certas!");
            this.checkPuzzleComplete();
        } else {
            console.log("Ordem INCORRETA! Os papéis não estão na sequência certa.");
        }
    }
}

checkPuzzleComplete() {
    // Verifica se já está completo para evitar duplicação
    if (this.completed) return;
    
    let allCorrect = true;
    for (const [pieceName, correctPageIndex] of this.correctPositions) {
        if (this.placedPieces.get(pieceName) !== correctPageIndex) {
            allCorrect = false;
            break;
        }
    }

    if (allCorrect) {
        this.completed = true; // Marca como completo
        
        // Remove notebook from inventory
        this.scene.inventory?.removeItem(this.itemKey);

        if (this.scene.cutsceneManager) {
            this.scene.cutsceneManager._startStorylineCutscene(
                'Ela guardou tudo que podia me lembrar que eu era mais do que diziam ser.',
                () => this.closePuzzle()
            );
        } else {
            this.closePuzzle();
        }

        this.scene.gameState.helenaStorylineCompleted = true;
        
        if (this.scene.checkAllStorylinesCompleted()) {
            this.scene.loadFinalMap();
        }
    }
}

    cleanupAllElements() {
        // Remove all visual elements
        this.overlay.destroy();
        this.title.destroy();
        this.closeButton.destroy();

        if (this.completeText) {
            this.completeText.destroy();
        }

        // Remove all pieces
        this.pieces.forEach(piece => {
            piece.sprite.destroy();
            piece.label && piece.label.destroy();
        });

        // Remove all page visuals
        this.pageZones.forEach(zone => {
            zone.visualElements.forEach(element => element.destroy());
        });
    }

    getPieceImageKey(pieceName) {
        // Map pieces to their image assets
        const pieceImages = {
            "Escrita rosa": "papelRasgado",
            "Escrita roxa": "papelRasgado",
            "Escrita vermelha": "papelRasgado",
            "Escrita azul": "papelRasgado"
        };
        return pieceImages[pieceName] || 'escritarosa';
    }

    createCloseButton() {
        this.closeButton = this.scene.add.text(
            5, 5,
            '[X]',
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '8px',
                color: '#ff0000',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 },
                resolution: 3
            }
        )
            .setDepth(1005)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.closePuzzle();
            });
    }

   closePuzzle() {
    // 1. Marca como inativo imediatamente
    this.active = false;
    this.completed = true;

    // 2. Remove todos os listeners primeiro
    this.pieces.forEach(piece => {
        piece.sprite?.removeAllListeners();
        piece.sprite?.disableInteractive();
    });

    // 3. Destrói elementos na ordem CORRETA (do mais profundo ao menos profundo)
    // Primeiro os elementos "por cima" (com maior depth)
    if (this.closeButton) {
        this.closeButton.destroy();
        this.closeButton = null;
    }

    // Destrói labels das peças (depth 1004)
    this.pieces.forEach(piece => {
        if (piece.label) {
            piece.label.destroy();
            piece.label = null;
        }
    });

    // Destrói as peças (sprites, depth 1003)
    this.pieces.forEach(piece => {
        if (piece.sprite) {
            piece.sprite.destroy();
            piece.sprite = null;
        }
    });

    // Destrói os elementos das páginas (labels e backgrounds)
    this.pageZones.forEach(zone => {
        // Destrói na ordem inversa (maior depth primeiro)
        [...zone.visualElements].reverse().forEach(element => {
            element?.destroy();
        });
        zone.visualElements = [];
    });

    // Por último o overlay (depth 1000)
    if (this.overlay) {
        this.overlay.destroy();
        this.overlay = null;
    }

    // 4. Limpa todas as referências
    this.pieces = [];
    this.pageZones = [];
    this.placedPieces.clear();

    // 5. Restaura a cena principal
    this.scene.children.depthSort();
    this.scene.setInteractionsEnabled(true);
    
    if (this.scene.isStandardRoom()) {
        this.scene.arrows.left?.setVisible(true);
        this.scene.arrows.right?.setVisible(true);
    }
}
}