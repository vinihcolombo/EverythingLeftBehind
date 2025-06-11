export default class CutsceneManager {
    constructor(scene) {
        this.scene = scene;
        this.cutsceneActive = false;
        this.cutsceneFade = null; 
        this.currentCutsceneText = null;
    }

    CutsceneDialogue(message, callback, duration) {
    const { width, height } = this.scene.cameras.main;

    const dialogueText = this.scene.add.text(width / 2, height / 2, message, {
        fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffffff',
            padding: { x: 10, y: 5 },
            resolution: 3,
        wordWrap: { width: width * 0.8, useAdvancedWrap: true },
    });
    dialogueText.setOrigin(0.5);
    dialogueText.setAlpha(0); // começa invisível
    dialogueText.setDepth(10000);

    // Fade-in do texto
    this.scene.tweens.add({
        targets: dialogueText,
        alpha: 1,
        duration: 500,
        ease: 'Linear',
        onComplete: () => {
            // Aguarda o texto visível
            this.scene.time.delayedCall(1500, () => {
                // Fade-out do texto
                this.scene.tweens.add({
                    targets: dialogueText,
                    alpha: 0,
                    duration: duration,
                    ease: 'Linear',
                    onComplete: () => {
                        dialogueText.destroy();
                        this._endCutscene(callback); // Agora chama o fade-out da cutscene
                    }
                });
            });
        }
    });
}

    MaeDialogue(message, callback, duration) {
    const { width, height } = this.scene.cameras.main;

    const dialogueText = this.scene.add.text(width / 2, height / 2, message, {
        fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#000000',
            padding: { x: 10, y: 5 },
            resolution: 3,
        wordWrap: { width: width * 0.8, useAdvancedWrap: true },
    });
    dialogueText.setOrigin(0.5);
    dialogueText.setAlpha(0); // começa invisível
    dialogueText.setDepth(10000);

    // Fade-in do texto
    this.scene.tweens.add({
        targets: dialogueText,
        alpha: 1,
        duration: 2000,
        ease: 'Linear',
        onComplete: () => {
            // Aguarda o texto visível
            this.scene.time.delayedCall(2000, () => {
                // Fade-out do texto
                this.scene.tweens.add({
                    targets: dialogueText,
                    alpha: 0,
                    duration: duration,
                    ease: 'Linear',
                    onComplete: () => {
                        dialogueText.destroy();
                        this._endCutscene(callback); // Agora chama o fade-out da cutscene
                    }
                });
            });
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
        // Fade de entrada (tela preta)
        this.cutsceneFade = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width * 2,
            this.scene.cameras.main.height * 2,
            0x000000 // Cor do fade (preto)
        )
            .setOrigin(0)
            .setAlpha(0) // Começa transparente
            .setDepth(9999);

        // Animação do fade-in
        this.scene.tweens.add({
            targets: this.cutsceneFade,
            alpha: 1, // Termina totalmente visível
            duration: 1000,
            onComplete: onFadeComplete
        });
    }

    _reverseFadeEffect(onFadeComplete) {
        this.cutsceneFade = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width * 2,
            this.scene.cameras.main.height * 2,
            0x000000 // Cor do fade (preto)
        )
            .setOrigin(0)
            .setAlpha(1) // Começa transparente
            .setDepth(9999);

        // Animação do fade-in
        this.scene.tweens.add({
            targets: this.cutsceneFade,
            alpha: 0, // Termina totalmente visível
            duration: 1000,
            onComplete: onFadeComplete
        });
    }

    _endCutscene(callback) {
        // Animação do fade-out
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