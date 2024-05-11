"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMsg = exports.ChatRoom = exports.Chat = void 0;
/**
 * Represents a chat room.
 */
class Chat {
    /**
     * Creates a new instance of the Chat class.
     * @param data - The data object containing the chat room information.
     */
    constructor(data) {
        this.id = data.id;
        this.createTime = data.createTime;
    }
}
exports.Chat = Chat;
/**
 * Represents a chat room.
 */
class ChatRoom extends Chat {
    /**
     * Creates a new instance of the ChatRoom class.
     * @param room - The required chat room data.
     */
    constructor(room) {
        super(room);
        this.closed = false;
        this.lastActive = room.lastActive;
        this.peers = room.peers;
        this.blocked = room.blocked;
        this.unviewedMsgsLength = room.unviewedMsgsLength;
        this.type = room.type;
        this.extras = room.extras;
        this.closed = room.closed;
    }
    /**
     * Updates the chat room with new values.
     * @param val - The new values to update.
     * @param add - Indicates whether to add the new values or replace the existing ones.
     * peers comes in here as string
     */
    update(val, add) {
        this.createTime = val.createTime || this.createTime;
        this.lastActive = val.lastActive || this.lastActive;
        if (val.peers?.length) {
            const peers = this.peers || [];
            if (add) {
                this.peers = [...peers, ...val.peers];
            }
            else {
                this.peers = peers.filter(p => {
                    const valPeersIdString = val.peers.map(value => value.id);
                    return !valPeersIdString.includes(p.id);
                });
            }
        }
        if (val.blocked?.length) {
            const blocked = this.blocked || [];
            if (add) {
                this.blocked = [...blocked, ...val.blocked];
            }
            else {
                this.blocked = blocked.filter(b => !val.blocked.includes(b));
            }
        }
    }
    /**
     * Gets the participants of the chat room.
     * @returns An array of peer information.
     */
    getParticipants() {
        return this.peers;
    }
    /**
     * Gets the peer information for the specified ID.
     * @param id - The ID of the peer.
     * @returns The peer information if found, otherwise null.
     */
    getPeerInfo(id) {
        const fullPeer = this.peers.find(p => p.id === id);
        if (fullPeer) {
            return fullPeer;
        }
        return null;
    }
}
exports.ChatRoom = ChatRoom;
/**
 * Represents a chat message in a chat room.
 */
class ChatMsg extends Chat {
    /**
     * Creates a new instance of the ChatMsg class.
     * @param myId The ID of the current user.
     * @param msg The chat message data.
     */
    constructor(myId, msg) {
        super(msg);
        this.myId = myId;
        this.peerInfo = msg.peerInfo;
        this.roomId = msg.roomId;
        this.msg = msg.msg;
        if (this.myId === this.peerInfo?.id) {
            this.who = 'me';
        }
        else {
            this.who = 'partner';
        }
        this.status = msg.status;
        this.deleted = msg.deleted;
    }
}
exports.ChatMsg = ChatMsg;
//# sourceMappingURL=chat-room.define.js.map