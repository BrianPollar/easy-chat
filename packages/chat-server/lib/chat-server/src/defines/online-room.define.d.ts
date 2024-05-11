import Chatroom, { InowhandleSocketRequestRes } from './chat-room.define';
import Onlinepeer from './peer.define';
import RoomBase from './room-base.define';
/**
 * Represents an online room.
 */
export default class Onlineroom extends RoomBase {
    id: string;
    private roomStatusInterval;
    peers: Map<string, Onlinepeer>;
    rooms: Map<string, Chatroom>;
    /**
     * Represents an online room.
     * @constructor
     * @param {string} id - The room id.
     * @param {number} roomStatusInterval - The interval in seconds for checking the room status.
     */
    constructor(id: string, // the room id
    roomStatusInterval: number);
    /**
     * Creates a new online room.
     * @param roomId - The ID of the room.
     * @param roomStatusInterval - The interval for updating the room status.
     * @returns A new instance of Onlineroom.
     */
    static create(roomId: string, roomStatusInterval: number): Onlineroom;
    /**
     * Handles a socket request from a peer.
     * @param peer - The online peer making the request.
     * @param request - The request object.
     * @param cb - The callback function to be called after processing the request.
     * @returns A promise that resolves to an object containing the response.
     */
    nowhandleSocketRequest(peer: Onlinepeer, request: any, cb: any): Promise<InowhandleSocketRequestRes>;
    /**
     * Calls the callback function with the specified event name and data.
     * @param eventName - The name of the event.
     * @param data - The data to pass to the callback function.
     */
    callBacFn: (eventName: string, data: any) => void;
}
