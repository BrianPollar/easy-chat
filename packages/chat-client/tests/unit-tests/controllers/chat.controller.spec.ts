/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, expect, describe, beforeEach, it, afterEach } from 'vitest';
import { EasyChatController } from '../../../src/controllers/chat.controller';
import { EasyChatClient } from '../../../src/websocket';
import { LoggerController } from '../../../src/controllers/logger.controller';
import { Subject } from 'rxjs';
import { ChatMsg, ChatRoom } from '../../../src/defines/chat-room.define';
import { createMockChatMsg, createMockChatRoom, createMockPeerinfo } from '../../mocks';
import { ECHATMETHOD } from '../../../../chat-shared/enums/chat.enum';
import { IpeerInfo } from '../../../../chat-shared/interfaces/chat.interface';

const websocketMock = {
  sendOnlineSoloRequest: vi.fn(),
  sendRequest: vi.fn(),
  activeUsers: new Map<string, string>(),
  isSocketConnected: vi.fn(),
  connect: vi.fn(),
  eventbus: {
    chat$: new Subject(),
    userOnlineChange$: new Subject(),
    outEvent: new Subject()
  }
} as unknown as EasyChatClient;

describe('EasyChatController', () => {
  let instance: EasyChatController;
  const myId = 'myId';
  const myNames = 'myNames';
  const myPhotoUrl = 'myPhotoUrl';

  beforeEach(() => {
    instance = new EasyChatController(
      websocketMock,
      myId,
      myNames,
      myPhotoUrl,
      'chatElementId'
    );
  });

  afterEach(() => {
    instance.destroy();
  });

  it('should have initial properties', () => {
    expect(instance.messages).toEqual([]);
    expect(instance.toPeer).toBe('all');
    expect(instance.activeRoom).toBeUndefined();
    expect(instance.destroyed$).toBeInstanceOf(Subject);
    expect(instance.logger).toBeInstanceOf(LoggerController);
  });

  it('should be initialised properly', () => {
    expect(instance.websocket).toBe(websocketMock);
    // @ts-ignore
    expect(instance.myId).toBeDefined();
    // @ts-ignore
    expect(instance.myNames).toBeDefined();
    // @ts-ignore
    expect(instance.myPhotoUrl).toBeDefined();
  });

  it('should determine local peer info', () => {
    const peerInfo = instance.determinLocalPeerInfo();
    expect(peerInfo).toEqual({
      id: myId,
      name: myNames,
      photo: myPhotoUrl,
      roomAdmin: false,
      lastSeen: expect.any(Date),
      online: true,
      unviewedMsgsLength: 0
    });
  });

  it('should fail to join if there is no active room', async() => {
    vi.spyOn(instance, 'determinLocalPeerInfo');
    instance.activeRoom = null;
    const join = await instance.joinRoom();
    expect(join).toBeFalsy();
    expect(instance.determinLocalPeerInfo).not.toHaveBeenCalled();
  });

  it('should fail if peer already joined room', async() => {
    // @ts-ignore
    vi.spyOn(instance, 'newPeer');
    vi.spyOn(instance, 'join')
      .mockResolvedValue({ joined: true, peers: [] });
    const join = await instance.joinRoom();
    expect(join).toBeFalsy();
    // @ts-ignore
    expect(instance.newPeer).not.toHaveBeenCalled();
  });

  it('should join room', async() => {
    const mockRoom = createMockChatRoom();
    instance.activeRoom = mockRoom;
    const peers = [createMockPeerinfo()];
    const mockJoinResponse = { joined: false, peers };
    vi.spyOn(instance, 'join').mockResolvedValueOnce(mockJoinResponse);
    // @ts-ignore
    const newPeerSpy = vi.spyOn(instance, 'newPeer');

    await instance.joinRoom();

    expect(newPeerSpy).toHaveBeenCalled();
  });

  it('#joinMainRoom should  fail to join main room if already joined', async() => {
    // @ts-ignore
    vi.spyOn(instance, 'mangeNewMainPeers');
    vi.spyOn(instance, 'joinMain').mockResolvedValueOnce({ joined: true, peers: [] });
    const joinmain = await instance.joinMainRoom();
    expect(joinmain).toBeFalsy();
    // @ts-ignore
    expect(instance.mangeNewMainPeers).not.toHaveBeenCalled();
  });


  it('#joinMain should join main room', async() => {
    const params = { roomId: 'mainRoomId' };
    const mockJoinResponse = { joined: true, peers: [] };
    vi.spyOn(instance.websocket, 'sendOnlineSoloRequest').mockResolvedValueOnce(mockJoinResponse);
    const result = await instance.joinMain(params);
    expect(result).toEqual(mockJoinResponse);
    expect(instance.websocket.sendOnlineSoloRequest).toHaveBeenCalledWith(ECHATMETHOD.JOIN, params);
  });

  it('should join main room', async() => {
    const peer = createMockPeerinfo();
    const peers = [peer];
    const mockJoinResponse = { joined: false, peers };
    vi.spyOn(instance, 'joinMain').mockResolvedValue(mockJoinResponse);
    // @ts-ignore
    const mangeNewMainPeersSpy = vi.spyOn(instance, 'mangeNewMainPeers');
    await instance.joinMainRoom();
    expect(mangeNewMainPeersSpy).toHaveBeenCalled();
    expect(mangeNewMainPeersSpy).toHaveBeenCalledWith(peers);
  });

  it('should join room', async() => {
    const params = { roomId: 'roomId' };
    const mockJoinResponse = { joined: true, peers: [] };
    vi.spyOn(instance.websocket, 'sendRequest').mockResolvedValueOnce(mockJoinResponse);
    const result = await instance.join(params);
    expect(result).toEqual(mockJoinResponse);
    expect(instance.websocket.sendRequest).toHaveBeenCalledWith(ECHATMETHOD.JOIN, params);
  });

  it('should fail incase of rejected promise', async() => {
    const room = createMockChatRoom();
    instance.activeRoom = room;
    vi.spyOn(instance.websocket, 'sendRequest').mockRejectedValueOnce('error');
    // @ts-ignore
    vi.spyOn(instance.logger, 'pError');
    const sent = await instance.send('Hello World', 'chatElementId');
    expect(sent).toBeFalsy();
    expect(instance.websocket.sendRequest).toHaveBeenCalled();
    // @ts-ignore
    expect(instance.logger.pError).toHaveBeenCalled();
    expect(instance.messages[instance.messages.length - 1].status).toBe('failed');
  });

  it('should send chat message', async() => {
    const room = createMockChatRoom();
    instance.activeRoom = room;
    const mockMsg = new ChatMsg(
      myId,
      {
        id: 'msgId',
        peerInfo: instance.determinLocalPeerInfo(),
        roomId: 'roomId',
        msg: 'Hello',
        createTime: new Date(),
        who: 'me',
        status: 'pending',
        deleted: false
      }
    );
    const mockSendRequest = vi.spyOn(instance.websocket, 'sendRequest').mockResolvedValueOnce(null);
    const scrollToLastSpy = vi.spyOn(instance, 'scrollToLast');
    await instance.send('Hello', 'chatElementId');
    expect(scrollToLastSpy).toHaveBeenCalled();
    const lastMsg = instance.messages[instance.messages.length - 1];
    const messageToSendMock = {
      id: lastMsg.id,
      roomId: instance.activeRoom.id,
      chatMessage: lastMsg.msg,
      createTime: lastMsg.createTime,
      // @ts-ignore
      from: instance.myId,
      to: instance.toPeer
    };
    expect(mockSendRequest).toHaveBeenCalledWith(ECHATMETHOD.CHAT_MESSAGE, messageToSendMock);
    expect(mockMsg.status).toBe('pending');
  });

  it('should update message status', async() => {
    const mockMsg = new ChatMsg(
      myId,
      {
        id: 'msgId',
        peerInfo: instance.determinLocalPeerInfo(),
        roomId: 'roomId',
        msg: 'Hello',
        createTime: new Date(),
        who: 'me',
        status: 'pending',
        deleted: false
      }
    );
    const mockSendRequest = vi.spyOn(instance.websocket, 'sendRequest').mockResolvedValueOnce(null);

    const updated = await instance.updateStatus('viewed', mockMsg);

    expect(updated).toBe(true);
    expect(mockSendRequest).toHaveBeenCalledWith(ECHATMETHOD.UPDATE_STATUS, {
      id: 'msgId',
      status: 'viewed',
      statusField: 'viewed',
      from: myId,
      to: 'all'
    });
    // expect(mockMsg.status).toBe('viewed');
  });

  it('should delete or restore message', async() => {
    const mockSendRequest = vi.spyOn(instance.websocket, 'sendRequest').mockResolvedValueOnce(null);

    const updated = await instance.deleteRestoreMesage('msgId', true);

    expect(updated).toBe(true);
    expect(mockSendRequest).toHaveBeenCalledWith(ECHATMETHOD.DELETE_MESSAGE, {
      deleted: true,
      id: 'msgId',
      from: myId,
      to: 'all'
    });
  });

  it('should send a close peer request', async() => {
    const mockSendRequest = vi.spyOn(instance.websocket, 'sendRequest').mockResolvedValueOnce(null);
    const closed = await instance.sendClosePeer(true);
    expect(closed).toBeNull();
    expect(mockSendRequest).toHaveBeenCalledWith(ECHATMETHOD.CLOSE_PEER, {
      stopClass: true
    });
  });

  it('should update peer info', async() => {
    const mockSendRequest = vi.spyOn(instance.websocket, 'sendRequest').mockResolvedValueOnce(null);
    const peerInfo: IpeerInfo = {
      id: 'peerId',
      name: 'peerName',
      photo: 'peerPhoto',
      roomAdmin: true,
      lastSeen: new Date(),
      online: true,
      unviewedMsgsLength: 0
    };
    const updated = await instance.updatePeer(peerInfo);
    expect(updated).toBeNull();
    expect(mockSendRequest).toHaveBeenCalledWith(ECHATMETHOD.PEER_UPDATE, {
      peerInfo,
      from: myId,
      to: 'all'
    });
  });

  it('should update room', async() => {
    const mockSendRequest = vi.spyOn(instance.websocket, 'sendRequest').mockResolvedValueOnce(null);
    const roomData = { id: 'roomId' };

    const updated = await instance.updateRoom(roomData, true);

    expect(updated).toBeNull();
    expect(mockSendRequest).toHaveBeenCalledWith(ECHATMETHOD.UPDATE_ROOM, {
      roomData,
      add: true,
      from: myId,
      to: 'all'
    });
  });

  it('should fail to create a new room, incase socket is not connected', async() => {
    vi.spyOn(instance.websocket, 'isSocketConnected').mockReturnValueOnce(false);
    const mockConnect = vi.spyOn(instance.websocket, 'connect').mockImplementation(() => vi.fn());
    const mockSendOnlineSoloRequest = vi.spyOn(instance.websocket, 'sendOnlineSoloRequest').mockResolvedValueOnce(null);
    const mockRoom = createMockChatRoom();
    const mockSetActiveUsers = vi.spyOn(instance.websocket.activeUsers, 'set');
    const mockUserOnlineChange$ = vi.spyOn(instance.websocket.eventbus.userOnlineChange$, 'next');
    const changed = await instance.newRoom(mockRoom);
    expect(changed).toBeFalsy();
    expect(instance.activeRoom).toEqual(mockRoom);
    expect(mockConnect).toHaveBeenCalled();
    expect(mockSendOnlineSoloRequest).toHaveBeenCalledWith(ECHATMETHOD.NEW_ROOM, {
      roomId: mockRoom.id,
      // @ts-ignore
      userId: instance.myId,
      to: 'me'
    });
    expect(mockSetActiveUsers).not.toHaveBeenCalled();
    expect(mockUserOnlineChange$).not.toHaveBeenCalled();
  });

  it('should clearRoom, incase active Room id is not equal to new room id', async() => {
    vi.spyOn(instance.websocket, 'isSocketConnected').mockReturnValueOnce(true);
    const mockRoom = createMockChatRoom();
    const mockRoom2 = createMockChatRoom();
    instance.activeRoom = mockRoom;
    const mockSetActiveUsers = vi.spyOn(instance.websocket.activeUsers, 'set');
    const mockUserOnlineChange$ = vi.spyOn(instance.websocket.eventbus.userOnlineChange$, 'next');
    vi.spyOn(instance, 'clearRoom');
    const changed = await instance.newRoom(mockRoom2);
    expect(changed).toBeFalsy();
    expect(instance.clearRoom).toHaveBeenCalled();
    expect(instance.activeRoom).toBe(mockRoom2);
    expect(mockSetActiveUsers).not.toHaveBeenCalled();
    expect(mockUserOnlineChange$).not.toHaveBeenCalled();
  });

  it('should create a new room', async() => {
    const mockConnect = vi.spyOn(instance.websocket, 'connect');
    const mockSendOnlineSoloRequest = vi.spyOn(instance.websocket, 'sendOnlineSoloRequest').mockResolvedValueOnce(null);
    const mockRoom = createMockChatRoom();
    const mockSetActiveUsers = vi.spyOn(instance.websocket.activeUsers, 'set');
    const mockUserOnlineChange$ = vi.spyOn(instance.websocket.eventbus.userOnlineChange$, 'next');
    const changed = await instance.newRoom(mockRoom);
    expect(changed).toBeFalsy();
    expect(instance.activeRoom).toBe(mockRoom);
    expect(mockConnect).toHaveBeenCalled();
    expect(mockSendOnlineSoloRequest).toHaveBeenCalledWith(ECHATMETHOD.NEW_ROOM, {
      roomId: mockRoom.id,
      // @ts-ignore
      userId: instance.myId,
      to: 'me'
    });
    expect(mockSetActiveUsers).not.toHaveBeenCalled();
    expect(mockUserOnlineChange$).not.toHaveBeenCalled();
  });

  it('should clear the room', () => {
    instance.activeRoom = { id: 'roomId' } as unknown as ChatRoom;
    const msg = createMockChatMsg();
    instance.messages = [new ChatMsg(myId, msg)];
    instance.clearRoom();
    expect(instance.activeRoom).toBeNull();
    expect(instance.messages).toEqual([]);
  });

  it('should scroll to last', () => {
    vi.spyOn(document, 'getElementById').mockImplementation(() => null);
    instance.scrollToLast('id');
    expect(document.getElementById).toHaveBeenCalled();
  });

  it('should handle new main peers', () => {
    const peers = [createMockPeerinfo()];
    const mockSetActiveUsers = vi.spyOn(instance.websocket.activeUsers, 'set');
    const mockUserOnlineChange$ = vi.spyOn(instance.websocket.eventbus.userOnlineChange$, 'next');

    // @ts-ignore
    instance.mangeNewMainPeers(peers);
    expect(mockSetActiveUsers).toHaveBeenCalledWith(peers[0].id, peers[0].id);
    expect(mockUserOnlineChange$).toHaveBeenCalledWith(true);
  });

  it('should handle main peer leave', () => {
    const mockDeleteActiveUser = vi.spyOn(instance.websocket.activeUsers, 'delete');
    const mockUserOnlineChange$ = vi.spyOn(instance.websocket.eventbus.userOnlineChange$, 'next');

    // @ts-ignore
    instance.manageMainPeerLeave({ peerId: 'peerId' });

    expect(mockDeleteActiveUser).toHaveBeenCalledWith('peerId');
    expect(mockUserOnlineChange$).toHaveBeenCalledWith(true);
  });

  it('should add new peer to the room', () => {
    const peers = [createMockPeerinfo(), createMockPeerinfo()];
    const room = createMockChatRoom();
    room.peers = peers;
    instance.activeRoom = room;
    // @ts-ignore
    const mockGetPeerInfo = vi.spyOn(instance, 'getPeerInfo').mockReturnValueOnce(null);
    const mockLoggerWarn = vi.spyOn(instance.logger, 'warn');

    // @ts-ignore
    instance.newPeer({ id: 'peerId', name: 'peerName', photo: 'peerPhoto', roomAdmin: true });

    expect(mockGetPeerInfo).toHaveBeenCalledWith('peerId');
    expect(mockLoggerWarn).not.toHaveBeenCalled();
  });

  it('should handle peer closed', () => {
    const room = createMockChatRoom();
    instance.activeRoom = room;
    // @ts-ignore
    const mockGetPeerInfo = vi.spyOn(instance, 'getPeerInfo').mockReturnValue({
      id: 'peerId',
      online: true
    } as unknown as IpeerInfo);

    // @ts-ignore
    instance.peerClosed('peerId');

    expect(mockGetPeerInfo).toHaveBeenCalledWith('peerId');
    // @ts-ignore
    expect(mockGetPeerInfo('peerId')!.online).toBe(false);
  });

  it('should get peer info', () => {
    instance.activeRoom = {
      peers: [
        { id: 'peerId1' },
        { id: 'peerId2' }
      ] as IpeerInfo[]
    } as unknown as ChatRoom;

    // @ts-ignore
    const peerInfo = instance.getPeerInfo('peerId2');

    expect(peerInfo).toEqual({ id: 'peerId2' });
  });
});
