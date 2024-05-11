import { Socket } from 'socket.io-client';
import { EasyChatController } from './controllers/chat.controller';
import { EventbusController } from './controllers/eventbus.controller';
/**
 * Represents the response of sending an online solo request.
 */
/**
 * Represents the response of sending an online solo request.
 */
export interface IsendOnlineSoloRequestRes {
    /**
     * Indicates whether the request was successful or not.
     */
    success: boolean;
    /**
     * The response data, if available.
     */
    response?: any;
    /**
     * The error, if any occurred during the request.
     */
    err?: any;
}
/**
 * Initializes the EasyChat client with the provided parameters.
 * @param url - The URL of the WebSocket server.
 * @param userId - The ID of the user.
 * @param userNames - The name(s) of the user.
 * @param userPhotoUrl - The URL of the user's photo.
 * @returns An object containing the EasyChat client and controller instances.
 */
export declare const initEasyChat: (url: string, userId: string, userNames: string, userPhotoUrl: string) => {
    easyChatClient: EasyChatClient;
    easyChatController: EasyChatController;
};
/**
 * Represents an EasyChatClient that connects to a WebSocket server and handles chat-related functionality.
 * @class
 */
export declare class EasyChatClient {
    private url;
    private id;
    static mode: string;
    activeUsers: Map<string, string>;
    eventbus: EventbusController;
    private socket;
    private logger;
    /**
     * Creates a new instance of the WebSocket class.
     * @param url The URL of the WebSocket server.
     * @param id The ID of the WebSocket connection.
     */
    constructor(url: string, id: string);
    /**
     * Gets the current socket.
     * @returns The current socket.
     */
    get currSocket(): Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
    /**
     * Handles the event when a room is created.
     * @param {any} data - The data associated with the event.
     */
    private roomCreated;
    /**
     * Sends a chat message through the event bus.
     * @param data - The data of the chat message.
     */
    private chatMessage;
    /**
     * Deletes a message.
     * @param data - The data of the message to be deleted.
     */
    private deleteMessage;
    /**
     * Creates a new peer and emits a chat event with the specified data.
     * @param data The data to be passed to the chat event.
     */
    private newPeer;
    /**
     * Creates a new main peer.
     * @param data The data for the new main peer.
     */
    private newMainPeer;
    /**
     * Handles the event when the peer is closed.
     * @param {any} data - The data associated with the event.
     */
    private peerClosed;
    /**
     * Handles the event when the main peer is closed.
     * @param {any} data - The data associated with the event.
     */
    private mainPeerClosed;
    /**
     * Updates the status and notifies the chat event bus.
     * @param data - The data to be passed to the chat event bus.
     */
    private updateStatus;
    /**
     * Updates the peer with the provided data.
     * @param data - The data to update the peer with.
     */
    private updatePeer;
    /**
     * Updates the room with the provided data.
     * @param data - The data to update the room with.
     */
    private updateRoom;
    /**
     * Updates the room on new data.
     * @param data - The new data to update the room with.
     */
    private updateRoomOnNew;
    /**
     * Checks if the socket is connected.
     * @returns {boolean} True if the socket is connected, false otherwise.
     */
    isSocketConnected(): boolean;
    /**
     * Disconnects the socket connection.
     */
    disconectSocket(): void;
    /**
     * Connects to the WebSocket server.
     * @param id - The user ID.
     * @param url - The URL of the WebSocket server.
     */
    connect(id?: string, url?: string): void;
    /**
     * Sends a request to the server using the WebSocket connection.
     * @param method The method name of the request.
     * @param data The data to be sent with the request (optional).
     * @param timeOut The timeout duration for the request in milliseconds (default: 10000).
     * @returns A Promise that resolves with the response from the server.
     * @throws If there is no socket connection or if the request times out.
     */
    sendRequest(method: any, data?: any, timeOut?: number): Promise<unknown>;
    /**
     * Sends an online solo request to the server.
     * @param method - The method of the request.
     * @param data - The data to be sent with the request (optional).
     * @param timeOut - The timeout duration for the request (default: 10000ms).
     * @returns A promise that resolves with the response from the server.
     * @throws If there is no socket connection or if the request times out.
     */
    sendOnlineSoloRequest(method: any, data?: any, timeOut?: number): Promise<unknown>;
    /**
     * Sets a timeout for the given callback function.
     * If the callback is not called within the specified time, an error is thrown.
     * @param {Function} callback - The callback function to be called.
     * @param {number} timeOut - The timeout duration in milliseconds. Default is 10000ms.
     * @returns {Function} - A wrapper function that can be used to call the original callback function.
     */
    timeoutCallback(callback: any, timeOut?: number): (...args: any[]) => void;
    /**
     * Disconnects the WebSocket connection.
     */
    disconnect(): void;
    /**
     * Sets up event handlers for the socket connection.
     * @param socket - The socket object.
     */
    private setupEventHandler;
    /**
     * Sets up the notification handler for the WebSocket connection.
     * The handler listens for the 'mainnotification' event and executes the corresponding method based on the received request.
     */
    private setupNotificationHandler;
}
