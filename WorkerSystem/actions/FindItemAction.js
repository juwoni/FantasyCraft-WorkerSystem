import WonEngine from 'WonEngine';
import ActionResult, {resultTypes} from "../ActionResult";

export default async (entity, props) => {
    const {itemIndex} = props;
    const {itemMgr} = WonEngine.getInstance().plugins;
    const foundItem = itemMgr.getItemByIndex(itemIndex);

    return foundItem;
}