"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = require("events");
const fs = tslib_1.__importStar(require("fs"));
const tracer = tslib_1.__importStar(require("tracer"));
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
 * This class is the base class for all chat rooms.
 */
class RoomBase extends events_1.EventEmitter {
    /**
     * Constructs a new RoomBase instance.
     *
     * @param id The ID of the room.
     */
    constructor(id // the room id
    ) {
        super();
        this.id = id;
        /** The list of peers in the room. */
        this.peers = new Map();
        /** The list of chat rooms in the room. */
        this.rooms = new Map();
        /** If the room is closed or not. */
        this.closed = false;
        /** The time when the room was last active. */
        this.activeTime = Date.now();
        /** The time when the room was created. */
        this.bornTime = Date.now();
        this.reqString = 'onlinerequest';
        this.notifString = 'mainnotification';
        logger.info('RoomBase:constructor() [roomId:"%s"]', id);
    }
    /**
     * Sets up the socket handler for the room.
     *
     * @param peer The peer that the handler is being set up for.
     */
    setupSocketHandler(peer) {
        peer.socket.on(this.reqString, (request, cb) => {
            this.setActive();
            logger.debug('RoomBase:setupSocketHandler:: - "request" event [room:"%s", method:"%s", peerId:"%s"]', this.id, request.method, peer.id);
            this.nowhandleSocketRequest(peer, request, cb)
                .catch(error => {
                logger.error('RoomBase:setupSocketHandler:: - "request" failed [error:"%o"]', error);
                cb(error);
            });
        });
    }
    /**
     * Handles a new peer joining the room.
     *
     * @param peer The peer that is joining the room.
     */
    handlePeer(peer) {
        logger.info('handlePeer() id: %s, address: %s', peer.id, peer.socket.handshake.address);
        peer.socket.join(this.id);
        this.setupSocketHandler(peer);
        this.peers.set(peer.id, peer);
        peer.on('close', () => {
            logger.info('RoomBase:handlePeer:: - %s closed, room:  %s', peer.id, this.id);
            if (this.closed) {
                return;
            }
            this.nownotification(peer.socket, 'peerClosed', { peerId: peer.id }, true);
            this.peers.delete(peer.id);
            logger.error('GOING TO DELETE NOW', this.peers);
            if (this.checkEmpty()) {
                this.close();
            }
        });
        peer.on('mainclose', () => {
            logger.info('RoomBase:handlePeer:: - %s main closed, room:  %s', peer.id, this.id);
            if (this.closed) {
                return;
            }
            logger.error('GOING TO DELETE NOW, MMMMMAIIINNNYYYYYYY', this.peers);
            this.nownotification(peer.socket, 'mainPeerClosed', { peerId: peer.id }, true);
            this.peers.delete(peer.id);
            if (this.checkEmpty()) {
                this.close();
            }
        });
    }
    /**
     * The `getPeer()` method returns the peer with the specified ID, or `null` if the peer does not exist.
     * @param peerId The peerId for the return peer.
     */
    getPeer(peerId) {
        return this.peers.get(peerId);
    }
    /**
     * Closes the room and releases all resources associated with it.
     */
    close() {
        logger.info('RoomBase:close:: - close() room: %s', this.id);
        this.closed = true;
        this.peers.forEach(peer => {
            if (!peer.closed) {
                peer.close();
            }
        });
        this.peers.clear();
        this.emit('close');
    }
    /**
     * Checks if the room is deserted and closes it if necessary.
     */
    checkDeserted() {
        if (this.checkEmpty()) {
            logger.info('RoomBase:checkDeserted:: - room %s is empty , now close it!', this.id);
            this.close();
            return;
        }
        const lastActive = (Date.now() - this.activeTime) / 1000; // seconds
        if (lastActive > 2 * 60 * 60) { // 2 hours not active
            logger.warn('RoomBase:checkDeserted:: - room %s too long no active!, now close it, lastActive: %s', this.id, lastActive);
            this.close();
        }
    }
    /**
     * Generates a status report for the room.
     * @returns An object containing the room's ID, list of peers, duration since creation (in seconds), and time since last activity (in seconds).
     */
    statusReport() {
        const dura = Math.floor((Date.now() - this.bornTime) / 1000);
        const lastActive = Math.floor((Date.now() - this.activeTime) / 1000);
        return {
            id: this.id,
            peers: [...this.peers.keys()],
            duration: dura,
            lastActive
        };
    }
    /**
     * Sends a message to all peers in the room.
     * @param {string} peerId - The ID of the peer sending the message.
     * @param {ECHATMETHOD} method - The method of the message.
     * @param {any} data - The data of the message.
     */
    sendMsgToallpeers(peerId, method, data) {
        const peer = this.peers.get(peerId);
        if (!peer) {
            return;
        }
        this.nownotification(peer.socket, method, data, true);
    }
    /**
     * Sends a notification to the specified socket.
     * @param socket - The socket to send the notification to.
     * @param method - The method of the notification.
     * @param data - The data associated with the notification.
     * @param broadcast - Indicates whether the notification should be broadcasted to all sockets in the room.
     */
    nownotification(socket, method, data = {}, broadcast = false) {
        if (broadcast) {
            socket.broadcast.to(this.id).emit(this.notifString, { method, data });
        }
        else {
            socket.emit(this.notifString, { method, data });
        }
    }
    /**
     * Sets the active time for the room.
     */
    setActive() {
        this.activeTime = Date.now();
    }
    /**
     * Checks if the room is empty.
     * @returns {boolean} True if the room is empty, false otherwise.
     */
    checkEmpty() {
        return this.peers.size === 0;
    }
}
exports.default = RoomBase;
//# sourceMappingURL=room-base.define.js.map