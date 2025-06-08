/**
 * Esta é uma "fábrica de funções". Ela cria e retorna uma função de handler
 * para um item colecionável.
 * @param {string} itemKey - A chave do item para adicionar ao inventário (ex: 'keychain').
 * @param {string} spriteName - O nome da propriedade do sprite na cena (ex: 'ChaveSprite').
 */
export function createCollectibleHandler(itemKey, spriteName) {
    // Retorna a função que será usada no nosso mapa de handlers
    return (scene, obj) => {
        // Adiciona o item ao inventário
        scene.inventory.addItem(itemKey, () => {
            scene.showItemZoom(itemKey);
        });

        // Remove a hitbox do objeto clicado
        scene.removeHitboxForObject(obj);

        // Destrói o sprite visual do item na cena
        if (scene[spriteName]) {
            scene[spriteName].destroy();
            scene[spriteName] = null; // Limpa a referência (boa prática)
        } else {
            console.warn(`Sprite '${spriteName}' não encontrado na cena para ser destruído.`);
        }
    };
}