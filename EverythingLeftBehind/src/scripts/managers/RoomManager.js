import { clickSound } from '../constants.js';

export default class RoomManager {
    constructor(scene) {
        this.scene = scene;
        this.currentRoom = 1;
        this.maxRooms = 4;
        this.interactiveZones = []; // Armazena todas as zonas interativas
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
        // Limpa as zonas interativas anteriores
        this.clearPreviousZones();

        // Atualiza a cena
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

    clearPreviousZones() {
        this.interactiveZones.forEach(zone => zone.destroy());
        this.interactiveZones = [];
    }

    //=========================================================================================================

    nextRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom((this.currentRoom % totalRooms) + 1);
        clickSound.currentTime = 0;
        clickSound.play();
    }

    //=========================================================================================================

    prevRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom(((this.currentRoom - 2 + totalRooms) % totalRooms) + 1);
        clickSound.currentTime = 0;
        clickSound.play();
    }
}