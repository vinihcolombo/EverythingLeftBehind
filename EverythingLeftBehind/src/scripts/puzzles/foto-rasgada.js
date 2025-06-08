export default class PuzzleGame {
    constructor(scene, imageKey, inventoryInstance, puzzleSize = 200, rows = 1, cols = 1) {
        this.inventory = inventoryInstance;
        this.scene = scene;
        this.imageKey = imageKey;
        this.rows = rows;
        this.cols = cols;
        this.puzzleSize = puzzleSize; // Tamanho quadrado do puzzle
        this.pieces = [];
        this.container = null;
        this.isComplete = false;
        this.onCompleteCallback = null;
        
        // Área onde as peças podem ser espalhadas (toda a tela)
        this.scatterArea = {
            x: 0,
            y: 0,
            width: scene.sys.game.config.width,
            height: scene.sys.game.config.height
        };
    }

    create() {
        // Centraliza o puzzle na tela
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        // Cria o container do puzzle centralizado
        this.container = this.scene.add.container(centerX, centerY);
        
        // Cria a borda do puzzle (área de montagem)
        const border = this.scene.add.rectangle(
            0, 0, 
            this.puzzleSize, 
            this.puzzleSize, 
            0x000000, 0
        )
        .setStrokeStyle(2, 0x555555)
        .setOrigin(0.5);
        this.container.add(border);
        
        // Calcula o tamanho das peças
        this.pieceWidth = this.puzzleSize/ this.cols;
        this.pieceHeight = this.puzzleSize/ this.rows;
        
        // Cria as peças do puzzle
        this.createPuzzlePieces();
        
        // Adiciona botão de fechar
        this.addCloseButton();
    }

    createPuzzlePieces() {
        // Primeiro determina as posições corretas
        const correctPositions = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                correctPositions.push({ row, col });
            }
        }
        
        // Embaralha as posições corretas para distribuição aleatória
        Phaser.Utils.Array.Shuffle(correctPositions);
        
        // Cria cada peça do puzzle em posições aleatórias na tela
        for (let i = 0; i < correctPositions.length; i++) {
            const correctPos = correctPositions[i];
            
            // Posição aleatória dentro da área de espalhamento
            const randomX = Phaser.Math.Between(
                this.scatterArea.x, 
                this.scatterArea.x + this.scatterArea.width - this.pieceWidth
            );
            
            const randomY = Phaser.Math.Between(
                this.scatterArea.y, 
                this.scatterArea.y + this.scatterArea.height - this.pieceHeight
            );
            
            this.createPuzzlePiece(
                randomX - this.container.x, // Ajusta para coordenadas relativas ao container
                randomY - this.container.y,
                correctPos.row,
                correctPos.col
            );
        }
    }

    createPuzzlePiece(startX, startY, correctRow, correctCol) {
    const piece = this.scene.add.image(
        startX + this.pieceWidth / 2,
        startY + this.pieceHeight / 2,
        this.createPieceTexture(correctRow, correctCol)
    )
    .setDisplaySize(this.pieceWidth, this.pieceHeight)
    .setInteractive({ draggable: true })
    .setDataEnabled();
    
    piece.setData({
        correctRow,
        correctCol,
        isCorrect: false
    });
    
    this.scene.input.setDraggable(piece);
    
    piece.on('dragstart', () => {
        this.scene.children.bringToTop(piece);
    });
    
    piece.on('drag', (pointer, dragX, dragY) => {
        piece.x = dragX; // Removida a subtração do container.x/y
        piece.y = dragY;
    });
    
    piece.on('dragend', () => {
        this.checkPiecePosition(piece);
        this.checkPuzzleCompletion();
    });
    
    this.container.add(piece);
    this.pieces.push(piece);
}

    createPieceTexture(row, col) {
        const textureKey = `puzzle-piece-${row}-${col}`;
        
        // Se a textura já existe, reutiliza
        if (this.scene.textures.exists(textureKey)) {
            return textureKey;
        }
        
        // Cria uma nova textura para a peça
        const texture = this.scene.textures.createCanvas(textureKey, this.pieceWidth, this.pieceHeight);
        const ctx = texture.getContext();
        const source = this.scene.textures.get(this.imageKey).getSourceImage();
        
        // Corta a parte correta da imagem original
        ctx.drawImage(
            source,
            col * this.pieceWidth,
            row * this.pieceHeight,
            this.pieceWidth,
            this.pieceHeight,
            0,
            0,
            this.pieceWidth,
            this.pieceHeight
        );
        
        // Adiciona um efeito de "rasgado" nas bordas
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.pieceWidth, this.pieceHeight);
        
        texture.refresh();
        return textureKey;
    }

    checkPiecePosition(piece) {
        // Converte coordenadas para posição relativa ao container
        const relX = piece.x;
        const relY = piece.y;
        
        // Verifica se a peça está perto o suficiente da posição correta
        const correctX = (piece.data.get('correctCol') * this.pieceWidth) - (this.puzzleSize / 2) + (this.pieceWidth / 2);
        const correctY = (piece.data.get('correctRow') * this.pieceHeight) - (this.puzzleSize / 2) + (this.pieceHeight / 2);
        
        const distance = Phaser.Math.Distance.Between(relX, relY, correctX, correctY);
        const snapDistance = this.pieceWidth / 3;
        
        if (distance < snapDistance) {
            // Snap para posição correta
            piece.x = correctX;
            piece.y = correctY;
            piece.setTint(0xaaaaaa); // Visual feedback
            piece.data.set('isCorrect', true);
        } else {
            piece.clearTint();
            piece.data.set('isCorrect', false);
        }
    }

    checkPuzzleCompletion() {
        const allCorrect = this.pieces.every(piece => piece.data.get('isCorrect'));
        
        if (allCorrect && !this.isComplete) {
            this.isComplete = true;
            
            // Efeito visual de conclusão
            this.pieces.forEach(piece => {
                this.scene.tweens.add({
                    targets: piece,
                    alpha: 0.8,
                    duration: 500,
                    yoyo: true,
                    repeat: 1
                });
            });
            
            if (this.onCompleteCallback) {
                this.onCompleteCallback();

            }
        }
    }

    addCloseButton() {
        const closeButton = this.scene.add.text(
            this.puzzleSize / 2 - 20,
            -this.puzzleSize / 2 + 20,
            '✕',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ff0000',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.destroy();
        });
        
        this.container.add(closeButton);
    }

    setOnComplete(callback) {
        this.onCompleteCallback = callback;
    }

    destroy() {
    // Limpa todas as peças
    this.pieces.forEach(piece => {
        if (piece) {
            piece.destroy();
        }
    });
    this.pieces = [];
    
    // Remove texturas temporárias
    for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
            const textureKey = `puzzle-piece-${row}-${col}`;
            if (this.scene.textures.exists(textureKey)) {
                this.scene.textures.remove(textureKey);
            }
        }
    }
    
    // Destrói o container
    if (this.container) {
        this.container.destroy();
        this.container = null;
    }
    
    this.isComplete = false;
}
}