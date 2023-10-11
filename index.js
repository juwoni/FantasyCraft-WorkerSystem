import {workState} from 'WonEngine/config';
import Work from './Work'
import {workTypes} from "../../config";
import {TeamTypes} from "localData/types";

export default class WorkerSystem {
    constructor() {
        this.entities = new Map();
        this.works = new Map();
    }

    setEntity(id, entity) {
        this.entities.set(id, entity);
    }

    getAssignedWork(type, coordX, coordY) {
        let assignedWork;
        switch (type) {
            default:
                assignedWork = this.works.get(`${type}_${coordX}_${coordY}`);
                break;
        }
        return assignedWork;
    }

    createWork(workType, coordX, coordY, workData) {
        if (this.getAssignedWork(workType, coordX, coordY)) {
            console.log('work is already assigned!');
            return null;
        }

        const work = new Work(workType, coordX, coordY, workData);
        this.works.set(work.id, work);
        return work;
    }

    init() {

    }

    finishWork(workId) {
        const work = this.works.get(workId);
        // error Cannot read property 'worker'
        const worker = work && work.worker;
        let result = false;
        if (!work) return false;

        if (work.state === workState.FINISH) {
            this.works.delete(workId);
            work.worker.preWork = null;
            console.log(`Work[${work.id}] deleted.`);

            if (worker.nextWork) {
                worker.startWork(worker.nextWork);
                worker.nextWork = null;
            }
            result = true;
        }

        // console.log(`finishWork result : ${result}`);
        return result;
    }

    update() {
        for (const entity of this.entities.values()) {
            const {worker} = entity;
            if (!worker.preWork) {
                for (const [workId, work] of this.works) {
                    if (work.state === workState.IDLE) {
                        worker.reserveWork(work);
                        break;
                    }
                }
            }

            if (worker.preWork) {
                if (worker.preWork.state === workState.RESERVED) {
                    (async () => {
                        // console.log(`worker.preWork ${worker.preWork}`);
                        await worker.preWork.start(entity);
                    })();
                }
            }
        }
    }

    release() {

    }
}