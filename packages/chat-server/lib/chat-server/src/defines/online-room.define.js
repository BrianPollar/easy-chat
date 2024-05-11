"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const tracer = tslib_1.__importStar(require("tracer"));
const chat_enum_1 = require("../../../chat-shared/enums/chat.enum");
const chat_room_define_1 = tslib_1.__importDefault(require("./chat-room.define"));
const peer_define_1 = tslib_1.__importDefault(require("./peer.define"));
const room_base_define_1 = tslib_1.__importDefault(require("./room-base.define"));
const onlineRoomLogger = tracer.colorConsole({
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
 * Represents an online room.
 */
class Onlineroom extends room_base_define_1.default {
    /**
     * Represents an online room.
     * @constructor
     * @param {string} id - The room id.
     * @param {number} roomStatusInterval - The interval in seconds for checking the room status.
     */
    constructor(id, // the room id
    roomStatusInterval) {
        super(id);
        this.id = id;
        this.roomStatusInterval = roomStatusInterval;
        this.peers = new Map();
        this.rooms = new Map();
        /**
         * Calls the callback function with the specified event name and data.
         * @param eventName - The name of the event.
         * @param data - The data to pass to the callback function.
         */
        this.callBacFn = (eventName, data) => {
            this.emit(eventName, data);
        };
        onlineRoomLogger.info('Onlineroom:constructor() [roomId:"%s"]', id);
        setInterval(() => {
            let all = 0;
            let closed = 0;
            this.rooms.forEach(room => {
                all++;
                if (room.closed) {
                    closed++;
                }
                room.checkDeserted(); // check if empty room
                onlineRoomLogger.debug(JSON.stringify(room.statusReport()));
            });
            onlineRoomLogger.info('chatroom total: %s, closed: %s', all, closed);
        }, this.roomStatusInterval * 1000);
    }
    /**
     * Creates a new online room.
     * @param roomId - The ID of the room.
     * @param roomStatusInterval - The interval for updating the room status.
     * @returns A new instance of Onlineroom.
     */
    static create(roomId, roomStatusInterval) {
        onlineRoomLogger.info('Onlineroom:create() [roomId:"%s"]', roomId);
        return new Onlineroom(roomId, roomStatusInterval);
    }
    /**
     * Handles a socket request from a peer.
     * @param peer - The online peer making the request.
     * @param request - The request object.
     * @param cb - The callback function to be called after processing the request.
     * @returns A promise that resolves to an object containing the response.
     */
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
                    this.nownotification(peer.socket, 'newMainPeer', { ...peer.peerInfo() }, true);
                    onlineRoomLogger.debug('Onlineroom:nowhandleSocketRequest:: - peer joined [peer: "%s"]', peer.id);
                    peer.joined = true;
                    break;
                }
            case chat_enum_1.ECHATMETHOD.CLOSE_PEER:
                {
                    onlineRoomLogger.info('Onlineroom:nowhandleSocketRequest:: - CLOSE_PEER, main peer: %s', peer.id);
                    peer.close();
                    res.msg = 'SUCCESS';
                    cb();
                    break;
                }
            case chat_enum_1.ECHATMETHOD.NEW_ROOM:
                {
                    const { roomId, userId, to } = request.data;
                    let room = this.rooms
                        .get(roomId);
                    if (!room) {
                        onlineRoomLogger.info('Onlineroom:nowhandleSocketRequest:: - creating a new ChatroomController [roomId:"%s"]', roomId);
                        room = new chat_room_define_1.default(roomId, userId, this.callBacFn);
                        this.rooms
                            .set(roomId, room);
                    }
                    let newPeer = room.getPeer(userId);
                    if (!newPeer) {
                        newPeer = new peer_define_1.default(userId, peer.socket, room);
                        room.handlePeer(peer);
                        onlineRoomLogger.info('Onlineroom:nowhandleSocketRequest:: - new peer, %s, %s', userId, peer.socket.id);
                    }
                    else {
                        newPeer.handlePeerReconnect(peer.socket);
                        onlineRoomLogger.info('Onlineroom:nowhandleSocketRequest:: - peer reconnect, %s, %s', userId, peer.socket.id);
                    }
                    if (to === 'all') {
                        this.nownotification(peer.socket, chat_enum_1.ECHATMETHOD.ROOM_CREATED, request.data, true);
                    }
                    else {
                        const toPeer = this.getPeer(to);
                        if (toPeer) {
                            this.nownotification(peer.socket, chat_enum_1.ECHATMETHOD.ROOM_CREATED, request.data, false);
                        }
                    }
                    this.nownotification(peer.socket, chat_enum_1.ECHATMETHOD.UPDATE_ROOMS_ON_NEW, request.data, true);
                    res.msg = 'SUCCESS';
                    cb();
                    break;
                }
        }
        return new Promise(resolve => resolve(res));
    }
}
exports.default = Onlineroom;
//# sourceMappingURL=online-room.define.js.map