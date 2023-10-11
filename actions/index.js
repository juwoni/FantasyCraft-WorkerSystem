import localData from 'localData';
import {WeaponTypes, EntityTypes} from "localData/types";

import MoveAction from "./MoveAction";
import ChopWoodAction from "./ChopWoodAction";
import GetItemAction from "./GetItemAction";
import FindZoneAction from "./FindZoneAction";
import BuildAction from "./BuildAction";
import PlaceItemAction from "./SaveitemAction";
import GrowAction from "./GrowAction";
import EscapeAction from "./EscapeAction";
import DestroyAction from './DestroyAction';
import AttackAction from './AttackAction';
import RangeAttackAction from './RangeAttackAction';
import CarryMaterialAction from "WonEngine/systems/WorkerSystem/actions/CarryMaterialAction";

import {resultTypes} from '../ActionResult';
import WonEngine from 'WonEngine';
import {actionTypes, workDataTypes, workTypes, workState, gageTypes} from "WonEngine/config";
import {generateUniqueId, posToCoords, sleep, toScaledPos} from "WonEngine/utils";
import {playActionList} from '../Work';

import ActionResult from "../ActionResult";
import {addLog} from 'WonUI/Interface/LogList/reducer';
import {playAction} from "WonEngine/systems/WorkerSystem/Work";
import {itemMap} from "localData/items";

export const Actions = {
    [actionTypes.MOVE]: MoveAction,
    [actionTypes.CHOP_WOOD]: ChopWoodAction,
    [actionTypes.GET_ITEM]: GetItemAction,
    [actionTypes.FIND_ZONE]: FindZoneAction,
    [actionTypes.SAVE_ITEM]: PlaceItemAction,
    [actionTypes.BUILD]: BuildAction,
    [actionTypes.GROW]: GrowAction,
    [actionTypes.ESCAPE]: EscapeAction,
    [actionTypes.DESTROY]: DestroyAction,
    [actionTypes.ATTACK]: AttackAction,
    [actionTypes.RANGE_ATTACK]: RangeAttackAction,
    [actionTypes.CARRY_MATERIAL]: CarryMaterialAction,
};

export const actionListMap = {
    [workTypes.MOVE]: (work) => {
        const {destPosition} = work.data;
        return [
            [actionTypes.MOVE, result => ({
                destCoords: posToCoords(destPosition),
            })],
        ]
    },

    [workTypes.DESTROY]: (work, entity) => {
        const {target} = work.data;
        const {equipments} = entity;

        if (equipments.weapon && equipments.weapon.weaponType === WeaponTypes.BOW) {
            return [
                [actionTypes.RANGE_ATTACK, result => ({
                    target,
                })],
                [actionTypes.DESTROY, result => ({
                    target,
                })],
            ]
        }

        return [
            [actionTypes.MOVE, result => ({
                destCoords: posToCoords(target.sprite.position),
            })],
            [actionTypes.ATTACK, result => ({
                target,
            })],
            [actionTypes.DESTROY, result => ({
                target,
            })],
        ]
    },
    [workTypes.GROW]: (work) => {
        const {target} = work.data;
        return [
            [actionTypes.MOVE, result => ({
                destCoords: posToCoords(target.sprite.position),
                cutLastPath: false,
                // merge: true
            })],
            [actionTypes.GROW, result => ({
                target,
                destPosition: target.sprite.position,
                // itemIndex: target.itemIndex,
            })],
        ]
    },

    [workTypes.SAVE_ITEM]: (work, entity) => {
        const {target} = work.data;

        if (entity.inventory.item) {
            return [
                [actionTypes.FIND_ZONE, result => ({})],
                [actionTypes.MOVE, ({placeCoords}) => ({
                    destCoords: placeCoords,
                    cutLastPath: false,
                })],
                [actionTypes.SAVE_ITEM, result => ({
                    placedItemIndex: 1,
                    placeCoords: result.destCoords,
                })],
                [actionTypes.MOVE, result => ({
                    destCoords: posToCoords(target.sprite.position),
                    cutLastPath: false,
                })],
                [actionTypes.GET_ITEM, result => ({
                    destCoords: posToCoords(target.sprite.position),
                })],
                [actionTypes.FIND_ZONE, result => ({})],
                [actionTypes.MOVE, ({placeCoords}) => ({
                    destCoords: placeCoords,
                    cutLastPath: false,
                })],
                [actionTypes.SAVE_ITEM, result => ({
                    placeCoords: result.destCoords,
                })],
            ];
        }

        return [
            [actionTypes.MOVE, result => ({
                destCoords: posToCoords(target.sprite.position),
                cutLastPath: false,

            })],
            [actionTypes.GET_ITEM, result => ({
                destCoords: posToCoords(target.sprite.position),
            })],
            [actionTypes.FIND_ZONE, result => ({})],
            [actionTypes.MOVE, ({placeCoords}) => ({
                destCoords: placeCoords,
                cutLastPath: false,
            })],
            [actionTypes.SAVE_ITEM, result => ({
                placeCoords: result.destCoords,
            })],
        ];
    },

    [workTypes.CHOP_WOOD]: (work) => {
        const {target} = work.data;

        return [
            [actionTypes.MOVE, result => ({
                destCoords: posToCoords(target.sprite.position),
            })],
            [actionTypes.ATTACK, result => ({
                target,
            })],
            [actionTypes.CHOP_WOOD, result => ({
                target,
            })],
        ];
    },
};
const FAILED_NOT_ENOUGH_ITEMS = 'FAILED_NOT_ENOUGH_ITEMS';

