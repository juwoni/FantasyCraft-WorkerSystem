export const resultTypes = {
    NULL: 'NULL',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
    ERROR: 'ERROR'
};

export default class ActionResult {
    constructor(payload, type) {
        this.type = type || resultTypes.SUCCESS;
        this.payload = payload || {};
    }
}