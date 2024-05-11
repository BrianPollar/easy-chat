/// <reference types="node" />
/// <reference types="node" />
import * as http from 'http';
import * as https from 'https';
import { Server, Socket } from 'socket.io';
import { IsocketConfig } from '../../chat-shared/interfaces/socket.interface';
import Onlineroom from './defines/online-room.define';
export declare class EasyChatServer {
    private httpsServer;
    private roomStatusInterval;
    private socketConfig;
    /**
     * general room on initial connect
     * This is the room that all users will be connected to when they first connect to the chat server.
     */
    onlineRoom: Onlineroom;
    /**
     *  io instance
     * This is the instance of the Socket.IO server that the chat application is running on.
     */
    io: Server;
    constructor(httpsServer: https.Server | http.Server, roomStatusInterval: number, socketConfig: Partial<IsocketConfig>);
    /**
      * Run web Socket server
      * This handles real time communication
      * This mostly handles media server rtc
      * connection operations
      */
    run(allowedCorsOrigins: string[]): void;
    /**
     * Emits an event to the online room.
     *
     * @param eventName - The name of the event to emit.
     * @param data - The data to send along with the event.
     */
    emitEvent(eventName: string, data: any): void;
    /**
      * Handle a new connection from a peer.
      *
      * @param socket The socket object for the new peer.
      */
    handleMainConnection(socket: Socket): void;
}
