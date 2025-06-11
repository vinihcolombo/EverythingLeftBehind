export default class CadernoPuzzle {
    constructor(scene, itemKey) {
        this.scene = scene;
        this.itemKey = itemKey;
        this.pieces = [];
        this.pageZones = [];
        this.placedPieces = new Map();
        this.snapThreshold = 60;
        this.snapDuration = 250;

        this.correctPositions = new Map([
            ["Escrita rosa", 0],
            ["Escrita roxa", 1],
            ["Escrita vermelha", 2],
            ["Escrita azul", 3]
        ]);
    }

    create() {
        this.scene.setInteractionsEnabled(false);

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
    }

    createPuzzleElements() {
        const mapData = this.scene.cache.json.get('cadernoPuzzle');
        this.createPages(mapData);
        this.createPieces(mapData);
        this.createCloseButton();
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
                    fontSize: '12px',
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
        const correctPageIndex = this.correctPositions.get(pieceName);
        const targetZone = this.pageZones[correctPageIndex];

        const dx = targetZone.centerX - sprite.x;
        const dy = targetZone.centerY - sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.snapThreshold && !this.placedPieces.has(pieceName)) {
            this.scene.tweens.add({
                targets: [sprite, pieceData.label],
                x: targetZone.centerX,
                y: targetZone.centerY,
                duration: this.snapDuration,
                ease: 'Back.easeOut',
                onComplete: () => {
                    sprite.disableInteractive();
                    pieceData.label && pieceData.label.destroy();
                    this.placedPieces.set(pieceName, true);
                    this.checkPuzzleComplete();
                }
            });
        } else {
            this.scene.tweens.add({
                targets: [sprite, pieceData.label],
                x: pieceData.originalX,
                y: pieceData.originalY,
                duration: this.snapDuration,
                ease: 'Back.easeOut'
            });
        }
    }

    checkPuzzleComplete() {
        if (this.placedPieces.size === this.correctPositions.size) {
            // Remove notebook from inventory
            if (this.scene.inventory) {
                this.scene.inventory.removeItem(this.itemKey);
                this.closePuzzle();
            }

            if (this.scene.cutsceneManager) {
                // Chama a sua cutscene com uma mensagem mais imersiva
                this.scene.cutsceneManager.playPuzzleCompleteCutscene(
                    'Ela guardou tudo que podia me lembrar que eu era mais do que diziam ser.',
                );
            }

            // Update game state - MARCA A STORYLINE DA HELENA COMO COMPLETA
            this.scene.gameState.helenaStorylineCompleted = true;

            // VERIFICA SE TODAS AS STORYLINES ESTÃO COMPLETAS
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
                fontSize: '12px',
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
        // Remove all elements
        this.overlay.destroy();
        this.closeButton.destroy();

        if (this.completeText) {
            this.completeText.destroy();
        }

        if (this.continueButton) {
            this.continueButton.destroy();
        }

        // Remove all pieces
        this.pieces.forEach(piece => {
            piece.sprite.destroy();
            if (piece.label) piece.label.destroy();
        });

        // Remove all page visuals
        this.pageZones.forEach(zone => {
            if (zone.visualElements) {
                zone.visualElements.forEach(element => {
                    if (element.destroy) element.destroy();
                });
            }
        });

        // Re-enable interactions
        this.scene.setInteractionsEnabled(true);

        // Optional: trigger any completion callback
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }
}