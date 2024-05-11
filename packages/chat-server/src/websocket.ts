/**
 * This class represents the web socket server for the chat application.
 */
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { Server, Socket } from 'socket.io';
import * as tracer from 'tracer';
import { IsocketConfig } from '../../chat-shared/interfaces/socket.interface';
import Onlineroom from './defines/online-room.define';
import Onlinepeer from './defines/peer.define';

const logger = tracer.colorConsole(
  {
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

export class EasyChatServer {
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

  constructor(
    private httpsServer: https.Server | http.Server,
    private roomStatusInterval: number,
    private socketConfig: Partial<IsocketConfig>
  ) {
    // Log rooms status
    setInterval(() => {
      let active = false;
      if (this.onlineRoom) {
        this.onlineRoom.checkDeserted();// check if empty room
        logger.debug(
          JSON.stringify(
            this.onlineRoom.statusReport()));
        active = true;
      }

      logger.info(
        'onlineRoom active: %s',
        active
      );
    }, this.roomStatusInterval * 1000);
  }

  /**
    * Run web Socket server
    * This handles real time communication
    * This mostly handles media server rtc
    * connection operations
    */
  run(allowedCorsOrigins: string[]) {
    this.io = new Server(this.httpsServer, {
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
      logger.info(
        'creating a new Onlineroom');
      this.onlineRoom = new Onlineroom(
        'mainonlineroom',
        this.roomStatusInterval
      );
    }

    this.io.on('connection', (socket: Socket) => {
      this.handleMainConnection(socket);
    });
  }

  /**
   * Emits an event to the online room.
   *
   * @param eventName - The name of the event to emit.
   * @param data - The data to send along with the event.
   */
  emitEvent(eventName: string, data) {
    this.onlineRoom.emit(eventName, data);
  }

  /**
    * Handle a new connection from a peer.
    *
    * @param socket The socket object for the new peer.
    */
  handleMainConnection(socket: Socket) {
    const { userId } = socket.handshake.query;
    if (!userId) {
      logger.warn(
        `handleMainConnection:: connection
          request without
          userId`);
      socket.disconnect(true);// disconnect on missing parameter
      return;
    }

    if (!this.onlineRoom) {
      logger.info(
        'creating a new Onlineroom');
      this.onlineRoom = new Onlineroom(
        'mainonlineroom',
        this.roomStatusInterval
      );
    }

    let peer = this.onlineRoom.getPeer(
      userId as string
    );

    if (!peer) {
      peer = new Onlinepeer(
          userId as string,
          socket,
          this.onlineRoom
      );
      this.onlineRoom.handlePeer(peer);
      logger.info(
        'new peer, %s, %s',
        userId,
        socket.id
      );
    } else {
      peer.handlePeerReconnect(socket, true);
      logger.info(
        'WebsocketServer:handleMainConnection:: - peer reconnect, %s, %s',
        userId,
        socket.id
      );
    }
  }
}
