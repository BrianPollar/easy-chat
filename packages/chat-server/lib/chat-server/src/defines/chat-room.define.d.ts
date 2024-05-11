import { TroomEvent } from '../../../chat-shared/types/union.types';
import Onlinepeer from './peer.define';
import RoomBase from './room-base.define';
/**
 * Represents the response object for handling socket requests.
 */
export interface InowhandleSocketRequestRes {
    /**
     * Indicates whether the request was successful.
     */
    success: boolean;
    /**
     * The error message, if any.
     */
    err: string;
    /**
     * The message to be sent to the client.
     */
    msg: string;
}
/**
 * Represents a chatroom in the chat server.
 */
export default class Chatroom extends RoomBase {
    id: string;
    userId: string;
    private cb;
    protected bornTime: number;
    protected reqString: string;
    protected notifString: string;
    /**
     * Represents a chat room.
     * @constructor
     * @param id - The room id.
     * @param userId - The user id.
     * @param cb - The callback function.
     */
    constructor(id: string, // the room id
    userId: string, cb: (...args: any[]) => void);
    /**
     * Creates a new chatroom instance.
     * @param roomId - The ID of the chatroom.
     * @param userId - The ID of the user creating the chatroom.
     * @param cb - The callback function to be executed after creating the chatroom.
     * @returns A new instance of the Chatroom class.
     */
    static create(roomId: string, userId: string, cb: (...args: any[]) => void): Chatroom;
    /**
     * Handles a socket request from a peer.
     * @param peer The online peer making the request.
     * @param request The request object.
     * @param cb The callback function to be called after processing the request.
     * @returns A promise that resolves to an object containing the response.
     */
    nowhandleSocketRequest(peer: Onlinepeer, request: any, cb: any): Promise<InowhandleSocketRequestRes>;
    /**
     * Emits an event with the specified name and data.
     * @param eventName - The name of the event.
     * @param data - The data to be passed along with the event.
     */
    protected emitEvent(eventName: TroomEvent, data?: any): void;
}
