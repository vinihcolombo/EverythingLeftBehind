// Este arquivo mapeia a 'key' de um item para a AÇÃO que ele executa no zoom.
// Cada ação é uma função que recebe a 'scene' como argumento.
const zoomedItemHandlers = {
    'notebookopen': (scene) => {
        scene.showTextBoxDialogue("É o meu antigo caderno. Tantas memórias...", true);
    },

    'camera': (scene) => {
        scene.showTextBoxDialogue("Eu gostava tanto de tirar fotos..", true);
    },

    'keychain': (scene) => {
        scene.showTextBoxDialogue("Isso deve abrir algo..", true);
    },

    // Adicione aqui as ações para outros itens.
    // Itens que não estiverem nesta lista não terão ação no modo de zoom.
};

// Exporta o objeto de handlers para que outros arquivos possam importá-lo
export default zoomedItemHandlers;