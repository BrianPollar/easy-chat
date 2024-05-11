import * as fs from 'fs';
import * as tracer from 'tracer';
import { ECHATMETHOD } from '../../../chat-shared/enums/chat.enum';
import Chatroom, { InowhandleSocketRequestRes } from './chat-room.define';
import Onlinepeer from './peer.define';
import RoomBase from './room-base.define';

const onlineRoomLogger = tracer.colorConsole(
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
 * Represents an online room.
 */
export default class Onlineroom
  extends RoomBase {
  override peers = new Map<string, Onlinepeer> ();
  override rooms = new Map<string, Chatroom> ();

  /**
   * Represents an online room.
   * @constructor
   * @param {string} id - The room id.
   * @param {number} roomStatusInterval - The interval in seconds for checking the room status.
   */
  constructor(
    public override id: string, // the room id
    private roomStatusInterval: number
  ) {
    super(id);
    onlineRoomLogger.info('Onlineroom:constructor() [roomId:"%s"]', id);

    setInterval(() => {
      let all = 0;
      let closed = 0;

      this.rooms.forEach(room => {
        all++;
        if (room.closed) {
          closed++;
        }

        room.checkDeserted();// check if empty room
        onlineRoomLogger.debug(
          JSON.stringify(
            room.statusReport()));
      });

      onlineRoomLogger.info(
        'chatroom total: %s, closed: %s',
        all,
        closed
      );
    }, this.roomStatusInterval * 1000);
  }

  /**
   * Creates a new online room.
   * @param roomId - The ID of the room.
   * @param roomStatusInterval - The interval for updating the room status.
   * @returns A new instance of Onlineroom.
   */
  static create(roomId: string, roomStatusInterval: number) {
    onlineRoomLogger.info('Onlineroom:create() [roomId:"%s"]', roomId);
    return new Onlineroom(
      roomId,
      roomStatusInterval);
  }

  /**
   * Handles a socket request from a peer.
   * @param peer - The online peer making the request.
   * @param request - The request object.
   * @param cb - The callback function to be called after processing the request.
   * @returns A promise that resolves to an object containing the response.
   */
  async nowhandleSocketRequest(
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
          'newMainPeer',
          { ...peer.peerInfo() },
          true
        );

        onlineRoomLogger.debug(
          'Onlineroom:nowhandleSocketRequest:: - peer joined [peer: "%s"]',
          peer.id);

        peer.joined = true;
        break;
      }

      case ECHATMETHOD.CLOSE_PEER:
      {
        onlineRoomLogger.info('Onlineroom:nowhandleSocketRequest:: - CLOSE_PEER, main peer: %s', peer.id);
        peer.close();
        res.msg = 'SUCCESS';
        cb();
        break;
      }

      case ECHATMETHOD.NEW_ROOM:
      {
        const { roomId, userId, to } = request.data;
        let room = this.rooms
          .get(roomId as string);

        if (!room) {
          onlineRoomLogger.info(
            'Onlineroom:nowhandleSocketRequest:: - creating a new ChatroomController [roomId:"%s"]',
            roomId
          );
          room = new Chatroom(
        roomId as string,
        userId as string,
        this.callBacFn
          );
          this.rooms
            .set(roomId as string, room);
        }

        let newPeer = room.getPeer(
					userId as string
        );

        if (!newPeer) {
          newPeer = new Onlinepeer(
            userId,
            peer.socket,
            room
          );
          room.handlePeer(peer);
          onlineRoomLogger.info(
            'Onlineroom:nowhandleSocketRequest:: - new peer, %s, %s',
            userId,
            peer.socket.id
          );
        } else {
          newPeer.handlePeerReconnect(peer.socket);
          onlineRoomLogger.info(
            'Onlineroom:nowhandleSocketRequest:: - peer reconnect, %s, %s',
            userId,
            peer.socket.id
          );
        }

        if (to === 'all') {
          this.nownotification(peer.socket, ECHATMETHOD.ROOM_CREATED, request.data, true);
        } else {
          const toPeer = this.getPeer(to);
          if (toPeer) {
            this.nownotification(peer.socket, ECHATMETHOD.ROOM_CREATED, request.data, false);
          }
        }
        this.nownotification(peer.socket, ECHATMETHOD.UPDATE_ROOMS_ON_NEW, request.data, true);
        res.msg = 'SUCCESS';
        cb();
        break;
      }
    }
    return new Promise(resolve => resolve(res));
  }

  /**
   * Calls the callback function with the specified event name and data.
   * @param eventName - The name of the event.
   * @param data - The data to pass to the callback function.
   */
  callBacFn = (eventName: string, data) => {
    this.emit(eventName, data);
  };
}
