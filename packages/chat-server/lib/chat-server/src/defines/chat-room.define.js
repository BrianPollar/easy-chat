"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const tracer = tslib_1.__importStar(require("tracer"));
const chat_enum_1 = require("../../../chat-shared/enums/chat.enum");
const room_base_define_1 = tslib_1.__importDefault(require("./room-base.define"));
const logger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = './serverLog/';
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('data.output err ', err);
                }
            }
        });
        fs.appendFile('./serverLog/chat-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
/**
 * Represents a chatroom in the chat server.
 */
class Chatroom extends room_base_define_1.default {
    /**
     * Represents a chat room.
     * @constructor
     * @param id - The room id.
     * @param userId - The user id.
     * @param cb - The callback function.
     */
    constructor(id, // the room id
    userId, cb) {
        super(id);
        this.id = id;
        this.userId = userId;
        this.cb = cb;
        // the time the chatroom was created
        this.bornTime = Date.now();
        // the string that is used to identify requests to this chatroom.
        this.reqString = 'mainrequest';
        // the string that is used to identify notifications from this chatroom.
        this.notifString = 'mainnotification';
        logger.info('Chatroom:constructor() [roomId:"%s"]', id);
    }
    /**
     * Creates a new chatroom instance.
     * @param roomId - The ID of the chatroom.
     * @param userId - The ID of the user creating the chatroom.
     * @param cb - The callback function to be executed after creating the chatroom.
     * @returns A new instance of the Chatroom class.
     */
    static create(roomId, userId, cb) {
        logger.info('Chatroom:create:: - create() [roomId:"%s"]', roomId);
        return new Chatroom(roomId, userId, cb);
    }
    /**
     * Handles a socket request from a peer.
     * @param peer The online peer making the request.
     * @param request The request object.
     * @param cb The callback function to be called after processing the request.
     * @returns A promise that resolves to an object containing the response.
     */
    // eslint-disable-next-line max-statements
    async nowhandleSocketRequest(peer, request, cb) {
        const res = {
            success: true,
            err: '',
            msg: ''
        };
        switch (request.method) {
            case chat_enum_1.ECHATMETHOD.JOIN:
                {
                    if (peer.joined) {
                        res.success = true;
                        res.msg = 'JOINED_ALREADY';
                        cb(null, { joined: true });
                        break;
                    }
                    const peerInfos = [];
                    this.peers.forEach(joinedPeer => {
                        peerInfos.push(joinedPeer.peerInfo());
                    });
                    res.msg = 'SUCCESS';
                    cb(null, { peers: peerInfos, joined: false });
                    this.nownotification(peer.socket, 'newPeer', { ...peer.peerInfo() }, true);
                    logger.debug('Chatroom:nowhandleSocketRequest:: - peer joined [peer: "%s"]', peer.id);
                    peer.joined = true;
                    break;
                }
            case chat_enum_1.ECHATMETHOD.CLOSE_PEER:
                {
                    logger.info('Chatroom:nowhandleSocketRequest:: - CLOSE_PEER, peer: %s', peer.id);
                    res.msg = 'SUCCESS';
                    cb();
                    peer.leaveRoom();
                    break;
                }
            case chat_enum_1.ECHATMETHOD.CHAT_MESSAGE:
                {
                    const { id, chatMessage, createTime, to, whoType, roomId } = request.data;
                    if (roomId !== this.id) {
                        res.msg = 'ROOM_ID_EXISTS';
                        cb();
                        return;
                    }
                    const msg = {
                        id,
                        peerInfo: peer.id,
                        roomId: this.id,
                        msg: chatMessage,
                        createTime,
                        recieved: [],
                        viewed: [],
                        who: 'me',
                        whoType,
                        status: 'sent',
                        deleted: false
                    };
                    this.emitEvent(request.method, msg);
                    if (to === 'all') {
                        this.nownotification(peer.socket, chat_enum_1.ECHATMETHOD.CHAT_MESSAGE, request.data, true);
                    }
                    else {
                        const toPeer = this.getPeer(to);
                        if (toPeer) {
                            this.nownotification(toPeer.socket, chat_enum_1.ECHATMETHOD.CHAT_MESSAGE, request.data, false);
                        }
                    }
                    res.msg = 'SUCCESS';
                    cb();
                    break;
                }
            case chat_enum_1.ECHATMETHOD.DELETE_MESSAGE:
                {
                    const { to, deleted, id } = request.data;
                    this.emitEvent(request.method, { to, deleted, id });
                    if (to === 'all') {
                        this.nownotification(peer.socket, chat_enum_1.ECHATMETHOD.DELETE_MESSAGE, request.data, true);
                    }
                    else {
                        const toPeer = this.getPeer(to);
                        if (toPeer) {
                            this.nownotification(toPeer.socket, chat_enum_1.ECHATMETHOD.DELETE_MESSAGE, request.data, false);
                        }
                    }
                    res.msg = 'SUCCESS';
                    cb();
                    break;
                }
            case chat_enum_1.ECHATMETHOD.UPDATE_ROOM:
                {
                    const { to, roomData, add } = request.data;
                    if (roomData) {
                        this.emitEvent(request.method, { to, roomData, add });
                    }
                    if (to === 'all') {
                        this.nownotification(peer.socket, chat_enum_1.ECHATMETHOD.UPDATE_ROOM, request.data, true);
                    }
                    else {
                        const toPeer = this.getPeer(to);
                        if (toPeer) {
                            this.nownotification(toPeer.socket, chat_enum_1.ECHATMETHOD.UPDATE_ROOM, request.data, false);
                        }
                    }
                    res.msg = 'SUCCESS';
                    cb();
                    break;
                }
            case chat_enum_1.ECHATMETHOD.DELETE_ROOM:
                {
                    const { to } = request.data;
                    if (to === 'all') {
                        this.nownotification(peer.socket, chat_enum_1.ECHATMETHOD.DELETE_ROOM, request.data, true);
                    }
                    else {
                        const toPeer = this.getPeer(to);
                        if (toPeer) {
                            this.nownotification(toPeer.socket, chat_enum_1.ECHATMETHOD.DELETE_ROOM, request.data, false);
                        }
                    }
                    res.msg = 'SUCCESS';
                    cb();
                    break;
                }
            case chat_enum_1.ECHATMETHOD.UPDATE_STATUS:
                {
                    const { to, id, status, statusField, statusQuo } = request.data;
                    this.emitEvent(request.method, { to, id, status, statusField, statusQuo });
                    if (to === 'all') {
                        this.nownotification(peer.socket, chat_enum_1.ECHATMETHOD.UPDATE_STATUS, request.data, true);
                    }
                    else {
                        const toPeer = this.getPeer(to);
                        if (toPeer) {
                            this.nownotification(toPeer.socket, chat_enum_1.ECHATMETHOD.UPDATE_STATUS, request.data, false);
                        }
                    }
                    res.msg = 'SUCCESS';
                    cb();
                    break;
                }
            case chat_enum_1.ECHATMETHOD.PEER_UPDATE: {
                const { to, peerInfo } = request.data;
                this.emitEvent(request.method, { to, peerInfo });
                if (to === 'all') {
                    this.nownotification(peer.socket, chat_enum_1.ECHATMETHOD.PEER_UPDATE, request.data, true);
                }
                else {
                    const toPeer = this.getPeer(to);
                    if (toPeer) {
                        this.nownotification(toPeer.socket, chat_enum_1.ECHATMETHOD.PEER_UPDATE, request.data, false);
                    }
                }
                res.msg = 'SUCCESS';
                cb();
                break;
            }
        }
        return new Promise(resolve => resolve(res));
    }
    /**
     * Emits an event with the specified name and data.
     * @param eventName - The name of the event.
     * @param data - The data to be passed along with the event.
     */
    emitEvent(eventName, data) {
        this.cb(eventName, data);
    }
}
exports.default = Chatroom;
//# sourceMappingURL=chat-room.define.js.map