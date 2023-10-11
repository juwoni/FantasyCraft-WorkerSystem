import WonEngine from 'WonEngine'
import {sleep, posToCoords} from 'WonEngine/utils';
import ActionResult from "../ActionResult";

export default async (worker, props) => {

    return Promise.resolve(new ActionResult());
};