export default class CutsceneManager {
    constructor(scene) {
        this.scene = scene;
        this.cutsceneQueue = [];
        this.isProcessingQueue = false;
        this.currentCutscene = null;
        this.cutsceneFade = null;
        this.currentCutsceneText = null;
        this.clickToContinueText = null;
        this.onClickCallback = null;
    }

    // Método principal para enfileirar cutscenes
    queueCutscene(type, message, callback) {
        this.cutsceneQueue.push({ type, message, callback });
        if (!this.isProcessingQueue) {
            this._processQueue();
        }
    }

    _processQueue() {
        if (this.cutsceneQueue.length === 0) {
            this.isProcessingQueue = false;
            return;
        }

        this.isProcessingQueue = true;
        const nextCutscene = this.cutsceneQueue.shift();
        this.currentCutscene = nextCutscene;

                this._startStorylineCutscene(nextCutscene.message, () => {
                    this._cutsceneComplete(nextCutscene.callback);
                });
    }

    _cutsceneComplete(callback) {
        // Limpa o estado atual
        this.currentCutscene = null;
        
        // Executa o callback da cutscene
        if (callback) callback();
        
        // Processa a próxima cutscene na fila
        this._processQueue();
    }

    _startPuzzleCutscene(message, callback) {
        this._createFadeEffect(() => {
            this.scene.showTextBoxDialogue(message);
            this.scene.time.delayedCall(2000, () => {
                this._endCutscene(callback);
            });
        });
    }

    _startStorylineCutscene(message, callback) {
        this._createFadeEffect(() => {
            this._showDialogue(message, callback);
        });
    }

    _showDialogue(message, callback) {
        const { width, height } = this.scene.cameras.main;

        // Limpa elementos anteriores
        this._cleanupDialogue();

        // Cria texto principal
        this.currentCutsceneText = this.scene.add.text(width / 2, height / 2, message, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#ffffff',
            padding: { x: 10, y: 5 },
            resolution: 3,
            wordWrap: { width: width * 0.8, useAdvancedWrap: true },
        }).setOrigin(0.5).setAlpha(0).setDepth(10000);

        // Texto "Clique para continuar"
        this.clickToContinueText = this.scene.add.text(width / 2, height * 0.7, "Clique para continuar", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#ffffff',
            resolution: 3,
        }).setOrigin(0.5).setAlpha(0).setDepth(10000);

        // Configura callback de clique
        this.onClickCallback = () => {
            this.scene.input.off('pointerdown', this.onClickCallback);
            this._completeDialogue(callback);
        };
        this.scene.input.once('pointerdown', this.onClickCallback);

        // Animação de entrada
        this.scene.tweens.add({
            targets: [this.currentCutsceneText, this.clickToContinueText],
            alpha: 1,
            duration: 500,
            ease: 'Linear'
        });
    }

    _completeDialogue(callback) {
        // Animação de saída
        this.scene.tweens.add({
            targets: [this.currentCutsceneText, this.clickToContinueText],
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this._cleanupDialogue();
                this._endCutscene(callback);
            }
        });
    }

    _cleanupDialogue() {
        if (this.currentCutsceneText) {
            this.currentCutsceneText.destroy();
            this.currentCutsceneText = null;
        }
        if (this.clickToContinueText) {
            this.clickToContinueText.destroy();
            this.clickToContinueText = null;
        }
        if (this.onClickCallback) {
            this.scene.input.off('pointerdown', this.onClickCallback);
            this.onClickCallback = null;
        }
    }

    _createFadeEffect(onComplete) {
        // Limpa fade anterior
        if (this.cutsceneFade) {
            this.cutsceneFade.destroy();
        }

        this.cutsceneFade = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width * 2,
            this.scene.cameras.main.height * 2,
            0x000000
        )
        .setOrigin(0)
        .setAlpha(0)
        .setDepth(9999);

        this.scene.tweens.add({
            targets: this.cutsceneFade,
            alpha: 1,
            duration: 1000,
            onComplete: onComplete
        });
    }

    _endCutscene(callback) {
        this.scene.tweens.add({
            targets: this.cutsceneFade,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                if (this.cutsceneFade) {
                    this.cutsceneFade.destroy();
                    this.cutsceneFade = null;
                }
                if (callback) callback();
                this.scene.setInteractionsEnabled(true);
            }
        });
    }
}