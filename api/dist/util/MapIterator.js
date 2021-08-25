"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iterateMap = void 0;
/*
 * Use may disable the TS config "downlevelIteration",
 * so, use the wrap method in the generated source code
 */
function iterateMap(map, onEach) {
    for (const pair of map) {
        onEach(pair);
    }
}
exports.iterateMap = iterateMap;
