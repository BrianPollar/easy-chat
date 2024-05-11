/// <reference types="node" />
import { EventEmitter } from 'events';
import { Socket } from 'socket.io';
import Chatroom from './chat-room.define';
import Onlineroom from './online-room.define';
/**
 * Represents an online peer in the chat server.
 * @extends EventEmitter
 */
export default class Onlinepeer extends EventEmitter {
    id: string;
    socket: Socket;
    room: Chatroom | Onlineroom;
    /** rooms a peer has */
    /** if peer has joined main room */
    joined: boolean;
    address: string;
    /** if peer is closed or not */
    closed: boolean;
    /** check disconnect counter value */
    disconnectCheck: number;
    intervalHandler: any;
    /** peers joining time */
    enterTime: number;
    lastSeen: Date;
    /**
     * Creates an instance of Onlinepeer.
     * @param {string} id - The ID of the peer.
     * @param {Socket} socket - The socket associated with the peer.
     * @param {Chatroom | Onlineroom} room - The room the peer belongs to.
     */
    constructor(id: string, socket: Socket, room: Chatroom | Onlineroom);
    /**
     * Closes the peer object.
     */
    close(): void;
    /**
     * Leaves the current room.
     */
    leaveRoom(): void;
    /**
     * Handles the peer's attempt to reconnect to a room.
     * @param {Socket} socket - The new socket associated with the peer.
     * @param {boolean} [isMain=false] - Indicates if the peer is reconnecting to the main room.
     */
    handlePeerReconnect(socket: Socket, isMain?: boolean): void;
    /**
     * Listens to the socket disconnect and error events for the peer object.
     */
    handlePeer(): void;
    /**
     * Closes the peer if the disconnectCheck is greater than 6.
     */
    checkClose(): void;
    /**
     * Returns information about the peer.
     * @returns {object} - The peer information.
     */
    peerInfo(): {
        id: string;
        address: string;
        durationTime: number;
    };
    /**
     * Closes the resource.
     */
    protected closeResource(): void;
}
