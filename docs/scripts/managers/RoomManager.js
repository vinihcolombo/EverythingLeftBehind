import { clickSound } from '../constants.js';

export default class RoomManager {
    constructor(scene) {
        this.scene = scene;
        this.currentRoom = 1;
        this.maxRooms = 4; // Usaremos isso para identificar o mapa final
        this.interactiveZones = []; 
    }

    //=========================================================================================================

    loadRoom(roomNumber) {
        if (this.scene.currentMapKey && this.scene.bg.texture) {
            this.scene.navigationHistory.push({
                mapKey: this.scene.currentMapKey,
                bgKey: this.scene.bg.texture.key,
                isRoom: true,
                roomNumber: this.currentRoom
            });
        }

        this.currentRoom = roomNumber;
        this.clearPreviousZones();

        const mapKey = `mapa${roomNumber}`;
        this.scene.updateBackground(`bg${roomNumber}`);
        this.scene.loadMapObjects(`mapa${roomNumber}`);
        this.scene.currentMapKey = mapKey;
        this.scene.updateArrowsVisibility();
    }

    //=========================================================================================================

    playSound() {
        clickSound.currentTime = 0;
        clickSound.play();
    }

    //=========================================================================================================

    clearPreviousZones(forceDestroy = false) {
        this.interactiveZones.forEach(zone => {
            zone.destroy();
        });
        this.interactiveZones = [];
        
        if (forceDestroy) {
            this.scene.children.each(child => {
                if (child instanceof Phaser.GameObjects.Zone) {
                    child.destroy();
                }
            });
        }
    }

    //=========================================================================================================

    nextRoom() {
        // Seu código para nextRoom continua o mesmo
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom((this.currentRoom % totalRooms) + 1);
        this.playSound(); // Mantive sua chamada de som de clique
    }

    //=========================================================================================================

    prevRoom() {
        // Seu código para prevRoom continua o mesmo
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom(((this.currentRoom - 2 + totalRooms) % totalRooms) + 1);
        this.playSound(); // Mantive sua chamada de som de clique
    }
}