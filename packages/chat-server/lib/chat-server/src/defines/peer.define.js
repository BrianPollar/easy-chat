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
 * Represents an online peer in the chat server.
 * @extends EventEmitter
 */
class Onlinepeer extends events_1.EventEmitter {
    /**
     * Creates an instance of Onlinepeer.
     * @param {string} id - The ID of the peer.
     * @param {Socket} socket - The socket associated with the peer.
     * @param {Chatroom | Onlineroom} room - The room the peer belongs to.
     */
    constructor(id, socket, room) {
        super();
        this.id = id;
        this.socket = socket;
        this.room = room;
        /** rooms a peer has */
        // rooms = new Map<string, ChatroomController> ();
        /** if peer has joined main room */
        this.joined = false;
        /** if peer is closed or not */
        this.closed = false;
        /** check disconnect counter value */
        this.disconnectCheck = 0;
        /** peers joining time */
        this.enterTime = Date.now();
        this.lastSeen = new Date();
        logger.info('Onlinepeer:constructor() [id:"%s", socket:"%s"]', id, socket.id);
        this.address = socket.handshake.address;
        this.setMaxListeners(Infinity);
        this.handlePeer();
    }
    /**
     * Closes the peer object.
     */
    close() {
        logger.info('Onlinepeer:close:: - peer %s call close()', this.id);
        this.closed = true;
        this.lastSeen = new Date();
        this.closeResource();
        if (this.socket) {
            this.socket.disconnect(true);
        }
        if (this.intervalHandler) {
            clearInterval(this.intervalHandler);
        }
        this.emit('mainclose');
    }
    /**
     * Leaves the current room.
     */
    leaveRoom() {
        logger.info('Onlinepeer:close:: - peer %s call leaveRoom()', this.id);
        this.closed = true;
        this.closeResource();
        this.socket.leave(this.room.id);
        if (this.intervalHandler) {
            clearInterval(this.intervalHandler);
        }
        this.emit('close');
    }
    /**
     * Handles the peer's attempt to reconnect to a room.
     * @param {Socket} socket - The new socket associated with the peer.
     * @param {boolean} [isMain=false] - Indicates if the peer is reconnecting to the main room.
     */
    handlePeerReconnect(socket, isMain = false) {
        this.socket.leave(this.room.id);
        if (isMain) {
            this.socket.disconnect(true);
        }
        logger.info('Onlinepeer:handlePeerReconnect:: - peer %s reconnnected! disconnect previous connection now.', this.id);
        this.socket = socket;
        this.socket.join(this.room.id);
        this.room.setupSocketHandler(this);
        this.handlePeer();
    }
    /**
     * Listens to the socket disconnect and error events for the peer object.
     */
    handlePeer() {
        this.socket.on('disconnect', (reason) => {
            if (this.closed) {
                return;
            }
            logger.debug('Onlinepeer:handlePeer:: - "socket disconnect" event [id:%s], reason: %s', this.id, reason);
            this.disconnectCheck = 0;
            if (this.intervalHandler) {
                clearInterval(this.intervalHandler);
            }
            this.intervalHandler = setInterval(() => {
                this.checkClose();
            }, 20000);
        });
        this.socket.on('error', (error) => {
            logger.info('Onlinepeer:handlePeer:: - socket error, peer: %s, error: %s', this.id, error);
        });
    }
    /**
     * Closes the peer if the disconnectCheck is greater than 6.
     */
    checkClose() {
        if (!this.socket.connected) {
            this.disconnectCheck++;
        }
        else {
            clearInterval(this.intervalHandler);
            this.intervalHandler = null;
        }
        if (this.disconnectCheck > 6) {
            this.close();
        }
    }
    /**
     * Returns information about the peer.
     * @returns {object} - The peer information.
     */
    peerInfo() {
        const peerInfo = {
            id: this.id,
            // roler: this.roler,
            // displayName: this.displayName,
            // picture: this.picture,
            // platform: this.platform,
            address: this.address,
            durationTime: (Date.now() - this.enterTime) / 1000
        };
        logger.info('Onlinepeer:peerInfo:: - returning peer info', peerInfo);
        return peerInfo;
    }
    /**
     * Closes the resource.
     */
    closeResource() { }
}
exports.default = Onlinepeer;
//# sourceMappingURL=peer.define.js.map