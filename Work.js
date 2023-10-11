import localData from 'localData';
import {actionTypes, workDataTypes, workTypes, workState} from "../../config";
import {resultTypes} from './ActionResult';
import WonEngine from 'WonEngine';
import {WeaponTypes} from "../../../localData/types";
import ActionResult from "./ActionResult";
import {addLog} from 'WonUI/Interface/LogList/reducer';
import {workMap, Actions} from "./actions";
import {updateItems} from 'WonUI/Interface/OverView/reducer'

/*
    WorkerSystem workflow
    +-------+
    |Work   |
    +---+---+
        |
        v
    +-------+            +--------------+
    |Start  +-----+----->|PlayThunk     +-----------------+
    +-------+     |      +--------------+                 |
                  |            | ^                        |
                  |            v |                        |
                  |      +--------------+                 |
                  +----->|PlayActionList|                 |
                  |      +--------------+                 |
                  |            | ^                        |
                  |            v |                        |
                  |      +--------------+        +------+ |
                  +----->|PlayAction    +------->|System| |
                         |              |<-------+      | |
                         +--------------+        +------+ |
                               | ^                        |
                               v |                        |
    +-------+            +--------------+                 |
    |Finish |<-----------+ActionResult  |<----------------+
    +-------+            +--------------+
 */

export default class Work {
    constructor(type, coordX, coordY, workData) {
        this.id = `${type}_${coordX}_${coordY}`;
        this.type = type;
        this.data = workData;
        this.state = workState.IDLE;
        this.worker = null;
        this.coords = new PIXI.Point(coordX, coordY);
    }


    async start(entity) {
        const {dispatch} = WonEngine.getInstance().store;
        const {workerSystem} = WonEngine.getInstance().systems;
        const {target} = this.data;

        this.state = workState.START;

        const workMapData = workMap[this.type](this, entity);

        let result;

        if (typeof workMapData === 'function') {
            result = await workMapData();
        }
        if (Array.isArray(workMapData)) {
            result = await playActionList(entity, workMapData);
        }

        if (result.type !== resultTypes.SUCCESS) {
            this.state = workState.STOP;
            dispatch(addLog(result.payload));
            dispatch(updateItems());
        }

        if (target) {
            if (target.commandSprite) {
                target.commandSprite.texture = PIXI.Texture.EMPTY;
            }
        }

        this.state = workState.FINISH;
        workerSystem.finishWork(this.id);

        const {entityMgr} = WonEngine.getInstance().plugins;
        if (this.type === 'CRAFT') {
            const factory = entityMgr.getEntity('OBJECT', this.coords.x, this.coords.y);
        }

        dispatch(updateItems());
    }
}

export async function playAction(entity, actionType, props) {
    const currentAction = Actions[actionType];

    if (!currentAction) {
        return new ActionResult(`${actionType} does not exist.`, resultTypes.ERROR);
    }

    let actionResult;
    console.log(`Started action[${actionType}]`);
    actionResult = await currentAction(entity, props);


    if (actionResult.type !== resultTypes.SUCCESS) {
        console.log(`Stopped action[${actionType}] ${actionResult.payload}`);
    }
    return actionResult;
}

export async function playActionList(entity, actionList) {
    let previousResult = {};
    let actionResult;
    for (const [actionType, getProps] of actionList) {

        actionResult = await playAction(entity, actionType, getProps(previousResult) || {});

        if (actionResult.type !== resultTypes.SUCCESS) {
            return actionResult;
        }

        previousResult = {
            ...previousResult,
            ...actionResult.payload,
        };

        console.log(`Finished action[${actionType}]`);
    }
    return actionResult;
}
