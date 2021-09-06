import { PageInfo } from "../model/PageInfo";

export function createConnection<TConnection, TEdge, TNode>(
    args: CreateConnectionArgs<TConnection, TEdge, TNode>
) {
    if (args.totalCount < 0) {
        throw new Error(`'totalCount' cannot be negative number`);
    }
    if (typeof args.first === 'number' && typeof args.last === 'number') {
        throw new Error(`'first' and 'last' cannot be specified at the same time`);
    }
    let from: number;
    let toExclusive: number;
    if (typeof args.first === 'number') {
        if (args.first < 0) {
            throw new Error(`'first' cannot be negative`);    
        }
        let index = args.after !== undefined && args.after !== null ? cursorToIndex(args.after) : -1;
        if (isNaN(index)) {
            throw new Error(`'after' is a invalid cursor`);
        }
        from = Math.max(0, index + 1);
        toExclusive = Math.max(0, Math.min(index + 1 + args.first, args.totalCount));
    } else if (typeof args.last === 'number') {
        if (args.last < 0) {
            throw new Error(`'last' cannot be negative`);
        }
        let index = args.before !== undefined && args.before !== null ? cursorToIndex(args.before) : args.totalCount;
        if (isNaN(index)) {
            throw new Error(`'before' is a invalid cursor`);
        }
        toExclusive = Math.max(0, Math.min(index, args.totalCount));
        from = Math.max(0, index - args.last);
    } else {
        from = 0;
        toExclusive = args.totalCount;
    }
    const nodes = from < toExclusive ? args.getNodes(from, toExclusive - from) : [];
    const edges = nodes.map((node, index) => {
        return args.createEdge(node, indexToCursor(from + index));
    });
    return args.createConnection(
        args.totalCount,
        edges,
        new PageInfo(
            toExclusive < args.totalCount, 
            from > 0, 
            indexToCursor(from), 
            indexToCursor(Math.max(from, toExclusive - 1))
        )
    )
}

interface CreateConnectionArgs<TConnection, TEdge, TNode> {

    readonly totalCount: number;
    getNodes(offset: number, count: number): TNode[];
    createEdge(node: TNode, cursor: string): TEdge;
    createConnection(totalCount: number, edges: TEdge[], pageInfo: PageInfo): TConnection;
    
    readonly first?: number | null;
    readonly after?: string | null;
    readonly last?: number | null;
    readonly before?: string | null;
}

function indexToCursor(index: number): string {
    return Buffer.from(index.toString(), 'utf-8').toString('base64');
}

function cursorToIndex(cursor: string): number {
    return parseInt(Buffer.from(cursor, 'base64').toString('utf-8'));
}