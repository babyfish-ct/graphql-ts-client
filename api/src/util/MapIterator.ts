/*
 * Use may disable the TS config "downlevelIteration",
 * so, use the wrap method in the generated source code 
 */
export function iterateMap<K, V>(
    map: ReadonlyMap<K, V>, 
    onEach: (pair: [K, V]) => void
) {
    for (const pair of map) {
        onEach(pair);
    }
}