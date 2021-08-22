import { Fetcher } from "./Fetcher";

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

export class RelayFragment<E extends string, T extends object>  {

    private constructor(
        readonly fragmentName: string, 
        readonly fetcher: Fetcher<E, object>
    ) {
    }

    static create<E extends string, T extends object>(
        fragmentName: string, fetcher: Fetcher<E, T>
    ): RelayFragment<E, T> {

        if (RELAY_FRAGMENT_MAP.has(fragmentName)) {
            throw new Error(
                `The relay fragment '${fragmentName} is aleary exists, please make sure: \n'` +
                "1. each relay fragment is declared as constant under GLOBAL scope\n" +
                "2. each relay fragment has a unique name"
            );
        }
        const relayFragment = new RelayFragment<E, T>(fragmentName, fetcher);
        RELAY_FRAGMENT_MAP.set(fragmentName, relayFragment);
        return relayFragment;
    }
}

const RELAY_FRAGMENT_MAP = new Map<string, RelayFragment<string, object>>();