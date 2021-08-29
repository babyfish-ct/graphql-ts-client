import 'reflect-metadata';
import { Node } from '../model/Node';
export declare class NodeService {
    node(id: String): Promise<Node | undefined>;
}
