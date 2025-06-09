export default class CutsceneManager {
    constructor(scene) {
        this.scene = scene;
        this.cutsceneActive = false;
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