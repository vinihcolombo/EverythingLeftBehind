import { createCollectibleHandler } from './handlerUtils.js';
import StonePuzzle from '../puzzles/puzzlePedra.js';

// Mapeia o nome do objeto do Tiled para a ação a ser executada
const worldInteractionHandlers = {
    // --- Itens Colecionáveis (usando nossa função auxiliar) ---
    'chavedeapartamento': createCollectibleHandler('keychain', 'ChaveSprite'),
    'coleçãodepedras':    createCollectibleHandler('rockCollection', 'PedraSprite'),
    'cadernodeescrita':   createCollectibleHandler('notebookOpen', 'NotebookSprite'),
    'gavetacamera':       createCollectibleHandler('camera', 'CameraSprite'),

    // --- Diálogos com Escolha ---
    'caixaclara':        (scene, obj) => scene.showTextBoxWithChoices("Nossa.. tantas memórias da Clara por aqui.."),
    'quadrobanana':      (scene, obj) => scene.showTextBoxWithChoices("Placeholder..."),
    'prateleiraarmario': (scene, obj) => scene.showTextBoxWithChoices("Teste 123"),
    'caixasobrehelena':  (scene, obj) => scene.showTextBoxWithChoices("A caixa de Helena. A primeira. É onde tudo começou..."),
    'gavetagrande':      (scene, obj) => scene.showTextBoxWithChoices("Uma gaveta grande, parece trancada."),
    'caixadorafael':     (scene, obj) => scene.showTextBoxWithChoices("aaaaaaa"),
    'quadro':            (scene, obj) => scene.showTextBoxWithChoices("Mapa-múndi"),
    
    // --- Diálogos Simples ---
    'gaveta': (scene, obj) => scene.showTextBoxDialogue("Está trancada."),
    'porta':  (scene, obj) => scene.showTextBoxDialogue("Está trancada."),

    // --- Ações Especiais ---
    // 'coleçãodepedras': (scene, obj) => scene.startPuzzlePedra(),
    'caixasemquadro': (scene, obj) => scene.startPuzzle(),

    // --- Navegação ---
    'voltar': (scene, obj) => scene.goBackToPreviousMap(),
};

export default worldInteractionHandlers;