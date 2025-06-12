import { inventorySound } from '../constants.js';

export default class Inventory {
    constructor(scene) {
        this.items = {};
        this.scene = scene;
        this.isVisible = false;
        this.slots = [];
        this.maxSlots = 10;
        this.scrollY = 0;
        this.maxScroll = 0;

        // Posições e dimensões
        this.inventoryWidth = 150;
        this.hiddenX = scene.cameras.main.width + 10;
        this.visibleX = scene.cameras.main.width - this.inventoryWidth;

        this.createToggleButton();
        this.createInventoryOverlay();

        this.isAnimating = false;

        this.itemActions = {};
    }

    //=========================================================================================================

    hasItem(itemKey) {
    return this.slots.some(slot => 
        slot.item && slot.item.texture && slot.item.texture.key === itemKey
    );
}

    isInventoryActive() {
        return this.inventory.isVisible;
    }

    hideAndDisable() {
        if (this.isVisible) {
            this.toggleVisibility(); // Usa a função existente para esconder
        }

        // Desativa interações
        if (this.toggleButton) {
            this.toggleButton.disableInteractive();
        }

        this.isVisible = false;
    }

    enable() {
        this.toggleButton.setInteractionsEnabled();

        this.isVisible = true;
    }   

    //=========================================================================================================

    createToggleButton() {
        const rightPosition = this.scene.cameras.main.width - 40;
        const topPosition = 20;

        this.toggleButton = this.scene.add.image(rightPosition, topPosition, 'iconInventory')
            .setDisplaySize(40, 40) // Tamanho fixo
            .setInteractive({ useHandCursor: true })
            .setDepth(1005);

        // Efeitos de hover - agora mais sutis
        this.toggleButton.on('pointerover', () => {
            this.scene.tweens.add({
                targets: this.toggleButton,
                scaleX: 0.4,
                scaleY: 0.4,
                duration: 100,
                ease: 'Sine.easeOut'
            });
        });

        this.toggleButton.on('pointerout', () => {
            this.scene.tweens.add({
                targets: this.toggleButton,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 100,
                ease: 'Sine.easeIn'
            });
        });

        this.toggleButton.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: this.toggleButton,
                scaleX: 0.03,
                scaleY: 0.03,
                duration: 50,
                yoyo: true
            });
            this.toggleInventory();
        });
    }

    //=========================================================================================================

    createInventoryOverlay() {
        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;

        const x = gameWidth - this.inventoryWidth;

        this.inventoryBg = this.scene.add.image(
            this.hiddenX,
            gameHeight / 2,
            'inventory'
        )
            .setOrigin(1.2, 0.5)
            .setDisplaySize(this.inventoryWidth - x - 25, gameHeight)
            .setDepth(1003);

        const rightPadding = 30;
        this.slotsContainer = this.scene.add.container(
            this.hiddenX + rightPadding,
            60
        )
            .setDepth(1004);

        const slotSize = 60;
        const padding = 5;

        for (let i = 0; i < this.maxSlots; i++) {
            const x = slotSize / 0.7;
            const y = i * (slotSize + padding) + slotSize / 2;

            const slotBg = this.scene.add.image(
                x, y,
                'slot'
            )
                .setDisplaySize(slotSize, slotSize);

            this.slots.push({
                background: slotBg,
                item: null,
                x: x,
                y: y
            });

            this.slotsContainer.add(slotBg);
        }

        // Calcular scroll máximo
        this.calculateMaxScroll();

        // Configurar scroll do mouse
        this.setupMouseScroll();
    }

    //=========================================================================================================

    calculateMaxScroll() {
        const slotHeight = 60 + 10;
        const visibleHeight = this.scene.cameras.main.height - 120;
        const totalHeight = this.maxSlots * slotHeight;

        this.maxScroll = Math.max(0, totalHeight - visibleHeight);
    }

    //=========================================================================================================    

    setupMouseScroll() {
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (this.isVisible) {
                this.scrollY += deltaY * 0.5;

                this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScroll);

                this.slotsContainer.y = 60 - this.scrollY;
            }
        });
    }

    //=========================================================================================================

    toggleInventory() {
        inventorySound.play();
        if (this.isAnimating) return;

        this.isVisible = !this.isVisible;
        this.isAnimating = true;

        this.scene.setInteractionsEnabled(!this.isVisible);

        if (this.isVisible) {
            this.scrollY = 0;
            this.slotsContainer.y = 60;

            // Animação de entrada
            this.scene.tweens.add({
                targets: [this.inventoryBg, this.slotsContainer],
                x: this.visibleX,
                duration: 300,
                onComplete: () => {
                    this.isAnimating = false;
                    this.slots.forEach(slot => {
                        if (slot.item) slot.item.setVisible(true);
                    });
                }
            });
        } else {
            // Animação de saída
            this.scene.tweens.add({
                targets: [this.inventoryBg, this.slotsContainer],
                x: this.hiddenX,
                duration: 300,
                onComplete: () => {
                    this.isAnimating = false;
                    this.slots.forEach(slot => {
                        if (slot.item) slot.item.setVisible(false);
                    });
                }
            });
            this.scene.setInteractionsEnabled(true);
        }
    }

    //=========================================================================================================

    useItem(itemKey) {
        // Verifica se o item existe e tem uma função de uso
        if (this.items[itemKey] && this.items[itemKey].use) {
            // Tenta usar o item
            const wasUsed = this.items[itemKey].use();
            if (wasUsed) {
                // Remove o item usável do registro
                delete this.items[itemKey];
                return true;
            }
        }
        return false;
    }

    addUsableItem(key, image, useCallback) {
        this.items[key] = {
            image: image,
            use: useCallback
        };
        // Não é necessário chamar updateInventoryDisplay() aqui
        // pois os itens usáveis são armazenados separadamente
    }

    addItem(itemKey, action = null) {
        const emptySlot = this.slots.find(slot => slot.item === null);
        if (emptySlot) {
            const item = this.scene.add.image(
                emptySlot.x,
                emptySlot.y,
                itemKey
            )
                .setDisplaySize(50, 50)
                .setInteractive()
                .on('pointerdown', () => {
                    if (this.isVisible) {
                        // Verifica se pode usar o item automaticamente
                        if (this.useItem(itemKey)) {
                            // Remove o item se foi usado com sucesso
                            this.removeItem(itemKey);
                        } else {
                            // Se não puder usar, executa a ação padrão (zoom)
                            if (action) action();
                        }
                    }
                })
                .setVisible(this.isVisible)
                .setDepth(53);

            emptySlot.item = item;
            this.slotsContainer.add(item);

            if (action) {
                this.itemActions[itemKey] = action;
            }

            return true;
        }
        return false;
    }

    //=========================================================================================================

    executeItemAction(itemKey) {
        if (this.itemActions[itemKey]) {
            this.itemActions[itemKey]();
        } else {
            console.log(`Item ${itemKey} clicado, mas nenhuma ação definida`);
            // Ação padrão para itens sem função específica
            this.scene.showTooltip({ name: `Usando ${itemKey}...` });
        }
    }

    //=========================================================================================================

    removeItem(itemKey) {
        const slotIndex = this.slots.findIndex(slot =>
            slot.item && slot.item.texture.key === itemKey
        );

        if (slotIndex !== -1) {
            this.slots[slotIndex].item.destroy();
            this.slots[slotIndex].item = null;
            return true;
        }
        return false; // Item não encontrado
    }

    destroyToggleButton() {
    if (this.toggleButton) {
        this.toggleButton.destroy();
        this.toggleButton = null;
    }
}
}