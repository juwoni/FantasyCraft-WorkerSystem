import WonEngine from "../../../index";
import ActionResult from "../ActionResult";

export default async (worker, props) => {
    const {entityMgr, textureMgr} = WonEngine.getInstance().plugins;
    const {physicSystem} = WonEngine.getInstance().systems;
    const {target} = props;
    const cutWoodTexture = textureMgr.getTexture('items', 0, 0, 8, 8);
    const targetCoords = target.sprite.posToCoords();
    target.sprite.texture = cutWoodTexture;
    target.commandSprite.texture = PIXI.Texture.EMPTY;
    target.shadow.sprite.visible = false;

    entityMgr.deleteEntityByCoords('OBJECT', targetCoords.x, targetCoords.y);
    entityMgr.addEntityByIndex('ITEM', 1, targetCoords.x, targetCoords.y);

    const dx = target.sprite.x - (worker.sprite.x - (worker.sprite.width * 0.5));
    const dy = target.sprite.y - (worker.sprite.y - (worker.sprite.height * 0.5));
    const radian = Math.atan2(dy, dx);
    physicSystem.createParticles(
        target.sprite.x + (target.sprite.width * 0.5),
        target.sprite.y + (target.sprite.height * 0.5),
        radian, 1);


    return Promise.resolve(new ActionResult());
};