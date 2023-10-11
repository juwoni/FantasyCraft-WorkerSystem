import WonEngine from 'WonEngine';
import ActionResult, {resultTypes} from "../ActionResult";

const FAILED_TO_FIND_EMPTY_ZONE = 'FAILED_TO_FIND_EMPTY_ZONE';

export default async () => {
    const {entityMgr} = WonEngine.getInstance().plugins;
    const {clusterSystem} = WonEngine.getInstance().systems;
    const zoneClusters = clusterSystem.getClusterManager('ZONE').getAllClusters();

    // Find empty place.
    for (const zoneCluster of zoneClusters) {
        for (const zoneEntity of zoneCluster.entities.values()) {
            if (zoneEntity.reserved) continue;
            const placedItem = entityMgr.getEntity('ITEM', zoneEntity.coords.x, zoneEntity.coords.y);
            if (!placedItem) {
                console.log(`Found empty zone ${zoneEntity.coords.x}_${zoneEntity.coords.y}`);
                zoneEntity.reserved = true;
                return Promise.resolve(new ActionResult({
                    placeCoords: zoneEntity.coords,
                }));
            }
        }
    }

    return Promise.resolve(new ActionResult(FAILED_TO_FIND_EMPTY_ZONE, resultTypes.FAIL));
}
