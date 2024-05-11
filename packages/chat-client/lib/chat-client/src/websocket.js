"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyChatClient = exports.initEasyChat = void 0;
const tslib_1 = require("tslib");
const socket_io_client_1 = require("socket.io-client");
const chat_enum_1 = require("../../chat-shared/enums/chat.enum");
const chat_controller_1 = require("./controllers/chat.controller");
const eventbus_controller_1 = require("./controllers/eventbus.controller");
const logger_controller_1 = require("./controllers/logger.controller");
/**
 * The timeout duration (in milliseconds) for a request.
 */
const requestTimeout = 10000;
/**
 * Map that stores chat notifications.
 * The key is the notification ID and the value is the notification message.
 */
const chatNotificationMap = new Map();
/**
 * Decorator function for chat notification.
 * @param ref - The reference for the chat notification.
 * @returns The modified property descriptor.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const chatNotification = (ref = '') => (target, propertyKey, descriptor) => {
    if (ref) {
        chatNotificationMap.set(ref, propertyKey);
    }
    else {
        chatNotificationMap.set(propertyKey, propertyKey);
    }
};
/**
 * Initializes the EasyChat client with the provided parameters.
 * @param url - The URL of the WebSocket server.
 * @param userId - The ID of the user.
 * @param userNames - The name(s) of the user.
 * @param userPhotoUrl - The URL of the user's photo.
 * @returns An object containing the EasyChat client and controller instances.
 */
const initEasyChat = (url, userId, userNames, userPhotoUrl) => {
    const easyChatClient = new EasyChatClient(url, userId);
    const easyChatController = new chat_controller_1.EasyChatController(easyChatClient, userId, userNames, userPhotoUrl, 'chatElementId');
    easyChatClient.connect();
    return { easyChatClient, easyChatController };
};
exports.initEasyChat = initEasyChat;
/**
 * Represents an EasyChatClient that connects to a WebSocket server and handles chat-related functionality.
 * @class
 */
