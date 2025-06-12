export default class MusicManager {
    constructor(scene) {
        this.scene = scene;
        this.currentTrack = null;
        this.volume = 0.1; // Volume padrão (0 a 1)
        this.isMuted = false;
        this.musicTracks = {
            default: 'main_theme',
            finalMap: 'final_theme',
            lembra: 'cutscene_theme',
            capa: 'menu_theme'
        };
        MusicManager._instance = this;
    }

    static getInstance(scene) {
        if (!MusicManager._instance) {
            new MusicManager(scene);
        } else if (scene) {
            // Atualiza a cena para garantir acesso ao sound
            MusicManager._instance.scene = scene;
        }
        return MusicManager._instance;
    }

    preload() {
        // Carregue todas as músicas do jogo
        this.scene.load.audio(this.musicTracks.default, './assets/music/Ambient.mp3');
        this.scene.load.audio(this.musicTracks.finalMap, './assets/music/Final.mp3');
        this.scene.load.audio(this.musicTracks.lembra, './assets/music/Lembra.mp3');
    }

    playDefaultMusic() {
        if (this.currentTrack === this.musicTracks.default) return;
        this._playMusic(this.musicTracks.default);
    }

    playCutsceneMusic() {
        this._playMusic(this.musicTracks.lembra);
    }

    playFinalMapMusic() {
        this._playMusic(this.musicTracks.finalMap);
    }

    playMenuMusic(){
        this._playMusic(this.musicTracks.capa);
    }

    _playMusic(trackKey) {
        // Se já está tocando a música solicitada, não faz nada
        if (this.currentTrack === trackKey) return;

        // Para a música atual com fade out
        this._stopCurrentMusic(() => {
            // Inicia a nova música com fade in
            const music = this.scene.sound.add(trackKey, {
                loop: true,
                volume: 0
            });
            
            music.play();
            this.currentTrack = trackKey;

            this.scene.tweens.add({
                targets: music,
                volume: this.isMuted ? 0 : this.volume,
     
                ease: 'Linear'
            });
        });
    }

    _stopCurrentMusic(onComplete) {
        if (!this.currentTrack) {
            onComplete();
            return;
        }

        const currentMusic = this.scene.sound.get(this.currentTrack);
        if (!currentMusic) {
            onComplete();
            return;
        }

        this.scene.tweens.add({
            targets: currentMusic,
            volume: 0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                currentMusic.stop();
                onComplete();
            }
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.setVolume(this.volume);
    }

    setVolume(volume) {
        this.volume = Phaser.Math.Clamp(volume, 0, 1);
        if (this.currentTrack) {
            const music = this.scene.sound.get(this.currentTrack);
            if (music) {
                music.setVolume(this.isMuted ? 0 : this.volume);
            }
        }
    }
}