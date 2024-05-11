"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyChatServer = void 0;
const tslib_1 = require("tslib");
/**
 * This class represents the web socket server for the chat application.
 */
const fs = tslib_1.__importStar(require("fs"));
const socket_io_1 = require("socket.io");
const tracer = tslib_1.__importStar(require("tracer"));
const online_room_define_1 = tslib_1.__importDefault(require("./defines/online-room.define"));
const peer_define_1 = tslib_1.__importDefault(require("./defines/peer.define"));
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
class EasyChatServer {
    constructor(httpsServer, roomStatusInterval, socketConfig) {
        this.httpsServer = httpsServer;
        this.roomStatusInterval = roomStatusInterval;
        this.socketConfig = socketConfig;
        // Log rooms status
        setInterval(() => {
            let active = false;
            if (this.onlineRoom) {
                this.onlineRoom.checkDeserted(); // check if empty room
                logger.debug(JSON.stringify(this.onlineRoom.statusReport()));
                active = true;
            }
            logger.info('onlineRoom active: %s', active);
        }, this.roomStatusInterval * 1000);
    }
    /**
      * Run web Socket server
      * This handles real time communication
      * This mostly handles media server rtc
      * connection operations
      */
    run(allowedCorsOrigins) {
        this.io = new socket_io_1.Server(this.httpsServer, {
            // io = socketio.listen(httpsServer, {
            /**
            * Allow cross-origin requests from the specified origins.
            */
            cors: {
                origin: [...allowedCorsOrigins],
                methods: ['GET', 'POST']
            },
            pingTimeout: this.socketConfig.pingTimeout || 3000,
            pingInterval: this.socketConfig.pingInterval || 5000,
            transports: this.socketConfig.transports || ['websocket'],
            allowUpgrades: this.socketConfig.allowUpgrades || false
        });
        logger.info('run websocket server....');
        if (!this.onlineRoom) {
            logger.info('creating a new Onlineroom');
            this.onlineRoom = new online_room_define_1.default('mainonlineroom', this.roomStatusInterval);
        }
        this.io.on('connection', (socket) => {
            this.handleMainConnection(socket);
        });
    }
    /**
     * Emits an event to the online room.
     *
     * @param eventName - The name of the event to emit.
     * @param data - The data to send along with the event.
     */
    emitEvent(eventName, data) {
        this.onlineRoom.emit(eventName, data);
    }
    /**
      * Handle a new connection from a peer.
      *
      * @param socket The socket object for the new peer.
      */
    handleMainConnection(socket) {
        const { userId } = socket.handshake.query;
        if (!userId) {
            logger.warn(`handleMainConnection:: connection
          request without
          userId`);
            socket.disconnect(true); // disconnect on missing parameter
            return;
        }
        if (!this.onlineRoom) {
            logger.info('creating a new Onlineroom');
            this.onlineRoom = new online_room_define_1.default('mainonlineroom', this.roomStatusInterval);
        }
        let peer = this.onlineRoom.getPeer(userId);
        if (!peer) {
            peer = new peer_define_1.default(userId, socket, this.onlineRoom);
            this.onlineRoom.handlePeer(peer);
            logger.info('new peer, %s, %s', userId, socket.id);
        }
        else {
            peer.handlePeerReconnect(socket, true);
            logger.info('WebsocketServer:handleMainConnection:: - peer reconnect, %s, %s', userId, socket.id);
        }
    }
}
exports.EasyChatServer = EasyChatServer;
//# sourceMappingURL=websocket.js.map