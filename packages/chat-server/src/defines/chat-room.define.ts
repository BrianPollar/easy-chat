import * as fs from 'fs';
import * as tracer from 'tracer';
import { ECHATMETHOD } from '../../../chat-shared/enums/chat.enum';
import { IchatMsg } from '../../../chat-shared/interfaces/chat.interface';
import { TroomEvent } from '../../../chat-shared/types/union.types';
import Onlinepeer from './peer.define';
import RoomBase from './room-base.define';

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
/**
 * Represents the response object for handling socket requests.
 */
export interface InowhandleSocketRequestRes {
  /**
   * Indicates whether the request was successful.
   */
  success: boolean;

  /**
   * The error message, if any.
   */
  err: string;

  /**
   * The message to be sent to the client.
   */
  msg: string;
}

/**
 * Represents a chatroom in the chat server.
 */
export default class Chatroom
  extends RoomBase {
  // the time the chatroom was created
  protected override bornTime = Date.now();
  // the string that is used to identify requests to this chatroom.
  protected override reqString = 'mainrequest';
  // the string that is used to identify notifications from this chatroom.
  protected override notifString = 'mainnotification';

  /**
   * Represents a chat room.
   * @constructor
   * @param id - The room id.
   * @param userId - The user id.
   * @param cb - The callback function.
   */
  constructor(
    public override id: string, // the room id
    public userId: string,
    private cb: (...args) => void
  ) {
    super(id);
    logger.info('Chatroom:constructor() [roomId:"%s"]', id);
  }

  /**
   * Creates a new chatroom instance.
   * @param roomId - The ID of the chatroom.
   * @param userId - The ID of the user creating the chatroom.
   * @param cb - The callback function to be executed after creating the chatroom.
   * @returns A new instance of the Chatroom class.
   */
  static create(
    roomId: string,
    userId: string,
    cb: (...args) => void
  ) {
    logger.info('Chatroom:create:: - create() [roomId:"%s"]', roomId);

    return new Chatroom(
      roomId, userId, cb);
  }

  /**
   * Handles a socket request from a peer.
   * @param peer The online peer making the request.
   * @param request The request object.
   * @param cb The callback function to be called after processing the request.
   * @returns A promise that resolves to an object containing the response.
   */
  // eslint-disable-next-line max-statements
  public async nowhandleSocketRequest(
    peer: Onlinepeer,
    request,
    cb
  ): Promise<InowhandleSocketRequestRes> {
    const res: InowhandleSocketRequestRes = {
      success: true,
      err: '',
      msg: ''
    };
    switch (request.method as ECHATMETHOD) {
      case ECHATMETHOD.JOIN:
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

        this.nownotification(
          peer.socket,
          'newPeer',
          { ...peer.peerInfo() },
          true
        );

        logger.debug(
          'Chatroom:nowhandleSocketRequest:: - peer joined [peer: "%s"]',
          peer.id);

        peer.joined = true;
        break;
      }

      case ECHATMETHOD.CLOSE_PEER:
      {
        logger.info('Chatroom:nowhandleSocketRequest:: - CLOSE_PEER, peer: %s', peer.id);
        res.msg = 'SUCCESS';
        cb();
        peer.leaveRoom();
        break;
      }

      case ECHATMETHOD.CHAT_MESSAGE:
      {
        const { id, chatMessage, createTime, to, whoType, roomId } = request.data;

        if (roomId !== this.id) {
          res.msg = 'ROOM_ID_EXISTS';
          cb();
          return;
        }
        const msg: IchatMsg = {
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
        } as unknown as IchatMsg;
        this.emitEvent(request.method, msg);
        if (to === 'all') {
          this.nownotification(peer.socket, ECHATMETHOD.CHAT_MESSAGE, request.data, true);
        } else {
          const toPeer = this.getPeer(to);
          if (toPeer) {
            this.nownotification(toPeer.socket, ECHATMETHOD.CHAT_MESSAGE, request.data, false);
          }
        }
        res.msg = 'SUCCESS';
        cb();

        break;
      }

      case ECHATMETHOD.DELETE_MESSAGE:
      {
        const { to, deleted, id } = request.data;
        this.emitEvent(request.method, { to, deleted, id });
        if (to === 'all') {
          this.nownotification(peer.socket, ECHATMETHOD.DELETE_MESSAGE, request.data, true);
        } else {
          const toPeer = this.getPeer(to);
          if (toPeer) {
            this.nownotification(toPeer.socket, ECHATMETHOD.DELETE_MESSAGE, request.data, false);
          }
        }
        res.msg = 'SUCCESS';
        cb();
        break;
      }
      case ECHATMETHOD.UPDATE_ROOM:
      {
        const { to, roomData, add } = request.data;
        if (roomData) {
          this.emitEvent(request.method, { to, roomData, add });
        }
        if (to === 'all') {
          this.nownotification(peer.socket, ECHATMETHOD.UPDATE_ROOM, request.data, true);
        } else {
          const toPeer = this.getPeer(to);
          if (toPeer) {
            this.nownotification(toPeer.socket, ECHATMETHOD.UPDATE_ROOM, request.data, false);
          }
        }
        res.msg = 'SUCCESS';
        cb();
        break;
      }
      case ECHATMETHOD.DELETE_ROOM:
      {
        const { to } = request.data;
        if (to === 'all') {
          this.nownotification(peer.socket, ECHATMETHOD.DELETE_ROOM, request.data, true);
        } else {
          const toPeer = this.getPeer(to);
          if (toPeer) {
            this.nownotification(toPeer.socket, ECHATMETHOD.DELETE_ROOM, request.data, false);
          }
        }
        res.msg = 'SUCCESS';
        cb();
        break;
      }
      case ECHATMETHOD.UPDATE_STATUS:
      {
        const { to, id, status, statusField, statusQuo } = request.data;
        this.emitEvent(request.method, { to, id, status, statusField, statusQuo });
        if (to === 'all') {
          this.nownotification(peer.socket, ECHATMETHOD.UPDATE_STATUS, request.data, true);
        } else {
          const toPeer = this.getPeer(to);
          if (toPeer) {
            this.nownotification(toPeer.socket, ECHATMETHOD.UPDATE_STATUS, request.data, false);
          }
        }
        res.msg = 'SUCCESS';
        cb();
        break;
      }
      case ECHATMETHOD.PEER_UPDATE: {
        const { to, peerInfo } = request.data;
        this.emitEvent(request.method, { to, peerInfo });
        if (to === 'all') {
          this.nownotification(peer.socket, ECHATMETHOD.PEER_UPDATE, request.data, true);
        } else {
          const toPeer = this.getPeer(to);
          if (toPeer) {
            this.nownotification(toPeer.socket, ECHATMETHOD.PEER_UPDATE, request.data, false);
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
  protected emitEvent(eventName: TroomEvent, data?) {
    this.cb(eventName, data);
  }
}
