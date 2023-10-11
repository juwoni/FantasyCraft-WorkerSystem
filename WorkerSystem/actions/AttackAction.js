import WonEngine from 'WonEngine'
import {sleep, posToCoords} from 'WonEngine/utils';
import ActionResult from "../ActionResult";

export default async (worker, props) => {
    const {attackSystem} = WonEngine.getInstance().systems;
    const {target} = props;

    if (!target.gage) {
        console.error(`${target.id} Gage does not exist!`);
    }

    target.gage.show();

    while (target.gage.value-- > 0) {
        const g = attackSystem.attack(worker, target);
        await sleep(500);
        await g.next();
        await g.next();
        target.gage.update();
        // console.log(`target[${target.id}] : ${target.gage.value}`);
    }

    return Promise.resolve(new ActionResult());
};