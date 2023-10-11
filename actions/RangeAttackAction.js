import WonEngine from 'WonEngine'
import {sleep, posToCoords} from 'WonEngine/utils';
import ActionResult from "../ActionResult";
import {gageTypes} from "WonEngine/config";

const ATTACK_DELAY = 1000;

export default async (worker, props) => {
    const {missileMgr} = WonEngine.getInstance().plugins;
    const {movementSystem} = WonEngine.getInstance().systems;
    const {target} = props;

    movementSystem.setDirection(worker, target.sprite);

    worker.gage.setGageType(gageTypes.WORK);
    worker.gage.show();
    worker.gage.setGageType(gageTypes.HEALTH);
    target.gage.show();

    while (target.gage.value-- > 0) {
        // const g = attackSystem.attack(worker, target);
        // await g.next();
        // await g.next();
        await sleep(ATTACK_DELAY);
        // await sleep(1000);
        await missileMgr.launch(worker, target);
        worker.gage.update(undefined, gageTypes.WORK, ATTACK_DELAY);
        target.gage.update();

        // console.log(`target[${target.id}] : ${target.gage.value}`);
    }

    worker.gage.hide();

    return Promise.resolve(new ActionResult());
};