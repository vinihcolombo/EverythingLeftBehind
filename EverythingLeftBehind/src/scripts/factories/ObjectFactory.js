// Esta classe é responsável por criar todos os objetos do jogo baseados nos dados do mapa.
export default class ObjectFactory {
    constructor(scene) {
        this.scene = scene; // A fábrica precisa de uma referência à cena para poder usar this.add, etc.
    }

    // Este é o método principal que será chamado pela cena
    loadMapObjects(mapKey) {
        const mapData = this.scene.cache.json.get(mapKey);
        if (!mapData) {
            console.error(`Mapa ${mapKey} não encontrado no cache!`);
            return;
        }

        mapData.layers.forEach(layer => {
            if (layer.type === 'objectgroup') {
                layer.objects.forEach(obj => {
                    // Usamos um switch para deixar o código mais limpo que múltiplos if/else
                    switch (obj.name) {
                        case 'Chave de Apartamento':
                            this.createChave(obj);
                            break;
                        case 'Coleção de Pedras':
                            this.createPedra(obj);
                            break;
                        case 'Caderno de Escrita':
                            this.createNotebook(obj);
                            break;
                        case 'gavetaCamera':
                            this.createCamera(obj);
                            break;
                        default:
                            // Para todos os outros objetos, cria uma zona padrão
                            this.createStandardInteractiveZone(obj);
                    }
                });
            }
        });
    }

    createChave(obj) {
        const scene = this.scene;

        if (scene.inventory.hasItem('keychain')) {
            return;
        }
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior, se ele existir NA CENA
        if (scene.ChaveSprite) {
            scene.ChaveSprite.destroy();
            scene.ChaveSprite = null;
        }

        // Cria o sprite e armazena a referência NA CENA
        // Note o uso de "scene.add.image" e "scene.ChaveSprite"
        scene.ChaveSprite = scene.add.image(
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'keychain' // A chave da imagem que você carregou no preload
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        // Cria a zona de interação (hitbox)
        const zone = scene.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            // Os eventos agora chamam os métodos da CENA
            .on('pointerover', () => scene.showTooltip({ name: 'Chave de Apartamento', x: obj.x, y: obj.y, width: obj.width, height: obj.height }))
            .on('pointerout', () => scene.tooltip.setVisible(false))
            .on('pointerdown', () => scene.handleObjectClick(obj));

        // Adiciona a zona ao array de zonas interativas NA CENA
        scene.roomManager.interactiveZones.push(zone);
    }

    createPedra(obj) {
        const scene = this.scene;

        if (scene.inventory.hasItem('rockCollection')) {
            return;
        }
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior, se ele existir NA CENA
        if (scene.PedraSprite) {
            scene.PedraSprite.destroy();
            scene.PedraSprite = null;
        }

        // Cria o sprite e armazena a referência NA CENA
        // Note o uso de "scene.add.image" e "scene.PedraSprite"
        scene.PedraSprite = scene.add.image(
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'rockCollection' // A chave da imagem que você carregou no preload
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        // Cria a zona de interação (hitbox)
        const zone = scene.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            // Os eventos agora chamam os métodos da CENA
            .on('pointerover', () => scene.showTooltip({ name: 'Coleção de pedras', x: obj.x, y: obj.y, width: obj.width, height: obj.height }))
            .on('pointerout', () => scene.tooltip.setVisible(false))
            .on('pointerdown', () => scene.handleObjectClick(obj));

        // Adiciona a zona ao array de zonas interativas NA CENA
        scene.roomManager.interactiveZones.push(zone);
    }

    createNotebook(obj) {
        const scene = this.scene;
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior, se ele existir NA CENA
        if (scene.NotebookSprite) {
            scene.NotebookSprite.destroy();
            scene.NotebookSprite = null;
        }

        // Cria o sprite e armazena a referência NA CENA
        // Note o uso de "scene.add.image" e "scene.NotebookSprite"
        scene.NotebookSprite = scene.add.image(
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'Notebook_Item' // A Notebook da imagem que você carregou no preload
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        // Cria a zona de interação (hitbox)
        const zone = scene.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            // Os eventos agora chamam os métodos da CENA
            .on('pointerover', () => scene.showTooltip({ name: 'Caderno', x: obj.x, y: obj.y, width: obj.width, height: obj.height }))
            .on('pointerout', () => scene.tooltip.setVisible(false))
            .on('pointerdown', () => scene.handleObjectClick(obj));

        // Adiciona a zona ao array de zonas interativas NA CENA
        scene.roomManager.interactiveZones.push(zone);
    }

    createCamera(obj) {
        const scene = this.scene;
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior, se ele existir NA CENA
        if (scene.CameraSprite) {
            scene.CameraSprite.destroy();
            scene.CameraSprite = null;
        }

        // Cria o sprite e armazena a referência NA CENA
        // Note o uso de "scene.add.image" e "scene.CameraSprite"
        scene.CameraSprite = scene.add.image(
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'camera' // A Camera da imagem que você carregou no preload
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        // Cria a zona de interação (hitbox)
        const zone = scene.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            // Os eventos agora chamam os métodos da CENA
            .on('pointerover', () => scene.showTooltip({ name: 'Câmera antiga', x: obj.x, y: obj.y, width: obj.width, height: obj.height }))
            .on('pointerout', () => scene.tooltip.setVisible(false))
            .on('pointerdown', () => scene.handleObjectClick(obj));

        // Adiciona a zona ao array de zonas interativas NA CENA
        scene.roomManager.interactiveZones.push(zone);
    }

    createStandardInteractiveZone(obj) {
        const scene = this.scene;
        const zone = scene.add.zone(obj.x, obj.y, obj.width, obj.height)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => scene.showTooltip(obj))
            .on('pointerout', () => scene.tooltip.setVisible(false))
            .on('pointerdown', () => scene.handleObjectClick(obj));

        scene.roomManager.interactiveZones.push(zone);
    }
}