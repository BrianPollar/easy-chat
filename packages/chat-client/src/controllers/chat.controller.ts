import { Subject, takeUntil } from 'rxjs';
import { ChatMsg, ChatRoom } from '../defines/chat-room.define';
import { ECHATMETHOD } from '../../../chat-shared/enums/chat.enum';
import { IpeerInfo } from '../../../chat-shared/interfaces/chat.interface';
import { makeRandomString } from '../constants/makerandomstring.constant';
import { TchatMsgStatus } from '../../../chat-shared/types/union.types';
import { LoggerController } from './logger.controller';
import { EasyChatClient } from '../websocket';

/** Handle CHAT related Task*/
/**
 * Represents a controller for the EasyChat application.
 */
export class EasyChatController {
  messages: ChatMsg[] = [];
  toPeer = 'all';
  activeRoom: ChatRoom | null;
  destroyed$ = new Subject();
  logger = new LoggerController();

  /**
   * Creates an instance of the ChatController class.
   * @param websocket - The EasyChatClient instance.
   * @param myId - The ID of the user.
   * @param myNames - The name of the user.
   * @param myPhotoUrl - The URL of the user's photo.
   */
  constructor(
    public websocket: EasyChatClient,
    private myId: string,
    private myNames: string,
    private myPhotoUrl: string,
    chatElementId: string
  ) {
    this.runSubscriptions(chatElementId);
  }

  /**
   * Determines the local peer information.
   * @returns {IpeerInfo} The local peer information.
   */
  determinLocalPeerInfo() {
    const peerInfo: IpeerInfo = {
      id: this.myId,
      name: this.myNames,
      photo: this.myPhotoUrl,
      roomAdmin: false,
      lastSeen: new Date(),
      online: true,
      unviewedMsgsLength: 0
    };
    return peerInfo;
  }

  /**
   * Joins the active room and adds new peers to the chat.
   *
   * @returns {Promise<void>} A promise that resolves when the room is joined.
   */
  async joinRoom() {
    if (!this.activeRoom) {
      return;
    }
    const { joined, peers } = await this
      .join(this.determinLocalPeerInfo());

    if (joined) {
      return;
    }

    this.logger.debug('joined, peersinfo: %s', JSON.stringify(peers));

    for (const peer of peers) {
      this.newPeer(peer);
    }
  }

  /**
   * Joins the main chat room.
   *
   * @returns {Promise<void>} A promise that resolves when the main room is joined.
   */
  async joinMainRoom() {
    const { joined, peers } = await this
      .joinMain(this.determinLocalPeerInfo());

    if (joined) {
      return;
    }

    this.logger.debug('joined main room, peersinfo: %s', JSON.stringify(peers));

    this.mangeNewMainPeers(peers);
  }


  /**
   * Joins the main chat room.
   *
   * @param params - The parameters for joining the chat room.
   * @returns An object containing information about the joined peers and whether the join was successful.
   */
  async joinMain(params) {
    const callRes = await this.websocket.sendOnlineSoloRequest(
      ECHATMETHOD.JOIN,
      params
    );

    return callRes as { peers: IpeerInfo[]; joined: boolean };
  }

  /**
   * Joins the chat room with the specified parameters.
   * @param params - The parameters for joining the chat room.
   * @returns A promise that resolves to an object containing information about the joined peers and whether the join was successful.
   */
  async join(params) {
    const callRes = await this.websocket.sendRequest(
      ECHATMETHOD.JOIN,
      params
    );

    return callRes as { peers: IpeerInfo[]; joined: boolean };
  }

  /**
   * Sends a chat message.
   *
   * @param chatMessage The message to send.
   * @returns A promise that resolves when the message is sent successfully, or rejects with an error if sending fails.
   */
  send(chatMessage: string, chatElementId: string) {
    const id = this.activeRoom.id + makeRandomString(22, 'combined');
    const createTime = new Date();
    const msg = new ChatMsg(
      this.myId,
      {
        id,
        peerInfo: this.determinLocalPeerInfo(),
        roomId: this.activeRoom.id,
        msg: chatMessage,
        createTime,
        who: 'me',
        status: 'pending',
        deleted: false
      }
    );

    this.messages = [...this.messages, msg];
    this.scrollToLast(chatElementId);

    return this.websocket.sendRequest(
      ECHATMETHOD.CHAT_MESSAGE,
      {
        id,
        roomId: this.activeRoom.id,
        chatMessage,
        createTime,
        from: this.myId,
        to: this.toPeer
      }
    ).then(() => {
      msg.status = 'sent';
    }).catch(err => {
      this.logger.error('send MESSAGE ERROR', err);
      msg.status = 'failed';
    });
  }


