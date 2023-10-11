import WonEngine from 'WonEngine'
import {sleep, posToCoords} from 'WonEngine/utils';
import ActionResult from "../ActionResult";
import {playActionList} from "WonEngine/systems/WorkerSystem/Work";
import {resultTypes} from "WonEngine/systems/WorkerSystem/ActionResult";
import {actionTypes} from "WonEngine/config";

const FAILED_NOT_ENOUGH_ITEMS = 'FAILED_NOT_ENOUGH_ITEMS';

export default async (worker, props) => {
    const {itemMgr} = WonEngine.getInstance().plugins;
    const {
        requiredMaterials = [],
        destCoords,
        target,
    } = props;
    let actionResult = null;
    let usedMaterials = [];
    while (requiredMaterials.length) {
        const materialItem = itemMgr.getMaterialItem(requiredMaterials[0].itemIndex);

        if (!materialItem) {
            return new ActionResult(FAILED_NOT_ENOUGH_ITEMS, resultTypes.FAIL);
        }

        const materialItemCoords = posToCoords(materialItem.sprite.position);

        actionResult = await playActionList(worker, [
            [actionTypes.MOVE, result => ({
                destCoords: materialItemCoords,
                cutLastPath: false,
            })],
            [actionTypes.GET_ITEM, result => ({
                destCoords: materialItemCoords,
            })],
            [actionTypes.MOVE, result => ({
                destCoords,
                // merge: true
            })],
            [actionTypes.SAVE_ITEM, result => ({
                placeCoords: destCoords,
            })],
        ]);

        if (actionResult.type !== resultTypes.SUCCESS) {
            return actionResult;
        }

        if (--requiredMaterials[0].count <= 0) {
            requiredMaterials.shift();
        }
        usedMaterials.push(materialItem.id);
    }

    return Promise.resolve(new ActionResult({
        usedMaterials
    }));
};