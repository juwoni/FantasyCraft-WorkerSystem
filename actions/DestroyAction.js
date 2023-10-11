
import WonEngine from "../../../index";
import Point from "../../../geom/Point";
import {posToCoords, toScaledPos, generateUniqueId} from 'WonEngine/utils';
import {TILE_SIZE} from "../../../config";
import ActionResult from "../ActionResult";


export default async (worker, props) => {
    const {entityMgr} = WonEngine.getInstance().plugins;
    const {physicSystem} = WonEngine.getInstance().systems;
    const {target} = props;

    const dx = target.sprite.x - (worker.sprite.x - (worker.sprite.width * 0.5));
    const dy = target.sprite.y - (worker.sprite.y - (worker.sprite.height * 0.5));
    const radian = Math.atan2(dy, dx);
    physicSystem.createParticles(
        target.sprite.x + (target.sprite.width * 0.5),
        target.sprite.y + (target.sprite.height * 0.5),
        radian);

    entityMgr.deleteEntity(target);


    return Promise.resolve(new ActionResult());
};
