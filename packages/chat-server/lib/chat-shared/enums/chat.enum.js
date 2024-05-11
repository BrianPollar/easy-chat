"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECHATMETHOD = void 0;
/**
 * Enum representing different chat methods.
 */
var ECHATMETHOD;
(function (ECHATMETHOD) {
    /**
     * Indicates a new peer has joined the chat.
     */
    ECHATMETHOD["NEW_PEER"] = "newPeer";
    /**
     * Indicates a new main peer has joined the chat.
     */
    ECHATMETHOD["NEW_MAIN_PEER"] = "newMainPeer";
    /**
     * Indicates a peer has closed.
     */
    ECHATMETHOD["PEER_CLOSE"] = "peerClosed";
    /**
     * Indicates the main peer has closed.
     */
    ECHATMETHOD["MAIN_PEER_CLOSE"] = "mainPeerClosed";
    /**
     * Indicates a join action.
     */
    ECHATMETHOD["JOIN"] = "join";
    /**
     * Indicates a close peer action.
     */
    ECHATMETHOD["CLOSE_PEER"] = "closePeer";
    /**
     * Indicates a request to get messages.
     */
    ECHATMETHOD["GET_MESSAGES"] = "getMessages";
    /**
     * Indicates a chat message.
     */
    ECHATMETHOD["CHAT_MESSAGE"] = "chatMessage";
    /**
     * Indicates a request to delete a message.
     */
    ECHATMETHOD["DELETE_MESSAGE"] = "deleteMessage";
    /**
     * Indicates a request to update a room.
     */
    ECHATMETHOD["UPDATE_ROOM"] = "updateRoom";
    /**
     * Indicates a request to delete a room.
     */
    ECHATMETHOD["DELETE_ROOM"] = "deleteRoom";
    /**
     * Indicates a request to update the status.
     */
    ECHATMETHOD["UPDATE_STATUS"] = "updateStatus";
    /**
     * Indicates an update to a peer.
     */
    ECHATMETHOD["PEER_UPDATE"] = "updatePeer";
    /**
     * Indicates that the socket is connected.
     */
    ECHATMETHOD["SOCKET_CONNECTED"] = "socketConnected";
    /**
     * Indicates that the socket is disconnected.
     */
    ECHATMETHOD["SOCKET_DISCONNECTED"] = "socketDisconnected";
    /**
     * Indicates a new room has been created.
     */
    ECHATMETHOD["NEW_ROOM"] = "newRoom";
    /**
     * Indicates that a room has been created.
     */
    ECHATMETHOD["ROOM_CREATED"] = "roomCreated";
    /**
     * Indicates an update to the rooms on a new action.
     */
    ECHATMETHOD["UPDATE_ROOMS_ON_NEW"] = "updateRoomOnNew";
})(ECHATMETHOD = exports.ECHATMETHOD || (exports.ECHATMETHOD = {}));
//# sourceMappingURL=chat.enum.js.map