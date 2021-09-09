/*
 * Copy from 
 * https://github.com/relay-tools/relay-hooks/blob/36658e00ed40b7eb6236ae1eaa29bd1f73cbc24c/examples/relay-hook-example/pagination-nextjs-ssr/relay/connection.ts
 */

import {
    ConnectionInterface,
    generateClientID,
    HandleFieldPayload,
    RecordSourceProxy,
} from 'relay-runtime';
import { buildConnectionEdge } from 'relay-runtime/lib/handlers/connection/ConnectionHandler';
const NEXT_EDGE_INDEX = '__connection_next_edge_index';

export function update(store: RecordSourceProxy, payload: HandleFieldPayload): void {
    const record = store.get(payload.dataID);
    if (!record) {
        return;
    }

    const {
        EDGES,
        END_CURSOR,
        HAS_NEXT_PAGE,
        HAS_PREV_PAGE,
        PAGE_INFO,
        PAGE_INFO_TYPE,
        START_CURSOR,
    } = ConnectionInterface.get();

    const serverConnection = record.getLinkedRecord(payload.fieldKey);
    const serverPageInfo = serverConnection && serverConnection.getLinkedRecord(PAGE_INFO);
    if (!serverConnection) {
        record.setValue(null, payload.handleKey);
        return;
    }
    // In rare cases the handleKey field may be unset even though the client
    // connection record exists, in this case new edges should still be merged
    // into the existing client connection record (and the field reset to point
    // to that record).
    const clientConnectionID = generateClientID(record.getDataID(), payload.handleKey);
    const clientConnectionField = record.getLinkedRecord(payload.handleKey);
    const clientConnection = clientConnectionField
        ? clientConnectionField
        : store.get(clientConnectionID);
    let clientPageInfo = clientConnection && clientConnection.getLinkedRecord(PAGE_INFO);
    if (!clientConnection) {
        // Initial fetch with data: copy fields from the server record
        const connection = store.create(clientConnectionID, serverConnection.getType());
        connection.setValue(0, NEXT_EDGE_INDEX);
        connection.copyFieldsFrom(serverConnection);
        let serverEdges: any = serverConnection.getLinkedRecords(EDGES);
        if (serverEdges) {
            serverEdges = serverEdges.map((edge: any) => buildConnectionEdge(store, connection, edge));
            connection.setLinkedRecords(serverEdges, EDGES);
        }
        record.setLinkedRecord(connection, payload.handleKey);

        clientPageInfo = store.create(
            generateClientID(connection.getDataID(), PAGE_INFO),
            PAGE_INFO_TYPE,
        );
        clientPageInfo.setValue(false, HAS_NEXT_PAGE);
        clientPageInfo.setValue(false, HAS_PREV_PAGE);
        clientPageInfo.setValue(null, END_CURSOR);
        clientPageInfo.setValue(null, START_CURSOR);
        if (serverPageInfo) {
            clientPageInfo.copyFieldsFrom(serverPageInfo);
        }
        connection.setLinkedRecord(clientPageInfo, PAGE_INFO);
    } else {
        if (clientConnectionField == null) {
            // If the handleKey field was unset but the client connection record
            // existed, update the field to point to the record
            record.setLinkedRecord(clientConnection, payload.handleKey);
        }
        const connection = clientConnection;
        // Subsequent fetches:
        // - updated fields on the connection
        // - merge prev/next edges, de-duplicating by node id
        // - synthesize page info fields
        let serverEdges: any = serverConnection.getLinkedRecords(EDGES);
        if (serverEdges) {
            serverEdges = serverEdges.map((edge: any) => buildConnectionEdge(store, connection, edge));
        }
        const prevEdges = connection.getLinkedRecords(EDGES);
        const prevPageInfo = connection.getLinkedRecord(PAGE_INFO);
        connection.copyFieldsFrom(serverConnection);
        // Reset EDGES and PAGE_INFO fields
        if (prevEdges) {
            connection.setLinkedRecords(prevEdges, EDGES);
        }
        if (prevPageInfo) {
            connection.setLinkedRecord(prevPageInfo, PAGE_INFO);
        }

        let nextEdges: any = [];
        //const args = payload.args;
        if (prevEdges && serverEdges) {
            // The connection was refetched from the beginning/end: replace edges
            nextEdges = serverEdges;
        } else if (serverEdges) {
            nextEdges = serverEdges;
        } else {
            nextEdges = prevEdges;
        }
        // Update edges only if they were updated, the null check is
        // for Flow (prevEdges could be null).
        if (nextEdges != null && nextEdges !== prevEdges) {
            connection.setLinkedRecords(nextEdges, EDGES);
        }
        if (clientPageInfo && serverPageInfo) {
            clientPageInfo.copyFieldsFrom(serverPageInfo);
        }
    }
}