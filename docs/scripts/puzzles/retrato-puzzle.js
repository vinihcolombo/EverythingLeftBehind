export default class RetratoPuzzle {
    constructor(scene, correctDate) {
        this.scene = scene;
        this.correctDate = correctDate; // Formato: "DD/MM/AAAA"
        this.selectedDate = "08/06/2010"; // Data inicial
        this.active = false;
        this.elements = []; // Array para armazenar todos os elementos criados
    }

    create() {
        // Impede interações com o jogo principal
        this.scene.setInteractionsEnabled(false);

        // Cria overlay escuro (depth 1000)
        this.overlay = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width * 2,
            this.scene.cameras.main.height * 2,
            0x000000, 0.7
        ).setOrigin(0).setDepth(1000);
        this.elements.push(this.overlay);

        // Container principal (depth 1001)
        this.container = this.scene.add.container(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY
        ).setDepth(1001);
        this.elements.push(this.container);

        // Fundo do puzzle (depth 1002 dentro do container)
        const bg = this.scene.add.image(0, 0, 'retrato')
            .setDisplaySize(426, 240)
            .setDepth(1002);
        this.container.add(bg);
        this.elements.push(bg);

        // Texto da pergunta (depth 1003)
        const question = this.scene.add.text(60, -90, "Quando tiramos essa foto?", {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#FFFFFF',
            align: 'center',
            resolution: 3,
            wordWrap: { width: 380 }
        }).setOrigin(0.5).setDepth(1003);
        this.container.add(question);
        this.elements.push(question);

        // Display da data selecionada (depth 1004)
        this.dateDisplay = this.scene.add.text(60, 0, this.selectedDate, {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#FFFFFF',
            resolution: 3,
            backgroundColor: '#333333'
        }).setOrigin(0.5).setPadding(10).setDepth(1004);
        this.container.add(this.dateDisplay);
        this.elements.push(this.dateDisplay);

        // Botões de controle (depth 1005)
        this.createControlButton(180, 113, 'Dia', 'day');
        this.createControlButton(250, 113, 'Mês', 'month');
        this.createControlButton(350, 113, 'Ano', 'year');

        // Botão de confirmar (depth 1006)
        const confirmButton = this.scene.add.text(40, 100, '[Confirmar]', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#00FF00',
            resolution: 3,
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setDepth(1006)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.checkAnswer());
        this.container.add(confirmButton);
        this.elements.push(confirmButton);

        // Botão de fechar (depth 1007)
        const closeButton = this.scene.add.text(-178, -100, '[X]', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#FF0000',
            resolution: 3,
            backgroundColor: '#333333',
            padding: { x: 5, y: 5 }
        })
        .setOrigin(0.5)
        .setDepth(1007)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.close());
        this.container.add(closeButton);
        this.elements.push(closeButton);

        this.active = true;
    }

    createControlButton(x, y, label, type) {
        const container = this.scene.add.container(x, y).setDepth(1005);
        this.elements.push(container);
        
        // Botão para aumentar
        const upButton = this.scene.add.text(0, -35, '+', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#FFFFFF',
            backgroundColor: '#333333',
            padding: { x: 15, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.adjustDate(type, 1));
        container.add(upButton);
        this.elements.push(upButton);

        // Botão para diminuir
        const downButton = this.scene.add.text(0, 50, '-', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#FFFFFF',
            backgroundColor: '#333333',
            padding: { x: 15, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.adjustDate(type, -1));
        container.add(downButton);
        this.elements.push(downButton);

        this.scene.inventory.hideAndDisable();
        
        return container;
    }

    adjustDate(type, change) {
        let [day, month, year] = this.selectedDate.split('/').map(Number);
        
        switch(type) {
            case 'day':
                day += change;
                if (day > 31) day = 1;
                if (day < 1) day = 31;
                break;
            case 'month':
                month += change;
                if (month > 12) month = 1;
                if (month < 1) month = 12;
                break;
            case 'year':
                year += change;
                if (year > 2025) year = 1980;
                if (year < 1980) year = 2025;
                break;
        }

        day = day.toString().padStart(2, '0');
        month = month.toString().padStart(2, '0');
        
        this.selectedDate = `${day}/${month}/${year}`;
        this.dateDisplay.setText(this.selectedDate);
    }

    checkAnswer() {
    if (this.selectedDate === this.correctDate) {
        this.scene.cutsceneManager._startStorylineCutscene('Tentando congelar seus tempos de ouros, encontrou memórias que doem como gelo queimando a pele.',);
        this.scene.gameState.retratoCompleted = true;
        this.close();
        
        
        // Emite um evento específico para a conclusão do puzzle do retrato
        this.scene.events.emit('retratoPuzzleCompleted');
    } else {
        this.scene.showTextBoxDialogue("Não foi nessa data... Eu preciso achar algo que me lembre disso.");
    }
}

    close() {
        // Destrói todos os elementos na ordem inversa
        for (let i = this.elements.length - 1; i >= 0; i--) {
            if (this.elements[i]) {
                this.elements[i].destroy();
            }
        }
        this.elements = [];
        
        if (this.container) {
            this.container.destroy();
        }
        
        if (this.overlay) {
            this.overlay.destroy();
        }
        
        this.active = false;
        this.scene.setInteractionsEnabled(true);
    }
}