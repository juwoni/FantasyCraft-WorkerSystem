import WonEngine from 'WonEngine'
import {posToCoords} from 'WonEngine/utils';
import {toScaledPos} from "../../../utils";
import ActionResult from "../ActionResult";
import {sleep} from 'WonEngine/utils';
import {gageTypes} from "../../../config";

const GROWING_TIME = 1000;

export default async (worker, props) => {
    const {entityMgr, textureMgr} = WonEngine.getInstance().plugins;
    const {itemIndex, target, destPosition} = props;
    // target.sprite.tint = 0xFF0000;
    // const {itemIndex, destPosition} = props;
    // const buildCoords = new PIXI.Point();

    // posToCoords(destPosition, buildCoords);
    const destCoords = new PIXI.Point();
    posToCoords(destPosition, destCoords);

    worker.gage.setGageType(gageTypes.WORK);
    worker.gage.show();
    worker.gage.update(undefined, gageTypes.WORK, GROWING_TIME);
    await sleep(GROWING_TIME);
    worker.gage.hide();
    const item = entityMgr.addEntityByIndex('ITEM', 3, destCoords.x, destCoords.y);


    // const graphices = new PIXI.Graphics();
    // genWireFrame(item.sprite, graphices);
    // item.sprite.addChild(graphices);

    // entityMgr.deleteEntity('BUILD', buildCoords.x, buildCoords.y);
    // entityMgr.addEntityByIndex('OBJECT', itemIndex, buildCoords.x, buildCoords.y);

    // entityMgr._addEntity(entityData.type, coordX, coordY, {
    //     layerName,
    //     itemIndex,
    //     terrainType: entityData.terrainType,
    //     isCenter,
    //     isWall: entityData.wall,
    //     isDoor: entityData.door,
    // });

    return Promise.resolve(new ActionResult());
};