  /**
   * Updates the status of a chat message.
   *
   * @param status - The new status of the chat message.
   * @param msg - The chat message to update.
   * @returns A promise that resolves to true if the status update was successful, or false otherwise.
   */
  updateStatus(status: TchatMsgStatus, msg: ChatMsg) {
    return this.websocket.sendRequest(
      ECHATMETHOD.UPDATE_STATUS,
      {
        id: msg.id,
        status,
        statusField: status,
        from: this.myId,
        to: this.toPeer
      }
    ).then(() => true).catch(() => false);
  }

  /**
   * Deletes or restores a message.
   * @param id - The ID of the message to delete or restore.
   * @param deleted - A boolean indicating whether to delete or restore the message.
   * @returns A promise that resolves to true if the request is successful, or false if it fails.
   */
  deleteRestoreMesage(id: string, deleted: boolean) {
    return this.websocket.sendRequest(
      ECHATMETHOD.DELETE_MESSAGE,
      {
        deleted,
        id,
        from: this.myId,
        to: this.toPeer
      }
    ).then(() => true).catch(() => false);
  }

  /**
   * Sends a request to close the peer.
   *
   * @param stopClass A boolean indicating whether to stop the class.
   * @returns A promise that resolves when the request is sent.
   */
  sendClosePeer(stopClass: boolean) {
    this.logger.debug('sendClosePeer');
    return this.websocket.sendRequest(
      ECHATMETHOD.CLOSE_PEER,
      {
        stopClass
      }
    );
  }

  /**
   * Updates the peer information.
   * @param peerInfo - The updated peer information.
   * @returns A Promise that resolves when the request is sent.
   */
  updatePeer(peerInfo: IpeerInfo) {
    return this.websocket.sendRequest(
      ECHATMETHOD.PEER_UPDATE,
      {
        peerInfo,
        from: this.myId,
        to: 'all'
      }
    );
  }

  /**
   * Updates the room with the given data.
   * @param roomData - The data of the room to update.
   * @param add - A boolean indicating whether to add the room to the array or remove it if false.
   * @returns A Promise that resolves when the update request is sent.
   */
  /** add to array or remove if false */
  updateRoom(roomData, add: boolean /** add to array or remove if false */) {
    return this.websocket.sendRequest(
      ECHATMETHOD.UPDATE_ROOM,
      {
        roomData,
        add,
        from: this.myId,
        to: 'all'
      }
    );
  }

  /**
   * Creates a new chat room.
   *
   * @param room - The chat room to be created.
   * @returns A Promise that resolves when the request to create the room is sent.
   */
  newRoom(room: ChatRoom) {
    if (this.websocket.isSocketConnected()) {
      if (this.activeRoom) {
        // this.sendClosePeer(false);
        if (this.activeRoom.id !== room.id) {
          this.clearRoom();
        } else {
          return;
        }
      }
    } else {
      this.websocket.connect();
    }
    this.activeRoom = room;
    return this.websocket.sendOnlineSoloRequest(
      ECHATMETHOD.NEW_ROOM,
      {
        roomId: room.id,
        userId: this.myId,
        to: 'me'
      }
    );
  }

  /**
   * Clears the active room and removes all messages.
   */
  clearRoom() {
    this.activeRoom = null;
    this.messages.length = 0;
    this.messages = [];
  }

  /**
   * Scrolls to the last message in the chat.
   */
  scrollToLast(chatElementId: string) {
    if (document) {
      const elem = document?.getElementById(chatElementId);
      elem?.scrollIntoView();
    }
  }

  /**
   * Destroys the chat controller.
   */
  destroy() {
    this.destroyed$.next(true);
  }

  /**
   * Manages new main peers by adding them to the active users list and triggering a user online change event.
   * @param peers - An array of peer information.
   */
  private mangeNewMainPeers(peers: IpeerInfo[]) {
    for (const peer of peers) {
      this.websocket.activeUsers.set(peer.id, peer.id);
    }
    this.websocket.eventbus.userOnlineChange$.next(true);
  }

  /**
   * Manages the leave event of the main peer.
   * @param {any} data - The data associated with the leave event.
   */
  private manageMainPeerLeave(data) {
    const { peerId } = data;
    this.websocket.activeUsers.delete(peerId);
    this.websocket.eventbus.userOnlineChange$.next(true);
  }

