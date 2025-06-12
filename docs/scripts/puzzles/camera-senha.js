// CameraPuzzle.js - Versão Ultra-Compacta
export default class CameraPuzzle {
    constructor(scene) {
        this.scene = scene;
        this.code = [3, 7, 2];
        this.currentDigits = [0, 0, 0];
        this.isOpen = false;
        this.container = null;
        this.display = null;
        this.messageText = null;
        this.zoomImageKey = 'camera_zoom';
    }

    create() {
        // Calcula 70% da tela
        const puzzleWidth = this.scene.cameras.main.width * 0.7;
        const puzzleHeight = this.scene.cameras.main.height * 0.7;

        // Container principal centralizado
        this.container = this.scene.add.container(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY
        ).setDepth(1000);

        // Fundo escuro (agora com tamanho relativo)
        const bg = this.scene.add.rectangle(
            0, 0,
            puzzleWidth,
            puzzleHeight,
            0x111111, 0.9
        ).setOrigin(0.5).setInteractive();
        this.container.add(bg);

        // Corpo da câmera (tamanho proporcional)
        const cameraBody = this.scene.add.rectangle(
            0, 0,
            puzzleWidth * 0.8,  // 80% do container
            puzzleHeight * 0.9,  // 90% do container
            0x222222
        ).setOrigin(0.5);
        this.container.add(cameraBody);

        // Lente simplificada
        const lens = this.scene.add.ellipse(
            0, -50,  // Posição mais próxima do centro
            80, 60,   // Tamanho reduzido
            0x333333
        ).setOrigin(0.5);
        this.container.add(lens);

        // Texto minimalista
        const lensText = this.scene.add.text(
            0, -50,
            '🔒',
            {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '10px',
                color: '#FFFFFF'
            }
        ).setOrigin(0.5);
        this.container.add(lensText);

        // Display compacto
        this.display = this.scene.add.text(
            0, 0,  // Posição central
            '0 0 0',
            {
                fontFamily: 'monospace',
                fontSize: '18px',  // Fonte menor
                color: '#00FF00',
                backgroundColor: '#000000',
                padding: { x: 5, y: 0 }
            }
        ).setOrigin(0.5);
        this.container.add(this.display);

        // Controles compactos
        this.createDigitControls();

        // Botão de submit minimalista
        const submitBtn = this.scene.add.text(
            0, 100,  // Posição mais alta
            'TENTAR',
            {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '10px',
                color: '#FFFFFF',
                backgroundColor: '#4CAF50',
                padding: { x: 5, y: 3 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        submitBtn.on('pointerdown', () => this.checkCode());
        this.container.add(submitBtn);

        // Mensagem compacta
        this.messageText = this.scene.add.text(
            0, -90,  // Posição mais alta
            '',
            {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '8px',  // Fonte muito pequena
                color: '#FF4444',
                align: 'center',
                wordWrap: { width: 150 }  // Quebra de linha para textos longos
            }
        ).setOrigin(0.5);
        this.container.add(this.messageText);

        // Botão de fechar minúsculo
        const closeBtn = this.scene.add.text(
            cameraBody.width / 2 - 10, -cameraBody.height / 2 + 10,
            '×',  // Símbolo mais compacto
            {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#FFFFFF',
                backgroundColor: '#FF0000',
                padding: { x: 5, y: 0 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => this.close());
        this.container.add(closeBtn);
    }

    createDigitControls() {
        const digitPositions = [-40, 0, 40];  // Espaçamento reduzido

        // Estilo unificado para os botões
        const btnStyle = {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#FFFFFF',
            backgroundColor: '#444444',
            padding: { x: 3, y: 2 },
            fixedWidth: 20,
            align: 'center'
        };

        digitPositions.forEach((xPos, index) => {
            // Botão para aumentar
            const upBtn = this.scene.add.text(
                xPos, 23,
                '+',
                btnStyle
            ).setOrigin(0.5).setInteractive({ useHandCursor: true });

            upBtn.on('pointerdown', () => this.changeDigit(index, 1));
            this.container.add(upBtn);

            // Dígito individual
            const digitText = this.scene.add.text(
                xPos, 44,
                '0',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#FFFFFF'
                }
            ).setOrigin(0.5);
            digitText.setData('index', index);
            this.container.add(digitText);

            // Botão para diminuir
            const downBtn = this.scene.add.text(
                xPos, 63,
                '-',
                btnStyle
            ).setOrigin(0.5).setInteractive({ useHandCursor: true });

            downBtn.on('pointerdown', () => this.changeDigit(index, -1));
            this.container.add(downBtn);
        });
    }

    changeDigit(index, delta) {
        this.currentDigits[index] = (this.currentDigits[index] + delta + 10) % 10;
        this.updateDisplay();
    }

    updateDisplay() {
        this.display.setText(this.currentDigits.join(' '));

        this.container.each(child => {
            if (child.getData('index') !== undefined) {
                const index = child.getData('index');
                child.setText(this.currentDigits[index].toString());
            }
        });
    }

    checkCode() {
        const isCorrect = this.currentDigits.every((digit, i) => digit === this.code[i]);

        if (isCorrect) {
            this.messageText.setText('DESBLOQUEADA!')
                .setColor('#00FF00');
            this.isOpen = true;

            this.scene.time.delayedCall(1500, () => {
                this.close();
                // Dispara a cutscene diretamente
                this.scene.cutsceneManager._startStorylineCutscene(
                    "Cada memória dela documenta um amor que não sobreviveu ao tempo.",
                    () => {
                        // Callback pós-cutscene
                        this.scene.events.emit('cameraPuzzleCompleted');
                    }
                );
            });
        } else {
            this.messageText.setText('ERRADO!')
                .setColor('#FF0000');
        }
    }

    open() {
        if (this.container) {
            this.container.setVisible(true);
        } else {
            this.create();
        }
        this.scene.setInteractionsEnabled(false);
    }

    close() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.scene.setInteractionsEnabled(true);
    }
}