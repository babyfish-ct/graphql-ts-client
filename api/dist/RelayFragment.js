"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayFragment = void 0;
/*
 * Example:
 *
 * export const DEPARTMENT_FRAGMENT =
 *     department$
 *     .id
 *     .name
 *     .employees(
 *         employee$
 *         .id
 *         .firstName
 *         .lastName
 *     )
 *     .asRelayFragment("departmentFragment");
 */
class RelayFragment {
    constructor(fragmentName, fetcher) {
        this.fragmentName = fragmentName;
        this.fetcher = fetcher;
    }
    static create(fragmentName, fetcher) {
        if (RELAY_FRAGMENT_MAP.has(fragmentName)) {
            throw new Error(`The relay fragment '${fragmentName} is aleary exists, please make sure: \n'` +
                "1. each relay fragment is declared as constant under GLOBAL scope\n" +
                "2. each relay fragment has a unique name");
        }
        const relayFragment = new RelayFragment(fragmentName, fetcher);
        RELAY_FRAGMENT_MAP.set(fragmentName, relayFragment);
        return relayFragment;
    }
}
exports.RelayFragment = RelayFragment;
const RELAY_FRAGMENT_MAP = new Map();
