export default class CutsceneManager {
    constructor(scene) {
        this.scene = scene;
        this.cutsceneActive = false;
        this.cutsceneFade = null; 
        this.currentCutsceneText = null;
        this.onClickCallback = null; // Armazenar a função de callback do clique
        this.clickToContinueText = null;
    }

    CutsceneDialogue(message, callback, duration) {
        const { width, height } = this.scene.cameras.main;

        // Destruir texto anterior se existir
        if (this.currentCutsceneText) {
            this.currentCutsceneText.destroy();
        }

        this.currentCutsceneText = this.scene.add.text(width / 2, height / 2, message, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffffff',
            padding: { x: 10, y: 5 },
            resolution: 3,
            wordWrap: { width: width * 0.8, useAdvancedWrap: true },
        });
        this.currentCutsceneText.setOrigin(0.5);
        this.currentCutsceneText.setAlpha(0);
        this.currentCutsceneText.setDepth(10000);

        this.clickToContinueText = this.scene.add.text(width / 2 - 50, height * 2/3, "Clique para continuar", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffffff',
            resolution: 3,
            wordWrap: { width: width * 0.8, useAdvancedWrap: true},
        });
        this.clickToContinueText.setDepth(10000);

        // Configurar o callback para quando o usuário clicar
        this.onClickCallback = () => {
            this._completeDialogue(callback);
        };
        this.scene.input.once('pointerdown', this.onClickCallback);

        // Fade-in do texto
        this.scene.tweens.add({
            targets: this.currentCutsceneText,
            alpha: 1,
            duration: 500,
            ease: 'Linear'
        });
    }

    MaeDialogue(message, callback, duration) {
        const { width, height } = this.scene.cameras.main;

        // Destruir texto anterior se existir
        if (this.currentCutsceneText) {
            this.currentCutsceneText.destroy();
        }

        this.currentCutsceneText = this.scene.add.text(width / 2, height / 2, message, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#000000',
            padding: { x: 10, y: 5 },
            resolution: 3,
            wordWrap: { width: width * 0.8, useAdvancedWrap: true },
        });
        this.currentCutsceneText.setOrigin(0.5);
        this.currentCutsceneText.setAlpha(0);
        this.currentCutsceneText.setDepth(10000);

        // Configurar o callback para quando o usuário clicar
        this.onClickCallback = () => {
            this._completeDialogue(callback);
        };
        this.scene.input.once('pointerdown', this.onClickCallback);

        // Fade-in do texto
        this.scene.tweens.add({
            targets: this.currentCutsceneText,
            alpha: 1,
            duration: 2000,
            ease: 'Linear'
        });
    }

    _completeDialogue(callback) {
        // Remover o listener de clique para evitar múltiplos triggers
        if (this.onClickCallback) {
            this.scene.input.off('pointerdown', this.onClickCallback);
            this.onClickCallback = null;
        }

        // Fade-out do texto
        this.scene.tweens.add({
            targets: this.currentCutsceneText,
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                if (this.currentCutsceneText) {
                    this.currentCutsceneText.destroy();
                    this.currentCutsceneText = null;
                }
                if (this.clickToContinueText) { // Adicione esta verificação
                this.clickToContinueText.destroy();
                this.clickToContinueText = null;
                }
                this._endCutscene(callback);
            }
        });
    }

    playPuzzleCompleteCutscene(message, callback) {
        if (this.cutsceneActive) return;
        this.cutsceneActive = true;

        // 1. Primeiro: Fade-in
        this._createFadeEffect(() => {
            // 2. Depois do fade completo: Mostra diálogo
            this.scene.showTextBoxDialogue(message);

            // 3. Ao fechar o diálogo: Fade-out e callback
            this.scene.time.delayedCall(2000, () => {
                this._endCutscene(callback);
            });
        });
    }

    playStorylineCompleteCutscene(message, callback) {
        if (this.cutsceneActive) return;
        this.cutsceneActive = true;

        this._createFadeEffect(() => {
            this.CutsceneDialogue(message, callback, 3000);
        });
    }

    _createFadeEffect(onFadeComplete) {
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
            onComplete: onFadeComplete
        });
    }

    _endCutscene(callback) {
        this.scene.tweens.add({
            targets: this.cutsceneFade,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                if (this.cutsceneFade) this.cutsceneFade.destroy();
                if (callback) callback();
                this.cutsceneActive = false;
                this.scene.setInteractionsEnabled(true);
            }
        });
    }
}