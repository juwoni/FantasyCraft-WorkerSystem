import WonEngine from 'WonEngine';
import ActionResult, {resultTypes} from "../ActionResult";
import {updateInventory} from 'WonUI/Interface/CharacterStatus/reducer';
import {updateItems} from "../../../../WonUI/Interface/ItemList/reducer";

const FAILED_GET_ITEM_INVENTORY_FULL = 'FAILED_GET_ITEM_INVENTORY_FULL';
const FAILED_ITEM_IS_NOT_EXISTED = 'FAILED_ITEM_IS_NOT_EXISTED';

export default async (entity, props) => {
    const {store} = WonEngine.getInstance();
    const {itemMgr, entityMgr} = WonEngine.getInstance().plugins;
    const {destCoords} = props;
    const item = entityMgr.getEntity('ITEM', destCoords.x, destCoords.y);

    if (!item) {
        return Promise.resolve(new ActionResult(FAILED_ITEM_IS_NOT_EXISTED, resultTypes.FAIL));
    }

    if (entity.inventory.item) {
        return Promise.resolve(new ActionResult(FAILED_GET_ITEM_INVENTORY_FULL, resultTypes.FAIL));
    }

    itemMgr.removeItem(item);
    entity.inventory.update(item);

    return Promise.resolve(new ActionResult());
};