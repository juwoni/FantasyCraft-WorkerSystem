import WonEngine from 'WonEngine';
import {TILE_SIZE} from 'WonEngine/config';
import ActionResult, {resultTypes} from "../ActionResult";

const FAILED_SAVE_ITEM = 'FAILED_SAVE_ITEM';

export default async (entity, props) => {
    const {itemMgr, entityMgr} = WonEngine.getInstance().plugins;
    const {placeCoords} = props;
    const savedItem = entity.inventory.item;

    itemMgr.updateItemList();

    if (savedItem) {
        savedItem.setEntityByCoords(placeCoords.x, placeCoords.y);
        savedItem.setVisible(true);
        entity.inventory.update(null);
    } else {
        return Promise.resolve(new ActionResult(FAILED_SAVE_ITEM, resultTypes.FAIL));
    }

    const zoneEntity = entityMgr.getEntity('ZONE', placeCoords.x, placeCoords.y);
    if (zoneEntity) {
        zoneEntity.reserved = false;
    }

    return Promise.resolve(new ActionResult());
}