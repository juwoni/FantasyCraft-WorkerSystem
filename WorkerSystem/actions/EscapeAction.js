import WonEngine from "../../../index";
import Point from "../../../geom/Point";
import {posToCoords, toScaledPos, generateUniqueId} from 'WonEngine/utils';
import {MAX_TILE_HEIGHT, MAX_TILE_WIDTH} from "../../../config";
import ActionResult from "../ActionResult";

const directions = [
    // new Point(-1, -1),
    new Point(0, -1),
    // new Point(1, -1),
    new Point(-1, 0),
    new Point(1, 0),
    // new Point(-1, 1),
    new Point(0, 1),
    // new Point(1, 1),
];

export default async (entity, props) => {
    const {wallType} = props;

    const {movementSystem} = WonEngine.getInstance().systems;
    const {pathFinder, entityMgr} = WonEngine.getInstance().plugins;
    const workerCoords = posToCoords(entity.sprite.position);

    let emptyCoords = null;

    if (wallType && entityMgr.entities.get(`${wallType}_${workerCoords.x}_${workerCoords.y}`)) {
        for (const direction of directions) {
            const coordX = workerCoords.x + direction.x;
            const coordY = workerCoords.y + direction.y;
            if (pathFinder.objectGrid[coordY][coordX] === 0) {
                emptyCoords = new Point(coordX, coordY);
                break;
            }
        }
    }

    // console.log(`emptyCoords : ${emptyCoords}`);
    if (emptyCoords !== null) {
        await movementSystem.move(entity, [toScaledPos(emptyCoords)]);
    }
    // console.log(`escape finished!`);

    return Promise.resolve(new ActionResult());
};