class EasyChatClient {
    /**
     * Creates a new instance of the WebSocket class.
     * @param url The URL of the WebSocket server.
     * @param id The ID of the WebSocket connection.
     */
    constructor(url, id) {
        this.url = url;
        this.id = id;
        this.activeUsers = new Map();
        this.eventbus = new eventbus_controller_1.EventbusController();
        this.logger = new logger_controller_1.LoggerController();
    }
    /**
     * Gets the current socket.
     * @returns The current socket.
     */
    get currSocket() {
        return this.socket;
    }
    /**
     * Handles the event when a room is created.
     * @param {any} data - The data associated with the event.
     */
    roomCreated(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.ROOM_CREATED,
            data
        });
    }
    /**
     * Sends a chat message through the event bus.
     * @param data - The data of the chat message.
     */
    chatMessage(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.CHAT_MESSAGE,
            data
        });
    }
    /**
     * Deletes a message.
     * @param data - The data of the message to be deleted.
     */
    deleteMessage(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.DELETE_MESSAGE,
            data
        });
    }
    /**
     * Creates a new peer and emits a chat event with the specified data.
     * @param data The data to be passed to the chat event.
     */
    newPeer(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.NEW_PEER,
            data
        });
    }
    /**
     * Creates a new main peer.
     * @param data The data for the new main peer.
     */
    newMainPeer(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.NEW_MAIN_PEER,
            data
        });
    }
    /**
     * Handles the event when the peer is closed.
     * @param {any} data - The data associated with the event.
     */
    peerClosed(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.PEER_CLOSE,
            data
        });
    }
    /**
     * Handles the event when the main peer is closed.
     * @param {any} data - The data associated with the event.
     */
    mainPeerClosed(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.MAIN_PEER_CLOSE,
            data
        });
    }
    /**
     * Updates the status and notifies the chat event bus.
     * @param data - The data to be passed to the chat event bus.
     */
    updateStatus(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.UPDATE_STATUS,
            data
        });
    }
    /**
     * Updates the peer with the provided data.
     * @param data - The data to update the peer with.
     */
    updatePeer(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.PEER_UPDATE,
            data
        });
    }
    /**
     * Updates the room with the provided data.
     * @param data - The data to update the room with.
     */
    updateRoom(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.UPDATE_ROOM,
            data
        });
    }
    /**
     * Updates the room on new data.
     * @param data - The new data to update the room with.
     */
    updateRoomOnNew(data) {
        this.eventbus.chat$.next({
            type: chat_enum_1.ECHATMETHOD.UPDATE_ROOMS_ON_NEW,
            data
        });
    }
    /**
     * Checks if the socket is connected.
     * @returns {boolean} True if the socket is connected, false otherwise.
     */
    isSocketConnected() {
        return Boolean(this.socket?.connected);
    }
    /**
     * Disconnects the socket connection.
     */
    disconectSocket() {
        this.socket.disconnect();
    }
    /**
     * Connects to the WebSocket server.
     * @param id - The user ID.
     * @param url - The URL of the WebSocket server.
     */
    connect(id = this.id, url = this.url) {
        const socketUrl = `${url}/?userId=${id}`;
        this.logger.debug('EasyChatClient:connect:: - socketUrl :', socketUrl);
        this.socket = (0, socket_io_client_1.io)(socketUrl, {
            timeout: 3000,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelayMax: 2000,
            transports: ['websocket']
        });
        this.setupEventHandler(this.socket);
        this.setupNotificationHandler();
    }
    /**
     * Sends a request to the server using the WebSocket connection.
     * @param method The method name of the request.
     * @param data The data to be sent with the request (optional).
     * @param timeOut The timeout duration for the request in milliseconds (default: 10000).
     * @returns A Promise that resolves with the response from the server.
     * @throws If there is no socket connection or if the request times out.
     */
    sendRequest(method, data, timeOut = 10000) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                this.logger.error('EasyChatClient:connect:: -', 'No socket connection');
                reject('No socket connection');
            }
            else {
                this.socket.emit('mainrequest', { method, data }, this.timeoutCallback((err, response) => {
                    if (err) {
                        this.logger.error('sendRequest %s timeout! socket: %o', method, this.socket);
                        reject(err);
                    }
                    else {
                        this.logger.debug('sendRequest response: %s', response);
                        resolve(response);
                    }
                }, timeOut));
            }
        });
    }
    /**
     * Sends an online solo request to the server.
     * @param method - The method of the request.
     * @param data - The data to be sent with the request (optional).
     * @param timeOut - The timeout duration for the request (default: 10000ms).
     * @returns A promise that resolves with the response from the server.
     * @throws If there is no socket connection or if the request times out.
     */
    sendOnlineSoloRequest(method, data, timeOut = 10000) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                this.logger.error('EasyChatClient:sendOnlineSoloRequest:: - connect -', 'No socket connection');
                reject('No socket connection');
            }
            else {
                this.socket.emit('onlinerequest', { method, data }, this.timeoutCallback((err, response) => {
                    if (err) {
                        this.logger.error('sendOnlineSoloRequest::sendRequest %s timeout! socket: %o', method, this.socket);
                        reject(err);
                    }
                    else {
                        resolve(response);
                    }
                }, timeOut));
            }
        });
    }
    /**
     * Sets a timeout for the given callback function.
     * If the callback is not called within the specified time, an error is thrown.
     * @param {Function} callback - The callback function to be called.
     * @param {number} timeOut - The timeout duration in milliseconds. Default is 10000ms.
     * @returns {Function} - A wrapper function that can be used to call the original callback function.
     */
    timeoutCallback(callback, timeOut = 10000) {
        let called = false;
        const interval = setTimeout(() => {
            if (called) {
                return;
            }
            called = true;
            this.logger.error('EasyChatClient:connect:: -', 'nowRequest timeout');
            callback(new Error('nowRequest timeout'));
        }, timeOut || requestTimeout);
        return (...args) => {
            if (called) {
                return;
            }
            called = true;
            clearTimeout(interval);
            callback(...args);
        };
    }
    /**
     * Disconnects the WebSocket connection.
     */
    disconnect() {
        if (this.socket.disconnected) {
            this.logger.debug('EasyChatClient:disconnect:: - socket already disconnected');
            return;
        }
        this.socket.disconnect();
    }
    /**
     * Sets up event handlers for the socket connection.
     * @param socket - The socket object.
     */
    setupEventHandler(socket) {
        socket.on('connect', () => {
            this.logger.debug('EasyChatClient:setupEventHandler:: - socket connected !');
            this.eventbus.chat$.next({
                type: chat_enum_1.ECHATMETHOD.SOCKET_CONNECTED
            });
        });
        socket.on('connect_error', () => {
            this.logger.warn('EasyChatClient:setupEventHandler:: - reconnect_failed !');
        });
        socket.on('connect_timeout', () => {
            this.logger.warn('EasyChatClient:setupEventHandler:: - connect_timeout !');
        });
        socket.on('disconnect', (reason) => {
            this.logger.error('EasyChatClient:setupEventHandler:: - Socket disconnect, reason: %s', reason);
            this.eventbus.chat$.next({
                type: chat_enum_1.ECHATMETHOD.SOCKET_DISCONNECTED
            });
        });
        socket.on('reconnect', attemptNumber => {
            this.logger.debug('EasyChatClient:setupEventHandler:: - "reconnect" event [attempts:"%s"]', attemptNumber);
        });
        socket.on('reconnect_failed', () => {
            this.logger.warn('EasyChatClient:setupEventHandler:: - reconnect_failed !');
        });
    }
    /**
     * Sets up the notification handler for the WebSocket connection.
     * The handler listens for the 'mainnotification' event and executes the corresponding method based on the received request.
     */
    setupNotificationHandler() {
        const socket = this.socket;
        socket.on('mainnotification', (request) => {
            this.logger.debug('EasyChatClient:setupNotificationHandler:: - mainnotification event, method: %s,data: %o', request.method, request.data);
            const regiMethod = chatNotificationMap.get(request.method);
            if (!regiMethod) {
                this.logger.warn('EasyChatClient:setupNotificationHandler:: - mainnotification method: %s, do not register!', request.method);
                return;
            }
            this[regiMethod](request.data);
        });
    }
}
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "roomCreated", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "chatMessage", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "deleteMessage", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "newPeer", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "newMainPeer", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "peerClosed", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "mainPeerClosed", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "updateStatus", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "updatePeer", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "updateRoom", null);
tslib_1.__decorate([
    chatNotification()
], EasyChatClient.prototype, "updateRoomOnNew", null);
exports.EasyChatClient = EasyChatClient;
//# sourceMappingURL=websocket.js.map