  /**
   * Adds a new peer to the active room.
   * If the peer already exists, it updates the online status.
   * @param data - The partial information of the peer.
   */
  private newPeer(data: Partial<IpeerInfo>) {
    const { id } = data;
    const peerInfo = this.getPeerInfo(id);
    if (peerInfo) {
      this.logger.warn('peer %s already existed!', id);
      peerInfo.online = true;
      return;
    }

    const peer = {
      id: data.id,
      name: data.name,
      photo: data.photo,
      roomAdmin: data.roomAdmin,
      online: data.online,
      lastSeen: new Date(),
      unviewedMsgsLength: data.unviewedMsgsLength
    };
    this.logger.debug('newPeer, %o', peer);
    this.activeRoom.peers = [...this.activeRoom.peers, peer];
  }

  /**
   * Handles the event when a peer is closed.
   * Updates the online status of the peer to false.
   * @param {string} peerId - The ID of the peer that is closed.
   */
  private peerClosed(peerId: string) {
    const peerInfo = this.getPeerInfo(peerId);
    if (peerInfo) {
      peerInfo.online = false;
    }
    // this.activeRoom.peers = this.activeRoom.peers.filter(p => p.id !== peerId);
  }

  /**
   * Retrieves the peer information based on the provided peer ID.
   * @param peerId The ID of the peer.
   * @returns The peer information if found, otherwise undefined.
   */
  private getPeerInfo(peerId: string) {
    return this.activeRoom.peers.find(peer => peer.id === peerId);
  }

  /**
   * Runs the subscriptions for the chat controller.
   * Subscribes to the chat events and performs corresponding actions based on the event type.
   */
  private runSubscriptions(chatElementId: string) {
    this.websocket.eventbus.chat$
      .pipe(takeUntil((this.destroyed$)))
      .subscribe(event => {
        if (event && event.type === ECHATMETHOD.CHAT_MESSAGE) {
          const { from, chatMessage, to, id, createTime } = event.data;
          if (to !== 'all' && to !== this.myId) {
            return;
          }

          const peerInfo = this.activeRoom.getPeerInfo(from);
          const msg = new ChatMsg(
            this.myId,
            {
              id,
              peerInfo,
              roomId: this.activeRoom.id,
              msg: chatMessage,
              createTime,
              who: 'partner',
              status: 'recieved',
              deleted: false
            });

          this.messages = [...this.messages, msg];
          this.scrollToLast(chatElementId);
          this.updateStatus('recieved', msg);
        }

        if (event && event.type === ECHATMETHOD.DELETE_MESSAGE) {
          const { id, deleted } = event.data;
          const found = this.messages
            .find(msg => msg.id === id);
          if (found) {
            found.deleted = deleted;
          }
        }

        if (event && event.type === ECHATMETHOD.NEW_PEER) {
          this.newPeer(event.data);
        }

        if (event && event.type === ECHATMETHOD.NEW_MAIN_PEER) {
          this.mangeNewMainPeers(event.data);
        }

        if (event && event.type === ECHATMETHOD.PEER_CLOSE) {
          this.peerClosed(event.data.peerId);
        }

        if (event && event.type === ECHATMETHOD.MAIN_PEER_CLOSE) {
          this.manageMainPeerLeave(event.data);
        }

        if (event && event.type === ECHATMETHOD.ROOM_CREATED) {
          this.joinRoom();
        }

        if (event && event.type === ECHATMETHOD.SOCKET_CONNECTED) {
          this.joinMainRoom();
        }

        if (event && event.type === ECHATMETHOD.UPDATE_STATUS) {
          const { id, status } = event.data;
          const msg = this.messages
            .find(val => val.id === id);
          if (msg) {
            msg.status = status;
            /**
             * const exist = msg[statusField]
              .find(val => val.id === statusQuo.id);
            if (!exist) {
              msg[statusField].push(statusQuo);
            }*/

            if (status === 'viewed') {
              this.websocket.eventbus.outEvent.next({
                type: 'viewed',
                data: this.activeRoom.unviewedMsgsLength
              });
              if (this.activeRoom.unviewedMsgsLength > 0) {
                this.activeRoom.unviewedMsgsLength--;
              }
            }
          }
        }

        if (event && event.type === ECHATMETHOD.PEER_UPDATE) {
          const { peerInfo } = event.data;
          const localPeerInfo = this.activeRoom.getPeerInfo(peerInfo.id);
          if (localPeerInfo) {
            localPeerInfo.roomAdmin = peerInfo.roomAdmin;
            // localPeerInfo.muted = peerInfo.muted;
            // if new props the add here
          }
        }

        if (event && event.type === ECHATMETHOD.UPDATE_ROOM) {
          const { roomData, add } = event.data;
          this.activeRoom.update(roomData, add);
        }
      });
  }
}
