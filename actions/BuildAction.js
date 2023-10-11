import WonEngine from 'WonEngine'
import {posToCoords} from 'WonEngine/utils';
import ActionResult from "../ActionResult";
import {gageTypes} from "../../../config";
import {sleep} from "../../../utils";

const BUILDING_TIME = 1000;

export default async (worker, props) => {
    const {
        itemIndex,
        destCoords
    } = props;

    const {entityMgr} = WonEngine.getInstance().plugins;

    worker.gage.setGageType(gageTypes.WORK);
    worker.gage.show();
    worker.gage.update(undefined, gageTypes.WORK, BUILDING_TIME);
    await sleep(BUILDING_TIME);
    worker.gage.hide();

    entityMgr.deleteEntityByCoords('BUILD', destCoords.x, destCoords.y);
    entityMgr.addEntityByIndex('OBJECT', itemIndex, destCoords.x, destCoords.y);

    return Promise.resolve(new ActionResult());
};