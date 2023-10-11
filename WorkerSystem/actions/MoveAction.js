import WonEngine from "../../../index";
import Point from "../../../geom/Point";
import {posToCoords, toScaledPos, generateUniqueId} from 'WonEngine/utils';
import {MAX_TILE_HEIGHT, MAX_TILE_WIDTH} from "../../../config";
import ActionResult, {resultTypes} from "../ActionResult";


const FAILED_TO_FIND_PATH = 'FAILED_TO_FIND_PATH';
const FAILED_INVALID_DESTINATION = 'FAILED_INVALID_DESTINATION';

const MoveAction = async (entity, props) => {
    const {
        merge = false,
        cutLastPath = true,
        destCoords,
    } = props;

    if (!destCoords) {
        return Promise.resolve(new ActionResult(FAILED_TO_FIND_PATH, resultTypes.FAIL));
    }

    const {movementSystem} = WonEngine.getInstance().systems;
    const {pathFinder} = WonEngine.getInstance().plugins;
    const workerCoords = posToCoords(entity.sprite.position);

    const grid = movementSystem.generateGrid(merge);
    grid[destCoords.y][destCoords.x] = 0;
    pathFinder.setGrid(grid);

    const paths = await pathFinder.findPath(workerCoords.x, workerCoords.y, destCoords.x, destCoords.y);

    if (!paths) {
        return Promise.resolve(new ActionResult(FAILED_INVALID_DESTINATION, resultTypes.FAIL));
    }

    if (cutLastPath) {
        paths.pop();
    }

    let movementResult = {};
    if (paths.length > 0) {
        movementResult = await movementSystem.move(entity, paths.map(path => toScaledPos(path)));
        if (!movementResult) {
            debugger;
        }
    }

    return Promise.resolve(new ActionResult(movementResult));
};

export default MoveAction;