export const thunkMap = {
    [workTypes.CRAFT]: (work, worker) => async () => {
        const {entityMgr, localDataMgr} = WonEngine.getInstance().plugins;
        const {target, product} = work.data;
        let usedMaterials = [];
        let actionResult = null;

        actionResult = await playAction(worker, actionTypes.CARRY_MATERIAL, {
            requiredMaterials: localDataMgr.createRequiredMaterials(product),
            destCoords: target.coords,
        });

        if (actionResult.type !== resultTypes.SUCCESS) {
            return actionResult;
        }

        usedMaterials = actionResult.payload.usedMaterials;

        const CRAFTING_TIME = 500;
        worker.gage.setGageType(gageTypes.WORK);
        worker.gage.show();
        worker.gage.update(undefined, gageTypes.WORK, CRAFTING_TIME);
        await sleep(CRAFTING_TIME);
        worker.gage.hide();

        for (const materialId of usedMaterials) {
            entityMgr.deleteEntityById(EntityTypes.ITEM, materialId);
        }

        worker.inventory.update(entityMgr.addEntityByIndex('ITEM', product.index));

        actionResult = await playActionList(worker, [
            [actionTypes.FIND_ZONE, result => ({})],
            [actionTypes.MOVE, ({placeCoords}) => ({
                destCoords: placeCoords,
                cutLastPath: false,
            })],
            [actionTypes.SAVE_ITEM, result => ({
                placeCoords: result.destCoords,
            })],
        ]);

        if (actionResult.type !== resultTypes.SUCCESS) {
            return actionResult;
        }

        return actionResult;
    },
    [workTypes.BUILD]: (work, entity) => async () => {
        const {entityMgr, buildMgr, itemMgr, localDataMgr} = WonEngine.getInstance().plugins;
        const {itemIndex} = work.data;
        const destCoords = work.coords;
        const buildItemData = localDataMgr.getItemData('OBJECT', itemIndex);
        let actionResult = null;
        let usedMaterials = [];

        if (buildItemData.materials) {
            const buildEntity = entityMgr.getEntity('BUILD', destCoords.x, destCoords.y);
            if (!buildEntity) {
                return new ActionResult('BUILD_ENTITY_IS_NOT_EXISTED', resultTypes.FAIL);
            }

            while (buildEntity.requiredMaterials.length) {
                const materialItem = itemMgr.getMaterialItem(buildEntity.requiredMaterials[0].itemIndex);

                if (!materialItem) {
                    return new ActionResult(FAILED_NOT_ENOUGH_ITEMS, resultTypes.FAIL);
                }

                const materialItemCoords = posToCoords(materialItem.sprite.position);

                actionResult = await playActionList(entity, [
                    [actionTypes.MOVE, result => ({
                        destCoords: materialItemCoords,
                        cutLastPath: false,
                    })],
                    [actionTypes.GET_ITEM, result => ({
                        destCoords: materialItemCoords,
                    })],
                    [actionTypes.MOVE, result => ({
                        destCoords,
                        // merge: true
                    })],
                    [actionTypes.SAVE_ITEM, result => ({
                        placeCoords: destCoords,
                    })],
                ]);

                if (actionResult.type !== resultTypes.SUCCESS) {
                    return actionResult;
                }

                if (--buildEntity.requiredMaterials[0].count <= 0) {
                    buildEntity.requiredMaterials.shift();
                }
                usedMaterials.push(materialItem.id);
            }

        }

        actionResult = await playActionList(entity, [
            [actionTypes.MOVE, result => ({
                destCoords,
                // merge: true
            })],
            [actionTypes.BUILD, result => ({
                destCoords,
                itemIndex,
            })],
            [actionTypes.ESCAPE, result => ({
                wallType: 'OBJECT'
            })],
        ]);

        if (actionResult.type !== resultTypes.SUCCESS) {
            return actionResult;
        }

        for (const materialId of usedMaterials) {
            entityMgr.deleteEntityById(EntityTypes.ITEM, materialId);
        }

        return Promise.resolve(actionResult);
    },
};

export const workMap = {
    ...actionListMap,
    ...thunkMap,
};