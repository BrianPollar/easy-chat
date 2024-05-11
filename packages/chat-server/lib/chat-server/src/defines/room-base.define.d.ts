/// <reference types="node" />
import { EventEmitter } from 'events';
import { Socket } from 'socket.io';
import { ECHATMETHOD } from '../../../chat-shared/enums/chat.enum';
import Chatroom from './chat-room.define';
import Onlinepeer from './peer.define';
/**
 * This class is the base class for all chat rooms.
 */
export default abstract class RoomBase extends EventEmitter {
    id: string;
    /** The list of peers in the room. */
    peers: Map<string, Onlinepeer>;
    /** The list of chat rooms in the room. */
    rooms: Map<string, Chatroom>;
    /** If the room is closed or not. */
    closed: boolean;
    /** The time when the room was last active. */
    activeTime: number;
    /** The time when the room was created. */
    protected bornTime: number;
    protected reqString: string;
    protected notifString: string;
    /**
     * Constructs a new RoomBase instance.
     *
     * @param id The ID of the room.
     */
    constructor(id: string);
    /**
     * Sets up the socket handler for the room.
     *
     * @param peer The peer that the handler is being set up for.
     */
    setupSocketHandler(peer: Onlinepeer): void;
    /**
     * Handles a new peer joining the room.
     *
     * @param peer The peer that is joining the room.
     */
    handlePeer(peer: Onlinepeer): void;
    /**
     * The `getPeer()` method returns the peer with the specified ID, or `null` if the peer does not exist.
     * @param peerId The peerId for the return peer.
     */
    getPeer(peerId: string): Onlinepeer;
    /**
     * Closes the room and releases all resources associated with it.
     */
    close(): void;
    /**
     * Checks if the room is deserted and closes it if necessary.
     */
    checkDeserted(): void;
    /**
     * Generates a status report for the room.
     * @returns An object containing the room's ID, list of peers, duration since creation (in seconds), and time since last activity (in seconds).
     */
    statusReport(): {
        id: string;
        peers: string[];
        duration: number;
        lastActive: number;
    };
    /**
     * Sends a message to all peers in the room.
     * @param {string} peerId - The ID of the peer sending the message.
     * @param {ECHATMETHOD} method - The method of the message.
     * @param {any} data - The data of the message.
     */
    sendMsgToallpeers(peerId: string, method: ECHATMETHOD, data: any): void;
    /**
     * Sends a notification to the specified socket.
     * @param socket - The socket to send the notification to.
     * @param method - The method of the notification.
     * @param data - The data associated with the notification.
     * @param broadcast - Indicates whether the notification should be broadcasted to all sockets in the room.
     */
    protected nownotification(socket: Socket, method: any, data?: {}, broadcast?: boolean): void;
    /**
     * Sets the active time for the room.
     */
    private setActive;
    /**
     * Checks if the room is empty.
     * @returns {boolean} True if the room is empty, false otherwise.
     */
    private checkEmpty;
    abstract nowhandleSocketRequest(peer: Onlinepeer, request: any, cb: any): Promise<any>;
}
